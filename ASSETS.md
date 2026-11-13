# Assets and licences

| Asset | Source | Licence |
|---|---|---|
| Dojo building, garden, trees, petals, lanterns, objects | Built from code in `src/scene/` (no model files) | Part of this project |
| Textures (wood, plaster, shoji, gravel, grass, roof, calligraphy, boards) | Drawn at run time on `<canvas>` in `src/scene/textures.ts` | Part of this project |
| Placeholder portrait (`public/images/placeholder-person.svg`), favicon, fallback illustration | Made for this project | Part of this project |
| Cormorant Garamond (headings) | [Fontsource](https://fontsource.org/fonts/cormorant-garamond) / Christian Thalmann | SIL Open Font License 1.1 |
| Zen Kaku Gothic New (body text) | [Fontsource](https://fontsource.org/fonts/zen-kaku-gothic-new) / Yoshimichi Ohira | SIL Open Font License 1.1 |
| Shippori Mincho (Japanese accents) | [Fontsource](https://fontsource.org/fonts/shippori-mincho) / FONTDASU | SIL Open Font License 1.1 — subset to the characters used (`scripts/subset-fonts.mjs`) |
| Yuji Syuku (brush calligraphy on the scroll and signs) | [Fontsource](https://fontsource.org/fonts/yuji-syuku) / Kinuta Font Factory | SIL Open Font License 1.1 — subset to the characters used |
| Dōjō kun (five maxims, About section) | Traditional Shotokan text | Public domain; translations written for this project |

All fonts are self-hosted, so the site makes no requests to Google Fonts.
The JKA name is mentioned as the dojo's affiliation only. No JKA logo or trademarked artwork is used;
add official logos only with permission.

Libraries (npm, see `package.json`): React, three.js, @react-three/fiber, @react-three/drei (MIT),
subset-font (build-time only, BSD-3-Clause).
