'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-webgl2';

// ---- Names exactly as they appear in Artboard_Stage3.riv, Artboard_Stage2.riv and Artboard_Stage1.riv ----
const SM = 'Adult Avatar Controller';
const VM = 'HeroVM';

// Three stages: same state machine, same inputs, same view model.
// Only the file and the artboard name differ.
const STAGES = [
  { id: 3, label: 'Stage 3', src: '/Artboard_Stage3.riv', artboard: 'Artboard_Stage3' },
  { id: 2, label: 'Stage 2', src: '/Artboard_Stage2.riv', artboard: 'Artboard_Stage2' },
  { id: 1, label: 'Stage 1', src: '/Artboard_Stage1.riv', artboard: 'Artboard_Stage1' },
];

const OUTFITS = [
  { v: 0, name: 'Purple', dot: '#8559DD', active: 'FF2BD6', inactive: '5B3AA3',
    pendant: { pendantChain: 'E8ADD0', pendantBack: 'BFADE8', pendantBase: '6F3FCE', pendantAccent: '8559DD', pendantCenter: '9367EB' } },
  { v: 1, name: 'Blue', dot: '#3B82F6', active: '00E5FF', inactive: '4851AF',
    pendant: { pendantChain: 'ADB3E8', pendantBack: 'ADC3E8', pendantBase: '3F6ACE', pendantAccent: '597CDD', pendantCenter: '67A5EB' } },
  { v: 2, name: 'Green', dot: '#3FAE6A', active: 'B8FF3C', inactive: '3E9566',
    pendant: { pendantChain: 'BFE8AD', pendantBack: 'B0E8AD', pendantBase: '62CE3F', pendantAccent: '63DD59', pendantCenter: '7FEB67' } },
  { v: 3, name: 'Red', dot: '#E04B4B', active: 'FF2D2D', inactive: 'BC4343',
    pendant: { pendantChain: 'E8ADAD', pendantBack: 'E8ADAD', pendantBase: 'CE3F3F', pendantAccent: 'DD5959', pendantCenter: 'EB6767' } },
  { v: 4, name: 'Gold', dot: '#E5B53A', active: 'FFE600', inactive: 'CF9C25',
    pendant: { pendantChain: 'E8E5AD', pendantBack: 'E8E1AD', pendantBase: 'CEAF3F', pendantAccent: 'DDCD59', pendantCenter: 'EBD267' } },
  { v: 5, name: 'Teal', dot: '#1FA3A0', active: 'FECF3B', inactive: '177173',
    pendant: { pendantChain: 'ADDAE8', pendantBack: 'ADE8E6', pendantBase: '3FCEAC', pendantAccent: '59DDD8', pendantCenter: '67EBE6' } },
  { v: 6, name: 'Rose', dot: '#E26A9B', active: '33E4FE', inactive: 'A62A6B',
    pendant: { pendantChain: 'E8ADCE', pendantBack: 'E8ADD8', pendantBase: 'CE3FC3', pendantAccent: 'DD59B4', pendantCenter: 'EB67D4' } },
  { v: 7, name: 'Graphite', dot: '#4B4E5B', active: 'FD881F', inactive: '4B4E5B',
    pendant: { pendantChain: '7A7D8D', pendantBack: '727789', pendantBase: '2C2D35', pendantAccent: '3B3F48', pendantCenter: '585C6B' } },
];

const SKINS = [
  [0, 'Skin-Light'], [1, 'Skin-Palest'], [2, 'Skin-Medium'], [3, 'Skin-Tan'],
  [4, 'Skin-Deep'], [5, 'Skin-Ebony'], [6, 'Skin-Bronze'], [7, 'Skin-Umber'],
];
const HAIR_STYLES = [
  [0, 'Main-Hair'], [1, 'Hair-Dark-Brown'], [2, 'Hair-Red-Orange'], [3, 'Hair-Afro'], [4, 'Hair-Front'],
];
const HAIR_COLORS = [
  [0, 'Dark-Brown'], [1, 'Chestnut'], [2, 'Auburn'], [3, 'Orange'], [4, 'Blonde'], [5, 'Silver'],
  [6, 'Black'], [7, 'Platinum'], [8, 'Rose'], [9, 'Teal'], [10, 'Violet'], [11, 'Burgundy'],
  [12, 'Grey'], [13, 'Copper'], [14, 'Blue'], [15, 'Mint'], [16, 'Pastel-Pink'],
];
const EYES = [
  [0, 'dark-brown'], [1, 'dark-green'], [2, 'dark-hazel'], [3, 'dark-blue_gray'], [4, 'dark-blue_amber'],
  [5, 'dark-violet'], [6, 'dark-teal'], [7, 'dark-silver'], [8, 'dark-rose'], [9, 'dark-ruby'],
  [10, 'dark-gold'], [11, 'dark-sky'], [12, 'dark-lime'],
];

