# Stillwater Wellness Studio

A five-page website for a fictional healthcare and wellness studio, built as a plain static site (HTML, CSS and a little JavaScript). It needs no build step.

**Pages**

- `index.html`: home page with a "what do you need help with?" finder, featured services, approach, team preview and studio gallery
- `services.html`: eight services in detail with filters, packages and policies
- `team.html`: practitioner profiles with a specialty filter and a profile panel
- `about.html`: story, values, spaces, FAQ and a contact form
- `book.html`: four-step booking flow (service, practitioner, date and time, details)

**Features:** scroll-reveal animations, parallax photos, a scroll progress bar, a sticky header, a mobile menu, responsive layouts and a reduced-motion fallback.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish with GitHub Pages

1. Push this folder to a GitHub repository (the files sit at the repository root).
2. In the repository, go to **Settings › Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. The site appears at `https://<your-username>.github.io/<repository-name>/` after a minute or two.

## How it is built

- Each page keeps its markup in a `<template id="dc-template">` and its logic in a `<script type="text/x-dc">` block.
- `js/dc-lite.js` is a small runtime that fills in the `{{ … }}` values, repeats `<sc-for>` blocks, shows or hides `<sc-if>` blocks, wires up `onClick`/`onChange`, and re-renders on `setState`.
- `js/morphdom.min.js` ([morphdom](https://github.com/patrick-steele-idem/morphdom), MIT) patches the page in place between renders.
- Fonts load from Google Fonts (Bricolage Grotesque and Manrope).

## Before going live

- The studio, practitioners and their bios are fictional placeholders.
- Replace `[PRICE]`, `[STUDIO ADDRESS]`, `[OPENING HOURS]`, `[PHONE]`, `[EMAIL]` and the other bracketed placeholders.
- The booking and contact forms show a confirmation screen but do not send anything yet. Connect them to a booking or form service.
- The practitioner portraits are Unsplash stock photos of real people. Replace them with photos of the actual team.

## Photo credits

All photos are from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license) and loaded directly from Unsplash's image servers, as Unsplash recommends.

| Unsplash photo | Photographer |
|---|---|
| photo-1566501206188-… (yoga pose) | Patrick Malleret |
| photo-1600334089648-… (hot stones) | engin akyurt |
| photo-1600334129128-… (stone massage) | engin akyurt |
| photo-1649751361457-… (physiotherapy) | yury kirillov |
| photo-1687436874774-… (group yoga) | Marea Wellness |
| photo-1687783615476-… (yoga mats) | Olga Pukhalskaya |
| photo-1600335895229-… (salad) | Luisa Brimble |
| photo-1787651343496-… (spa bed) | Mayur Roxan |
| photo-1787651343620-… (massage table) | Mayur Roxan |
| photo-1787496994323-… (armchairs) | Enio Pereira da Silva |
| photo-1567922045116-… (tea in foliage) | Aniketh Kanukurthi |
| photo-1761971975973-… (yoga studio) | eran design |
| photo-1761971975724-… (studio interior) | eran design |
| photo-1613068431228-… (candles) | Claudio Schwarz |
| photo-1451976426598-… (green building) | Danist Soh |
| photo-1739298061709-… (team at table) | Ninthgrid |
| photo-1512917602760-… (hands with cup) | Kira auf der Heide |
| photo-1598555763574-… (acupuncture) | Katherine Hanlon |
| photo-1747239069226-… (reformer Pilates) | Roxana Popovici |
| photo-1506126613408-… (meditation) | Jared Rice |
| photo-1623854767648-… (portrait) | Siednji Leon |
| photo-1741363863033-… (portrait) | Finn Mund |
| photo-1715412507413-… (portrait) | amirreza momennia |
| photo-1580489944761-… (portrait) | Jake Nackos |
| photo-1544168190-… (portrait) | Juan Encalada |
| photo-1662850886700-… (portrait) | Nolan Manning |
| photo-1573497019940-… (portrait) | Christina @ wocintechchat.com |
| photo-1674932668403-… (portrait) | Yoad Shejtman |
