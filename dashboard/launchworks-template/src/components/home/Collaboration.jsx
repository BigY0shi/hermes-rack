import Reveal from '../ui/Reveal';
import SpotlightCard from '../ui/SpotlightCard';
import BeamLine from '../ui/BeamLine';
import SonarPing from '../ui/SonarPing';

export default function Collaboration() {
  return (
    <section className="z-10 overflow-hidden bg-[#0a0a0a] w-full border-neutral-900/50 border-b py-24 md:py-32 relative">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      {/* Vertical beam on left side */}
      <div className="absolute left-[15%] top-0 bottom-0 pointer-events-none flex flex-col items-center opacity-20 hidden lg:flex">
        <BeamLine direction="vertical" length={400} delay={0} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left copy */}
          <div className="w-full lg:w-1/2">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-orange-500" />
                <span className="text-xs font-mono text-orange-500 tracking-widest uppercase">Multiplayer Mode</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-medium text-white tracking-tight mb-6 leading-[0.9]">
                Build and debug<br />
                <span className="text-neutral-500">with your team.</span>
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-neutral-400 text-lg font-light mb-8 max-w-md leading-relaxed">
                Invite stakeholders to view, comment, or edit workflows in real-time. See live presence indicators and full version history.
              </p>
            </Reveal>

            {/* Feature list with beam decorations */}
            {[
              'Live cursor tracking and presence',
              'Inline commenting and approvals',
              'Granular permission controls',
            ].map((item, i) => (
              <Reveal key={item} delay={200 + i * 80} direction="left">
                <div className="flex items-center gap-3 mb-4 text-neutral-300 text-base font-light">
                  <div className="flex items-center gap-2 shrink-0">
                    <SonarPing size={8} color="#f97316" rings={1} />
                    <BeamLine direction="horizontal" length={24} delay={i * 0.4} strokeWidth={0.8} />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-500 shrink-0">
                    <iconify-icon icon="solar:check-circle-linear" class="text-base" />
                  </div>
                  {item}
                </div>
              </Reveal>
            ))}

            {/* Stats row */}
            <Reveal delay={500}>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { v: '50ms', l: 'Sync latency' },
                  { v: '∞', l: 'Collaborators' },
                  { v: '99.9%', l: 'Availability' },
                ].map(({ v, l }) => (
                  <SpotlightCard key={l} className="border border-neutral-800 bg-[#0f0f0f] px-3 py-3 text-center rounded-lg">
                    <div className="text-lg font-semibold text-white">{v}</div>
                    <div className="text-xs text-neutral-500 font-mono mt-0.5">{l}</div>
                  </SpotlightCard>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right image panel */}
          <div className="w-full lg:w-1/2 relative group perspective-1000">
            <Reveal scale delay={200}>
              <div className="absolute inset-0 bg-orange-500/15 blur-[80px] rounded-full pointer-events-none z-0 transform group-hover:scale-110 transition-transform duration-700" />

              {/* Sonar decorations around image */}
              <div className="absolute -top-4 -left-4 z-20 opacity-60">
                <SonarPing size={16} color="#f97316" rings={3} />
              </div>
              <div className="absolute -bottom-4 -right-4 z-20 opacity-40">
                <SonarPing size={12} color="#f97316" rings={2} />
              </div>

              {/* Beam lines framing the image */}
              <div className="absolute top-0 left-0 z-20 opacity-50">
                <BeamLine direction="vertical" length={60} delay={0} />
              </div>
              <div className="absolute top-0 right-0 z-20 opacity-50">
                <BeamLine direction="vertical" length={60} delay={0.5} />
              </div>

              <SpotlightCard className="relative z-10 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group-hover:border-neutral-700 transition-colors duration-700">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/variants/b41ed9cc-930b-4625-9af2-4a478108704b/1600w.jpg"
                  alt="Collaboration"
                  className="w-full h-[380px] sm:h-[440px] object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transform group-hover:scale-105 transition-all duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-80 pointer-events-none" />

                <div className="absolute top-6 left-6 flex -space-x-2">
                  <img className="w-10 h-10 rounded-full border-2 border-neutral-900 animate-float-slow" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-neutral-900 animate-float-fast" style={{ animationDelay: '1s' }} src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="User" />
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-sm text-white font-medium animate-float-med" style={{ animationDelay: '2s' }}>
                    +3
                  </div>
                </div>

                {/* Live indicator */}
                <div className="absolute bottom-6 left-6 flex items-center gap-2 border border-neutral-700 bg-neutral-900/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <SonarPing size={8} color="#22c55e" rings={2} />
                  <span className="text-xs font-mono text-neutral-300">3 editing now</span>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}