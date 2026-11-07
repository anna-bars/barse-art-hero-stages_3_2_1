# Hero Stage 3 — Rive Integration Reference

File: `ART_Hero_Stage3.riv`
---

## 1. Structure at a glance

| Item | Value |
|---|---|
| Artboard | `Artboard` (3000 × 3201, fixed size) |
| State machine | `Adult Avatar Controller` (marked Default; the only one seen) |
| Artboard view model | `HeroVM` |
| Default view model instance | `Purple` |
| Character size/position | Fixed inside the artboard. Do not scale the character per stage. |

The character is controlled in two separate ways:

1. **State machine inputs**: appearance (outfit, eyes, hair, skin, sunglasses), talk/celebrate state, blink and glints.
2. **View model `HeroVM`**: charge level of the shield and sword, charge colors, pendant colors and the belt letter.

These are independent of each other. Changing `outfitColor` does **not** change the charge colors, and changing the view model instance does **not** change the outfit.

---

## 2. State machine inputs (`Adult Avatar Controller`)

All inputs below exist in the state machine. Defaults observed at start: all numbers `0`, booleans unchecked.

| Input | Type | Group in editor | Range | Default |
|---|---|---|---|---|
| `Sunglasses` | Number | (root) | `0` or `1` | `0` |
| `isTalking` | Boolean | States | true / false | false |
| `isCelebrating` | Boolean | States | true / false | false |
| `ShieldGlint` | Trigger | Effects | fire | n/a |
| `SwordGlint` | Trigger | Effects | fire | n/a |
| `Blink` | Trigger | Effects | fire | n/a |
| `outfitColor` | Number | Customization | `0` to `7` | `0` |
| `eyeColor` | Number | Customization | `0` to `12` | `0` |
| `hairColor` | Number | Customization | `0` to `16` | `0` |
| `hairVariants` | Number | Customization | `0` to `4` | `0` |
| `skinVariants` | Number | Customization | `0` to `7` | `0` |

There are no charge inputs in the state machine. Charge is controlled only through `HeroVM` (section 4).

### Blend states that read these inputs

Each customization input drives one Blend 1D state. The timeline value is the input value.

| Blend state | Driven by input | Layer it sits in |
|---|---|---|
| `Outfits Blend` | `outfitColor` | `Outfit Colors` |
| `Eye Color Blend` | `eyeColor` | `Eye Color Variants` |
| `Hair Variants Blend` | `hairVariants` | `Hair Variants` |
| `Hair Color Blend` | `hairColor` | `Hair Colors` |
| `Skin Blend` | `skinVariants` | `Skin Variants` |
| `Sunglasses Blend` | `Sunglasses` | not checked |

---

## 3. Value maps (input value → option)

### `outfitColor` (0–7)
| Value | Outfit |
|---|---|
| 0 | Purple (base) |
| 1 | Blue |
| 2 | Green |
| 3 | Red |
| 4 | Gold |
| 5 | Teal |
| 6 | Rose |
| 7 | Graphite |

### `skinVariants` (0–7)
| Value | Timeline |
|---|---|
| 0 | `Skin-Light` |
| 1 | `Skin-Palest` |
| 2 | `Skin-Medium` |
| 3 | `Skin-Tan` |
| 4 | `Skin-Deep` |
| 5 | `Skin-Ebony` |
| 6 | `Skin-Bronze` |
| 7 | `Skin-Umber` |

Note that value order is **not** light-to-dark. Use the table.

### `hairVariants` (0–4)
| Value | Timeline |
|---|---|
| 0 | `Main-Hair` |
| 1 | `Hair-Dark-Brown` |
| 2 | `Hair-Red-Orange` |
| 3 | `Hair-Afro` |
| 4 | `Hair-Front` |

### `hairColor` (0–16)
| Value | Timeline | Value | Timeline |
|---|---|---|---|
| 0 | `Hair_Dark-Brown` | 9 | `Hair_Teal` |
| 1 | `Hair_Chestnut` | 10 | `Hair_Violet` |
| 2 | `Hair_Auburn` | 11 | `Hair_Burgundy` |
| 3 | `Hair_Orange` | 12 | `Hair_Grey` |
| 4 | `Hair_Blonde` | 13 | `Hair_Copper` |
| 5 | `Hair_Silver` | 14 | `Hair_Blue` |
| 6 | `Hair_Black` | 15 | `Hair_Mint` |
| 7 | `Hair_Platinum` | 16 | `Hair_Pastel-Pink` |
| 8 | `Hair_Rose` | | |

