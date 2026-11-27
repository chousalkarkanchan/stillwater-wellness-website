/* dc-lite: a tiny runtime that renders the Stillwater page templates.
   Supports {{ holes }}, <sc-for>, <sc-if>, onClick / onChange handlers,
   setState re-rendering (patched in place with morphdom) and lifecycle hooks. */
(function () {
  'use strict';

  window.DCLogic = class DCLogic {
    constructor(props) { this.props = props || {}; this.state = null; }
    setState(patch) {
      this.state = Object.assign({}, this.state || {}, patch);
      if (!this.__queued) {
        this.__queued = true;
        Promise.resolve().then(() => { this.__queued = false; this.__render(); });
      }
    }
    forceUpdate() { this.setState({}); }
  };

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$/.test(path)) return path.slice(1, -1);
    let v = scope;
    for (const k of path.split('.')) { if (v == null) return undefined; v = v[k]; }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, (_, p) => { const v = lookup(p, scope); return v == null ? '' : String(v); });
  }

  const EVENT = { onclick: 'click', onchange: 'change', oninput: 'input' };
  let handlers = {}, hid = 0;

  function renderNodes(nodes, scope, out) {
    for (const n of nodes) {
      if (n.nodeType === 3) { out.appendChild(document.createTextNode(interp(n.nodeValue, scope))); continue; }
      if (n.nodeType !== 1) continue;
      const tag = n.localName;
      if (tag === 'sc-for') {
        const list = lookup((n.getAttribute('list') || '').replace(HOLE, '$1').trim(), scope) || [];
        const as = n.getAttribute('as') || 'item';
        list.forEach((item, i) => {
          const s = Object.create(scope); s[as] = item; s.$index = i;
          renderNodes(n.childNodes, s, out);
        });
        continue;
      }
      if (tag === 'sc-if') {
        const m = (n.getAttribute('value') || '').match(WHOLE);
        if (m && lookup(m[1], scope)) renderNodes(n.childNodes, scope, out);
        continue;
      }
      const el = n.namespaceURI === 'http://www.w3.org/2000/svg'
        ? document.createElementNS(n.namespaceURI, n.tagName)
        : document.createElement(tag);
      let selectValue;
      for (const a of Array.from(n.attributes)) {
        const name = a.name;
        if (name.startsWith('hint-') || name === 'key') continue;
        const whole = a.value.match(WHOLE);
        if (EVENT[name.toLowerCase()]) {
          const fn = whole ? lookup(whole[1], scope) : null;
          if (typeof fn === 'function') {
            let type = EVENT[name.toLowerCase()];
            if (type === 'change' && (tag === 'input' || tag === 'textarea')) type = 'input';
            const id = 'h' + (hid++); handlers[id] = fn;
            el.setAttribute('data-dce-' + type, id);
          }
          continue;
        }
        if (whole && (name === 'disabled' || name === 'checked')) {
          if (lookup(whole[1], scope)) el.setAttribute(name, '');
          continue;
        }
        const val = whole ? lookup(whole[1], scope) : interp(a.value, scope);
        if (name === 'value' && tag === 'select') { selectValue = val; continue; }
        if (name === 'value' && tag === 'textarea') { el.textContent = val == null ? '' : val; continue; }
        if (val == null || val === false) continue;
        el.setAttribute(name, val === true ? '' : String(val));
      }
      const src = tag === 'template' ? n.content.childNodes : n.childNodes;
      renderNodes(src, scope, el);
      if (selectValue !== undefined) {
        for (const o of el.options) if ((o.value || o.text) === selectValue) o.setAttribute('selected', '');
      }
      out.appendChild(el);
    }
    return out;
  }

  function dispatch(type) {
    document.addEventListener(type, (e) => {
      let stopped = false;
      const ev = { target: e.target, nativeEvent: e, preventDefault: () => e.preventDefault(), stopPropagation: () => { stopped = true; } };
      for (let el = e.target; el && el !== document; el = el.parentNode) {
        const id = el.getAttribute && el.getAttribute('data-dce-' + type);
        if (id && handlers[id]) { ev.currentTarget = el; handlers[id](ev); if (stopped) break; }
      }
    }, true);
  }

  function keepRuntimeState(fromEl, toEl) {
    if (fromEl.classList && fromEl.classList.contains('in') && toEl.classList && toEl.classList.contains('rv')) toEl.classList.add('in');
    if (fromEl.hasAttribute && fromEl.hasAttribute('data-o') && !toEl.hasAttribute('data-o')) toEl.setAttribute('data-o', '1');
    if (fromEl.hasAttribute && (fromEl.hasAttribute('data-px') || fromEl.hasAttribute('data-prog')) && fromEl.style.transform) toEl.style.transform = fromEl.style.transform;
    return true;
  }

  function boot() {
    const tpl = document.getElementById('dc-template');
    const code = document.querySelector('script[type="text/x-dc"]');
    const app = document.getElementById('app');
    if (!tpl || !code || !app) return;
    const Component = new Function('DCLogic', code.textContent + '\nreturn Component;')(window.DCLogic);
    const c = new Component({});
    let mounted = false;
    c.__render = function () {
      handlers = {}; hid = 0;
      const next = document.createElement('div');
      renderNodes(tpl.content.childNodes, c.renderVals(), next);
      if (!mounted) {
        while (next.firstChild) app.appendChild(next.firstChild);
        mounted = true;
        if (c.componentDidMount) c.componentDidMount();
      } else {
        window.morphdom(app, next, { childrenOnly: true, onBeforeElUpdated: keepRuntimeState });
        if (c.componentDidUpdate) c.componentDidUpdate();
      }
    };
    ['click', 'input', 'change'].forEach(dispatch);
    c.__render();
    // Safety net for scroll reveals: show any .rv element that has entered the viewport.
    let raf = 0;
    const reveal = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll('.ready .rv:not(.in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in');
      });
    };
    document.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(reveal); }, { passive: true, capture: true });
    setTimeout(reveal, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
