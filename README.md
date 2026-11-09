# Hero Stages 3 / 2 / 1 — Rive demo and docs

Next.js app with a live preview of `public/Artboard_Stage3.riv`, `public/Artboard_Stage2.riv` and `public/Artboard_Stage1.riv` (Stage 3 / Stage 2 / Stage 1 switch above the character; artboards `Artboard_Stage3`, `Artboard_Stage2` and `Artboard_Stage1`) and integration docs.

- State machine `Adult Avatar Controller`: `outfitColor`, `eyeColor`, `hairColor`, `hairVariants`, `skinVariants`, `Sunglasses`, `isTalking`, `isCelebrating`, triggers `Blink`, `ShieldGlint`, `SwordGlint`
- View model `HeroVM`: `shieldCharge`, `swordCharge`, `chargeActive`, `chargeInactive`, pendant colors, `beltLetter`; eight instances (Purple … Graphite)
- Stage background: `#FFFD12`
- Renderer: `@rive-app/react-webgl2`

```
npm install
npm run dev
```

The original integration notes are in `ART_Hero_Stage3_Integration.md`.
