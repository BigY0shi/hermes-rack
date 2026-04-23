import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';

const navigationGroups = [
  {
    label: 'Command',
    items: [
      { to: '/', label: 'Overview', icon: 'solar:widget-5-linear' },
      { to: '/launch-systems', label: 'Launch Systems', icon: 'solar:rocket-2-linear' },
      { to: '/operating-systems', label: 'Operating Systems', icon: 'solar:settings-linear' },
      { to: '/growth-systems', label: 'Growth Systems', icon: 'solar:graph-up-linear' },
      { to: '/intelligence-systems', label: 'Intelligence Systems', icon: 'solar:chart-square-linear' },
    ],
  },
  {
    label: 'Framework',
    items: [
      { to: '/method', label: 'Method', icon: 'solar:route-linear' },
      { to: '/clients', label: 'Clients', icon: 'solar:users-group-rounded-linear' },
      { to: '/settings', label: 'Settings', icon: 'solar:tuning-2-linear' },
    ],
  },
];

function NavItem({ to, label, icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-all duration-200',
        active
          ? 'border-[#d6b08e] bg-[#fff7ef] text-[#1f1b18] shadow-[inset_0_0_0_1px_rgba(208,113,42,0.08)]'
          : 'border-transparent text-[#5d554e] hover:border-[#ddd2c4] hover:bg-[#f6efe6] hover:text-[#1f1b18]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-8 w-8 items-center justify-center rounded-sm border transition-colors duration-200',
          active
            ? 'border-[#d9b18b] bg-[#d0712a] text-white'
            : 'border-[#ddd2c4] bg-[#fbf7f1] text-[#7a7268] group-hover:border-[#d6c7b6] group-hover:text-[#403932]',
        ].join(' ')}
      >
        <iconify-icon icon={icon} class="text-base"></iconify-icon>
      </span>
      <span className="font-medium tracking-tight">{label}</span>
      {active ? <span className="ml-auto h-2 w-2 rounded-full bg-[#d0712a]" aria-hidden="true" /> : null}
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#d9d0c5] px-5 py-5">
        <Link to="/" onClick={onNavigate} className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md border border-[#d3c7b7] bg-[#f8f1e7] text-[#d0712a]">
            <iconify-icon icon="solar:layers-minimalistic-linear" class="text-[20px]"></iconify-icon>
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight text-[#1f1b18]">
              Launchworks Dynamics
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#7e7367]">
              Applied Systems for Growth
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <section key={group.label}>
              <div className="mb-3 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8b8176]">
                {group.label}
              </div>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active =
                    item.to === '/'
                      ? pathname === '/'
                      : pathname === item.to || pathname.startsWith(`${item.to}/`);

                  return (
                    <NavItem
                      key={item.to}
                      {...item}
                      active={active}
                      onClick={onNavigate}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="border-t border-[#d9d0c5] px-4 py-4">
        <div className="rounded-md border border-[#d8cdc0] bg-[#f8f2ea] p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#877c70]">
              System State
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#4d453f]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d0712a]" aria-hidden="true" />
              Stable
            </div>
          </div>

          <div className="mt-4 space-y-3 text-[13px] text-[#5a5149]">
            <div className="flex items-center justify-between">
              <span>Observability</span>
              <span className="font-medium text-[#1f1b18]">92%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e8ddd1]">
              <div className="h-full w-[92%] bg-[#d0712a]" />
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#7b7166]">
              <span>Queue Sync: nominal</span>
              <span>04 active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const allItems = navigationGroups.flatMap((group) => group.items);
    const match = allItems.find((item) =>
      item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`)
    );

    return match?.label || 'Overview';
  }, [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[#d8cfc3] bg-[#f3ece2] lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-[#d9d0c5] bg-[#f7f1e8] lg:left-[248px]">
        <div className="flex h-[74px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d7ccbf] bg-[#fbf7f1] text-[#3d3732] transition-colors hover:bg-[#f2eadf] lg:hidden"
            >
              <iconify-icon icon="solar:hamburger-menu-linear" class="text-[18px]"></iconify-icon>
            </button>

            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#8b8176]">Operating Environment</div>
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-[#1f1b18]">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-[#d7ccbf] bg-[#fbf7f1] px-3 py-2 text-[#756c63] md:flex md:w-[260px]">
              <iconify-icon icon="solar:magnifer-linear" class="text-[16px]"></iconify-icon>
              <input
                type="text"
                aria-label="Search systems"
                placeholder="Search systems, audits, or clients"
                className="w-full border-0 bg-transparent text-sm text-[#2a2521] outline-none placeholder:text-[#918679]"
              />
            </div>

            <div className="hidden items-center gap-2 rounded-md border border-[#d8cdbf] bg-[#f9f4ed] px-3 py-2 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d0712a]" aria-hidden="true" />
              <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#5f564e]">
                Systems Nominal
              </span>
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d7ccbf] bg-[#fbf7f1] text-[#4a433d] transition-colors hover:bg-[#f2eadf]"
            >
              <iconify-icon icon="solar:bell-linear" class="text-[18px]"></iconify-icon>
            </button>

            <button
              type="button"
              className="hidden items-center gap-2 rounded-md border border-[#cfa074] bg-[#d0712a] px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b96023] md:inline-flex"
            >
              <iconify-icon icon="solar:add-circle-linear" class="text-[18px]"></iconify-icon>
              Start a Build
            </button>

            <button
              type="button"
              aria-label="Workspace"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d7ccbf] bg-[#ebe3d7] text-[#2f2a25] transition-colors hover:bg-[#e2d8ca]"
            >
              <iconify-icon icon="solar:user-linear" class="text-[18px]"></iconify-icon>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-[#201c18]/30"
          />
          <div className="relative h-full w-[88%] max-w-[320px] border-r border-[#d8cfc3] bg-[#f3ece2] shadow-[18px_0_32px_rgba(53,43,34,0.12)]">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}