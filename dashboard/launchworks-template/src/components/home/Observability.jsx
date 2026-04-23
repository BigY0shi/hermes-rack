import Reveal from '../ui/Reveal';

export default function Observability() {
  return (
    <section className="z-10 overflow-hidden bg-[#050505] w-full border-neutral-900/50 border-b py-32 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
          <div className="w-full lg:w-1/2">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium mb-6 shadow-[0_0_15px_rgba(249,115,22,0.15)] backdrop-blur-md">
                <iconify-icon icon="solar:pulse-linear" class="text-base"></iconify-icon>
                Deep Observability
              </div>
              <h2 className="text-4xl md:text-6xl font-medium text-white tracking-tight mb-6 leading-tight">
                See everything.
                <br />
                <span className="text-neutral-500">Miss nothing.</span>
              </h2>
              <p className="text-neutral-400 text-lg font-light mb-8 max-w-md leading-relaxed">
                Gain unparalleled visibility into your automated processes. Track every payload, trace every error, and optimize performance with comprehensive logs and metrics.
              </p>
              <button className="px-6 py-2.5 rounded-full bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-white text-base font-medium transition-all group flex items-center gap-2 w-max">
                Explore Analytics
                <iconify-icon icon="solar:arrow-right-linear" class="group-hover:translate-x-1 transition-transform"></iconify-icon>
              </button>
            </Reveal>
          </div>
          
          <div className="w-full lg:w-1/2 relative group perspective-1000">
            <Reveal scale={true}>
              <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none z-0 transform group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 rounded-[2rem] overflow-hidden border border-neutral-800 shadow-2xl bg-[#0a0a0a] transform rotate-y-[2deg] rotate-x-[2deg] group-hover:rotate-0 transition-transform duration-700">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/variants/123d5123-5c17-48c6-b870-726635b7b6d2/1600w.jpg" alt="Metrics" className="w-full h-[400px] object-cover opacity-60 transform group-hover:scale-105 transition-transform duration-1000 ease-out mix-blend-luminosity hover:mix-blend-normal pan-image" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-transparent pointer-events-none"></div>

                <div className="absolute bottom-6 left-6 right-6 h-28 bg-neutral-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 flex items-end gap-2.5">
                  {[40, 60, 30, 70, 100, 80, 50].map((h, i) => (
                    <div key={i} className="w-full bg-orange-500/60 rounded-t-sm animate-[pulse_2s_ease-in-out_infinite]" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}></div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}