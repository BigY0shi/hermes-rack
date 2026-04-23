import Reveal from '../ui/Reveal';
import BeamLine from '../ui/BeamLine';
import SonarPing from '../ui/SonarPing';
import SpotlightCard from '../ui/SpotlightCard';

export default function DataTransformation() {
  return (
    <section className="overflow-hidden bg-[#050505] w-full border-neutral-900/50 border-b py-24 md:py-32 relative">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/3 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <Reveal>
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px w-8 bg-orange-500" />
            <span className="text-xs font-mono text-orange-500 tracking-widest uppercase">Data Pipeline</span>
            <div className="h-px w-8 bg-orange-500" />
          </div>
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-medium text-white tracking-tight mb-5 leading-[0.95]">
              Transform data<br />
              <span className="text-neutral-500">on the fly.</span>
            </h2>
            <p className="text-neutral-400 text-lg font-light max-w-xl mx-auto">
              No more brittle scripts. Map fields visually and apply powerful transformations instantly.
            </p>
          </div>
        </Reveal>

        <div className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0">

          {/* Source Panel */}
          <Reveal delay={0} direction="left" className="w-full md:w-[42%]">
            <SpotlightCard className="h-full bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col hover:border-neutral-700 transition-colors duration-500">
              <div className="px-5 py-3 border-b border-neutral-800/80 bg-[#111] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SonarPing size={8} color="#3b82f6" rings={2} />
                  <iconify-icon icon="solar:card-linear" class="text-neutral-400 text-sm" />
                  <span className="text-xs font-medium text-neutral-300 tracking-wide font-mono">Stripe Webhook</span>
                </div>
                <span className="text-[10px] font-mono text-green-500 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded">LIVE</span>
              </div>
              <div className="py-5 font-mono text-sm leading-loose text-neutral-400 flex-1">
                <div className="px-5">{'{'}</div>
                {[
                  { key: '"user_id"', val: '"usr_9x8j2"', color: 'text-green-400', anim: 'highlightRow1 9s infinite' },
                  { key: '"full_name"', val: '"Jane Doe"', color: 'text-green-400', anim: 'highlightRow2 9s infinite' },
                  { key: '"amount_cents"', val: '4900', color: 'text-yellow-400', anim: 'highlightRow3 9s infinite' },
                  { key: '"currency"', val: '"usd"', color: 'text-green-400', anim: null },
                ].map(({ key, val, color, anim }) => (
                  <div key={key} className="px-5 py-1 border-l-2 border-transparent transition-colors duration-300" style={anim ? { animation: anim } : {}}>
                    <span className="text-blue-400">{key}</span>: <span className={color}>{val}</span>,
                  </div>
                ))}
                <div className="px-5">{'}'}</div>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Beam connector in between */}
          <div className="flex-1 hidden md:flex items-center justify-center relative z-0 min-w-[5rem]">
            {/* Vertical decorative beams */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0">
              <BeamLine direction="vertical" length={60} delay={0} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <BeamLine direction="vertical" length={60} delay={1} />
            </div>

            {/* Horizontal beam track */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-neutral-800 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"
                style={{ animation: 'pulseSweep 2.5s infinite linear' }}
              />
            </div>

            {/* Center transfer node */}
            <div className="relative z-10 w-12 h-12 rounded-xl bg-[#0a0a0a] border border-orange-500/40 flex items-center justify-center shadow-[0_0_24px_rgba(249,115,22,0.2)] hover:shadow-[0_0_32px_rgba(249,115,22,0.35)] transition-shadow duration-300">
              <iconify-icon icon="solar:transfer-horizontal-linear" class="text-orange-500 text-lg" />
              <div className="absolute -top-1 -right-1">
                <SonarPing size={8} color="#f97316" rings={2} />
              </div>
            </div>

            {/* Noodle connector decorations (horizontal dashes) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <line x1="0" y1="50%" x2="100%" y2="50%"
                stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.15"
                strokeDasharray="4 8"
              />
            </svg>
          </div>

          {/* Mobile beam connector */}
          <div className="flex md:hidden items-center justify-center py-2">
            <div className="flex flex-col items-center gap-1">
              <BeamLine direction="vertical" length={32} />
              <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-orange-500/40 flex items-center justify-center">
                <iconify-icon icon="solar:transfer-horizontal-linear" class="text-orange-500" />
              </div>
              <BeamLine direction="vertical" length={32} delay={1} />
            </div>
          </div>

          {/* Destination Panel */}
          <Reveal delay={200} direction="right" className="w-full md:w-[42%]">
            <SpotlightCard className="h-full bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col hover:border-neutral-700 transition-colors duration-500">
              <div className="px-5 py-3 border-b border-neutral-800/80 bg-[#111] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SonarPing size={8} color="#a855f7" rings={2} />
                  <iconify-icon icon="solar:cloud-linear" class="text-neutral-400 text-sm" />
                  <span className="text-xs font-medium text-neutral-300 tracking-wide font-mono">Salesforce Contact</span>
                </div>
                <span className="text-[10px] font-mono text-orange-400 border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 rounded">SYNCED</span>
              </div>
              <div className="py-5 font-mono text-sm leading-loose text-neutral-400 flex-1">
                <div className="px-5">{'{'}</div>
                {[
                  { key: '"ContactId"', val: '"usr_9x8j2"', color: 'text-green-400', anim: 'highlightRow1 9s infinite' },
                  { key: '"FirstName"', val: '"Jane"', color: 'text-green-400', anim: 'highlightRow2 9s infinite' },
                  { key: '"LastName"', val: '"Doe"', color: 'text-green-400', anim: 'highlightRow2 9s infinite' },
                  { key: '"Revenue_USD"', val: '49.00', color: 'text-yellow-400', anim: 'highlightRow3 9s infinite' },
                ].map(({ key, val, color, anim }) => (
                  <div key={key} className="px-5 py-1 border-l-2 border-transparent transition-colors duration-300" style={anim ? { animation: anim } : {}}>
                    <span className="text-purple-400">{key}</span>: <span className={color}>{val}</span>,
                  </div>
                ))}
                <div className="px-5">{'}'}</div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* Bottom decoration: vertical beam + sonar */}
        <div className="flex justify-center mt-12 gap-12">
          <Reveal delay={400}>
            <div className="flex flex-col items-center gap-2">
              <BeamLine direction="vertical" length={48} delay={0.5} />
              <SonarPing size={12} color="#f97316" rings={3} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}