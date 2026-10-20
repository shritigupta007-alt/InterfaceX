import {
  Layers, SlidersHorizontal, Smartphone, Code2, ScanSearch,
  ArrowRight, MousePointerClick, Eye, Wrench, Check,
} from 'lucide-react';

interface Props {
  onOpenPlayground: () => void;
}

const features = [
  { icon: Layers, title: 'Visual Component Builder', desc: 'Assemble interfaces from reusable elements without writing markup by hand.' },
  { icon: SlidersHorizontal, title: 'Live Property Editing', desc: 'Change styling and content and instantly see the results on the canvas.' },
  { icon: Smartphone, title: 'Responsive Preview', desc: 'Inspect your design at desktop, tablet, and mobile widths side by side.' },
  { icon: Code2, title: 'Code Explorer', desc: 'Understand and copy the generated HTML and CSS that powers your design.' },
  { icon: ScanSearch, title: 'Interface Checker', desc: 'Identify common responsiveness and accessibility issues with real checks.' },
];

const steps = [
  { icon: MousePointerClick, title: 'Choose Components', desc: 'Pick from buttons, cards, navbars, forms, and more.' },
  { icon: SlidersHorizontal, title: 'Customize', desc: 'Edit text, colors, spacing, and layout in real time.' },
  { icon: Eye, title: 'Test', desc: 'Preview at different screen sizes and run interface checks.' },
  { icon: Code2, title: 'Export Code', desc: 'Copy or download clean, ready-to-use HTML and CSS.' },
];

const galleryItems = [
  { type: 'Button', color: '#7657FF', preview: <button className="px-5 py-2.5 rounded-lg bg-[#7657FF] text-white text-sm font-semibold">Get Started</button> },
  { type: 'Card', color: '#3DA08C', preview: <div className="w-full rounded-xl border border-[#E5E7F0] p-4 bg-white"><div className="h-2 w-20 bg-[#17182B] rounded mb-2" /><div className="h-2 w-full bg-[#E5E7F0] rounded mb-1" /><div className="h-2 w-2/3 bg-[#E5E7F0] rounded" /></div> },
  { type: 'Navbar', color: '#E8A33D', preview: <div className="w-full flex items-center justify-between rounded-lg border border-[#E5E7F0] px-4 py-2.5 bg-white"><span className="font-bold text-sm text-[#17182B]">Brand</span><div className="flex gap-3"><div className="h-2 w-8 bg-[#E5E7F0] rounded" /><div className="h-2 w-8 bg-[#E5E7F0] rounded" /><div className="h-2 w-8 bg-[#E5E7F0] rounded" /></div></div> },
  { type: 'Form', color: '#7657FF', preview: <div className="w-full rounded-xl border border-[#E5E7F0] p-4 bg-white space-y-2"><div className="h-2 w-12 bg-[#17182B] rounded" /><div className="h-7 w-full bg-[#F1F2F8] rounded border border-[#E5E7F0]" /><div className="h-2 w-10 bg-[#17182B] rounded" /><div className="h-7 w-full bg-[#F1F2F8] rounded border border-[#E5E7F0]" /><div className="h-8 w-full bg-[#7657FF] rounded" /></div> },
  { type: 'Badge', color: '#E05260', preview: <span className="px-3 py-1 rounded-full bg-[#EEEBFF] text-[#7657FF] text-xs font-semibold">New</span> },
  { type: 'Alert', color: '#3DA08C', preview: <div className="w-full rounded-lg bg-[#EEEBFF] text-[#4A4B66] px-4 py-2.5 text-xs font-medium">This is an alert message.</div> },
];

