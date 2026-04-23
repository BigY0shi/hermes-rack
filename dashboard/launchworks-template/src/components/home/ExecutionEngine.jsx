import { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Reveal from '../ui/Reveal';

export default function ExecutionEngine() {
  const [terminalRef, terminalVisible] = useScrollReveal({ threshold: 0.5 });
  const [visibleLines, setVisibleLines] = useState(0);

  const lines = [
    { text: 'Initializing V8 isolate context...', type: 'neutral' },
    { prefix: 'INFO', text: 'Deploying workflow: user_sync_v2', type: 'blue' },
    { prefix: 'INFO', text: 'Compiling visual nodes to AST', type: 'blue' },
    { prefix: 'SUCCESS', text: 'AST compiled in 12ms', type: 'green' },
    { prefix: 'INFO', text: 'Distributing to 35 global edge regions', type: 'blue' },
    { text: '● Deployment active. Listening for events.', type: 'green' },
    { text: '> Event payload received: { type: "payment.success" }', type: 'orange', mt: true },
    { text: '↳ Routing to PostgreSQL', detail: '(3ms)', type: 'neutral' },
    { text: '↳ Routing to SendGrid', detail: '(15ms)', type: 'neutral' },
    { text: '✓ Workflow execution completed', detail: '(18ms total)', type: 'green' }
  ];

  useEffect(() => {
    if (terminalVisible) {
      let timer;
      const revealNextLine = (index) => {
        if (index < lines.length) {
          setVisibleLines(index + 1);
          timer = setTimeout(() => revealNextLine(index + 1), 300);
        }
      };
      timer = setTimeout(() => revealNextLine(0), 400);
      return () => clearTimeout(timer);
    }
  }, [terminalVisible]);

  return (
    <section className="relative z-10 w-full py-32 bg-[#0a0a0a] border-b border-neutral-900/50 overflow-hidden" id="execution-engine">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium mb-6 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                <iconify-icon icon="solar:bolt-linear" class="text-base animate-pulse"></iconify-icon>
                Sub-millisecond Execution
              </div>
              <h2 className="text-4xl md:text-6xl font-medium text-white tracking-tight mb-6 leading-tight">
                Compiled to edge.
                <br />
                <span className="text-neutral-500">Executed globally.</span>
              </h2>
              <p className="text-neutral-400 text-lg font-light mb-8 max-w-md leading-relaxed">
                Your visual workflows are instantly compiled to highly optimized V8 isolates and deployed to 35+ edge regions worldwide.
              </p>
              <ul className="flex flex-col gap-4">
                {['Zero cold starts for instant response times', 'Automatic horizontal scaling on demand', 'Failover routing built-in natively'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300 text-base font-light">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-500 shrink-0">
                      <iconify-icon icon="solar:check-circle-linear" class="text-base"></iconify-icon>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="w-full lg:w-1/2 relative perspective-1000 h-[400px] flex items-center justify-center" ref={terminalRef}>
            <div className="w-full max-w-lg bg-[#0d0d0d] rounded-2xl border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 relative z-20">
              <div className="h-10 border-b border-neutral-800/80 bg-[#141414] flex items-center px-4 gap-2 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                <div className="absolute left-1/2 -translate-x-1/2 text-[11px] text-neutral-500 font-mono tracking-wider">edge-runtime.log</div>
              </div>
              <div className="p-6 font-mono text-sm text-neutral-400 h-64 overflow-hidden relative leading-loose">
                <div className="flex flex-col gap-1">
                  {lines.map((line, index) => (
                    <div key={index} className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${index < visibleLines ? 'opacity-100' : 'opacity-0'} ${line.mt ? 'mt-3' : ''}`}>
                      {line.prefix && (
                         <span className={`mr-2 ${line.prefix === 'INFO' ? 'text-blue-400' : 'text-green-400'}`}>{line.prefix}</span>
                      )}
                      <span className={
                        line.type === 'green' ? 'text-green-400' : 
                        line.type === 'orange' ? 'text-orange-400' : 
                        line.type === 'blue' && !line.prefix ? 'text-blue-400' : 'text-neutral-500'
                      }>
                        {line.type === 'blue' && line.prefix ? <span className="text-white">{line.text}</span> : line.text}
                      </span>
                      {line.detail && <span className="text-neutral-600 ml-2">{line.detail}</span>}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none"></div>
              </div>
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="absolute top-[15%] right-[-5%] w-16 h-16 bg-[#1a1a1a]/60 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-center animate-float-slow text-neutral-500">
                <iconify-icon icon="solar:server-square-linear" class="text-2xl"></iconify-icon>
              </div>
              <div className="absolute bottom-[20%] right-[5%] w-14 h-14 bg-[#1a1a1a]/60 backdrop-blur-md border border-orange-500/20 rounded-xl flex items-center justify-center animate-float-fast text-orange-500/50">
                <iconify-icon icon="solar:global-linear" class="text-xl"></iconify-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}