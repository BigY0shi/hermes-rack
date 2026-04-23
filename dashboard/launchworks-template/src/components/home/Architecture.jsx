import Reveal from '../ui/Reveal';
import SpotlightCard from '../ui/SpotlightCard';
import BeamLine from '../ui/BeamLine';
import SonarPing from '../ui/SonarPing';

export default function Architecture() {
  return (
    <section
      className="relative z-10 w-full py-24 md:py-32 bg-[#050505] border-t border-neutral-900/50 overflow-hidden"
      id="architecture"
    >
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      {/* Top decorative beam + sonar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 pointer-events-none">
        <BeamLine direction="vertical" length={64} delay={0} />
        <SonarPing size={14} color="#f97316" rings={3} />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        <Reveal>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 lg:px-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-orange-500" />
                <span className="text-xs font-mono text-orange-500 tracking-widest uppercase">System Architecture</span>
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl w-full leading-[0.9] text-white font-medium tracking-tight">
                Resilient.<br />
                <span className="text-neutral-500">Workflows.</span>
              </h2>
            </div>
            <p className="text-base md:text-lg text-neutral-400 w-full md:w-[30%] max-w-sm font-light tracking-wide border-l border-white/10 pl-4">
              Purposeful automation and robust integrations engineered to transform daily operations while safeguarding your data.
            </p>
          </header>
        </Reveal>

        {/* Horizontal beam between header and grid */}
        <Reveal delay={100}>
          <div className="flex items-center gap-4 mb-12 lg:px-8">
            <BeamLine direction="horizontal" length={80} delay={0} />
            <SonarPing size={10} color="#f97316" rings={2} />
            <BeamLine direction="horizontal" length={120} delay={0.3} />
            <SonarPing size={8} color="#f97316" rings={2} />
            <div className="flex-1">
              <BeamLine direction="horizontal" length="100%" delay={0.6} className="w-full" />
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 h-auto md:h-[600px] lg:px-8">

          {/* Column 1 */}
          <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">
            <Reveal delay={0} className="flex-1">
              <SpotlightCard className="relative border border-neutral-800 h-full overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-[#0a0a0a] rounded-xl">
                <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors duration-300">
                        <iconify-icon icon="solar:pen-2-linear" width="18" height="18" />
                      </div>
                      <SonarPing size={8} color="#f97316" rings={2} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">
                      Visual Mapping
                    </h3>
                    <p className="text-sm text-neutral-400 font-light leading-relaxed">
                      Intuitive drag-and-drop canvas for complex data routing.
                    </p>
                  </div>
                  <div className="mt-4">
                    <BeamLine direction="horizontal" length={60} delay={0} strokeWidth={0.8} />
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>

            <Reveal delay={100} className="flex-1">
              <SpotlightCard className="relative border border-neutral-800 h-full overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-[#111111] rounded-xl p-6 md:p-8 flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors duration-300 mb-4">
                    <iconify-icon icon="solar:bolt-linear" width="18" height="18" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2 tracking-tight">Zero Latency</h3>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed">
                    Edge-deployed configurations ensure sub-millisecond execution globally.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <BeamLine direction="horizontal" length={40} delay={0.5} strokeWidth={0.8} />
                  <div className="text-xs font-mono text-orange-500/60">&lt;10ms</div>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

          {/* Center column */}
          <Reveal delay={200} className="md:col-span-4 h-full">
            <SpotlightCard className="relative border border-neutral-800 h-full overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-[#0a0a0a] rounded-xl">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/9497e84f-cd43-4bed-8735-bbc8bfb0606f_800w.webp"
                  alt="Security Architecture"
                  className="w-full h-full object-cover opacity-20 mix-blend-luminosity group-hover:opacity-30 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>

              {/* Top beam decoration */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 group-hover:opacity-80 transition-opacity duration-300">
                <SonarPing size={14} color="#f97316" rings={3} />
                <BeamLine direction="vertical" length={40} delay={0} />
              </div>

              <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-end">
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-3 tracking-tight">
                  Enterprise Grade Security
                </h3>
                <p className="text-base text-neutral-400 font-light leading-relaxed">
                  SOC2 Type II compliant. Granular access controls ensure data never rests in unauthorized regions.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <BeamLine direction="horizontal" length={48} delay={0.2} strokeWidth={0.8} />
                  <span className="text-xs font-mono text-orange-500/70">SOC2 ✓</span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Right column */}
          <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">
            <Reveal delay={300} className="h-[60%]">
              <SpotlightCard className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-[#111111] h-full border-neutral-800 border rounded-xl p-6 md:p-8 flex flex-col shadow-lg justify-between">
                <div className="relative z-20 w-full pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-orange-500/70 uppercase tracking-widest">Ecosystem</span>
                    <SonarPing size={10} color="#f97316" rings={2} className="opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-medium text-white tracking-tight leading-snug">
                    Renewal.
                  </h3>
                </div>

                {/* Animated orbital sphere */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 mix-blend-screen group-hover:scale-105 transition-transform duration-700 mt-12">
                  <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-[80px]" />
                  <div className="absolute inset-0 animate-[spin_60s_linear_infinite] opacity-80 flex items-center justify-center">
                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[140%] h-[140%]">
                      <g opacity="0.6">
                        <ellipse cx="200" cy="200" rx="180" ry="40" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="1 12" strokeLinecap="round" />
                        <ellipse cx="200" cy="200" rx="160" ry="32" stroke="#f97316" strokeWidth="1.5" strokeDasharray="1 10" strokeLinecap="round" />
                        <ellipse cx="200" cy="200" rx="140" ry="24" stroke="#c2410c" strokeWidth="1" strokeDasharray="1 12" strokeLinecap="round" />
                      </g>
                      <g opacity="0.9" className="animate-[spin_40s_linear_infinite_reverse]" style={{ transformOrigin: '200px 200px' }}>
                        <ellipse cx="200" cy="200" rx="90" ry="90" stroke="#ffedd5" strokeWidth="1.5" strokeDasharray="1 16" strokeLinecap="round" />
                        <ellipse cx="200" cy="200" rx="54" ry="90" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="1 14" strokeLinecap="round" />
                        <ellipse cx="200" cy="200" rx="18" ry="90" stroke="#f97316" strokeWidth="1.5" strokeDasharray="1 18" strokeLinecap="round" />
                        <ellipse cx="200" cy="200" rx="90" ry="54" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="1 18" strokeLinecap="round" />
                        <ellipse cx="200" cy="200" rx="90" ry="18" stroke="#f97316" strokeWidth="1.5" strokeDasharray="1 16" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="relative z-20 mt-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </SpotlightCard>
            </Reveal>

            <Reveal delay={400} className="h-[40%]">
              <SpotlightCard className="relative border border-orange-500/20 h-full overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 md:p-8 flex items-center justify-between">
                {/* Sonar in bg */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                  <SonarPing size={40} color="white" rings={2} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-medium text-white mb-1 tracking-tight">View Docs</h3>
                  <p className="text-sm text-orange-200 font-light">Explore the API references</p>
                </div>
                <iconify-icon icon="solar:arrow-right-linear" class="text-white/80 text-2xl relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </SpotlightCard>
            </Reveal>
          </div>
        </div>

        {/* Bottom decorative beams */}
        <Reveal delay={500}>
          <div className="flex items-center gap-4 mt-12 lg:px-8">
            <SonarPing size={10} color="#f97316" rings={2} className="opacity-50" />
            <BeamLine direction="horizontal" length={100} delay={0} />
            <BeamLine direction="horizontal" length={60} delay={0.3} />
            <SonarPing size={8} color="#f97316" rings={2} className="opacity-40" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}