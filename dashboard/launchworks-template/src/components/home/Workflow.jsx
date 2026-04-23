import Reveal from '../ui/Reveal';
import SonarPing from '../ui/SonarPing';
import BeamLine from '../ui/BeamLine';
import SpotlightCard from '../ui/SpotlightCard';

const nodes = [
  { icon: 'solar:database-linear', label: 'Database', top: '10%', left: '15%', delay: 0 },
  { icon: 'solar:chat-line-linear', label: 'Messaging', top: '10%', right: '15%', delay: 0.3 },
  { icon: 'solar:bag-linear', label: 'Commerce', bottom: '10%', left: '15%', delay: 0.6 },
  { icon: 'solar:card-linear', label: 'Payments', bottom: '10%', right: '15%', delay: 0.9 },
  { icon: 'solar:cloud-linear', label: 'Cloud', top: '50%', left: '5%', delay: 1.2 },
  { icon: 'solar:cpu-linear', label: 'Compute', top: '50%', right: '5%', delay: 1.5 },
];

export default function Workflow() {
  return (
    <section className="z-10 border-y bg-[#0f0f0f] w-full border-neutral-900/50 py-24 md:py-32 relative overflow-hidden" id="workflow">
      <style>{`
        @keyframes flow {
          0% { stroke-dashoffset: 20; opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
        .line-anim { animation: flow 3s linear infinite; }
      `}</style>

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <Reveal>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-orange-500" />
            <span className="text-xs font-mono text-orange-500 tracking-widest uppercase">Orchestration Layer</span>
            <div className="h-px w-8 bg-orange-500" />
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-medium text-white tracking-tight mb-6 leading-[0.95]">
            Orchestrate your<br />
            <span className="text-neutral-500">entire stack.</span>
          </h2>
          <p className="text-neutral-400 text-lg font-light max-w-md mx-auto mb-16">
            Connect any service. Route any signal. Control every edge of your infrastructure from a single command surface.
          </p>
        </Reveal>

        <Reveal scale delay={100}>
          <div className="relative w-full max-w-3xl mx-auto h-[360px] sm:h-[420px] flex items-center justify-center">
            {/* Sonar decoration top-left */}
            <div className="absolute top-4 left-4 opacity-40">
              <SonarPing size={12} color="#f97316" rings={3} />
            </div>
            <div className="absolute bottom-4 right-4 opacity-30">
              <SonarPing size={10} color="#f97316" rings={2} />
            </div>

            {/* Orbit Ring 1 */}
            <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] -translate-x-1/2 -translate-y-1/2 border border-neutral-800/40 rounded-full pointer-events-none">
              <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500/60 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              </div>
            </div>

            {/* Orbit Ring 2 */}
            <div className="absolute top-1/2 left-1/2 w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 border border-neutral-800/25 border-dashed rounded-full pointer-events-none">
              <div className="absolute inset-0 animate-[spin_14s_linear_infinite_reverse]">
                <div className="absolute top-[12%] left-[72%] w-2 h-2 bg-orange-500/40 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                <div className="absolute bottom-[10%] left-[25%] w-2.5 h-2.5 bg-orange-600/30 rounded-full" />
              </div>
            </div>

            {/* Animated SVG beams from center to nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Static ghost lines */}
              {['M50,50 L20,20','M50,50 L80,20','M50,50 L20,80','M50,50 L80,80','M50,50 L10,50','M50,50 L90,50'].map((d, i) => (
                <path key={i} d={d} stroke="rgba(64,64,64,0.6)" strokeWidth="0.3" fill="none" />
              ))}
              {/* Beam animated dashes */}
              {[
                { d: 'M50,50 L20,20', delay: '0s' },
                { d: 'M50,50 L80,20', delay: '0.5s' },
                { d: 'M50,50 L20,80', delay: '1s' },
                { d: 'M50,50 L80,80', delay: '1.5s' },
                { d: 'M50,50 L10,50', delay: '2s' },
                { d: 'M50,50 L90,50', delay: '2.5s' },
              ].map((beam, i) => (
                <path
                  key={`beam-${i}`}
                  d={beam.d}
                  stroke="#f97316"
                  strokeWidth="0.6"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  fill="none"
                  className="line-anim"
                  style={{ animationDelay: beam.delay, filter: 'drop-shadow(0 0 2px rgba(249,115,22,0.8))' }}
                />
              ))}
              {/* Traveling dot on each beam */}
              {[
                { path: 'M50,50 L20,20', delay: '0s' },
                { path: 'M50,50 L80,20', delay: '0.8s' },
                { path: 'M50,50 L20,80', delay: '1.6s' },
                { path: 'M50,50 L80,80', delay: '2.4s' },
              ].map((t, i) => (
                <circle key={`dot-${i}`} r="0.8" fill="#f97316" opacity="0.9" style={{ filter: 'drop-shadow(0 0 3px #f97316)' }}>
                  <animateMotion dur="2s" repeatCount="indefinite" begin={t.delay}>
                    <mpath href={`#beam-path-${i}`} />
                  </animateMotion>
                </circle>
              ))}
            </svg>

            {/* Center hub glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className="relative w-[120px] h-[120px]">
                <div className="absolute inset-0 rounded-[28px] bg-orange-500/10 blur-xl" />
                <div className="absolute inset-[-8px] rounded-[32px] border border-orange-400/20 animate-[pulse_2.8s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* Center hub icon */}
            <div className="relative z-20 w-24 h-24 rounded-2xl bg-gradient-to-b from-orange-400 to-orange-600 border border-orange-300/30 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.3)]">
              <div className="absolute inset-0 rounded-2xl bg-orange-400/10" />
              <iconify-icon icon="solar:layers-minimalistic-bold" class="text-white text-4xl relative z-10" />
              {/* Sonar on center */}
              <div className="absolute -top-2 -right-2 z-30">
                <SonarPing size={10} color="#f97316" rings={2} />
              </div>
            </div>

            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none z-0" />

            {/* Peripheral nodes */}
            {nodes.map((node, i) => (
              <div
                key={node.icon}
                className="absolute z-20 node-anim"
                style={{
                  top: node.top, left: node.left,
                  right: node.right, bottom: node.bottom,
                  animationDelay: `-${i * 0.6}s`,
                }}
              >
                <SpotlightCard className="w-14 h-14 rounded-xl bg-[#161616] border border-neutral-800/90 flex flex-col items-center justify-center text-neutral-400 shadow-[0_0_18px_rgba(0,0,0,0.3)] cursor-pointer hover:border-orange-500/40 hover:text-orange-400 transition-colors duration-300">
                  <iconify-icon icon={node.icon} width="20" height="20" />
                </SpotlightCard>
                <p className="text-[10px] text-neutral-600 text-center mt-1 font-mono">{node.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Stats row */}
        <Reveal delay={300}>
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { v: '99.9%', l: 'Uptime SLA' },
              { v: '<10ms', l: 'P95 Latency' },
              { v: '500+', l: 'Integrations' },
            ].map(({ v, l }) => (
              <div key={l} className="border border-neutral-800 bg-[#0a0a0a] px-4 py-3 text-center">
                <div className="text-xl font-semibold text-white tracking-tight">{v}</div>
                <div className="text-xs text-neutral-500 font-mono mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}