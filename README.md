# Dojo website — JKA Shotokan karate

An immersive bilingual website (French / English): the visitor arrives in a cherry-blossom garden,
glides through the opening doors of the dojo in first person, and the dojo itself becomes the menu.
Every section is also reachable from a conventional menu and from a plain HTML version.

All business content is **placeholder** for now: see [Editing the content](#editing-the-content).

Built with React, TypeScript, Vite, three.js, React Three Fiber and Drei. There is no backend.

---

## Setup

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints (usually http://localhost:5173). The landing page is French (`/fr/`).

### Production build

```bash
npm run build
```

The finished website is in `dist/`. To try the build locally:

```bash
npm run preview
```

---

## Pages and addresses

| Section | French | English | Object in the dojo |
|---|---|---|---|
| Dojo (menu) | `/fr/` | `/en/` | — |
| About | `/fr/a-propos` | `/en/about` | Calligraphy scroll in the alcove (tokonoma) |
| Sensei | `/fr/sensei` | `/en/sensei` | Framed portrait, back wall left |
| Schedule | `/fr/horaire` | `/en/schedule` | Timetable board, left wall |
| Calendar | `/fr/calendrier` | `/en/calendar` | Hanging paper calendar, right wall |
| Black belts | `/fr/ceintures-noires` | `/en/black-belts` | Wooden name-plaque board, back wall right |
| Links | `/fr/liens` | `/en/links` | Rack of wooden tablets (ema), left wall |
| Contact | `/fr/contact` | `/en/contact` | Open shoji onto the garden, right wall |

`/` always opens the French site. Every address can be shared, reloaded and bookmarked, and the browser's
Back / Forward buttons work.

---

## Editing the content

**Everything about the dojo is in one file: [`src/config/content.ts`](src/config/content.ts).**
Each text has a `fr` and an `en` version.

| What | Where in `content.ts` |
|---|---|
| Dojo name, tagline, style, calligraphy | `dojo` |
| Button labels (Enter the dojo, Skip intro…) | `cta` |
| About text, Dojo kun | `about` |
| Instructors | `instructors` |
| Weekly classes | `schedule.classes` (day 0 = Monday … 6 = Sunday) |
| Calendar (Google Calendar settings, sample events, event types) | `calendar`, `eventKinds` |
| Black belts (photo + dan) | `blackBelts`, `danNames` |
| External links | `linkGroups` |
| Address, phone, email, hours, map link | `contact` |

Placeholder rules:

- A value set to `null` shows **"Détails à venir / Details coming soon"**.
- `placeholder: true` shows a small **"Exemple / Example"** badge. Remove it when the information is real.
- A link with an empty `url` shows **"Lien à venir / Link coming soon"** and is not clickable.

**Photos** (instructors, black belts): put the files in `public/images/`, for example
`public/images/black-belts/jane.jpg`, then write `photo: '/images/black-belts/jane.jpg'`.
Use JPG or WebP, about 600×750 px (portrait 4:5), under ~150 KB each.
A missing or broken photo falls back to a neutral silhouette.

**Section names, addresses and menu order** are in [`src/config/site.ts`](src/config/site.ts).
**Interface wording** (buttons, messages, day names) is in [`src/i18n/ui.ts`](src/i18n/ui.ts).

### Japanese characters

The Japanese fonts are cut down to only the characters used on the site, which keeps them around 20 KB
instead of several MB. `npm run dev` and `npm run build` regenerate them automatically. If you add new
kanji to the content while the dev server is running, run `npm run fonts` (or restart `npm run dev`).

---

## Calendar (Google Calendar)

Until Google Calendar is connected, the calendar shows the sample events from `calendar.sampleEvents`,
clearly marked as examples.

To connect it:

1. In Google Calendar, open the dojo calendar's **Settings → Access permissions** and tick
   **Make available to public** ("See all event details").
2. In the same settings, under **Integrate calendar**, copy the **Calendar ID**
   (it looks like `abc123@group.calendar.google.com`).
3. In [Google Cloud Console](https://console.cloud.google.com/): create a project, enable the
   **Google Calendar API**, then **Credentials → Create credentials → API key**.
   Restrict the key to **HTTP referrers** (your website address, e.g. `https://yourdojo.com/*`)
   and to the **Google Calendar API** only.
4. Copy `.env.example` to `.env` and fill in:

   ```
   VITE_GOOGLE_CALENDAR_API_KEY=your-key
   VITE_GOOGLE_CALENDAR_ID=abc123@group.calendar.google.com
   ```

5. Rebuild (`npm run build`) and upload.

Staff then just add events in Google Calendar. The type of each event (grading, tournament, seminar,
closure) is picked from words in its title, for example "Passage de grade", "Tournoi", "Stage" or "Fermé".
The word lists are in `eventKinds`. The key is visible in the browser, which is normal for public
calendars; the restrictions in step 3 stop anyone else from using it. The time zone is `calendar.timeZone`.

---

## Changing the look

| What | Where |
|---|---|
| Interface colours, fonts, spacing, motion speed | CSS variables at the top of [`src/styles/global.css`](src/styles/global.css) |
| 3D scene colours (wood, plaster, blossoms, sky…) | [`src/config/theme.ts`](src/config/theme.ts) |
| Photographic materials (tint, texture size in metres) | [`src/scene/materials.ts`](src/scene/materials.ts), files in `public/textures/` |
| Sky lighting (swap the `.hdr` for another [Poly Haven](https://polyhaven.com/hdris) sky) | `SKY` in [`src/scene/realAssets.ts`](src/scene/realAssets.ts) |
| Grass, cherry-blossom clusters | [`src/scene/Grass.tsx`](src/scene/Grass.tsx), [`src/scene/CherryTrees.tsx`](src/scene/CherryTrees.tsx) |
| Lights | `Lights` in [`src/scene/DojoCanvas.tsx`](src/scene/DojoCanvas.tsx) |
| Procedural textures (wood grain, shoji, calligraphy…) | [`src/scene/textures.ts`](src/scene/textures.ts) |
| Building, garden, trees, objects | `src/scene/Building.tsx`, `Garden.tsx`, `CherryTrees.tsx`, `DojoObjects.tsx` |

## Animation, camera and quality settings

All of these are in [`src/config/experience.ts`](src/config/experience.ts):

- `timings.entranceDuration` sets the length of the entrance glide (default 7 s; keep it between 5 and 8).
  Other timings control the door opening window, the section focus move and the fade used by Skip.
- `camera` sets the start position, the entrance path points, the resting position inside, the field of
  view and how far the camera moves towards an object.
- `hotspots` sets where each section's object sits in the dojo and whether its label is above or below it.
- `quality` sets the low / medium / high presets: pixel-ratio cap, shadows, number of petals, blossoms and
  grass blades, texture detail, and the camera-like finish (ambient occlusion, soft glow, vignette).

The quality tier is chosen from the device and lowered automatically if the frame rate drops.
Add `?quality=low`, `?quality=medium` or `?quality=high` to the address to force one.
`?webgl=0` shows the plain HTML version.

---

## How it works

```
src/
  config/        content.ts (business info) · site.ts (sections/URLs) · experience.ts (timings, camera, quality) · theme.ts
  i18n/ui.ts     interface wording FR/EN
  router/        tiny history-based router: the URL decides the language and the open section
  state/         machine.ts: explicit state machine (loading → exterior → entering → interior, plus transition)
  scene/         three.js scene (lazy-loaded chunk)
    director.ts    the single camera system: time-based shots, cancellable, drives the doors too
    CameraRig.tsx  connects state + route to the director; screen fitting, look-around, panel offset
    Hotspots.tsx   HTML buttons pinned to 3D objects
    Building / Doors / Garden / CherryTrees / Petals / DojoObjects / textures / materials
  ui/            top bar, menu drawer, intro, loading, veil, section panel, fallback, section content
```

- **One camera system.** `director.ts` plays the entrance path, short focus moves, or a held pose. Everything
  advances with elapsed time, and a new move always starts from where the camera is, so skipping,
  navigating or resizing mid-move never jumps. The door opening is computed from the same entrance
  progress value, so doors and camera cannot drift apart.
- **State machine.** Repeated clicks are ignored outside the right state. The hotspots only accept input once the
  camera has fully settled.
- **Text stays HTML.** Hotspot labels, menus and panels are ordinary, accessible HTML. The canvas only shows
  decorative calligraphy.
- **Fallbacks.** No WebGL, a failed scene, a lost GPU context, or the visitor choosing "Simple version"
  during a slow load all switch to an HTML version with every section.
- **Realism.** Photographic CC0 materials (hinoki floor, cedar, plaster, roof tiles, stone, gravel, bark),
  image-based lighting from a real sunrise sky, sunlight that falls through the open shoji with soft light
  shafts, swaying grass, cherry-blossom clusters that cast dappled shadows, and ambient occlusion on capable devices.
  Every photographic file is optional: if one fails to load, the drawn version is used instead.
- **Performance.** The 3D code loads after the page shell, and the textures (about 2 MB) and sky (1.6 MB) load
  behind the loading screen. Grass, blossoms and petals each use a single draw call. Pixel ratio is capped, shadows and particle
  counts scale with quality, and rendering pauses while the tab is hidden.
- **Accessibility.** Keyboard navigation with visible focus, skip link, focus moved to the panel heading
  and returned on close, Escape to close, `prefers-reduced-motion` respected, and a persistent motion toggle.
  Reduced motion replaces the glide with a short fade. There is no audio.
- **Return visits.** After the intro, the same browser session is offered "Enter directly" or
  "Replay entrance". "Replay entrance" is also always in the menu.

### Adding a contact form later

The Contact panel deliberately shows no form until a real service is connected. The integration point is
`ContactFormSlot` in [`src/ui/sections/Sections.tsx`](src/ui/sections/Sections.tsx). Use Formspree,
Netlify Forms, a PHP mailer or similar, then set `contact.formEnabled = true`.

---

## Deploying

Upload the contents of `dist/` to any static host. Because addresses like `/fr/horaire` are handled
by the app, the host must serve `index.html` for unknown paths:

- **Apache / Hostinger:** `dist/.htaccess` is included and does this. Upload it too (it is a hidden file).
- **Netlify / Cloudflare Pages:** `dist/_redirects` is included.
- **Vercel:** add a rewrite of `/(.*)` to `/index.html`.
- **GitHub Pages:** copy `index.html` to `404.html` after building.

To host in a sub-folder (e.g. `https://example.com/dojo/`), build with `VITE_BASE=/dojo/ npm run build`.

## Known limitations

- The dojo and garden are a stylised model built from simple shapes, not a photoreal architectural model.
- Verification used headless Chromium with software WebGL. The entrance timing, all interactions, the phone
  layouts and the fallbacks were checked there, but the frame rate on real phones and GPUs has not been
  measured yet. Test on a real iPhone and a mid-range Android before launch.
- The French and English texts are placeholders written for layout; have the final copy proofread.

Asset sources and licences: see [ASSETS.md](ASSETS.md).
