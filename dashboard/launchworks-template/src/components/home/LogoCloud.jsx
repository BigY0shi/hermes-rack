export default function LogoCloud() {
  const logos = [
    { icon: 'simple-icons:vercel', name: 'Vercel' },
    { icon: 'simple-icons:stripe', name: 'Stripe' },
    { icon: 'simple-icons:supabase', name: 'Supabase' },
    { icon: 'simple-icons:github', name: 'GitHub' },
    { icon: 'simple-icons:linear', name: 'Linear' },
    { icon: 'simple-icons:framer', name: 'Framer' },
  ];

  return (
    <section className="border-y overflow-hidden bg-gradient-to-b from-[#050505] to-[#0a0a0a] w-full z-10 border-neutral-800/40 py-20 relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_0%,#050505_100%)]"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        <div className="absolute top-0 bottom-0 w-[25vw] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] animate-[subtleSweep_8s_cubic-bezier(0.4,0,0.2,1)_infinite]"></div>
      </div>

      <div className="relative z-10 w-full perspective-1000">
        <div className="max-w-7xl mx-auto px-6 text-center mb-14">
          <p className="text-sm tracking-[0.2em] uppercase text-neutral-500 font-medium">
            Powering infrastructure for forward-thinking teams
          </p>
        </div>

        <div className="w-full overflow-hidden marquee-mask relative">
          <div className="animate-infinite-scroll py-6">
            {[...Array(2)].map((_, groupIndex) => (
              <div key={groupIndex} className="flex items-center">
                {logos.map((logo, index) => (
                  <div key={index} className="flex items-center gap-3 px-10 md:px-16 brand-logo cursor-pointer group relative">
                    <iconify-icon icon={logo.icon} class="text-3xl md:text-4xl"></iconify-icon>
                    <span className="text-2xl md:text-3xl font-medium tracking-tight">
                      {logo.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}