import { ArrowDownRight, ArrowRight, Braces, Check, Code2, Layers3, MousePointer2, PanelsTopLeft, ScanLine, SlidersHorizontal, Smartphone, Sparkles } from 'lucide-react';

interface Props { onOpenPlayground: () => void; }

const features = [
  { n: '01', icon: Layers3, title: 'Build with blocks', desc: 'Start with practical UI pieces, then compose them into a layout that feels like yours.' },
  { n: '02', icon: SlidersHorizontal, title: 'Tune every detail', desc: 'Change copy, spacing, colour and alignment from the properties panel. See each change on the canvas.' },
  { n: '03', icon: Smartphone, title: 'Think beyond desktop', desc: 'Check how an interface behaves at different widths before you call it finished.' },
  { n: '04', icon: Braces, title: 'Learn from the output', desc: 'Inspect the generated markup and styles instead of treating the interface like a black box.' },
  { n: '05', icon: ScanLine, title: 'Catch rough edges', desc: 'Use interface checks to spot common usability and layout issues while you work.' },
];

const examples = [
  { name: 'Primary action', tag: 'BUTTON', sample: <button className="demo-primary">Create account <ArrowRight size={14} /></button> },
  { name: 'Content card', tag: 'CARD', sample: <div className="demo-card"><span className="demo-card-kicker">FIELD NOTES / 004</span><strong>Make room for good ideas.</strong><span className="demo-lines"><i /><i /><i /></span></div> },
  { name: 'Status badge', tag: 'BADGE', sample: <span className="demo-badge"><span /> Ready to ship</span> },
  { name: 'Form field', tag: 'INPUT', sample: <div className="demo-input"><span>Email address</span><div>you@example.com <ArrowRight size={13} /></div></div> },
];

