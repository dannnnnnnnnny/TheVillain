# Third-party source notices

## tween.js easing equations

- Upstream: [tweenjs/tween.js](https://github.com/tweenjs/tween.js).
- Pinned commit: `84a27a74febbda783eebb7ee3e7d7c7abfd25009`.
- Source: [`src/Easing.ts`](https://github.com/tweenjs/tween.js/blob/84a27a74febbda783eebb7ee3e7d7c7abfd25009/src/Easing.ts).
- Local adaptation: `src/vendor/tweenEasing.js`; four selected easing functions, TypeScript/group wrappers removed, named ES module exports added. No runtime package/network dependency.
- License: MIT. Original permission and copyright are preserved in `src/vendor/tweenjs-LICENSE.txt`. GitHub API's SPDX metadata reported `NOASSERTION`; the original LICENSE text was directly read and states The MIT License.
- Use: dynamic attack anticipation/strike/recoil and associated impact effects. Rendering code imports this module rather than merely citing it.

Research used agent-reach's GitHub CLI route. Other evaluated candidates included [kittykatattack/dust](https://github.com/kittykatattack/dust) (MIT, Pixi dependency) and [simeydotme/sparticles](https://github.com/simeydotme/sparticles). They were not copied into this Canvas game. Native particle drawing remains project code.

## LittleJS particle appearance

- Upstream: [KilledByAPixel/LittleJS](https://github.com/KilledByAPixel/LittleJS), MIT, Copyright (c) 2021 Frank Force.
- Pinned commit: `9712ac4cd76e8d5eb77da21004687b63f7856fc1`.
- Source: `src/engineParticles.js`, `Particle.render()` size interpolation, fade envelope and velocity-oriented trail length.
- Local adaptation: `src/vendor/littleJSParticles.js`. Extracted scalar calculations for this Canvas renderer; no LittleJS engine, WebGL or extra runtime package is installed.
- Original permission/copyright: `src/vendor/littlejs-LICENSE.txt`.

## Celeste motion reference

- [NoelFB/Celeste](https://github.com/NoelFB/Celeste), pinned commit `1b0ce45c75e05649ae91b44a8bb6b196684e4352`, `Source/Player/Player.cs`.
- Reviewed its timed dash afterimages (`CreateTrail`, `dashTrailTimer`), deliberate squash/stretch and dash entry freeze. Referenced as motion-design patterns; no C# code, character artwork, audio or game assets copied.
- Original source is MIT, Copyright (c) 2018 Noel Berry. The local implementation remains the project's Canvas/JS actor and effect code.
- Also evaluated `pixel-boy/NinjaAdventure`; no repository license was found, so no assets were copied.

## Natural Earth world-map data

- Dataset: `geojson/ne_110m_admin_0_countries.geojson` from [nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector), pinned commit `ca96624a56bd078437bca8184e78163e5039ad19`.
- Local file: `public/assets/world-countries.geojson`,177countryfeatures, no external runtime service.
- Natural Earth map data is public domain, verified against [official terms](https://www.naturalearthdata.com/about/terms-of-use/). Made with Natural Earth.
- Visual/reference research: [Double C pixel Earth](https://double-c.itch.io/double-cs-pixel-earth), [amCharts Pixel Map Generator](https://pixelmap.amcharts.com/). These are references; their code/artwork was not copied into the game. Pixel rendering/selection styling is project code.
