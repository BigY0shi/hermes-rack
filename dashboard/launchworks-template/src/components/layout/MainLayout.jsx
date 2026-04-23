import { memo, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navigationGroups = [
  {
    label: 'Command',
    items: [
      { to: '/', label: 'Overview', icon: 'solar:widget-5-outline' },
      { to: '/launch-systems', label: 'Launch Systems', icon: 'solar:rocket-outline' },
      { to: '/operating-systems', label: 'Operating Systems', icon: 'solar:settings-outline' },
      { to: '/growth-systems', label: 'Growth Systems', icon: 'solar:chart-square-outline' },
      { to: '/intelligence-systems', label: 'Intelligence Systems', icon: 'solar:eye-outline' },
    ],
  },
  {
    label: 'Structure',
    items: [
      { to: '/method', label: 'Method', icon: 'solar:diagram-up-outline' },
      { to: '/clients', label: 'Clients', icon: 'solar:users-group-rounded-outline' },
      { to: '/settings', label: 'Settings', icon: 'solar:tuning-2-outline' },
    ],
  },
];

const pageTitles = {
  '/': 'Overview',
  '/launch-systems': 'Launch Systems',
  '/operating-systems': 'Operating Systems',
  '/growth-systems': 'Growth Systems',
  '/intelligence-systems': 'Intelligence Systems',
  '/method': 'Method',
  '/clients': 'Clients',
  '/settings': 'Settings',
};

const pageDescriptors = {
  '/': 'Operating visibility across launch, refinement, and deployment systems.',
  '/launch-systems': 'Pipeline control for launch planning, staging, and delivery readiness.',
  '/operating-systems': 'Operational integrity, rebuild state, and system governance.',
  '/growth-systems': 'Growth infrastructure, throughput, and demand signal monitoring.',
  '/intelligence-systems': 'Observability, issue density, and performance awareness.',
  '/method': 'Five Fingers of Death execution structure and engagement sequencing.',
  '/clients': 'Active engagements, project state, and readiness across the queue.',
  '/settings': 'Workspace controls, preferences, and environment configuration.',
};

const quickActions = ['Start a Build', 'New Audit', 'New Project'];

function MainLayout() {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => pageTitles[location.pathname] || 'Overview', [location.pathname]);
  const pageDescriptor = useMemo(
    () => pageDescriptors[location.pathname] || pageDescriptors['/'],
    [location.pathname]
  );

  return (
    <div className="min-h-screen bg-[#f4eee3] text-[#231f1b] antialiased">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .nav-link-hover:hover { transform: translateX(4px); }
        .indicator-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,112,97,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,112,97,0.07)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_24%,transparent_76%,rgba(78,68,58,0.03))]" />
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[#d2c5b5] bg-[#efe7da] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[#d2c5b5] px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-[#c8b9a4] bg-[#f6f1e8] text-[#c9621c] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                <iconify-icon icon="solar:bolt-outline" width="22" height="22" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c6d5d]">
                  Launchworks Dynamics
                </p>
                <h1 className="mt-1 text-[18px] font-semibold tracking-tight text-[#231f1b]">
                  Applied Systems
                </h1>
                <p className="mt-1 text-xs text-[#74685d]">for Growth</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7b6a]">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `nav-link-hover group flex items-center gap-3 border px-3 py-2.5 text-sm transition-all duration-300 ${
                          isActive
                            ? 'border-[#d59b6b] bg-[#f7efe5] text-[#2b241e] shadow-[inset_0_0_0_1px_rgba(201,98,28,0.05)]'
                            : 'border-transparent text-[#5c5147] hover:border-[#d7cab8] hover:bg-[#f5eee4] hover:text-[#231f1b]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`flex h-8 w-8 items-center justify-center border transition-all duration-300 ${
                              isActive
                                ? 'border-[#d59b6b] bg-[#cb6620] text-[#fffaf4] scale-105'
                                : 'border-[#d7cab8] bg-[#f7f0e6] text-[#8c7c6a] group-hover:border-[#d0c2af] group-hover:text-[#6d5b48]'
                            }`}
                          >
                            <iconify-icon icon={item.icon} width="18" height="18" />
                          </span>
                          <span className="font-medium tracking-tight">{item.label}</span>
                          {isActive ? (
                            <span className="indicator-fade ml-auto h-2 w-2 rounded-full bg-[#cb6620]" aria-hidden="true" />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#d3c7b6] p-4">
            <div className="border border-[#d0c2af] bg-[#f5eee4] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7b6d5f]">
                  System State
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8b4a1f]">
                  <span className="h-2 w-2 rounded-full bg-[#c9621c] animate-[pulse_2s_infinite]" />
                  Stable
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-[#d3c7b6] bg-[#f4eee3]/98 backdrop-blur-[8px]">
          <div className="flex min-h-[74px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center border border-[#d3c7b6] bg-[#f8f2e9] text-[#4e443a] transition-all duration-300 hover:bg-[#f1e8db] hover:scale-105 lg:hidden"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <iconify-icon icon="solar:hamburger-menu-outline" width="20" height="20" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="hidden h-8 w-[1px] bg-[#d4c8b8] sm:block" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7b6a]">
                    Operating Environment
                  </p>
                  <h2 className="truncate text-[20px] font-semibold tracking-tight text-[#231f1b]">
                    {pageTitle}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default memo(MainLayout);