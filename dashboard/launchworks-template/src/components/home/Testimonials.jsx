import Reveal from '../ui/Reveal';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "NexusFlow cut our API integration time by 80%. We replaced thousands of lines of fragile scripts with a few visual workflows. It's absolute magic.",
      name: "John Doe",
      role: "Lead Engineer, TechCo",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      center: false,
      delay: 0
    },
    {
      title: "Saves us hours daily",
      quote: "The telemetry features alone are worth it. Knowing exactly where a payload failed across 5 different services instantly saves us hours of debugging every single day.",
      name: "Alice Smith",
      role: "CTO, DataFlow",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      center: true,
      delay: 150
    },
    {
      quote: "I'm not a developer, but I set up our entire marketing-to-sales data sync in an afternoon using their visual builder. It feels incredibly seamless.",
      name: "Mark Jones",
      role: "RevOps, StartUp",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      center: false,
      delay: 300
    }
  ];

  return (
    <section className="relative z-10 w-full py-32 overflow-hidden bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 tracking-tight mb-4">
              Loved by builders
            </h2>
            <p className="text-neutral-400 text-lg font-light max-w-xl mx-auto">
              Discover why the most forward-thinking teams choose our infrastructure to scale.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col xl:flex-row items-center justify-center relative w-full gap-8 xl:gap-0 mt-8">
          {testimonials.map((test, idx) => (
            <Reveal key={idx} delay={test.delay} className={`test-card-wrapper relative ${test.center ? 'z-30 w-full max-w-md center-card' : 'z-10 w-full max-w-sm xl:scale-95'} ${!test.center && idx === 0 ? 'xl:-mr-12 origin-right' : ''} ${!test.center && idx === 2 ? 'xl:-ml-12 origin-left' : ''}`}>
              <div className={`test-card-inner relative w-full h-full rounded-[2rem] overflow-hidden group ${test.center ? 'p-10 backdrop-blur-3xl center-card-rock' : 'p-8 bg-[#141414]/60 backdrop-blur-2xl'}`}>
                <h3 className="text-2xl font-medium text-white mb-4 tracking-tight group-hover:text-orange-100 transition-colors relative z-10">
                  {test.title || "A Game Changer"}
                </h3>
                
                <p className={`${test.center ? 'text-lg text-neutral-300' : 'text-base text-neutral-400'} font-light leading-relaxed mb-8 group-hover:text-white transition-colors relative z-10`}>
                  {test.quote}
                </p>

                <div className="flex items-center gap-4 mt-auto relative z-10 pt-4">
                  <div className={`relative ${test.center ? 'w-14 h-14' : 'w-12 h-12'} flex-shrink-0 flex items-center justify-center`}>
                    <img src={test.img} alt={test.name} className="w-full h-full object-cover z-10 border-white/10 border rounded-full relative" />
                  </div>
                  <div>
                    <div className={`${test.center ? 'text-lg' : 'text-base'} font-medium text-white`}>{test.name}</div>
                    <div className={`${test.center ? 'text-base text-neutral-400' : 'text-sm text-neutral-500'}`}>{test.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}