### `eyeColor` (0–12)
| Value | Timeline |
|---|---|
| 0 | `eye_dark-brown` |
| 1 | `eye_dark-green` |
| 2 | `eye_dark-hazel` |
| 3 | `eye_dark-blue_gray` |
| 4 | `eye_dark-blue_amber` |
| 5 | `eye_dark-violet` |
| 6 | `eye_dark-teal` |
| 7 | `eye_dark-silver` |
| 8 | `eye_dark-rose` |
| 9 | `eye_dark-ruby` |
| 10 | `eye_dark-gold` |
| 11 | `eye_dark-sky` |
| 12 | `eye_dark-lime` |

### `Sunglasses` (0 or 1)
| Value | Timeline |
|---|---|
| 0 | `Sunglasses_Off` |
| 1 | `Sunglasses_On` |

Use only `0` or `1`. The state is a Blend 1D, so values between 0 and 1 would blend the two timelines.

Any combination of the customization inputs can be set together.

---

## 4. View model `HeroVM`

The artboard is bound to `HeroVM`. Properties:

| Property | Type | Default (instance `Purple`) | Purpose |
|---|---|---|---|
| `chargeActive` | Color | `FF2BD6` | Color of lit charge segments (shield and sword) |
| `chargeInactive` | Color | `5B3AA3` | Color of unlit charge segments (shield and sword) |
| `shieldCharge` | Number | `0` | Shield charge level, `0` to `5` |
| `swordCharge` | Number | `0` | Sword charge level, `0` to `5` |
| `pendantChain` | Color | `BFADE8` | Pendant chain |
| `pendantBack` | Color | `BFADE8` | Pendant back |
| `pendantBase` | Color | `6F3FCE` | Pendant base |
| `pendantAccent` | Color | `8559DD` | Pendant accent |
| `pendantCenter` | Color | `9367EB` | Pendant center gem |
| `beltLetter` | String | `A` | Letter shown on the belt |

### Charge behavior (checked in the editor)
- `shieldCharge` and `swordCharge` are independent. A value of `N` lights `N` of the 5 segments; `0` lights none, `5` lights all.
- Values `0`, `1`, `2`, `3`, `4` and `5` were exercised.
- Lit segments use `chargeActive`, unlit segments use `chargeInactive`. Shield and sword share the same two colors.

### Belt letter
- `beltLetter` is a single character. The intended range is uppercase `A` to `Z`. The editor does not enforce this, so send one uppercase character.

### Instances of `HeroVM`
Instances carry the charge color pair. The instance is selected on the artboard (default: `Purple`). The instance name matches the outfit name, but it is **not** linked to `outfitColor`: select the instance and set `outfitColor` separately.

| Instance | `chargeActive` | `chargeInactive` |
|---|---|---|
| `Purple` (default) | `FF2BD6` | `5B3AA3` |
| `Blue` | `00E5FF` | `4851AF` |
| `Green` | `B8FF3C` | `3E9566` |
| `Red` | `FF2D2D` | `BC4343` |
| `Gold` | `FFE600` | `CF9C25` |
| `Teal` | `FECF3B` | `177173` |
| `Rose` | `33E4FE` | `A62A6B` |
| `Graphite` | `FD881F` | `4B4E5B` |

All eight instances have `shieldCharge = 0`, `swordCharge = 0`, `beltLetter = A` and the pendant colors listed in the property table above.

You can also skip instances and set `chargeActive` / `chargeInactive` directly at runtime with any colors.

---

## 5. Recommended usage

To show a hero, set (in any order):

1. Bind the `HeroVM` instance whose charge colors fit the outfit (for example `Blue` with `outfitColor = 1`).
2. Set the customization inputs: `outfitColor`, `eyeColor`, `hairColor`, `hairVariants`, `skinVariants`, and `Sunglasses`.
3. Set `shieldCharge`, `swordCharge`, `beltLetter` and, if needed, the pendant colors.
4. Drive `isTalking` and `isCelebrating` as needed, and fire `Blink`, `ShieldGlint` and `SwordGlint` triggers.