// Preview colours for the pickers only (approximate, UI helper — not read from the .riv)
const SKIN_HEX = ['#F1C9A5', '#FBE3D3', '#D9A273', '#C08556', '#8D5A3B', '#5B3A29', '#A8703F', '#6E4430'];
const HAIR_HEX = ['#3B2417', '#6B3A22', '#8E3B1F', '#E7762B', '#E8C477', '#C9CCD3', '#16161A', '#EDEBE4', '#E58AAE',
  '#2FA7A0', '#8A5BD6', '#6E1A2E', '#8A8D94', '#B8602B', '#3F78E0', '#8FE3C0', '#F5B8D0'];
const EYE_HEX = ['#5A3A22', '#3E7D4A', '#8A6A2E', '#6F8196', '#7C8B4A', '#7E57C2', '#2A9D9A', '#B8BCC4', '#D56A94',
  '#B3173B', '#D9A21B', '#5BB8F0', '#9ACD32'];

const TABS = [
  ['actions', 'Actions'],
  ['look', 'Look'],
  ['power', 'Power'],
  ['colors', 'Colors'],
];

const PENDANT_DEFAULTS = OUTFITS[0].pendant;
const PENDANT_LABELS = {
  pendantChain: 'Chain',
  pendantBack: 'Back',
  pendantBase: 'Base',
  pendantAccent: 'Accent',
  pendantCenter: 'Center gem',
};

// "100%" = BASE percent of the stage block. Lower BASE = smaller character by default.
const BASE = 78;
const ZOOMS = [100, 80, 75, 50];

const layout = new Layout({ fit: Fit.Contain, alignment: Alignment.Center });

const hexToRgb = (hex) => [
  parseInt(hex.slice(0, 2), 16),
  parseInt(hex.slice(2, 4), 16),
  parseInt(hex.slice(4, 6), 16),
];

export default function Page() {
  const [stageId, setStageId] = useState(3);
  const [tab, setTab] = useState('actions');
  // key = remount, so each stage loads its own .riv cleanly
  return <Demo key={stageId} stageId={stageId} onStage={setStageId} tab={tab} setTab={setTab} />;
}