export function Landing({ onOpenPlayground }: Props) {
  return <main className="ix-site">
    <nav className="ix-nav">
      <a className="ix-brand" href="#top" aria-label="InterfaceX home"><span className="ix-brand-mark"><PanelsTopLeft size={19} strokeWidth={2.4} /></span><span>interface<span className="ix-brand-x">x</span><small>THE FRONTEND WORKSHOP</small></span></a>
      <div className="ix-nav-links"><a href="#approach">Approach</a><a href="#components">Components</a><a href="#workflow">Workflow</a></div>
      <button className="ix-nav-cta" onClick={onOpenPlayground}>Open the workspace <ArrowRight size={15} /></button>
    </nav>

    <section id="top" className="ix-hero">
      <div className="ix-hero-copy">
        <div className="ix-eyebrow"><span className="ix-live-dot" /> A hands-on frontend playground <span className="ix-eyebrow-line" /></div>
        <h1>From rough idea<br />to <em>real interface.</em></h1>
        <p className="ix-hero-description">A visual space to experiment with UI, understand how components fit together, and leave with code you can actually learn from.</p>
        <div className="ix-hero-actions"><button className="ix-button-primary" onClick={onOpenPlayground}>Start building <ArrowRight size={17} /></button><a className="ix-text-link" href="#approach">See how it works <ArrowDownRight size={16} /></a></div>
        <div className="ix-proof"><div className="ix-proof-icon"><Check size={15} /></div><span>No account. No setup. Just start experimenting.</span></div>
      </div>
      <div className="ix-hero-art" aria-label="Illustration of the InterfaceX visual editor">
        <div className="ix-art-note">A LITTLE LESS GUESSWORK <Sparkles size={13} /></div>
        <div className="ix-editor-window">
          <div className="ix-window-top"><div className="ix-window-dots"><i /><i /><i /></div><span>untitled-interface / editor</span><span className="ix-save-state"><span /> Saved locally</span></div>
          <div className="ix-editor-toolbar"><span className="ix-toolbar-logo"><PanelsTopLeft size={14} /></span><span className="ix-toolbar-project">Untitled project</span><span className="ix-toolbar-spacer" /><span className="ix-toolbar-pill">Design</span><span className="ix-toolbar-code">{'</>'} Code</span></div>
          <div className="ix-editor-body">
            <aside className="ix-editor-side"><span className="ix-panel-label">INSERT</span><div className="ix-tool-item ix-tool-active"><Layers3 size={13} /> Components</div><div className="ix-tool-item"><MousePointer2 size={13} /> Select</div><div className="ix-tool-item"><SlidersHorizontal size={13} /> Layout</div><div className="ix-side-divider"/><span className="ix-panel-label">ELEMENTS</span>{['Button','Card','Navbar','Form'].map((x,i)=><div className="ix-element" key={x}><span>{['◧','▱','☰','▤'][i]}</span>{x}<b>+</b></div>)}</aside>
            <div className="ix-canvas"><div className="ix-canvas-label"><span>CANVAS / 01</span><span>100%</span></div><div className="ix-preview-site"><div className="ix-preview-nav"><span className="ix-preview-logo"><i /> northstar</span><span>Work&nbsp;&nbsp;&nbsp; About&nbsp;&nbsp;&nbsp; <b>Contact ↗</b></span></div><div className="ix-preview-content"><span className="ix-preview-overline">INDEPENDENT BY DESIGN</span><h3>Good work<br />starts <em>somewhere.</em></h3><p>A small studio for ideas<br />that deserve a little more.</p><button>Explore the studio <ArrowRight size={11} /></button></div><div className="ix-preview-footer"><span>01 — 03</span><span>Scroll to explore ↓</span></div><div className="ix-selection"><span>Hero section</span><i /><i /><i /><i /></div></div></div>
            <aside className="ix-properties"><span className="ix-panel-label">PROPERTIES</span><div className="ix-property-title">Hero section <span>⌘</span></div><label>CONTENT</label><div className="ix-property-field">Good work starts somewhere.</div><label>TYPOGRAPHY</label><div className="ix-property-pair"><span>Size</span><b>48 px</b></div><div className="ix-property-pair"><span>Weight</span><b>Medium⌄</b></div><label>APPEARANCE</label><div className="ix-property-pair"><span>Text colour</span><b><i className="ix-swatch" /> #20251F</b></div><div className="ix-property-pair"><span>Radius</span><b>08 px</b></div></aside>
          </div>
          <div className="ix-code-strip"><div className="ix-code-heading"><Code2 size={13} /> GENERATED OUTPUT <span>index.html</span></div><code><i>&lt;section</i> class=<b>"hero"</b><i>&gt;</i> <span>&lt;h1&gt;</span>Good work starts somewhere.<span>&lt;/h1&gt;</span> <i>&lt;/section&gt;</i></code><span className="ix-code-status"><Check size={12} /> In sync</span></div>
        </div>
        <div className="ix-art-caption"><span>01 / THE WORKSPACE</span><span>DESIGN ↔ CODE</span></div>
      </div>
      <div className="ix-hero-bottom"><span>MADE FOR THE CURIOUS</span><span className="ix-bottom-rule"/><span>DESIGN IT. UNDERSTAND IT. BUILD IT.</span></div>
    </section>

    <section className="ix-intro" id="approach"><div className="ix-section-index">[ WHY INTERFACEX ]</div><div className="ix-intro-content"><h2>Not another magic button.<br /><em>A place to learn by making.</em></h2><div><p>InterfaceX sits between a blank editor and a finished website. Build visually, try things without fear, and see the structure behind the screen.</p><p className="ix-muted-copy">It is a workshop for the process—not a shortcut around understanding it.</p></div></div></section>

    <section className="ix-features"><div className="ix-section-heading"><div><div className="ix-section-index">[ YOUR TOOLKIT ]</div><h2>Small tools.<br /><em>Better instincts.</em></h2></div><p>Everything has a job. Each part of the workspace is designed to help you make a decision, test it, or understand what changed.</p></div><div className="ix-feature-list">{features.map((f)=><article className="ix-feature-row" key={f.n}><span className="ix-feature-number">{f.n}</span><span className="ix-feature-icon"><f.icon size={20} strokeWidth={1.7} /></span><h3>{f.title}</h3><p>{f.desc}</p><ArrowDownRight className="ix-feature-arrow" size={19} /></article>)}</div></section>

    <section className="ix-components" id="components"><div className="ix-components-heading"><div><div className="ix-section-index">[ THE BUILDING BLOCKS ]</div><h2>Start with a piece.<br /><em>Make it your own.</em></h2></div><p>A quick look at the kinds of UI elements you can experiment with in the workspace.</p></div><div className="ix-component-grid">{examples.map((item,i)=><article className="ix-component-card" key={item.name}><div className="ix-component-meta"><span>{item.tag}</span><span>0{i+1}</span></div><div className={`ix-component-stage ix-stage-${i}`}>{item.sample}</div><div className="ix-component-name">{item.name}<ArrowUpRightIcon /></div></article>)}</div><div className="ix-components-foot"><span>THE LIBRARY GROWS WITH YOUR IDEAS</span><button onClick={onOpenPlayground}>Explore the workspace <ArrowRight size={15} /></button></div></section>

    <section className="ix-workflow" id="workflow"><div className="ix-section-index">[ A SIMPLE LOOP ]</div><div className="ix-workflow-layout"><h2>Make a change.<br /><em>See what happens.</em></h2><div className="ix-steps">{[{n:'01',title:'Choose',desc:'Pick a component to get moving.'},{n:'02',title:'Shape it',desc:'Adjust the content and visual details.'},{n:'03',title:'Inspect',desc:'Preview the result and check the layout.'},{n:'04',title:'Take the code',desc:'Read, copy, and build on what you made.'}].map(s=><div className="ix-step" key={s.n}><span>{s.n}</span><div><h3>{s.title}</h3><p>{s.desc}</p></div><ArrowRight size={16} /></div>)}</div></div></section>

    <section className="ix-cta"><div className="ix-cta-stamp"><Braces size={23} /></div><div><div className="ix-section-index">[ YOUR CANVAS IS WAITING ]</div><h2>Curiosity is a good<br />place to <em>start.</em></h2><p>Open a project and see where the first experiment takes you.</p></div><button onClick={onOpenPlayground}>Open InterfaceX <ArrowRight size={17} /></button><span className="ix-cta-asterisk">✳</span></section>

    <footer className="ix-footer"><a className="ix-brand" href="#top"><span className="ix-brand-mark"><PanelsTopLeft size={19} strokeWidth={2.4} /></span><span>interface<span className="ix-brand-x">x</span><small>THE FRONTEND WORKSHOP</small></span></a><span>Built to make the frontend feel less like a black box.</span><span>INTERFACEX © 2026</span></footer>
  </main>;
}

function ArrowUpRightIcon() { return <ArrowRight size={15} className="ix-card-arrow" />; }