export function Landing({ onOpenPlayground }: Props) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17182B]">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7657FF] flex items-center justify-center text-white font-bold text-sm">iX</div>
            <span className="font-semibold">InterfaceX</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-[#4A4B66]">
            <a href="#features" className="hover:text-[#17182B]">Features</a>
            <a href="#how" className="hover:text-[#17182B]">How It Works</a>
            <a href="#gallery" className="hover:text-[#17182B]">Component Library</a>
          </div>
          <button onClick={onOpenPlayground} className="px-4 py-2 rounded-lg bg-[#7657FF] text-white text-sm font-semibold hover:bg-[#6344E6] transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEBFF] text-[#7657FF] text-xs font-semibold mb-5">
              <Layers size={13} /> Interactive Frontend Playground
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-[#17182B] mb-5">
              Design it. Understand it. Build it.
            </h1>
            <p className="text-lg text-[#4A4B66] leading-relaxed mb-8 max-w-lg">
              Your interactive playground for building frontend interfaces. Experiment with components, explore responsive layouts, and turn visual designs into real HTML and CSS.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={onOpenPlayground} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7657FF] text-white font-semibold hover:bg-[#6344E6] transition-colors shadow-lg shadow-[#7657FF]/20">
                Open Playground <ArrowRight size={18} />
              </button>
              <a href="#gallery" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#17182B] font-semibold border border-[#E5E7F0] hover:border-[#D1D5E8] transition-colors">
                Explore Components
              </a>
            </div>
          </div>

          {/* Product mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-[#E5E7F0] bg-white shadow-2xl shadow-[#17182B]/10 overflow-hidden">
              <div className="h-9 bg-[#F1F2F8] border-b border-[#E5E7F0] flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E05260]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E8A33D]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3DA08C]" />
              </div>
              <div className="flex h-[340px]">
                {/* Sidebar */}
                <div className="w-32 border-r border-[#E5E7F0] p-2.5 hidden sm:block">
                  <div className="h-2 w-16 bg-[#E5E7F0] rounded mb-3" />
                  <div className="space-y-1.5">
                    {[1,2,3,4].map((i) => <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-[#F6F5FF]"><div className="w-3 h-3 rounded bg-[#7657FF]/30" /><div className="h-1.5 flex-1 bg-[#E5E7F0] rounded" /></div>)}
                  </div>
                </div>
                {/* Canvas */}
                <div className="flex-1 p-4 bg-[#F8F9FC]">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="h-4 w-32 bg-[#17182B] rounded mb-2" />
                    <div className="flex justify-between items-center mb-4"><div className="h-2 w-16 bg-[#E5E7F0] rounded" /><div className="flex gap-1"><div className="h-2 w-6 bg-[#E5E7F0] rounded" /><div className="h-2 w-6 bg-[#E5E7F0] rounded" /></div></div>
                    <div className="h-5 w-3/4 bg-[#17182B] rounded mb-1.5" />
                    <div className="h-2 w-full bg-[#E5E7F0] rounded mb-1" />
                    <div className="h-2 w-2/3 bg-[#E5E7F0] rounded mb-3" />
                    <div className="flex gap-2"><div className="h-7 w-20 bg-[#7657FF] rounded-lg" /><div className="h-7 w-20 bg-white border border-[#E5E7F0] rounded-lg" /></div>
                  </div>
                </div>
                {/* Properties */}
                <div className="w-28 border-l border-[#E5E7F0] p-2.5 hidden sm:block">
                  <div className="h-2 w-14 bg-[#E5E7F0] rounded mb-3" />
                  <div className="space-y-2">
                    {[1,2,3].map((i) => <div key={i}><div className="h-1.5 w-10 bg-[#E5E7F0] rounded mb-1" /><div className="h-4 w-full bg-[#F1F2F8] rounded border border-[#E5E7F0]" /></div>)}
                  </div>
                </div>
              </div>
              {/* Code panel */}
              <div className="h-16 bg-[#17182B] px-3 py-2 flex items-center gap-2">
                <div className="text-[10px] text-[#7657FF] font-mono">&lt;button&gt;</div>
                <div className="text-[10px] text-white/60 font-mono">Get Started</div>
                <div className="text-[10px] text-[#7657FF] font-mono">&lt;/button&gt;</div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-[#7657FF] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg hidden sm:block">Live Preview</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#17182B] mb-3">Everything you need to learn frontend</h2>
          <p className="text-[#4A4B66] max-w-xl mx-auto">A focused toolkit for understanding how visual design becomes code.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-2xl border border-[#E5E7F0] p-6 hover:shadow-lg hover:shadow-[#17182B]/5 transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-[#F6F5FF] flex items-center justify-center mb-4">
                  <Icon size={22} className="text-[#7657FF]" />
                </div>
                <h3 className="font-semibold text-[#17182B] mb-2">{f.title}</h3>
                <p className="text-sm text-[#4A4B66] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="bg-white border-y border-[#E5E7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#17182B] mb-3">How it works</h2>
            <p className="text-[#4A4B66]">Four steps from idea to exportable code.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative">
                  <div className="bg-[#F8F9FC] rounded-2xl p-6 border border-[#E5E7F0] h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#7657FF] flex items-center justify-center"><Icon size={20} className="text-white" /></div>
                      <span className="text-3xl font-bold text-[#E5E7F0]">{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-[#17182B] mb-1.5">{s.title}</h3>
                    <p className="text-sm text-[#4A4B66] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#17182B] mb-3">Component Library</h2>
          <p className="text-[#4A4B66]">A growing collection of the building blocks you will use inside the playground.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((item) => (
            <div key={item.type} className="bg-white rounded-2xl border border-[#E5E7F0] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#17182B]">{item.type}</h3>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              </div>
              <div className="bg-[#F8F9FC] rounded-xl p-5 min-h-[90px] flex items-center justify-center">
                {item.preview}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={onOpenPlayground} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7657FF] text-white font-semibold hover:bg-[#6344E6] transition-colors">
            Open Playground <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-[#17182B] text-white p-10 sm:p-14 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to build your first interface?</h2>
          <p className="text-white/70 mb-7 max-w-lg mx-auto">No sign-up required. Open the playground and start designing in seconds.</p>
          <button onClick={onOpenPlayground} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#7657FF] font-semibold hover:bg-[#6344E6] transition-colors">
            Open Playground <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7F0] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#7657FF] flex items-center justify-center text-white font-bold text-xs">iX</div>
                <span className="font-semibold">InterfaceX</span>
              </div>
              <p className="text-sm text-[#4A4B66]">An interactive playground for building frontend interfaces. Design it. Understand it. Build it.</p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-[#17182B] mb-2">Product</h4>
                <ul className="space-y-1.5 text-[#4A4B66]">
                  <li><a href="#features" className="hover:text-[#17182B]">Features</a></li>
                  <li><a href="#how" className="hover:text-[#17182B]">How It Works</a></li>
                  <li><a href="#gallery" className="hover:text-[#17182B]">Components</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#17182B] mb-2">Get Started</h4>
                <ul className="space-y-1.5 text-[#4A4B66]">
                  <li><button onClick={onOpenPlayground} className="hover:text-[#17182B]">Open Playground</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#F1F2F8] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#9B9CB5]">
            <span>InterfaceX · A college project for Web Designing Lab.</span>
            <span>Built with React, TypeScript & Tailwind CSS.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
