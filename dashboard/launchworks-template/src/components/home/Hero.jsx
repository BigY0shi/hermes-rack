import React, { useEffect } from "react";

export default function Hero() {
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    let animationFrameId;
    let renderer;
    let handleResize;

    const initAnimations = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        const THREE = window.THREE;

        if (!gsap || !ScrollTrigger || !THREE) return;

        gsap.registerPlugin(ScrollTrigger);

        const titleEl = document.getElementById("hero-title");
        if (titleEl && !titleEl.classList.contains("splitted")) {
          const text = "Unify your operations into one intelligent platform.";
          const words = text.split(" ");
          titleEl.innerHTML = "";
          titleEl.classList.add("splitted");

          words.forEach((word) => {
            const maskSpan = document.createElement("span");
            maskSpan.className = "reveal-mask";
            maskSpan.innerHTML = `<span class="reveal-word">${word}&nbsp;</span>`;
            titleEl.appendChild(maskSpan);
          });
        }

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.to(".reveal-word", {
          y: "0%",
          duration: 1.2,
          stagger: 0.04,
          delay: 0.2,
        });

        tl.fromTo(
          ".hero-elem",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
          "-=0.8"
        );

        tl.fromTo(
          ".logo-anim-elem",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          "-=0.6"
        );

        tl.fromTo(
          ".dashboard-plane",
          { opacity: 0, z: -200, rotationX: 45 },
          { opacity: 1, z: 0, rotationX: 38, duration: 1.5, ease: "expo.out" },
          "-=0.6"
        );

        tl.fromTo(
          ".dash-elem",
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1 },
          "-=1.0"
        );

        tl.fromTo(
          ".dash-card",
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)" },
          "-=0.8"
        );

        gsap.to("#god-ray", {
          opacity: 0.3,
          scale: 1.05,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(".dashboard-plane", {
          scrollTrigger: {
            trigger: ".perspective-container",
            start: "top 30%",
            end: "bottom 80%",
            scrub: 1,
          },
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          scale: 1,
          ease: "power1.inOut",
        });

        const canvas = document.getElementById("webgl-bg");
        if (canvas && !canvas.dataset.initialized) {
          canvas.dataset.initialized = "true";

          renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
          });

          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(window.devicePixelRatio);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );

          camera.position.z = 30;
          camera.position.y = 10;
          camera.rotation.x = -0.2;

          const geometry = new THREE.PlaneGeometry(100, 100, 40, 40);
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.03,
          });

          const plane = new THREE.Mesh(geometry, material);
          plane.rotation.x = -Math.PI / 2;
          scene.add(plane);

          const positions = plane.geometry.attributes.position;
          const originalZ = [];

          for (let i = 0; i < positions.count; i++) {
            originalZ.push(positions.getZ(i));
          }

          let time = 0;

          const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            time += 0.005;

            for (let i = 0; i < positions.count; i++) {
              const x = positions.getX(i);
              const y = positions.getY(i);
              const wave1 = Math.sin(x * 0.1 + time) * 2;
              const wave2 = Math.cos(y * 0.1 + time * 0.8) * 2;
              positions.setZ(i, originalZ[i] + wave1 + wave2);
            }

            positions.needsUpdate = true;
            plane.rotation.z = time * 0.1;

            renderer.render(scene, camera);
          };

          animate();

          handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          };

          window.addEventListener("resize", handleResize);
        }
      } catch (e) {
        console.error("Failed to load animation scripts:", e);
      }
    };

    initAnimations();

    return () => {
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((st) => st.kill());
      }
    };
  }, []);

  return (
    <section className="bg-transparent text-zinc-200 font-sans overflow-visible antialiased selection:bg-orange-500/30 relative">
      <style>{`
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .border-gradient-surface {
          position: relative;
          background: rgba(20, 20, 22, 0.8);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
        }

        .border-gradient-surface::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: calc(1rem + 1px);
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
          z-index: -1;
          pointer-events: none;
        }

        .border-gradient-card {
          position: relative;
          background: rgba(24, 24, 27, 0.6);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .border-gradient-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: calc(0.75rem + 1px);
          background: linear-gradient(to bottom right, rgba(255,255,255,0.08), rgba(255,255,255,0));
          z-index: -1;
        }

        .perspective-container {
          perspective: 2000px;
          transform-style: preserve-3d;
          overflow: visible;
        }

        .dashboard-plane {
          transform: rotateX(38deg) rotateY(-12deg) rotateZ(18deg) scale(0.95);
          transform-origin: center top;
          box-shadow: -20px 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(255, 107, 0, 0.05);
          overflow: visible;
        }

        .reveal-mask {
          overflow: hidden;
          display: inline-block;
          vertical-align: top;
        }

        .reveal-word {
          display: inline-block;
          transform: translateY(100%);
        }

        @media (max-width: 1024px) {
          .dashboard-plane {
            transform: rotateX(24deg) rotateY(-6deg) rotateZ(8deg) scale(0.98);
          }
        }

        @media (max-width: 768px) {
          .dashboard-plane {
            transform: none;
          }
        }
      `}</style>

      <canvas id="webgl-bg" className="absolute inset-0 z-0 pointer-events-none opacity-40"></canvas>

      <div
        id="god-ray"
        className="absolute top-[-20%] right-[-22%] w-[86vw] h-[86vw] rounded-full bg-[#ff5a1f]/20 blur-[170px] pointer-events-none z-0 mix-blend-screen"
      ></div>

      <div className="absolute top-[-4%] right-[-12%] w-[52vw] h-[52vw] rounded-full bg-[#ff5a1f]/10 blur-[140px] pointer-events-none z-0 mix-blend-screen"></div>

      <main className="relative z-10 w-full pt-32 pb-24 md:pb-32 overflow-visible">
        <div className="md:px-10 lg:px-16 w-full pr-6 pl-6">
          <div className="max-w-[920px] flex flex-col items-start mb-16 md:mb-20 relative z-20">
            <div className="hero-elem opacity-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 text-[#ff5a1f] text-xs font-normal mb-6 backdrop-blur-sm">
              <iconify-icon icon="solar:start-linear" width="14"></iconify-icon>
              <span>Unify &amp; Automate</span>
            </div>

            <h1
              id="hero-title"
              className="text-5xl md:text-7xl lg:text-[88px] font-medium tracking-tight text-white mb-6 leading-[0.98] max-w-[820px]"
            >
              Unify your operations into one intelligent platform.
            </h1>

            <p className="hero-elem opacity-0 text-zinc-400 text-base md:text-lg mb-8 max-w-xl leading-relaxed font-normal">
              Bring fragmented tools together in a single command center. Optimize daily processes and empower your team to scale effortlessly without extensive coding.
            </p>

            <div className="hero-elem opacity-0 flex items-center gap-4">
              <button className="px-6 py-3 rounded-full bg-[#ff5a1f] text-white text-sm font-normal shadow-[0_0_30px_rgba(255,90,31,0.3)] hover:bg-[#ff6a35] hover:shadow-[0_0_40px_rgba(255,90,31,0.5)] transition-all">
                Start for free
              </button>
              <button className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-normal hover:bg-white/10 transition-all backdrop-blur-sm">
                View demo
              </button>
            </div>

            <div className="w-full flex flex-col items-start gap-6 mt-16 pt-8 border-t border-white/5 relative z-20 max-w-[980px]">
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-normal logo-anim-elem opacity-0">
                Trusted by leading engineering teams
              </p>

              <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-70">
                <div className="flex items-center gap-2 text-zinc-400 logo-anim-elem opacity-0 hover:text-white transition-colors cursor-default">
                  <iconify-icon icon="solar:infinity-linear" width="20"></iconify-icon>
                  <span className="text-base font-medium tracking-tight">Nebula</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 logo-anim-elem opacity-0 hover:text-white transition-colors cursor-default">
                  <iconify-icon icon="solar:planet-3-linear" width="20"></iconify-icon>
                  <span className="text-base font-medium tracking-tight">Astro</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 logo-anim-elem opacity-0 hover:text-white transition-colors cursor-default">
                  <iconify-icon icon="solar:triangle-linear" width="20"></iconify-icon>
                  <span className="text-base font-medium tracking-tight">Polymath</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-zinc-400 logo-anim-elem opacity-0 hover:text-white transition-colors cursor-default">
                  <iconify-icon icon="solar:box-linear" width="20"></iconify-icon>
                  <span className="text-base font-medium tracking-tight">BlockScale</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-visible md:px-8 md:mt-12 lg:mt-16 lg:pl-44 lg:pr-44 w-full mt-8 pr-24 pl-44">
          <div className="perspective-container w-full max-w-[1500px] mx-auto relative overflow-visible">
            <div className="dashboard-plane border-gradient-surface w-full min-h-[620px] md:min-h-[760px] lg:min-h-[860px] flex opacity-0">
              <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#0a0a0c]/50 dash-elem opacity-0">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <iconify-icon icon="solar:command-linear" className="text-zinc-300" width="18"></iconify-icon>
                </div>

                <div className="flex flex-col gap-4">
                  <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center text-[#ff5a1f] bg-[#ff5a1f]/10 relative">
                    <iconify-icon icon="solar:widget-5-linear" width="20"></iconify-icon>
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#ff5a1f] rounded-r-full"></div>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition">
                    <iconify-icon icon="solar:users-group-rounded-linear" width="20"></iconify-icon>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition">
                    <iconify-icon icon="solar:chart-square-linear" width="20"></iconify-icon>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition">
                    <iconify-icon icon="solar:settings-linear" width="20"></iconify-icon>
                  </a>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-[#111114]/80 backdrop-blur-xl relative overflow-hidden rounded-r-2xl">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

                <div className="px-8 py-8 border-b border-white/5 flex flex-col gap-6 dash-elem opacity-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-normal tracking-tight text-white flex items-center gap-2">
                      Connections <span className="text-zinc-500 text-sm font-normal">(28)</span>
                    </h2>

                    <div className="relative group">
                      <iconify-icon
                        icon="solar:magnifer-linear"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        width="16"
                      ></iconify-icon>
                      <input
                        type="text"
                        placeholder="Search apps..."
                        className="pl-9 pr-4 py-1.5 bg-black/40 border border-white/10 rounded-full text-xs text-zinc-300 focus:outline-none focus:border-white/20 w-48 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button className="px-4 py-1.5 rounded-md bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-normal border border-[#ff5a1f]/20">All</button>
                    <button className="px-4 py-1.5 rounded-md bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-normal transition">Active</button>
                    <button className="px-4 py-1.5 rounded-md bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-normal transition">Inactive</button>
                    <button className="px-4 py-1.5 rounded-md bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-normal transition border border-white/5">Analytics</button>
                    <button className="px-4 py-1.5 rounded-md bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-normal transition border border-white/5">Security</button>
                    <button className="px-4 py-1.5 rounded-md bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 text-xs font-normal transition border border-white/5">Billing</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                  <div className="flex items-center gap-2 mb-4 dash-elem opacity-0">
                    <h3 className="text-sm font-normal text-white">Trending</h3>
                    <span className="text-xs text-zinc-600">(6)</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border-gradient-card p-5 flex flex-col gap-4 dash-card opacity-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center">
                            <iconify-icon icon="solar:code-square-linear" className="text-white" width="20"></iconify-icon>
                          </div>
                          <div>
                            <h4 className="text-base font-normal text-white">CodeHub</h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] text-zinc-300 font-normal tracking-wide">DevOps</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                        AI-powered platform that allows developers to create, store, manage and collaborate on code efficiently.
                      </p>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <a href="#" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
                          <iconify-icon icon="solar:settings-linear" width="14"></iconify-icon> Setup
                        </a>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-zinc-300">Active</span>
                          <div className="w-9 h-5 bg-[#ff5a1f] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(255,90,31,0.4)] border border-[#ff5a1f]">
                            <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1 top-0.5 shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-gradient-card p-5 flex flex-col gap-4 dash-card opacity-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center">
                            <iconify-icon icon="solar:calculator-minimalistic-linear" className="text-emerald-400" width="20"></iconify-icon>
                          </div>
                          <div>
                            <h4 className="text-base font-normal text-white">LedgerX</h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] text-zinc-300 font-normal tracking-wide">Finance</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                        Comprehensive accounting software package developed to manage invoicing, payroll, and cash flow.
                      </p>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <a href="#" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
                          <iconify-icon icon="solar:settings-linear" width="14"></iconify-icon> Setup
                        </a>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-zinc-500">Disabled</span>
                          <div className="w-9 h-5 bg-zinc-800 rounded-full relative cursor-pointer border border-white/10">
                            <div className="w-3.5 h-3.5 bg-zinc-400 rounded-full absolute left-1 top-0.5 shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-gradient-card p-5 flex flex-col gap-4 dash-card opacity-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center">
                            <iconify-icon icon="solar:branching-paths-up-linear" className="text-orange-400" width="20"></iconify-icon>
                          </div>
                          <div>
                            <h4 className="text-base font-normal text-white">RepoSync</h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] text-zinc-300 font-normal tracking-wide">Popular</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                        Open-core company that operates a DevOps software package to develop, secure, and operate software.
                      </p>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <a href="#" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
                          <iconify-icon icon="solar:settings-linear" width="14"></iconify-icon> Setup
                        </a>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-zinc-300">Active</span>
                          <div className="w-9 h-5 bg-[#ff5a1f] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(255,90,31,0.4)] border border-[#ff5a1f]">
                            <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1 top-0.5 shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-gradient-card p-5 flex flex-col gap-4 dash-card opacity-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center">
                            <iconify-icon icon="solar:calendar-mark-linear" className="text-rose-400" width="20"></iconify-icon>
                          </div>
                          <div>
                            <h4 className="text-base font-normal text-white">Gatherly</h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] text-zinc-300 font-normal tracking-wide">Events</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                        Global event management and ticketing platform allowing users to browse, create, and promote events.
                      </p>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <a href="#" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
                          <iconify-icon icon="solar:settings-linear" width="14"></iconify-icon> Setup
                        </a>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-zinc-500">Disabled</span>
                          <div className="w-9 h-5 bg-zinc-800 rounded-full relative cursor-pointer border border-white/10">
                            <div className="w-3.5 h-3.5 bg-zinc-400 rounded-full absolute left-1 top-0.5 shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}