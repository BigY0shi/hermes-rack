import Reveal from '../ui/Reveal';
import SpotlightCard from '../ui/SpotlightCard';
import BeamLine from '../ui/BeamLine';
import SonarPing from '../ui/SonarPing';

export default function Features() {
  return (
    <section
      className="bg-[#0a0a0a] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-400 overflow-x-hidden relative"
      id="features"
    >
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes pulseSoft { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.85;transform:scale(1.05)} }
        .pulse-soft{animation:pulseSoft 3s ease-in-out infinite}
      `}</style>

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none z-0" />

      <div className="relative z-10 w-full py-24 md:py-32">
        {/* Header */}
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <header className="text-center mb-16 max-w-4xl mx-auto">
            <Reveal>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-orange-500" />
                <span className="text-xs font-mono text-orange-500 tracking-widest uppercase">Platform Features</span>
                <div className="h-px w-8 bg-orange-500" />
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 text-white leading-[0.9]">
                Orchestrate complex<br />
                logic with{' '}
                <span className="text-orange-500">precision.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-lg text-neutral-400 font-light max-w-xl mx-auto">
                Build, monitor, and scale your backend operations without writing boilerplate. Everything you need, unified.
              </p>
            </Reveal>

            {/* Sonar decoration */}
            <Reveal delay={200}>
              <div className="flex justify-center mt-10 gap-8">
                <BeamLine direction="vertical" length={48} delay={0} />
                <SonarPing size={12} color="#f97316" rings={3} />
                <BeamLine direction="vertical" length={48} delay={0.5} />
              </div>
            </Reveal>
          </header>
        </div>

        {/* Grid */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-[22rem]">

            {/* Card 1 — Visual Builder */}
            <Reveal delay={0} className="md:col-span-2 h-full">
              <SpotlightCard className="group relative rounded-2xl overflow-hidden h-full bg-[#121212] border border-neutral-800 hover:border-neutral-700 transition-all duration-500">
                <div className="p-8 md:p-10 h-full flex flex-col relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors duration-500 shrink-0">
                      <iconify-icon icon="solar:widget-add-linear" width="22" height="22" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium tracking-tight text-white mb-1">Visual Workflow Builder</h3>
                      <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-sm">
                        Drag, drop, and connect logical nodes to create complex branching scenarios without reading docs.
                      </p>
                    </div>
                  </div>

                  {/* Beam decorations inside card */}
                  <div className="flex items-center gap-3 mb-6">
                    <BeamLine direction="horizontal" length={60} delay={0} strokeWidth={0.8} />
                    <SonarPing size={8} color="#f97316" rings={2} />
                    <BeamLine direction="horizontal" length={60} delay={0.5} strokeWidth={0.8} />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-[52%] pointer-events-none">
                    {/* Card UI mockups */}
                    <div className="float-slow absolute left-[10%] bottom-[20%] w-[45%] max-w-[380px] rounded-2xl border border-white/5 bg-[#1a1a1a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" style={{ animationDuration: '3s' }} />
                        <div className="w-10 h-2 rounded-full bg-white/20" />
                      </div>
                      <div className="w-full h-9 rounded-lg bg-white/5 border border-white/5" />
                    </div>
                    <div className="float-fast absolute right-[5%] bottom-[6%] w-[50%] max-w-[440px] rounded-2xl border border-white/10 bg-[#222]/95 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <div className="w-12 h-2 rounded-full bg-white/20" />
                      </div>
                      <div className="w-full h-10 rounded-lg bg-white/10 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-orange-500/25 w-[34%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>

            {/* Card 2 — Telemetry */}
            <Reveal delay={150} className="md:col-span-1 h-full">
              <SpotlightCard className="group relative rounded-2xl overflow-hidden h-full bg-[#121212] border border-neutral-800 hover:border-neutral-700 transition-all duration-500">
                <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] overflow-hidden flex flex-col justify-between p-8 md:p-10">
                  {/* Sonar in corner */}
                  <div className="absolute top-4 right-4 opacity-40">
                    <SonarPing size={16} color="#f97316" rings={3} />
                  </div>

                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neutral-300 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors duration-500">
                      <iconify-icon icon="solar:chart-square-linear" width="24" height="24" />
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-white mb-3">Real-time Telemetry</h3>
                    <p className="text-sm text-neutral-400 font-light leading-relaxed">Monitor execution times and payload sizes instantly.</p>
                  </div>

                  {/* Beam decoration */}
                  <div className="flex flex-col items-start gap-1 my-4">
                    <BeamLine direction="horizontal" length={80} delay={0} strokeWidth={0.8} />
                    <BeamLine direction="horizontal" length={50} delay={0.4} strokeWidth={0.8} />
                  </div>

                  <div className="flex items-end gap-2 h-12 w-full opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bar-1 w-full bg-white/5 rounded-t-sm" />
                    <div className="bar-2 w-full bg-white/5 rounded-t-sm" />
                    <div className="bar-3 w-full bg-orange-500 rounded-t-sm shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                    <div className="bar-4 w-full bg-white/5 rounded-t-sm" />
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>

            {/* Card 3 — Security */}
            <Reveal delay={250} className="md:col-span-1 h-full">
              <SpotlightCard className="group relative rounded-2xl overflow-hidden h-full bg-[#121212] border border-neutral-800 hover:border-neutral-700 transition-all duration-500">
                <div className="flex flex-col p-8 md:p-10 h-full relative">
                  {/* Sonar */}
                  <div className="absolute bottom-6 right-6 opacity-30">
                    <SonarPing size={20} color="#f97316" rings={2} />
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neutral-300 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors duration-500 relative z-10">
                    <iconify-icon icon="solar:shield-check-linear" width="24" height="24" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-medium tracking-tight text-white mb-3">Enterprise Security</h3>
                    <p className="text-sm text-neutral-400 font-light leading-relaxed">End-to-end encryption and granular role-based access.</p>
                  </div>

                  {/* Vertical beam */}
                  <div className="flex justify-center my-4">
                    <BeamLine direction="vertical" length={48} delay={0.2} />
                  </div>

                  <div className="absolute bottom-0 left-8 right-8 h-24 bg-[#0a0a0a] rounded-t-xl border-t border-x border-white/5 flex flex-col justify-center px-6 gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-orange-500 transition-colors duration-500" />
                      <div className="h-1 bg-white/10 rounded-full w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] -translate-x-full" style={{ animation: 'shimmer 2s infinite' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-3/4">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                      <div className="h-1 bg-white/10 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>

            {/* Card 4 — Developer */}
            <Reveal delay={350} className="md:col-span-2 h-full">
              <SpotlightCard className="group relative rounded-2xl overflow-hidden h-full bg-[#121212] border border-neutral-800 hover:border-neutral-700 transition-all duration-500">
                <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] overflow-hidden flex flex-col md:flex-row items-center p-8 md:p-10 gap-8">
                  <div className="flex-1 relative z-10 flex flex-col w-full">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neutral-300 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors duration-500">
                      <iconify-icon icon="solar:document-text-linear" width="24" height="24" />
                    </div>
                    <h3 className="text-2xl font-medium tracking-tight text-white mb-3">Developer First</h3>
                    <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-sm">
                      Write custom logic snippets in Node.js or Python right within the canvas for edge cases.
                    </p>

                    {/* Noodle decorations */}
                    <div className="flex items-center gap-2 mt-6">
                      <BeamLine direction="horizontal" length={40} delay={0} strokeWidth={0.8} />
                      <SonarPing size={8} color="#f97316" rings={2} />
                      <BeamLine direction="horizontal" length={40} delay={0.6} strokeWidth={0.8} />
                    </div>
                  </div>

                  <div className="w-full md:w-[28rem] shrink-0 rounded-xl bg-[#080808] border border-white/10 p-5 shadow-2xl relative overflow-hidden group-hover:border-white/20 transition-colors duration-500">
                    <div className="flex gap-1.5 mb-4 opacity-50">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    </div>
                    <div className="font-mono text-xs md:text-sm leading-relaxed text-neutral-300">
                      <div><span className="text-orange-400">export</span> <span className="text-purple-400">default</span> <span className="text-blue-400">async</span></div>
                      <div><span className="text-blue-400">function</span><span className="text-neutral-300">(</span><span className="text-orange-300">event</span><span className="text-neutral-300">) {'{'}</span></div>
                      <div className="pl-4"><span className="text-orange-400">const</span> data = event.payload;</div>
                      <div className="pl-4 text-neutral-500 italic mt-1">// Transform data payload</div>
                      <div className="pl-4 mt-1"><span className="text-purple-400">return</span> {'{'} status: <span className="text-green-400">200</span>, data {'}'};</div>
                      <div>{'}'}</div>
                    </div>
                    <div className="absolute bottom-5 right-5 w-1.5 h-4 bg-orange-500 animate-[pulse_1s_infinite] opacity-0 group-hover:opacity-100 transition-opacity delay-300" />
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}