import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const readinessTrend = [
  { week: 'W1', readiness: 58, load: 11 },
  { week: 'W2', readiness: 62, load: 13 },
  { week: 'W3', readiness: 67, load: 12 },
  { week: 'W4', readiness: 71, load: 16 },
  { week: 'W5', readiness: 76, load: 14 },
  { week: 'W6', readiness: 82, load: 15 },
];

const kpiCards = [
  {
    label: 'Active Builds',
    value: '12',
    detail: '+2 entering deployment window',
    tone: 'accent',
    icon: 'solar:widget-5-linear',
  },
  {
    label: 'Launch Readiness',
    value: '84%',
    detail: '3 projects above release threshold',
    tone: 'neutral',
    icon: 'solar:rocket-2-linear',
  },
  {
    label: 'Ops Integrity',
    value: '96.2',
    detail: 'Audit variance down 1.4%',
    tone: 'neutral',
    icon: 'solar:shield-check-linear',
  },
  {
    label: 'Growth Signal',
    value: 'Strong',
    detail: 'Inbound demand holding across 4 sectors',
    tone: 'neutral',
    icon: 'solar:graph-up-linear',
  },
  {
    label: 'Deployment Queue',
    value: '07',
    detail: '2 blocked, 5 cleared for review',
    tone: 'warning',
    icon: 'solar:server-path-linear',
  },
];

const processSteps = [
  'Abstract / Idea',
  'Brainstorm',
  'Development',
  'Iteration',
  'Deployment',
];

const servicePanels = [
  {
    title: 'Launch Systems',
    summary: 'Campaign architecture, launch sequencing, and release coordination across assets and teams.',
    stats: ['04 active rails', '09 release blocks', 'Readiness 88%'],
    focus: 'Current focus: release pacing',
  },
  {
    title: 'Operating Systems',
    summary: 'Internal workflows, handoff design, delivery governance, and process stabilization.',
    stats: ['11 mapped workflows', '03 rebuilds in motion', 'Integrity 96%'],
    focus: 'Current focus: handoff compression',
  },
  {
    title: 'Growth Systems',
    summary: 'Acquisition mechanics, conversion pathways, and reporting structure for reliable throughput.',
    stats: ['05 active engines', 'Signal +14%', '02 funnel audits'],
    focus: 'Current focus: offer-path refinement',
  },
  {
    title: 'Intelligence Systems',
    summary: 'Instrumentation, observability layers, issue patterning, and decision support.',
    stats: ['17 active probes', '03 anomaly flags', 'Coverage 91%'],
    focus: 'Current focus: readiness telemetry',
  },
];

const transmissions = [
  '[09:14] Deployment note appended — Atlas release checklist advanced to final review.',
  '[08:52] Operating rebuild synchronized — intake routing logic reduced queue overlap.',
  '[08:31] Signal update — Northstar growth system exceeded forecast threshold.',
  '[07:58] Audit marker raised — Beacon ops integrity drift detected in approvals rail.',
  '[07:26] Client transmission received — Meridian requested accelerated launch pacing.',
];

const queueItems = [
  {
    client: 'Atlas Bioworks',
    phase: 'Iteration',
    readiness: '91%',
    priority: 'High',
    owner: 'LM',
    status: 'Cleared',
  },
  {
    client: 'Northstar Capital',
    phase: 'Development',
    readiness: '74%',
    priority: 'High',
    owner: 'AR',
    status: 'Active',
  },
  {
    client: 'Meridian Health',
    phase: 'Deployment',
    readiness: '96%',
    priority: 'Critical',
    owner: 'ST',
    status: 'Queued',
  },
  {
    client: 'Foundry Grid',
    phase: 'Brainstorm',
    readiness: '43%',
    priority: 'Medium',
    owner: 'EV',
    status: 'Scoping',
  },
  {
    client: 'Cinder Logistics',
    phase: 'Abstract / Idea',
    readiness: '29%',
    priority: 'Low',
    owner: 'NK',
    status: 'Intake',
  },
];