function Demo({ stageId, onStage, tab, setTab }) {
  const stage = STAGES.find((x) => x.id === stageId);
  const { rive, RiveComponent } = useRive({
    src: stage.src,
    artboard: stage.artboard,
    stateMachines: SM,
    autoplay: true,
    layout,
  });

  const outfitIn = useStateMachineInput(rive, SM, 'outfitColor');
  const eyeIn = useStateMachineInput(rive, SM, 'eyeColor');
  const hairColorIn = useStateMachineInput(rive, SM, 'hairColor');
  const hairVarIn = useStateMachineInput(rive, SM, 'hairVariants');
  const skinIn = useStateMachineInput(rive, SM, 'skinVariants');
  const sunIn = useStateMachineInput(rive, SM, 'Sunglasses');
  const talkIn = useStateMachineInput(rive, SM, 'isTalking');
  const celebIn = useStateMachineInput(rive, SM, 'isCelebrating');
  const blinkIn = useStateMachineInput(rive, SM, 'Blink');
  const shieldGlintIn = useStateMachineInput(rive, SM, 'ShieldGlint');
  const swordGlintIn = useStateMachineInput(rive, SM, 'SwordGlint');

  const ready = !!(outfitIn && eyeIn && hairColorIn && hairVarIn && skinIn && sunIn && talkIn && celebIn);

  // appearance
  const [outfit, setOutfit] = useState(0);
  const [eye, setEye] = useState(0);
  const [hairColor, setHairColor] = useState(0);
  const [hairVar, setHairVar] = useState(0);
  const [skin, setSkin] = useState(0);
  const [sun, setSun] = useState(0);
  // states
  const [talking, setTalking] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  // view model
  const [instance, setInstance] = useState('Purple');
  const [vmi, setVmi] = useState(null);
  const [shield, setShield] = useState(0);
  const [sword, setSword] = useState(0);
  const [letter, setLetter] = useState('A');
  const [chargeActive, setChargeActive] = useState(OUTFITS[0].active);
  const [chargeInactive, setChargeInactive] = useState(OUTFITS[0].inactive);
  const [pendant, setPendant] = useState(PENDANT_DEFAULTS);
  const [zoom, setZoom] = useState(100);
  const [fired, setFired] = useState({ blink: 0, shield: 0, sword: 0 });

  // state machine inputs
  useEffect(() => { if (outfitIn) outfitIn.value = outfit; }, [outfitIn, outfit]);
  useEffect(() => { if (eyeIn) eyeIn.value = eye; }, [eyeIn, eye]);
  useEffect(() => { if (hairColorIn) hairColorIn.value = hairColor; }, [hairColorIn, hairColor]);
  useEffect(() => { if (hairVarIn) hairVarIn.value = hairVar; }, [hairVarIn, hairVar]);
  useEffect(() => { if (skinIn) skinIn.value = skin; }, [skinIn, skin]);
  useEffect(() => { if (sunIn) sunIn.value = sun; }, [sunIn, sun]);
  useEffect(() => { if (talkIn) talkIn.value = talking; }, [talkIn, talking]);
  useEffect(() => { if (celebIn) celebIn.value = celebrating; }, [celebIn, celebrating]);

  // Only values the user has touched are ever written to the view model.
  // Everything else keeps the values authored in Rive.
  const touched = useRef({ shield: null, sword: null, letter: null, colors: {} });
  const [bindNonce, setBindNonce] = useState(0);

  const writeColor = (inst, key, hex) => {
    const c = hexToRgb(hex);
    inst.color(key).rgb(c[0], c[1], c[2]);
  };

  // bind the chosen HeroVM instance, then re-apply ONLY what the user changed
  useEffect(() => {
    if (!rive) return;
    try {
      const vm = rive.viewModelByName(VM);
      const inst = vm && vm.instanceByName(instance);
      if (!inst) return;
      rive.bindViewModelInstance(inst);
      const t = touched.current;
      if (t.shield !== null) inst.number('shieldCharge').value = t.shield;
      if (t.sword !== null) inst.number('swordCharge').value = t.sword;
      if (t.letter !== null) inst.string('beltLetter').value = t.letter;
      Object.entries(t.colors).forEach(([k, hex]) => writeColor(inst, k, hex));
      setVmi(inst);
    } catch (err) {
      console.warn('HeroVM binding failed', err);
    }
  }, [rive, instance, bindNonce]);

  const changeShield = (n) => {
    setShield(n);
    touched.current.shield = n;
    try { if (vmi) vmi.number('shieldCharge').value = n; } catch (e) { console.warn(e); }
  };
  const changeSword = (n) => {
    setSword(n);
    touched.current.sword = n;
    try { if (vmi) vmi.number('swordCharge').value = n; } catch (e) { console.warn(e); }
  };
  const changeLetter = (v) => {
    setLetter(v);
    touched.current.letter = v;
    try { if (vmi) vmi.string('beltLetter').value = v; } catch (e) { console.warn(e); }
  };
  const changeColor = (key, hex) => {
    if (key === 'chargeActive') setChargeActive(hex);
    else if (key === 'chargeInactive') setChargeInactive(hex);
    else setPendant((p) => ({ ...p, [key]: hex }));
    touched.current.colors[key] = hex;
    try { if (vmi) writeColor(vmi, key, hex); } catch (e) { console.warn(e); }
  };

  const pickInstance = (name) => {
    const o = OUTFITS.find((x) => x.name === name);
    setInstance(name);
    setChargeActive(o.active);
    setChargeInactive(o.inactive);
    setPendant(o.pendant);
    touched.current.colors = {}; // the new instance brings its own colors
  };
  const resetColors = () => {
    pickInstance(instance);
    setBindNonce((n) => n + 1); // fresh instance = authored colors
  };
  const pickOutfit = (o) => {
    setOutfit(o.v);
    pickInstance(o.name); // matching charge colors; can be overridden below
  };

  const fire = (input, key) => {
    if (input) input.fire();
    setFired((f) => ({ ...f, [key]: f[key] + 1 }));
  };

  const outfitName = OUTFITS[outfit].name;

  return (
    <>
      {/* ================= HERO — LIVE DEMO ================= */}
      <div className="layout">
        <div className="stage">
          <div className="stage-tabs" role="tablist" aria-label="Stage">
            {STAGES.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={stageId === x.id}
                className={`stage-tab ${stageId === x.id ? 'active' : ''}`}
                onClick={() => onStage(x.id)}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label="Character size"
            style={{
              position: 'absolute', left: 24, bottom: 24, zIndex: 6,
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
              borderRadius: 999, background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#fff', padding: '0 6px' }}>Size</span>
            {ZOOMS.map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                style={{
                  cursor: 'pointer', border: 0, borderRadius: 999, padding: '7px 12px',
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
                  background: zoom === z ? '#fff' : 'transparent',
                  color: zoom === z ? '#111' : '#fff',
                }}
              >
                {z}%
              </button>
            ))}
          </div>
          <div className="pane show">
            <div
              className="canvas-wrap"
              style={{
                width: `${(BASE * zoom) / 100}%`,
                height: `${(BASE * zoom) / 100}%`,
                transition: 'width .2s ease, height .2s ease',
              }}
            >
              <RiveComponent />
            </div>
          </div>
        </div>

        <div className="panel ios">
          <div className="ios-head">
            <div className="ios-eyebrow">
              <span className="pulse" />Live · Hero {stage.label}
            </div>
            <h1>Hero {stage.label}</h1>
            <div className="ios-readout">
              <span>{outfitName}</span><i />
              <span>{instance}</span><i />
              <span>🛡 {shield}</span><i />
              <span>⚔ {sword}</span><i />
              <span>Belt {letter}</span>
            </div>
          </div>

          <div className="ios-seg ios-seg-top" role="tablist">
            {TABS.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>

          {!ready && <div className="ios-note">Loading character…</div>}

          {tab === 'actions' && (
            <>
              <div className="ios-group">
                <ToggleRow label="isTalking" on={talking} disabled={!talkIn} onChange={() => setTalking((v) => !v)} />
                <ToggleRow label="isCelebrating" on={celebrating} disabled={!celebIn} onChange={() => setCelebrating((v) => !v)} />
                <ToggleRow label="Sunglasses" on={!!sun} disabled={!sunIn} onChange={() => setSun((v) => (v ? 0 : 1))} />
              </div>

              <div className="ios-trigger-row">
                <TriggerBtn icon="👁" label="Blink" disabled={!blinkIn} onClick={() => fire(blinkIn, 'blink')} />
                <TriggerBtn icon="🛡" label="ShieldGlint" disabled={!shieldGlintIn} onClick={() => fire(shieldGlintIn, 'shield')} />
                <TriggerBtn icon="⚔" label="SwordGlint" disabled={!swordGlintIn} onClick={() => fire(swordGlintIn, 'sword')} />
              </div>
            </>
          )}

          {tab === 'look' && (
            <>
              <Card title="Outfit" code="outfitColor" value={`${outfit} · ${OUTFITS[outfit].name}`}>
                <SwatchRow items={OUTFITS.map((o) => [o.v, o.name, o.dot])} value={outfit} disabled={!outfitIn} onPick={(v) => pickOutfit(OUTFITS[v])} />
              </Card>
              <Card title="Skin" code="skinVariants" value={`${skin} · ${SKINS[skin][1].replace('Skin-', '')}`}>
                <SwatchRow items={SKINS.map(([v, n]) => [v, n.replace('Skin-', ''), SKIN_HEX[v]])} value={skin} disabled={!skinIn} onPick={setSkin} />
              </Card>
              <Card title="Hair style" code="hairVariants" value={`${hairVar} · ${HAIR_STYLES[hairVar][1].replace('Hair-', '').replace('Main-Hair', 'Main')}`}>
                <div className="ios-seg ios-seg-wrap">
                  {HAIR_STYLES.map(([v, n]) => (
                    <button key={v} className={hairVar === v ? 'on' : ''} disabled={!hairVarIn} onClick={() => setHairVar(v)}>
                      {n.replace('Hair-', '').replace('Main-Hair', 'Main')}
                    </button>
                  ))}
                </div>
              </Card>
              <Card title="Hair color" code="hairColor" value={`${hairColor} · ${HAIR_COLORS[hairColor][1]}`}>
                <SwatchRow items={HAIR_COLORS.map(([v, n]) => [v, n, HAIR_HEX[v]])} value={hairColor} disabled={!hairColorIn} onPick={setHairColor} />
              </Card>
              <Card title="Eyes" code="eyeColor" value={`${eye} · ${EYES[eye][1].replace('dark-', '')}`}>
                <SwatchRow items={EYES.map(([v, n]) => [v, n.replace('dark-', ''), EYE_HEX[v]])} value={eye} disabled={!eyeIn} onPick={setEye} />
              </Card>
            </>
          )}

          {tab === 'power' && (
            <>
              <Card title="Shield charge" code="shieldCharge" value={`${shield} / 5`}>
                <div className="ios-seg">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className={shield === n ? 'on' : ''} disabled={!vmi} onClick={() => changeShield(n)}>{n}</button>
                  ))}
                </div>
              </Card>
              <Card title="Sword charge" code="swordCharge" value={`${sword} / 5`}>
                <div className="ios-seg">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className={sword === n ? 'on' : ''} disabled={!vmi} onClick={() => changeSword(n)}>{n}</button>
                  ))}
                </div>
              </Card>
              <div className="ios-group">
                <div className="ios-row">
                  <span className="ios-label">Belt letter<small>beltLetter · A–Z</small></span>
                  <input
                    className="ios-letter"
                    type="text"
                    maxLength={1}
                    value={letter}
                    disabled={!vmi}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                      if (v) changeLetter(v);
                    }}
                    aria-label="Belt letter"
                  />
                </div>
              </div>
            </>
          )}

          {tab === 'colors' && (
            <>
              <Card title="Instance" code="HeroVM" value={instance}>
                <SwatchRow items={OUTFITS.map((o) => [o.name, o.name, `#${o.active}`])} value={instance} disabled={!rive} onPick={pickInstance} />
              </Card>
              <div className="ios-group">
                <ColorRow label="chargeActive" value={chargeActive} onChange={(h) => changeColor('chargeActive', h)} disabled={!vmi} />
                <ColorRow label="chargeInactive" value={chargeInactive} onChange={(h) => changeColor('chargeInactive', h)} disabled={!vmi} />
                {Object.keys(PENDANT_DEFAULTS).map((k) => (
                  <ColorRow key={k} label={k} value={pendant[k]} onChange={(hex) => changeColor(k, hex)} disabled={!vmi} />
                ))}
              </div>
              <button className="ios-btn" disabled={!vmi} onClick={resetColors}>Reset colors to instance</button>
            </>
          )}

          <a className="scroll-cue" href="#overview">
            <span>Integration docs</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* ================= DOCUMENTATION ================= */}
      <div className="docs">
        <div className="docs-shell">
          <DocsNav />

          <div className="docs-body">
            <DocSection id="overview" eyebrow="Overview" title="Two independent control layers">
              <p>
                The character in <code>Artboard_Stage3.riv</code>,{' '}
                <code>Artboard_Stage2.riv</code> and{' '}
                <code>Artboard_Stage1.riv</code> is fixed
                inside a 3000 × 3201 artboard, so do not scale it per
                stage. It is controlled in two separate ways that do not
                affect each other.
              </p>
              <div className="update-grid">
                <div className="update-card system-a">
                  <div className="update-card-title">State machine</div>
                  <ul>
                    <li><code>{SM}</code></li>
                    <li>Outfit, eyes, hair, skin, sunglasses</li>
                    <li><code>isTalking</code>, <code>isCelebrating</code>, glints, blink</li>
                  </ul>
                </div>
                <div className="update-card">
                  <div className="update-card-title">View model <code>{VM}</code></div>
                  <ul>
                    <li>Shield and sword charge, 0 to 5</li>
                    <li>Charge and pendant colors</li>
                    <li>Belt letter</li>
                  </ul>
                </div>
              </div>
              <p>
                Changing <code>outfitColor</code> does not change the charge
                colors, and switching the view model instance does not change
                the outfit.
              </p>
            </DocSection>

            <DocSection id="inputs" eyebrow="State machine" title="Inputs">
              <table className="stage-table">
                <thead>
                  <tr><th>Input</th><th>Type</th><th>Range</th><th>Default</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>Sunglasses</code></td><td>Number</td><td>0 or 1</td><td>0</td></tr>
                  <tr><td><code>isTalking</code></td><td>Boolean</td><td>true / false</td><td>false</td></tr>
                  <tr><td><code>isCelebrating</code></td><td>Boolean</td><td>true / false</td><td>false</td></tr>
                  <tr><td><code>ShieldGlint</code></td><td>Trigger</td><td>fire</td><td>n/a</td></tr>
                  <tr><td><code>SwordGlint</code></td><td>Trigger</td><td>fire</td><td>n/a</td></tr>
                  <tr><td><code>Blink</code></td><td>Trigger</td><td>fire</td><td>n/a</td></tr>
                  <tr><td><code>outfitColor</code></td><td>Number</td><td>0 to 7</td><td>0</td></tr>
                  <tr><td><code>eyeColor</code></td><td>Number</td><td>0 to 12</td><td>0</td></tr>
                  <tr><td><code>hairColor</code></td><td>Number</td><td>0 to 16</td><td>0</td></tr>
                  <tr><td><code>hairVariants</code></td><td>Number</td><td>0 to 4</td><td>0</td></tr>
                  <tr><td><code>skinVariants</code></td><td>Number</td><td>0 to 7</td><td>0</td></tr>
                </tbody>
              </table>
              <p>
                Each customization input drives one Blend 1D state, so any
                combination can be set together. Send whole numbers only:
                a value between two stops would blend two options.
              </p>
            </DocSection>

            <DocSection id="values" eyebrow="State machine" title="Value maps">
              <h3>outfitColor</h3>
              <MapTable head={['Value', 'Outfit']} rows={OUTFITS.map((o) => [o.v, o.name + (o.v === 0 ? ' (base)' : '')])} />
              <h3>skinVariants</h3>
              <MapTable head={['Value', 'Timeline']} rows={SKINS} code />
              <p>The order is not light to dark. Use the table.</p>
              <h3>hairVariants</h3>
              <MapTable head={['Value', 'Timeline']} rows={HAIR_STYLES} code />
              <h3>hairColor</h3>
              <MapTable head={['Value', 'Timeline']} rows={HAIR_COLORS.map(([v, n]) => [v, `Hair_${n}`])} code />
              <h3>eyeColor</h3>
              <MapTable head={['Value', 'Timeline']} rows={EYES.map(([v, n]) => [v, `eye_${n}`])} code />
              <h3>Sunglasses</h3>
              <MapTable head={['Value', 'Timeline']} rows={[[0, 'Sunglasses_Off'], [1, 'Sunglasses_On']]} code />
            </DocSection>

            <DocSection id="viewmodel" eyebrow="View model" title={`${VM} properties`}>
              <table className="stage-table">
                <thead>
                  <tr><th>Property</th><th>Type</th><th>Default (Purple)</th><th>Purpose</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>chargeActive</code></td><td>Color</td><td><code>FF2BD6</code></td><td>Lit charge segments, shield and sword</td></tr>
                  <tr><td><code>chargeInactive</code></td><td>Color</td><td><code>5B3AA3</code></td><td>Unlit charge segments, shield and sword</td></tr>
                  <tr><td><code>shieldCharge</code></td><td>Number</td><td>0</td><td>Shield charge level, 0 to 5</td></tr>
                  <tr><td><code>swordCharge</code></td><td>Number</td><td>0</td><td>Sword charge level, 0 to 5</td></tr>
                  <tr><td><code>pendantChain</code></td><td>Color</td><td><code>E8ADD0</code></td><td>Pendant chain</td></tr>
                  <tr><td><code>pendantBack</code></td><td>Color</td><td><code>BFADE8</code></td><td>Pendant back</td></tr>
                  <tr><td><code>pendantBase</code></td><td>Color</td><td><code>6F3FCE</code></td><td>Pendant base</td></tr>
                  <tr><td><code>pendantAccent</code></td><td>Color</td><td><code>8559DD</code></td><td>Pendant accent</td></tr>
                  <tr><td><code>pendantCenter</code></td><td>Color</td><td><code>9367EB</code></td><td>Pendant center gem</td></tr>
                  <tr><td><code>beltLetter</code></td><td>String</td><td><code>A</code></td><td>Letter on the belt</td></tr>
                </tbody>
              </table>
              <h3>Charge</h3>
              <p>
                <code>shieldCharge</code> and <code>swordCharge</code> are
                independent. A value of N lights N of the 5 segments: 0 lights
                none, 5 lights all. Lit segments use <code>chargeActive</code>,
                unlit ones use <code>chargeInactive</code>, and shield and
                sword share the same two colors.
              </p>
              <h3>Belt letter</h3>
              <p>
                A single uppercase character, A to Z. Rive does not enforce
                this, so validate it before sending.
              </p>
            </DocSection>

            <DocSection id="instances" eyebrow="View model" title="Instances">
              <p>
                Each instance carries its own charge color pair and its own
                pendant colors. The default instance is <code>Purple</code>.
                The instance name matches the outfit name but is not linked
                to <code>outfitColor</code>: select the instance and set{' '}
                <code>outfitColor</code> separately.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="stage-table">
                  <thead>
                    <tr>
                      <th>Instance</th><th>chargeActive</th><th>chargeInactive</th>
                      <th>pendantChain</th><th>pendantBack</th><th>pendantBase</th>
                      <th>pendantAccent</th><th>pendantCenter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OUTFITS.map((o) => (
                      <tr key={o.name}>
                        <td>{o.name}{o.v === 0 ? ' (default)' : ''}</td>
                        <td><code>{o.active}</code></td>
                        <td><code>{o.inactive}</code></td>
                        <td><code>{o.pendant.pendantChain}</code></td>
                        <td><code>{o.pendant.pendantBack}</code></td>
                        <td><code>{o.pendant.pendantBase}</code></td>
                        <td><code>{o.pendant.pendantAccent}</code></td>
                        <td><code>{o.pendant.pendantCenter}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                All eight start with <code>shieldCharge = 0</code>,{' '}
                <code>swordCharge = 0</code> and <code>beltLetter = A</code>.
                Binding an instance also changes the pendant, because the
                pendant colors differ per instance. You can set any of the
                color properties directly at runtime to override the instance.
              </p>
              <LiveFeed
                label="Triggers fired from this page"
                text={
                  fired.blink + fired.shield + fired.sword === 0
                    ? 'waiting for first trigger…'
                    : `${fired.blink} blink · ${fired.shield} shield glint · ${fired.sword} sword glint`
                }
              />
            </DocSection>

            <DocSection id="usage" eyebrow="Recommended usage" title="Showing a hero">
              <ol className="check-list">
                <li>Bind the <code>{VM}</code> instance whose charge colors fit the outfit (for example <code>Blue</code> with <code>outfitColor = 1</code>).</li>
                <li>Set the customization inputs: <code>outfitColor</code>, <code>eyeColor</code>, <code>hairColor</code>, <code>hairVariants</code>, <code>skinVariants</code>, <code>Sunglasses</code>.</li>
                <li>Set <code>shieldCharge</code>, <code>swordCharge</code> and <code>beltLetter</code>; override the charge or pendant colors only if you need different ones.</li>
                <li>Drive <code>isTalking</code> and <code>isCelebrating</code>, and fire <code>Blink</code>, <code>ShieldGlint</code> and <code>SwordGlint</code>.</li>
              </ol>
            </DocSection>

            <DocSection id="js" eyebrow="JavaScript" title="Web integration example">
              <CodeBlock code={JS_EXAMPLE} />
            </DocSection>

            <DocSection id="files" eyebrow="Files" title="Where the file lives">
              <p>
                The <code>.riv</code> is a plain static asset, loaded by path
                from <code>/public</code>.
              </p>
              <div className="tree-block">{`public/
  Artboard_Stage3.riv   artboard "Artboard_Stage3" (3000 × 3201)
  Artboard_Stage2.riv   artboard "Artboard_Stage2" (3000 × 3201)
  Artboard_Stage1.riv   artboard "Artboard_Stage1"
                        both: state machine "${SM}"
                              view model "${VM}", default instance "Purple"`}</div>
            </DocSection>

            <DocSection id="checklist" eyebrow="Integration Checklist" title="Ship it">
              <ul className="check-list boxes">
                <li>Load <code>Artboard_Stage3.riv</code>, <code>Artboard_Stage2.riv</code> or <code>Artboard_Stage1.riv</code> with its artboard name and state machine <code>{SM}</code></li>
                <li>Keep the character unscaled inside the artboard</li>
                <li>Bind a <code>{VM}</code> instance, then set charge, colors and belt letter</li>
                <li>Set the customization inputs with whole numbers inside their ranges</li>
                <li>Drive <code>isTalking</code> / <code>isCelebrating</code>, fire the triggers</li>
                <li>Done</li>
              </ul>
            </DocSection>

            <footer className="docs-footer">
              Hero Stage 3 / Stage 2 / Stage 1 · Rive integration docs
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

function Card({ title, code, value, children }) {
  return (
    <div className="ios-card">
      <div className="ios-card-head">
        <span className="ios-card-title">{title}<em>{code}</em></span>
        <span className="ios-card-value">{value}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, on, onChange, disabled }) {
  return (
    <button className="ios-row ios-row-btn" disabled={disabled} onClick={onChange} role="switch" aria-checked={on}>
      <span className="ios-label">{label}</span>
      <span className={`ios-switch ${on ? 'on' : ''}`}><span /></span>
    </button>
  );
}

function TriggerBtn({ icon, label, onClick, disabled }) {
  return (
    <button className="ios-trigger" disabled={disabled} onClick={onClick}>
      <span className="ios-trigger-ico">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SwatchRow({ items, value, onPick, disabled }) {
  return (
    <div className="ios-swatches">
      {items.map(([v, name, color]) => (
        <button
          key={v}
          title={name}
          aria-label={name}
          className={`ios-swatch ${value === v ? 'on' : ''}`}
          disabled={disabled}
          onClick={() => onPick(v)}
        >
          <span style={{ background: color }} />
        </button>
      ))}
    </div>
  );
}

function ColorRow({ label, value, onChange, disabled }) {
  return (
    <label className="ios-row">
      <span className="ios-label">{label}</span>
      <span className="ios-colorval">
        <b>{value}</b>
        <input
          type="color"
          value={`#${value.toLowerCase()}`}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.slice(1).toUpperCase())}
        />
      </span>
    </label>
  );
}

function OptionGrid({ items, value, onPick, disabled, label }) {
  return (
    <div className="opt-grid">
      {items.map(([v, name]) => (
        <button key={v} className={`chip-btn ${value === v ? 'on' : ''}`} disabled={disabled} onClick={() => onPick(v)}>
          {v} · {label ? label(name) : name}
        </button>
      ))}
    </div>
  );
}

function ColorField({ label, value, onChange, disabled }) {
  return (
    <label className="color-field">
      <input
        type="color"
        value={`#${value.toLowerCase()}`}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.slice(1).toUpperCase())}
      />
      {label}
      <b>{value}</b>
    </label>
  );
}

