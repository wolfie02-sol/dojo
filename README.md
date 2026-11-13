# Dojo website — JKA Shotokan karate (simple version)

A calm, realistic website in French and English. The home page is a slowly drifting collage of photos of
Japan (Mount Fuji, cherry blossoms, temples) and Montreal, with the dojo's name and the menu laid over it. Each section is its own page: About, Sensei, Schedule, Calendar, Black belts, Links and Contact.
Every section page has a photo banner, the content, and links to the previous and next sections.

All business content is **placeholder** for now: see [Editing the content](#editing-the-content).

Built with React, TypeScript and Vite. There is no backend and no 3D.
The immersive 3D version is kept separately on the `claude/dojo-website` branch.

---

## Setup

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints. The landing page is French (`/fr/`).

### Production build

```bash
npm run build
```

The finished site is in `dist/`. To try it locally:

```bash
npm run preview
```

---

## Addresses

| Section | French | English |
|---|---|---|
| Home | `/fr/` | `/en/` |
| About | `/fr/a-propos` | `/en/about` |
| Sensei | `/fr/sensei` | `/en/sensei` |
| Schedule | `/fr/horaire` | `/en/schedule` |
| Calendar | `/fr/calendrier` | `/en/calendar` |
| Black belts | `/fr/ceintures-noires` | `/en/black-belts` |
| Links | `/fr/liens` | `/en/links` |
| Contact | `/fr/contact` | `/en/contact` |

- `/` always opens the French site.
- Every page has its own address, so you can share it or reload it.
- The browser's Back / Forward buttons move between pages.

---

## Editing the content

**Everything about the dojo is in [`src/config/content.ts`](src/config/content.ts)**, in French and English:

| What | Where in `content.ts` |
|---|---|
| Name, tagline, style, small kanji | `dojo` |
| Buttons on the opening image | `cta` |
| About text, Dojo kun | `about` |
| Instructors | `instructors` |
| Weekly classes | `schedule.classes` (day 0 = Monday … 6 = Sunday) |
| Calendar settings, sample events, event types | `calendar`, `eventKinds` |
| Black belts (photo + dan) | `blackBelts`, `danNames` |
| External links | `linkGroups` |
| Address, phone, email, hours, map link | `contact` |

Placeholder rules:

- `null` shows **"Détails à venir / Details coming soon"**.
- `placeholder: true` shows an **"Exemple / Example"** badge. Remove it when the information is real.
- A link with an empty `url` shows **"Lien à venir / Link coming soon"**.

Section names, addresses and menu order are in [`src/config/site.ts`](src/config/site.ts).
Interface wording is in [`src/i18n/ui.ts`](src/i18n/ui.ts).

### Photos

[`src/config/media.ts`](src/config/media.ts) controls the home page collage and the section photos.

- **Home page collage:** `collage` in `media.ts` lists the photos (files in `public/images/collage/`, each as
  `.webp` + `.jpg`, about 720×480), the number of rows and the speed (`secondsPerLoop`, higher is slower).
  Add, remove or reorder photos freely. A pause button stops the movement, and visitors who prefer reduced
  motion see a still collage.
- **Section photos:** `pageBanners` chooses the banner photo at the top of each section page (and which part
  of it stays in view). `sectionImages.about` is the photo beside the About text.
- **Instructor and black-belt photos:** the `photo` fields in `content.ts`, for example
  `'/images/black-belts/jane.jpg'` (portrait 4:5, about 600×750 px).

The current photos are stock photos (see [ASSETS.md](ASSETS.md)). Replace them with photos of the real dojo
when you have them.

### Japanese characters

The Japanese accent font is cut down to only the characters the site uses (about 12 KB).
`npm run dev` and `npm run build` regenerate it automatically. While the dev server is running, run
`npm run fonts` after adding new kanji.

---

## Calendar (Google Calendar)

Until it is connected, the calendar shows sample events marked "Exemple". To connect it:

1. In Google Calendar, open the calendar's **Settings → Access permissions**, then tick **Make available to public**.
2. Copy the **Calendar ID** from **Integrate calendar**.
3. In [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Calendar API**, then create an
   **API key**. Restrict it to your website address (HTTP referrers) and to the Calendar API.
4. Copy `.env.example` to `.env` and fill in `VITE_GOOGLE_CALENDAR_API_KEY` and `VITE_GOOGLE_CALENDAR_ID`.
5. Rebuild and upload.

Each event's type (grading, tournament, seminar, closure) is detected from words in its title, such as
"Passage de grade", "Tournoi", "Stage" or "Fermé". The word lists are in `eventKinds`.

---

## Look and feel

- **Colours, fonts, spacing:** the CSS variables at the top of [`src/styles/global.css`](src/styles/global.css).
- **Collage look:** the `.collage` rules in the CSS (tilt angle, gap, rounded corners); the darkening over it is
  `.home__shade`.

## Accessibility and reliability

- Real HTML throughout.
- Keyboard: skip link, visible focus, and focus moves to the new page's heading after each page change.
- Menu: a native dialog with Escape and a focus trap.
- Touch targets are at least 44 px.
- Visitors who turn on "reduce motion" in their system settings get a still collage and no fades; everyone else gets a pause button.
- A missing photo is replaced by a neutral block, and a missing instructor photo by a silhouette.
- No audio, no tracking, no external requests apart from Google Calendar once you configure it.

## Contact form later

The Contact section deliberately shows no form until a real service is connected. The integration point is
`ContactFormSlot` in [`src/ui/sections/Sections.tsx`](src/ui/sections/Sections.tsx).

## Deploying

Upload the contents of `dist/` to any static host. Addresses like `/fr/horaire` need the host to serve
`index.html` for unknown paths:

- **Apache / Hostinger:** the included `.htaccess` does it. It is a hidden file; upload it too.
- **Netlify / Cloudflare Pages:** the included `_redirects` does it.
- **Vercel:** rewrite `/(.*)` to `/index.html`.

For a sub-folder (e.g. `https://example.com/dojo/`), build with `VITE_BASE=/dojo/ npm run build`.