const systemMap = [
  { name: 'Abstract', state: 'locked' },
  { name: 'System Mapping', state: 'active' },
  { name: 'Build Rail', state: 'active' },
  { name: 'Refinement', state: 'queued' },
  { name: 'Deployment', state: 'queued' },
];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Sidebar({ open, onClose, activeNav, setActiveNav }) {
  const navGroups = [
    {
      label: 'Command',
      items: ['Overview', 'Launch Systems', 'Operating Systems', 'Growth Systems', 'Intelligence Systems'],
    },
    {
      label: 'Structure',
      items: ['Method', 'Clients', 'Settings'],
    },
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-[#2a241f]/20 backdrop-blur-[1px] transition-opacity md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[#d7ccbe] bg-[#f5efe6] transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Primary navigation"
      >
        <div className="flex items-start justify-between border-b border-[#ddd1c2] px-5 py-5">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[#cdb9a3] bg-[#efe4d4] text-[#c75c1d]">
                <iconify-icon icon="solar:widget-6-linear" width="20" height="20"></iconify-icon>
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-medium tracking-tight text-[#221f1b]">
                  Launchworks Dynamics
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7d746b]">
                  Applied Systems for Growth
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center border border-[#ddd1c2] text-[#554d46] transition hover:bg-[#eee5d8] md:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="mb-3 px-2 text-[11px] uppercase tracking-[0.18em] text-[#8c8176]">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active = activeNav === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setActiveNav(item);
                        onClose();
                      }}
                      className={cn(
                        'flex w-full items-center justify-between border px-3 py-3 text-left text-[14px] transition',
                        active
                          ? 'border-[#d8a27f] bg-[#f1e2d6] text-[#8b3f16]'
                          : 'border-transparent text-[#3b342f] hover:border-[#ddd1c2] hover:bg-[#f0e7db]'
                      )}
                    >
                      <span className="font-medium">{item}</span>
                      <iconify-icon
                        icon={active ? 'solar:alt-arrow-right-linear' : 'solar:round-arrow-right-linear'}
                        width="16"
                        height="16"
                      ></iconify-icon>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#ddd1c2] px-4 py-4">
          <div className="border border-[#d9ccbc] bg-[#efe7db] p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c736b]">
                System Status
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#9a471a]">
                <span className="h-2 w-2 rounded-full bg-[#d26522]"></span>
                Live
              </span>
            </div>
            <div className="space-y-2 text-[12px] text-[#564f48]">
              <div className="flex items-center justify-between">
                <span>Observability</span>
                <span className="font-medium text-[#2c2722]">Nominal</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Queue Pressure</span>
                <span className="font-medium text-[#2c2722]">Moderate</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Audit Drift</span>
                <span className="font-medium text-[#2c2722]">Contained</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#ddd1c2] bg-[#f7f1e8]/95 backdrop-blur-sm">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-[#d9ccbc] bg-[#f3ebdf] text-[#463f38] transition hover:bg-[#ede2d4] md:hidden"
              onClick={onOpenSidebar}
              aria-label="Open navigation"
            >
              <iconify-icon icon="solar:hamburger-menu-linear" width="20" height="20"></iconify-icon>
            </button>

            <div>
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#8a8178]">Overview</p>
              <h1 className="text-[24px] font-medium tracking-tight text-[#211d19] md:text-[30px]">
                Mission Control
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button className="inline-flex items-center gap-2 border border-[#d7ccbe] bg-[#f2e8db] px-3.5 py-2 text-[13px] font-medium text-[#3d352f] transition hover:border-[#caa07f] hover:text-[#8d4016]">
              <iconify-icon icon="solar:add-circle-linear" width="18" height="18"></iconify-icon>
              Start a Build
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center border border-[#d7ccbe] text-[#5c544d] transition hover:bg-[#efe4d7]"
              aria-label="Notifications"
            >
              <iconify-icon icon="solar:bell-linear" width="19" height="19"></iconify-icon>
            </button>
            <div className="flex items-center gap-3 border border-[#d7ccbe] bg-[#f4ecdf] px-3 py-2">
              <div className="text-right">
                <p className="text-[12px] font-medium text-[#28231f]">Launchworks</p>
                <p className="text-[11px] text-[#82786f]">Core Workspace</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center bg-[#e2d5c5] text-[12px] font-medium text-[#3f3832]">
                LD
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <iconify-icon
              icon="solar:magnifer-linear"
              width="18"
              height="18"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-[#857a70]"
            ></iconify-icon>
            <input
              type="text"
              placeholder="Search systems, clients, deployments..."
              className="h-11 w-full border border-[#d8ccbd] bg-[#fbf7f0] pl-10 pr-4 text-[14px] text-[#2e2925] outline-none transition placeholder:text-[#91867b] focus:border-[#cc8f67]"
              aria-label="Search systems"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 border border-[#d8ccbd] bg-[#f5ede1] px-3 py-2 text-[12px] text-[#4d453f]">
              <span className="h-2 w-2 rounded-full bg-[#d06322]"></span>
              Operating state: monitored
            </div>
            <div className="inline-flex items-center gap-2 border border-[#d8ccbd] bg-[#f5ede1] px-3 py-2 text-[12px] text-[#4d453f]">
              <iconify-icon icon="solar:clock-circle-linear" width="16" height="16"></iconify-icon>
              Last sync 2m ago
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Card({ children, className = '' }) {
  return (
    <section
      className={cn(
        'border border-[#d9ccbc] bg-[#fbf7f0] p-4 shadow-[0_1px_0_rgba(60,44,28,0.03)] transition duration-200 hover:border-[#ccbba8]',
        className
      )}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Overview');
  const [selectedPhase, setSelectedPhase] = useState('System Mapping');

  const selectedQueue = useMemo(
    () => queueItems.find((item) => item.client === 'Meridian Health') || queueItems[0],
    []
  );

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#211d19]">
      <style>{`
        .launchworks-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .launchworks-scrollbar::-webkit-scrollbar-thumb {
          background: #cdbda9;
        }

        .launchworks-scrollbar::-webkit-scrollbar-track {
          background: #eee5d9;
        }
      `}</style>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      <div className="md:pl-[240px]">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="px-4 py-4 md:px-7 md:py-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-12 xl:grid-cols-5">
              {kpiCards.map((card) => (
                <Card key={card.label} className="min-h-[126px] bg-[#faf5ee]">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e73]">
                      {card.label}
                    </p>
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center border',
                        card.tone === 'accent' || card.tone === 'warning'
                          ? 'border-[#d8a17d] bg-[#f3e1d3] text-[#b85018]'
                          : 'border-[#ddd1c2] bg-[#f1ebe2] text-[#6e655d]'
                      )}
                    >
                      <iconify-icon icon={card.icon} width="18" height="18"></iconify-icon>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[28px] font-medium tracking-tight text-[#1f1b17]">
                        {card.value}
                      </p>
                      <p
                        className={cn(
                          'mt-1 text-[12px]',
                          card.tone === 'accent'
                            ? 'text-[#9e4719]'
                            : card.tone === 'warning'
                            ? 'text-[#8c5b37]'
                            : 'text-[#766d65]'
                        )}
                      >
                        {card.detail}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="xl:col-span-7 xl:row-span-2">
              <div className="mb-5 flex flex-col gap-4 border-b border-[#e2d7ca] pb-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e73]">
                    Systems Overview
                  </p>
                  <h2 className="mt-1 text-[24px] font-medium tracking-tight text-[#221d18]">
                    Project Command
                  </h2>
                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#70675f]">
                    Selected environment: Meridian Health / launch rebuild. Workflow status, readiness,
                    and deployment dependencies are currently being monitored from a single command
                    surface.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
                  {[
                    ['Client', selectedQueue.client],
                    ['Phase', selectedQueue.phase],
                    ['Readiness', selectedQueue.readiness],
                    ['Priority', selectedQueue.priority],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-[#ddd1c2] bg-[#f6efe4] px-3 py-2">
                      <p className="uppercase tracking-[0.14em] text-[#94897d]">{label}</p>
                      <p className="mt-1 font-medium text-[#2a241f]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="border border-[#ddd1c2] bg-[#f8f3eb] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#7f7469]">
                      Workflow Map
                    </p>
                    <span className="inline-flex items-center gap-2 text-[12px] text-[#97501f]">
                      <span className="h-2 w-2 rounded-full bg-[#d26522]"></span>
                      active chain
                    </span>
                  </div>

                  <div className="space-y-4">
                    {systemMap.map((item, index) => {
                      const isActive = selectedPhase === item.name;
                      const stateTone =
                        item.state === 'active'
                          ? 'border-[#d7a27f] bg-[#f4e4d8] text-[#8a3f16]'
                          : item.state === 'queued'
                          ? 'border-[#ddd1c2] bg-[#f2ece3] text-[#6d645d]'
                          : 'border-[#e4dbd1] bg-[#f8f4ee] text-[#91877d]';
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setSelectedPhase(item.name)}
                          className={cn(
                            'relative flex w-full items-center gap-3 border p-3 text-left transition',
                            isActive
                              ? 'border-[#cb8b63] bg-[#f5e4d8]'
                              : 'border-[#e0d5c8] bg-[#fbf8f3] hover:border-[#d1bea9]'
                          )}
                        >
                          <div className="flex w-7 flex-col items-center self-stretch pt-0.5">
                            <div
                              className={cn(
                                'flex h-7 w-7 items-center justify-center border text-[11px] font-medium',
                                isActive
                                  ? 'border-[#cb8b63] bg-[#cf6323] text-white'
                                  : 'border-[#d6cabd] bg-[#efe7dc] text-[#5f5650]'
                              )}
                            >
                              {index + 1}
                            </div>
                            {index < systemMap.length - 1 && (
                              <div className="mt-2 w-px flex-1 bg-[#d8ccbd]"></div>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="text-[14px] font-medium text-[#241f1b]">{item.name}</p>
                            <p className="mt-1 text-[12px] text-[#746b63]">
                              {item.state === 'active'
                                ? 'In active refinement and sequencing.'
                                : item.state === 'queued'
                                ? 'Prepared for downstream activation.'
                                : 'Awaiting system unlock.'}
                            </p>
                          </div>

                          <div className={cn('border px-2 py-1 text-[11px] uppercase tracking-[0.14em]', stateTone)}>
                            {item.state}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-[#ddd1c2] bg-[#f8f2e9] p-4">
                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#7f7469]">
                      Current System Status
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        ['Operating state', 'Readiness calibration in progress'],
                        ['Constraint', 'Legal review delaying final approvals'],
                        ['Deployment gate', 'Awaiting content rail sign-off'],
                        ['Owner', 'Systems team / Meridian pod'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-start justify-between gap-4 border-t border-[#e5dbcf] pt-3 first:border-t-0 first:pt-0">
                          <span className="text-[12px] uppercase tracking-[0.14em] text-[#908578]">
                            {label}
                          </span>
                          <span className="max-w-[180px] text-right text-[12px] text-[#3f3832]">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-[#ddd1c2] bg-[#f6efe5] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#7f7469]">
                        Stage Marker
                      </p>
                      <span className="text-[12px] font-medium text-[#9a4a1d]">{selectedPhase}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden bg-[#e2d8cc]">
                      <div
                        className="h-full bg-[#d16422] transition-all duration-300"
                        style={{
                          width: `${((systemMap.findIndex((item) => item.name === selectedPhase) + 1) / systemMap.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="mt-3 text-[12px] leading-relaxed text-[#70675f]">
                      Phase progression remains disciplined. Readiness moves only after review, audit,
                      and dependency confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="xl:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e73]">
                    Launchworks Method
                  </p>
                  <h2 className="mt-1 text-[20px] font-medium tracking-tight text-[#231e19]">
                    Five Fingers of Death
                  </h2>
                </div>
                <iconify-icon icon="solar:sort-from-top-to-bottom-linear" width="18" height="18" class="text-[#8d8073]"></iconify-icon>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 launchworks-scrollbar xl:flex-col xl:overflow-visible">
                {processSteps.map((step, index) => {
                  const active = index === 2 || index === 3;
                  return (
                    <div key={step} className="flex min-w-[180px] items-center gap-3 xl:min-w-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center border text-[12px] font-medium',
                            active
                              ? 'border-[#cc8f67] bg-[#d26422] text-white'
                              : 'border-[#d8ccbd] bg-[#efe7dc] text-[#5f5750]'
                          )}
                        >
                          {index + 1}
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className="hidden h-10 w-px bg-[#d8ccbd] xl:block"></div>
                        )}
                      </div>

                      <div className="flex-1 border border-[#ddd1c2] bg-[#f8f2e9] px-3 py-3">
                        <p className="text-[13px] font-medium text-[#2d2722]">{step}</p>
                        <p className="mt-1 text-[12px] text-[#776d65]">
                          {index < 2
                            ? 'Definition and signal capture.'
                            : index < 4
                            ? 'Build and controlled refinement.'
                            : 'Release and operating handoff.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-8">
              {servicePanels.map((panel) => (
                <Card key={panel.title} className="bg-[#faf6ef]">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[18px] font-medium tracking-tight text-[#231e19]">
                        {panel.title}
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-[#6f665d]">
                        {panel.summary}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center border border-[#d8ccbd] bg-[#f0e7dc] text-[#7c7063]">
                      <iconify-icon icon="solar:layers-minimalistic-linear" width="18" height="18"></iconify-icon>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {panel.stats.map((stat) => (
                      <span
                        key={stat}
                        className="border border-[#ddd1c2] bg-[#f3ece3] px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#60574f]"
                      >
                        {stat}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-[#e2d7ca] pt-3 text-[12px] text-[#8b4418]">
                    {panel.focus}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="xl:col-span-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e73]">
                    Transmission Log
                  </p>
                  <h2 className="mt-1 text-[20px] font-medium tracking-tight text-[#231e19]">
                    Activity Feed
                  </h2>
                </div>
                <span className="border border-[#d7cabc] bg-[#f2e8dc] px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-[#8a4a1f]">
                  live
                </span>
              </div>

              <div className="space-y-2">
                {transmissions.map((entry) => (
                  <div
                    key={entry}
                    className="border border-[#ddd1c2] bg-[#f8f2e8] px-3 py-3 text-[12px] leading-relaxed text-[#4a433d]"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="xl:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e73]">
                    Engagement Queue
                  </p>
                  <h2 className="mt-1 text-[20px] font-medium tracking-tight text-[#231e19]">
                    Active Clients / Projects
                  </h2>
                </div>
                <button className="border border-[#d7ccbe] bg-[#f3ebdf] px-3 py-2 text-[12px] font-medium text-[#473f38] transition hover:border-[#cb946d] hover:text-[#934618]">
                  New Audit
                </button>
              </div>

              <div className="overflow-hidden border border-[#ddd1c2]">
                <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr] gap-3 border-b border-[#ddd1c2] bg-[#efe7db] px-3 py-3 text-[11px] uppercase tracking-[0.16em] text-[#7e746a]">
                  <div>Client / Project</div>
                  <div>Phase</div>
                  <div>Readiness</div>
                  <div>Priority</div>
                  <div>Status</div>
                </div>

                {queueItems.map((item) => (
                  <div
                    key={item.client}
                    className="grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr] gap-3 border-b border-[#e4d9cc] bg-[#fbf7f1] px-3 py-3 text-[13px] last:border-b-0 hover:bg-[#f7f0e7]"
                  >
                    <div>
                      <p className="font-medium text-[#27221e]">{item.client}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#8f8479]">
                        owner {item.owner}
                      </p>
                    </div>
                    <div className="text-[#5f564e]">{item.phase}</div>
                    <div className="font-medium text-[#2c2722]">{item.readiness}</div>
                    <div
                      className={cn(
                        'w-fit border px-2 py-1 text-[11px] uppercase tracking-[0.12em]',
                        item.priority === 'Critical'
                          ? 'border-[#d59671] bg-[#f3dfd0] text-[#964719]'
                          : item.priority === 'High'
                          ? 'border-[#dec8b5] bg-[#f4ece2] text-[#655b53]'
                          : 'border-[#e3d9cf] bg-[#f8f3ec] text-[#82786e]'
                      )}
                    >
                      {item.priority}
                    </div>
                    <div className="text-[#5f564e]">{item.status}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="xl:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7e73]">
                    Intelligence
                  </p>
                  <h2 className="mt-1 text-[20px] font-medium tracking-tight text-[#231e19]">
                    Readiness Trend
                  </h2>
                </div>
                <span className="text-[12px] text-[#7a7067]">6-week signal</span>
              </div>

              <div className="h-[260px] border border-[#ddd1c2] bg-[#f8f2e9] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readinessTrend} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d16422" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#d16422" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ddd1c2" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: '#7d7268', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#7d7268', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#fbf7f0',
                        border: '1px solid #d9ccbc',
                        borderRadius: '0px',
                        color: '#2b2622',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="load"
                      stroke="#b8ada1"
                      fill="#d7cec4"
                      fillOpacity={0.12}
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="readiness"
                      stroke="#d16422"
                      fill="url(#readinessFill)"
                      strokeWidth={2.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ['Throughput', '14.2'],
                  ['Issue Density', '0.8'],
                  ['Project Load', '15'],
                ].map(([label, value]) => (
                  <div key={label} className="border border-[#ddd1c2] bg-[#f5ede2] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#8d8277]">{label}</p>
                    <p className="mt-2 text-[18px] font-medium tracking-tight text-[#2a241f]">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}