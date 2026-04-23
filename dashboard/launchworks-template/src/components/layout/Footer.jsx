import { Link } from 'react-router-dom';

const footerColumns = [
  {
    title: 'Systems',
    items: [
      { label: 'Overview', to: '/' },
      { label: 'Launch Systems', to: '/launch-systems' },
      { label: 'Operating Systems', to: '/operating-systems' },
      { label: 'Growth Systems', to: '/growth-systems' },
    ],
  },
  {
    title: 'Framework',
    items: [
      { label: 'Intelligence Systems', to: '/intelligence-systems' },
      { label: 'Method', to: '/method' },
      { label: 'Clients', to: '/clients' },
      { label: 'Settings', to: '/settings' },
    ],
  },
  {
    title: 'Operating State',
    items: [
      { label: 'Queue Load', meta: '07 active' },
      { label: 'Readiness Signal', meta: 'Nominal' },
      { label: 'Last Sync', meta: '04m ago' },
      { label: 'Transmission Window', meta: 'Open' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-[#d3c7b6] bg-[#eee5d8]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-[#d2c5b5] bg-[#f5eee4] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] lg:grid-cols-[1.3fr_2fr]">
          <div className="flex flex-col justify-between gap-6 border-b border-[#d8cbba] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <div>
              <Link to="/" className="inline-flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-[#c8b9a4] bg-[#f8f2e8] text-[#c9621c] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                  <iconify-icon icon="solar:layers-minimalistic-outline" width="20" height="20" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7d6f60]">
                    Launchworks Dynamics
                  </p>
                  <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#231f1b]">
                    Applied Systems for Growth
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#675c52]">
                    A systems-first development studio for launches, rebuilds, and operational refinement.
                  </p>
                </div>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-[#d4c6b4] bg-[#f8f2e9] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b6d5f]">
                    Operating State
                  </span>
                  <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#8b4a1f]">
                    <span className="h-2 w-2 bg-[#c9621c]" aria-hidden="true" />
                    Stable
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#6d6257]">
                  Console aligned for launch planning, operating rebuilds, and deployment control.
                </p>
              </div>

              <div className="border border-[#d4c6b4] bg-[#f8f2e9] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b6d5f]">
                    Contact Surface
                  </span>
                  <iconify-icon
                    icon="solar:arrow-up-right-outline"
                    width="16"
                    height="16"
                    class="text-[#8b7c6d]"
                  />
                </div>
                <a
                  href="mailto:ops@launchworksdynamics.com"
                  className="mt-2 inline-flex text-sm font-medium text-[#231f1b] transition-colors duration-150 hover:text-[#b75b1d]"
                >
                  ops@launchworksdynamics.com
                </a>
                <p className="mt-1 text-xs text-[#6d6257]">Audit intake, system scoping, and build initiation.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#7d7061]">
                  {column.title}
                </h3>

                <div className="space-y-2">
                  {column.items.map((item) =>
                    item.to ? (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="group flex items-center justify-between border border-transparent px-2.5 py-2 text-sm text-[#4e453d] transition-all duration-150 hover:border-[#d8cab9] hover:bg-[#f8f2e9] hover:text-[#231f1b]"
                      >
                        <span>{item.label}</span>
                        <iconify-icon
                          icon="solar:arrow-right-outline"
                          width="15"
                          height="15"
                          class="text-[#8d7f70] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#c9621c]"
                        />
                      </Link>
                    ) : (
                      <div
                        key={item.label}
                        className="flex items-center justify-between border border-[#ddd1c1] bg-[#f7f0e6] px-3 py-2.5 text-sm"
                      >
                        <span className="text-[#5c5147]">{item.label}</span>
                        <span className="font-medium text-[#2b241e]">{item.meta}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-x border-b border-[#d2c5b5] bg-[#efe7da] px-5 py-4 text-xs text-[#74685d] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} Launchworks Dynamics</span>
            <span className="hidden h-3 w-px bg-[#cdbfac] sm:block" aria-hidden="true" />
            <span>Internal operating environment</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#"
              className="transition-colors duration-150 hover:text-[#231f1b]"
              aria-label="Launchworks Dynamics on X"
            >
              <iconify-icon icon="simple-icons:x" width="14" height="14" />
            </a>
            <a
              href="#"
              className="transition-colors duration-150 hover:text-[#231f1b]"
              aria-label="Launchworks Dynamics on LinkedIn"
            >
              <iconify-icon icon="simple-icons:linkedin" width="14" height="14" />
            </a>
            <a
              href="#"
              className="transition-colors duration-150 hover:text-[#231f1b]"
              aria-label="Launchworks Dynamics on GitHub"
            >
              <iconify-icon icon="simple-icons:github" width="14" height="14" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}