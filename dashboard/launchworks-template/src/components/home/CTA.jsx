import Reveal from '../ui/Reveal';

export default function CTA() {
  return (
    <section className="py-10 md:py-40 overflow-visible bg-[#000000] w-full border-neutral-900/80 border-t relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/20 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse"></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <Reveal scale={true}>
          <h2 className="text-5xl md:text-7xl font-medium text-white tracking-tight mb-8 drop-shadow-sm leading-tight">
            Ready to automate your
            <br className="hidden md:block" /> entire workflow?
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers and forward-thinking teams building the future of internal tooling and automation without limits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black hover:bg-neutral-200 text-base font-medium transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2">
              Start Building for Free
              <iconify-icon icon="solar:arrow-right-linear" class="text-lg"></iconify-icon>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-white text-base font-medium transition-all backdrop-blur-md">
              Talk to Sales
            </button>
          </div>
          <p className="text-sm text-neutral-600 mt-6 font-light">
            No credit card required. 14-day free trial on Pro plans.
          </p>
        </Reveal>
      </div>
    </section>
  );
}