function MapTable({ head, rows, code }) {
  return (
    <table className="stage-table">
      <thead>
        <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a}>
            <td>{a}</td>
            <td>{code ? <code>{b}</code> : b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocsNav() {
  const items = [
    ['overview', 'Overview'],
    ['inputs', 'Inputs'],
    ['values', 'Value Maps'],
    ['viewmodel', 'View Model'],
    ['instances', 'Instances'],
    ['usage', 'Usage'],
    ['js', 'JavaScript'],
    ['files', 'Files'],
    ['checklist', 'Checklist'],
  ];
  return (
    <nav className="docs-nav">
      <div className="docs-nav-label">Contents</div>
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`}>{label}</a>
      ))}
    </nav>
  );
}

function DocSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="doc-section">
      <div className="doc-eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function LiveFeed({ label, text }) {
  return (
    <div className="live-feed">
      <span className="live-feed-dot" />
      <span className="live-feed-label">{label}</span>
      <span className="live-feed-value">{text}</span>
    </div>
  );
}

function CodeBlock({ code }) {
  return <pre className="code-block"><code>{code}</code></pre>;
}

const JS_EXAMPLE = `import { Rive, Fit, Alignment, Layout } from '@rive-app/canvas'

const SM = 'Adult Avatar Controller'

const hero = new Rive({
  src: '/Artboard_Stage3.riv',      // or '/Artboard_Stage2.riv', '/Artboard_Stage1.riv'
  artboard: 'Artboard_Stage3',      // or 'Artboard_Stage2', 'Artboard_Stage1'
  canvas: document.getElementById('canvas'),
  stateMachines: SM,
  autoplay: true,
  layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  onLoad: () => {
    // 1. view model instance (charge colors)
    const vm = hero.viewModelByName('HeroVM')
    const vmi = vm.instanceByName('Blue')
    hero.bindViewModelInstance(vmi)

    vmi.number('shieldCharge').value = 3      // 0 to 5
    vmi.number('swordCharge').value = 5
    vmi.string('beltLetter').value = 'K'      // one uppercase letter
    vmi.color('pendantCenter').rgb(147, 103, 235)   // optional override

    // 2. state machine inputs
    const inputs = hero.stateMachineInputs(SM)
    const get = (name) => inputs.find((i) => i.name === name)

    get('outfitColor').value = 1              // Blue
    get('skinVariants').value = 3
    get('hairColor').value = 4
    get('hairVariants').value = 0
    get('eyeColor').value = 5
    get('Sunglasses').value = 0

    get('isTalking').value = true
    get('Blink').fire()
    get('ShieldGlint').fire()
  },
})`;