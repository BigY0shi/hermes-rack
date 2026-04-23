import { useState, useEffect } from 'react';
import Reveal from '../ui/Reveal';
import clsx from 'clsx';

// Custom hook to animate numbers when they change (mimics GSAP behavior)
function AnimatedPrice({ targetValue }) {
  const [value, setValue] = useState(targetValue);
  
  useEffect(() => {
    let start = value;
    let end = targetValue;
    if (start === end) return;
    
    const duration = 800; // ms
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo function for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setValue(Math.round(start + (end - start) * easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue, value]);
  
  return <>{value}</>;
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section className="z-10 overflow-hidden bg-[#050505] w-full border-neutral-900/50 border-t pt-32 pb-32 relative" id="pricing">
      {/* Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-8">Simple, predictable pricing</h2>

            <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <span className={clsx("transition-colors duration-300", !isYearly ? "text-white" : "text-neutral-400")}>Monthly</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isYearly}
                  onChange={() => setIsYearly(!isYearly)}
                />
                <div className="w-12 h-7 bg-neutral-800 rounded-full peer peer-checked:bg-orange-500 transition-colors duration-500 border border-neutral-700 peer-checked:border-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-300 peer-checked:after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all after:duration-500 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:after:translate-x-[22px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
              </label>
              <span className={clsx("transition-colors duration-300 flex items-center", isYearly ? "text-white" : "text-neutral-400")}>
                Annually 
                <span className="text-orange-500 text-[10px] ml-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 uppercase tracking-wider font-semibold">-20%</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="group/cards grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Starter */}
          <Reveal delay={0} className="h-full">
            <div className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cards:[&:not(:hover)]:opacity-40 group-hover/cards:[&:not(:hover)]:blur-[3px] group-hover/cards:[&:not(:hover)]:scale-[0.97] group-hover/cards:[&:not(:hover)]:bg-[#0a0a0a]/80 hover:scale-[1.03] hover:z-20 relative p-8 lg:p-10 rounded-[2rem] bg-[#121212]/80 backdrop-blur-xl border border-white/5 hover:border-white/20 hover:bg-[#181818]/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] flex flex-col cursor-default h-full">
              <h3 className="text-xl font-medium text-white mb-2 tracking-tight">Starter</h3>
              <p className="text-sm text-neutral-500 font-light mb-8 line-clamp-2 min-h-[40px]">For individuals and small projects exploring automation.</p>
              <div className="text-4xl lg:text-5xl font-medium text-white mb-10 tracking-tight">
                $<AnimatedPrice targetValue={0} /><span className="text-sm text-neutral-500 font-light billing-period">/mo</span>
              </div>

              <ul className="flex flex-col gap-5 mb-10 flex-1">
                {[
                  '1,000 tasks/month',
                  '5 active integrations',
                  'Standard community support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-300 font-light">
                    <iconify-icon icon="solar:check-circle-linear" class="text-neutral-500 text-lg shrink-0"></iconify-icon>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 rounded-full bg-[#1a1a1a] border border-neutral-700/50 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">Get Started</button>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={150} className="h-full">
            <div className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cards:[&:not(:hover)]:opacity-40 group-hover/cards:[&:not(:hover)]:blur-[3px] group-hover/cards:[&:not(:hover)]:scale-[0.97] group-hover/cards:[&:not(:hover)]:bg-[#0a0a0a]/80 hover:scale-[1.03] hover:z-20 relative p-8 lg:p-10 rounded-[2rem] bg-gradient-to-b from-[#1a1510]/90 to-[#121212]/90 backdrop-blur-xl border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.05)] hover:border-orange-500/50 hover:shadow-[0_0_50px_rgba(249,115,22,0.2)] flex flex-col cursor-default h-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] uppercase tracking-wider font-semibold rounded-full px-3 py-1 shadow-[0_0_15px_rgba(249,115,22,0.4)] whitespace-nowrap">
                Most Popular
              </div>
              <h3 className="text-xl font-medium text-white mb-2 tracking-tight">Pro</h3>
              <p className="text-sm text-neutral-500 font-light mb-8 line-clamp-2 min-h-[40px]">For scaling teams automating complex daily workflows.</p>
              <div className="text-4xl lg:text-5xl font-medium text-white mb-10 tracking-tight">
                $<AnimatedPrice targetValue={isYearly ? 39 : 49} /><span className="text-sm text-neutral-500 font-light billing-period">/mo</span>
              </div>

              <ul className="flex flex-col gap-5 mb-10 flex-1">
                {[
                  '50,000 tasks/month',
                  'Unlimited active integrations',
                  'Priority support & Telemetry'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-200 font-light">
                    <iconify-icon icon="solar:check-circle-linear" class="text-orange-500 text-lg shrink-0"></iconify-icon>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-sm font-medium transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-400/50">Start Free Trial</button>
            </div>
          </Reveal>

          {/* Enterprise */}
          <Reveal delay={300} className="h-full">
            <div className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cards:[&:not(:hover)]:opacity-40 group-hover/cards:[&:not(:hover)]:blur-[3px] group-hover/cards:[&:not(:hover)]:scale-[0.97] group-hover/cards:[&:not(:hover)]:bg-[#0a0a0a]/80 hover:scale-[1.03] hover:z-20 relative p-8 lg:p-10 rounded-[2rem] bg-[#121212]/80 backdrop-blur-xl border border-white/5 hover:border-white/20 hover:bg-[#181818]/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] flex flex-col cursor-default h-full">
              <h3 className="text-xl font-medium text-white mb-2 tracking-tight">Enterprise</h3>
              <p className="text-sm text-neutral-500 font-light mb-8 line-clamp-2 min-h-[40px]">For massive scale, custom needs, and dedicated security.</p>
              <div className="text-4xl lg:text-5xl font-medium text-white mb-10 tracking-tight">
                $<AnimatedPrice targetValue={isYearly ? 79 : 99} /><span className="text-sm text-neutral-500 font-light billing-period">/mo</span>
              </div>

              <ul className="flex flex-col gap-5 mb-10 flex-1">
                {[
                  'Unlimited tasks & throughput',
                  'Custom enterprise integrations',
                  '24/7 dedicated account team'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-300 font-light">
                    <iconify-icon icon="solar:check-circle-linear" class="text-neutral-500 text-lg shrink-0"></iconify-icon>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3.5 rounded-full bg-[#1a1a1a] border border-neutral-700/50 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">Contact Sales</button>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}