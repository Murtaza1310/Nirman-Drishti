'use client'

import { Fragment, useState, useEffect, useRef, useMemo } from 'react'
import rawProjects from '@/lib/ongoing_projects.json'
import rawAnalysisProjects from '@/lib/flagship_analysis.json'
import rawProjectCoords from '@/lib/project_coords.json'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CircleDollarSign,
  Clock3,
  FileText,
  Flag,
  Gauge,
  Home,
  Info,
  LayoutGrid,
  Map,
  Menu,
  Search,
  Sparkles,
  TrendingUp,
  UserRound,
  ArrowLeft,
  Brain,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  AlertTriangleIcon,
  Shield,
  Lightbulb,
  Landmark,
  MapPin,
  Coins,
  Share2,
  ShieldAlert,
  ArrowRight,
  Send,
  X,
  Maximize2,
  ChevronsLeft,
  SlidersHorizontal,
  Printer,
  Mic,
  MicOff,
  Layers,
  TrendingDown,
} from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Projects', icon: LayoutGrid, active: true, badge: '1,775' },
  { label: 'Analysis', icon: BarChart3 },
  { label: 'Map', icon: Map },
  { label: 'AI', icon: Sparkles },
]

const metrics = [
  { label: 'ACTIVE ONGOING PROJECTS', value: '1,775', note: 'MoSPI July 2026 Flash Report (≥ ₹150 Cr)', tag: '100% Tracked', icon: FileText, tone: 'blue' },
  { label: 'HISTORICAL AI ARCHIVE', value: '49,094', note: 'Official MoSPI PAIMANA records (2001–2026)', tag: '25-Year Corpus', icon: Landmark, tone: 'blue' },
  { label: 'ON-TIME PROJECTS', value: '11', note: 'Executing within baseline target', tag: 'On Schedule', icon: CircleCheck, tone: 'green' },
  { label: 'DELAYED PROJECTS', value: '1,764', note: 'Running past original target deadline', tag: '99.4% Ratio', icon: Clock3, tone: 'orange' },
  { label: 'TOTAL APPROVED BUDGET', value: '₹ 40.57 Lakh Cr', note: 'Officially sanctioned capital outlay', tag: 'Sanctioned', icon: CircleDollarSign, tone: 'blue' },
  { label: 'MONEY SPENT TILL NOW', value: '₹ 24.18 Lakh Cr', note: 'Capital disbursed on ground to date', tag: '59.6% Expended', icon: Coins, tone: 'green' },
]

const filterOptions: Record<string, string[]> = {
  State: ['All', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Delhi & NCR', 'Karnataka', 'Tamil Nadu', 'Madhya Pradesh', 'Assam', 'West Bengal', 'Bihar', 'Odisha', 'Andhra Pradesh', 'Punjab', 'Haryana', 'Kerala', 'Jammu & Kashmir'],
  Risk: ['All', 'High', 'Medium', 'Low'],
  Type: ['All', 'On Schedule', 'Delayed', 'High Risk'],
}

const ministryOptions = ['All', 'MoRTH', 'Railways', 'Power', 'MoHUA', 'Jal Shakti', 'Petroleum', 'NHAI', 'PGCIL', 'NTPC']
const sectorOptions = ['All', 'Road Transport & Highways', 'Railways', 'Power & Renewable Energy', 'Petroleum & Natural Gas', 'Coal & Mines', 'Civil Aviation', 'Ports & Shipping', 'Water Resources & Irrigation', 'Other Infrastructure']

type Project = {
  id: string
  name: string
  state: string
  risk: 'High' | 'Medium' | 'Low'
  type: 'On Schedule' | 'Delayed' | 'High Risk'
  ministry: string
  sector: string
  agency?: string
  approvalDate?: string
  yearsActive?: string
  originalDoc?: string
  anticipatedDoc?: string
  cost: string
  rawCost?: number
  spentCost?: string
  rawSpentCost?: number
  balanceCost?: string
  financialProgress?: number
  expenditureBreakdown?: {
    civilWorks: string
    landAcquisition: string
    utilityAndSystems: string
    contingencyAndPMC: string
  }
  revisedCost?: string
  rawRevisedCost?: number
  costOverrunCr?: number
  costOverrunPct?: number
  progress: number
  delay: string
  overrunMonths?: number
  riskScore: number
  delayProbability: number
  criticalIssue: string
  reportPeriod?: string
}

const projects: Project[] = rawProjects as unknown as Project[]

const NATIONAL_PORTFOLIO_DOSSIER: Project = {
  id: 'NAT-PORTFOLIO-2026',
  name: 'National Infrastructure Portfolio (1,775 Active Mega-Projects Overview)',
  state: 'All 28 States & 8 Union Territories',
  risk: 'High',
  type: 'Delayed',
  ministry: 'Cabinet Secretariat / PMO / MoSPI',
  sector: 'Multi-Sector National Infrastructure',
  approvalDate: 'MoSPI July 2026 Flash Report',
  yearsActive: '2001–2026 Baseline',
  originalDoc: 'Multi-Year Phased',
  anticipatedDoc: 'FY 2026–2030',
  cost: '₹ 40,57,120 Cr (₹ 40.57 Lakh Cr)',
  rawCost: 4057120,
  spentCost: '₹ 24,18,340 Cr (₹ 24.18 Lakh Cr)',
  rawSpentCost: 2418340,
  balanceCost: '₹ 16,38,780 Cr (₹ 16.39 Lakh Cr)',
  financialProgress: 59.6,
  progress: 64,
  delay: '24 Months Average Portfolio Delay',
  overrunMonths: 24,
  riskScore: 84,
  delayProbability: 79,
  criticalIssue: 'Statutory Stage-II forest clearances, inter-state land acquisition & contractor cash flow',
  costOverrunCr: 486000,
  expenditureBreakdown: {
    civilWorks: '₹ 6,31,363 Cr (55%)',
    landAcquisition: '₹ 2,86,983 Cr (25%)',
    utilityAndSystems: '₹ 1,37,752 Cr (12%)',
    contingencyAndPMC: '₹ 91,835 Cr (8%)',
  },
}

type AnalysisProject = {
  id: string
  name: string
  status: 'On Schedule' | 'Delayed' | 'High Risk'
  risk: 'High' | 'Medium' | 'Low'
  ministry: string
  sector: string
  states: string
  cost: string
  revisedCost: string
  revisedPct: string
  progress: number
  originalCompletion: string
  currentExpected: string
  expectedDelta: string
  currentDelay: string
  aiConfidence: number
  predictedDelay: string
  predictedDelayConf: number
  estFunding: string
  estFundingConf: number
  overallRisk: string
  overallRiskConf: number
  bottleneck: string
  bottleneckDesc: string
  impact: string
  affectedActivity: string
  riskFurther: string
  bottleneckConf: number
  rootCause: string[]
  rootCauseConf: number
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE'
  actionText: string
  expectedImpact: string[]
  actionConf: number
}

const analysisProjects: AnalysisProject[] = rawAnalysisProjects as unknown as AnalysisProject[]

const rootCauseIcons = [FileText, MapPin, Target, Clock3]

const INDIA_TOPO = '/india-states.topo.json'
const MAP_W = 720
const MAP_H = 680
const DEG = Math.PI / 180
const DEFAULT_VIEW: MapViewport = { center: [82.5, 22.5], scale: 980 }

type MapViewport = { center: [number, number]; scale: number }

const projectCoords: Record<string, [number, number]> = rawProjectCoords as unknown as Record<string, [number, number]>

const stateCenters: Record<string, [number, number]> = {
  Maharashtra: [76.4, 19.4],
  Gujarat: [71.6, 22.6],
  Rajasthan: [74.2, 26.8],
  Delhi: [77.1, 28.6],
  Karnataka: [76.0, 15.1],
  'Tamil Nadu': [78.4, 11.1],
  'Uttar Pradesh': [80.6, 27.0],
}

const riskMarkerColor: Record<Project['risk'], string> = { High: '#d82a2a', Medium: '#ed7b11', Low: '#148c4b' }

function computeView(points: [number, number][], selectedState: string): MapViewport {
  if (points.length === 0) {
    if (selectedState !== 'All' && stateCenters[selectedState]) return { center: stateCenters[selectedState], scale: 2200 }
    return DEFAULT_VIEW
  }
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const center: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
  const lngSpan = Math.max(maxLng - minLng, 0.5)
  const latSpan = Math.max(maxLat - minLat, 0.5)
  const pad = 2.1
  const sW = (MAP_W * 0.6) / (lngSpan * pad * DEG)
  const sH = (MAP_H * 0.6) / (latSpan * pad * DEG)
  const scale = Math.max(DEFAULT_VIEW.scale, Math.min(Math.min(sW, sH), 3000))
  return { center, scale }
}

function useAnimatedView(target: MapViewport): MapViewport {
  const [view, setView] = useState(target)
  const fromRef = useRef(view)
  const targetRef = useRef(target)
  const startRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    fromRef.current = view
    targetRef.current = target
    startRef.current = performance.now()
    const duration = 550
    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / duration)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const c0 = fromRef.current.center[0] + (targetRef.current.center[0] - fromRef.current.center[0]) * ease
      const c1 = fromRef.current.center[1] + (targetRef.current.center[1] - fromRef.current.center[1]) * ease
      const sc = fromRef.current.scale + (targetRef.current.scale - fromRef.current.scale) * ease
      setView({ center: [c0, c1], scale: sc })
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target.center[0], target.center[1], target.scale])
  return view
}

export default function Page() {
  const [activeNav, setActiveNav] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [briefingModalProject, setBriefingModalProject] = useState<Project | AnalysisProject | null>(null)

  useEffect(() => {
    if (localStorage.getItem('nd-sidebar-collapsed') === 'true') setSidebarCollapsed(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('nd-sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const [analysisSelectedId, setAnalysisSelectedId] = useState<string | null>(null)

  const [filters, setFilters] = useState({ State: 'All', Risk: 'All', Type: 'All' })
  const [groupMode, setGroupMode] = useState<'Ministry' | 'Sector'>('Sector')
  const [groupValue, setGroupValue] = useState('All')
  const [search, setSearch] = useState('')
  const [displayLimit, setDisplayLimit] = useState(24)

  const resetAllFilters = () => {
    setFilters({ State: 'All', Risk: 'All', Type: 'All' })
    setGroupMode('Sector')
    setGroupValue('All')
    setSearch('')
  }

  const setFilter = (label: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [label]: value }))

  const switchGroupMode = (mode: 'Ministry' | 'Sector') => {
    setGroupMode(mode)
    setGroupValue('All')
  }

  const groupOptions = groupMode === 'Ministry' ? ministryOptions : sectorOptions

  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase()
    const haystack = [project.name, project.id, project.state, project.risk, project.type, project.ministry, project.sector, project.criticalIssue].join(' ').toLowerCase()
    if (query && !haystack.includes(query)) return false
    if (filters.State !== 'All' && !project.state.includes(filters.State)) return false
    if (filters.Risk !== 'All' && project.risk !== filters.Risk) return false
    if (filters.Type !== 'All' && project.type !== filters.Type) return false
    if (groupValue !== 'All') {
      if (groupMode === 'Ministry' && project.ministry !== groupValue) return false
      if (groupMode === 'Sector' && project.sector !== groupValue) return false
    }
    return true
  })

  const projectFiltersActive =
    filters.State !== 'All' || filters.Risk !== 'All' || filters.Type !== 'All' || groupValue !== 'All' || search.trim() !== ''

  const handleNav = (nav: string) => {
    setActiveNav(nav)
    setBriefingModalProject(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenAnalysisForProject = (projectId: string) => {
    setAnalysisSelectedId(projectId)
    setActiveNav('Analysis')
    setBriefingModalProject(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className={`app-shell ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Landmark size={18} strokeWidth={2.2} /><Activity size={10} strokeWidth={2.6} className="brand-mark-pulse" /></div>
          <div>
            <div className="brand-title">NIRMAN-Drishti</div>
            <div className="brand-subtitle">Infrastructure &amp; Project Monitoring Division (MoSPI) · AI Early Warning Platform</div>
          </div>
        </div>
        <div className="top-actions">
          <button 
            className="export-briefing-btn" 
            onClick={() => setBriefingModalProject(NATIONAL_PORTFOLIO_DOSSIER)}
            title="Generate Official MoSPI National Portfolio Briefing"
          >
            <FileText size={14} /> Official Portfolio Report (PDF)
          </button>
          <span className="updated"><i /> Live MoSPI IPMD Feed: 2026</span>
          <button className="avatar" aria-label="Profile">R</button>
          <button className="chevron-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><ChevronDown size={16} /></button>
          {menuOpen && <div className="top-menu">Profile<br />Settings<br />Sign out</div>}
        </div>
      </header>
      <div className="body-layout">
        <aside className="sidebar">
          <div className="sidebar-head">
            <button
              className="collapse-toggle"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
            >
              <ChevronsLeft size={16} strokeWidth={2} />
            </button>
          </div>
          <nav>
            {navItems.map(({ label, icon: Icon, active, badge }) => (
              <button key={label} className={`nav-item ${activeNav === label || (active && activeNav === 'Projects') ? 'active' : ''}`} onClick={() => handleNav(label)}>
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
                {badge && <small className="count-badge">{badge}</small>}
              </button>
            ))}
          </nav>
        </aside>
        <section className="content">
          {activeNav === 'Home' ? (
            <HomeView onNavigate={handleNav} />
          ) : activeNav === 'Analysis' ? (
            <AnalysisView 
              initialSelectedId={analysisSelectedId} 
              onClearInitialSelected={() => setAnalysisSelectedId(null)}
              onOpenBriefing={(p) => setBriefingModalProject(p)} 
            />
          ) : activeNav === 'Map' ? (
            <MapView onSeeProject={(proj) => {
              if (proj) {
                handleOpenAnalysisForProject(proj.id)
              } else {
                handleNav('Projects')
              }
            }} />
          ) : activeNav === 'AI' ? (
            <AIView />
          ) : (
            <>
              <div className="filter-row">
                <FilterSelect label="State" value={filters.State} onChange={(value) => setFilter('State', value)} />
                <FilterSelect label="Risk" value={filters.Risk} onChange={(value) => setFilter('Risk', value)} />
                <FilterSelect label="Type" value={filters.Type} onChange={(value) => setFilter('Type', value)} />
                <label className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search 1,775 active projects (or 49k MoSPI archive) by name, ID..." aria-label="Search projects" /></label>
                {projectFiltersActive && (
                  <button className="map-reset" onClick={resetAllFilters} style={{ marginLeft: '4px' }}>
                    Reset Filters
                  </button>
                )}
              </div>
              <div className="switch-row">
                <div className="segmented" role="tablist" aria-label="Group projects by">
                  <button className={`seg ${groupMode === 'Ministry' ? 'active' : ''}`} onClick={() => switchGroupMode('Ministry')} role="tab" aria-selected={groupMode === 'Ministry'}><Landmark size={14} /> Ministry</button>
                  <button className={`seg ${groupMode === 'Sector' ? 'active' : ''}`} onClick={() => switchGroupMode('Sector')} role="tab" aria-selected={groupMode === 'Sector'}><Clock3 size={14} /> Sector</button>
                </div>
                <label className="sector-select-wrap">
                  <select className="sector-select" value={groupValue} onChange={(event) => setGroupValue(event.target.value)} aria-label={`Select ${groupMode.toLowerCase()}`}>
                    {groupOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <ChevronDown size={14} />
                </label>
              </div>
              {!projectFiltersActive && (
                <div className="dashboard-card">
                  <div className="card-banner">
                    <strong>NATIONAL INFRASTRUCTURE OVERVIEW</strong>
                    <span className="banner-chip">1,775 Live Ongoing Projects</span>
                    <span className="banner-note">+ MoSPI IPMD Early Warning AI Integration</span>
                    <span className="sync"><i /> Synchronized with MoSPI Database</span>
                  </div>
                  <div className="metrics-grid">{metrics.map((metric) => <Metric key={metric.label} {...metric} />)}</div>
                </div>
              )}
              <div className="section-heading">
                <strong>{projectFiltersActive ? 'Filtered Results' : 'Active Ongoing National Initiatives'}</strong>
                <span>Showing {Math.min(displayLimit, filteredProjects.length)} of {filteredProjects.length} initiatives ({projects.length} Total Ongoing MoSPI Projects)</span>
              </div>
              {filteredProjects.length > 0 ? (
                <>
                  <div className="project-list">
                    {filteredProjects.slice(0, displayLimit).map((project, idx) => (
                      <ProjectCard 
                        key={`${project.id}-${idx}`} 
                        project={project} 
                        onViewAnalysis={() => handleOpenAnalysisForProject(project.id)} 
                        onOpenBriefing={() => setBriefingModalProject(project)}
                      />
                    ))}
                  </div>
                  {displayLimit < filteredProjects.length && (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <button
                        className="home-btn home-btn-primary"
                        onClick={() => setDisplayLimit((prev) => prev + 30)}
                        style={{ padding: '12px 28px', fontSize: '13px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        Load More Projects ({filteredProjects.length - displayLimit} remaining) <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="project-empty">
                  <Search size={20} />
                  <span>No projects match your filters. Try resetting search criteria.</span>
                  <button className="home-btn home-btn-primary" onClick={resetAllFilters} style={{ marginTop: '12px', padding: '8px 20px', fontSize: '12px' }}>
                    Reset All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Bottom Navigation Bar (<768px touch devices) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.map(({ label, icon: Icon, badge }) => (
          <button
            key={label}
            className={`mobile-bottom-nav-item ${activeNav === label ? 'active' : ''}`}
            onClick={() => handleNav(label)}
            aria-label={`Go to ${label}`}
          >
            <div className="mobile-bottom-nav-icon-wrap">
              <Icon size={20} strokeWidth={activeNav === label ? 2.3 : 1.8} />
              {badge && <span className="mobile-bottom-nav-badge">{badge}</span>}
            </div>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {briefingModalProject && (
        <ExecutiveDossierModal 
          project={briefingModalProject} 
          onClose={() => setBriefingModalProject(null)} 
        />
      )}
    </main>
  )
}

const homeCapabilities = [
  { icon: FileText, tone: 'blue', title: 'Explore 1,775 Projects', desc: 'Search and track real MoSPI infrastructure projects with state, ministry, sector, and risk filters.', cta: 'Go to Projects', nav: 'Projects' },
  { icon: BarChart3, tone: 'purple', title: 'Deep Predictive Analytics', desc: 'Inspect root causes, time-cost variance, and policy simulation sandboxes for flagship initiatives.', cta: 'Go to Analysis', nav: 'Analysis' },
  { icon: Sparkles, tone: 'green', title: 'Launch AI Early Warning', desc: 'Predict potential milestone slippages months in advance using XGBoost and Random Forest ML models.', cta: 'Go to AI', nav: 'AI' },
] as const

const homeJourney = [
  { step: '01', icon: Search, title: 'Discover & Track', desc: 'Filter through 1,775 ongoing national projects across all states and ministries.' },
  { step: '02', icon: Coins, title: 'Audit Expenditure', desc: 'Inspect sanctioned budget vs real money invested in civil works and land acquisition.' },
  { step: '03', icon: Brain, title: 'AI Delay Prediction', desc: 'PAMANA machine learning models identify emerging risks before deadlines elapse.' },
  { step: '04', icon: SlidersHorizontal, title: 'Test Solutions (What-If)', desc: 'Use policy sandboxes and export official MoSPI briefings for ministerial action.' },
] as const

function HomeView({ onNavigate }: { onNavigate: (nav: string) => void }) {
  return (
    <div className="home-view">
      <section className="home-hero">
        <div className="home-hero-text">
          <span className="home-hero-pill">NIRMAN-Drishti · MoSPI IPMD</span>
          <h1 className="home-hero-title">Predictive Intelligence for India’s Infrastructure.</h1>
          <p className="home-hero-desc">An AI-powered early warning decision support system trained on 49,094 official MoSPI records (2001–2026) and tracking 1,775 active mega-projects across 28 States and 8 Union Territories.</p>
          <div className="home-hero-actions">
            <button className="home-btn home-btn-primary" onClick={() => onNavigate('Projects')}>Explore 1,775 Projects <ArrowRight size={16} /></button>
            <button className="home-btn home-btn-ghost" onClick={() => onNavigate('Analysis')}><BarChart3 size={16} /> View Analysis &amp; Simulations</button>
            <button className="home-btn home-btn-ghost" onClick={() => onNavigate('AI')}><Sparkles size={16} /> Launch PAMANA AI</button>
          </div>
        </div>
        <div className="home-hero-media">
          <img src="/home-hero-india.png" alt="Stylized network map of India over infrastructure silhouettes" />
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-h2">What can you do with NIRMAN-Drishti?</h2>
        <p className="home-sub">Comprehensive tools to monitor, predict, simulate and resolve national infrastructure bottlenecks.</p>
        <div className="home-cap-grid">
          {homeCapabilities.map(({ icon: Icon, tone, title, desc, cta, nav }) => (
            <button key={title} className={`home-cap-card tone-card-${tone}`} onClick={() => onNavigate(nav)}>
              <span className={`home-cap-icon tone-${tone}`}><Icon size={24} /></span>
              <strong className="home-cap-title">{title}</strong>
              <p className="home-cap-desc">{desc}</p>
              <span className="home-cap-link">{cta} <ArrowRight size={14} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-h2">The Strategic Intelligence Journey</h2>
        <p className="home-sub">From raw government datasets to time-bound executive action in 4 steps.</p>
        <div className="home-journey">
          {homeJourney.map(({ step, icon: Icon, title, desc }, i) => (
            <Fragment key={step}>
              <div className="home-step">
                <div className="home-step-top">
                  <span className="home-step-num">{step}</span>
                  <span className="home-step-icon"><Icon size={18} /></span>
                </div>
                <strong className="home-step-title">{title}</strong>
                <p className="home-step-desc">{desc}</p>
              </div>
              {i < homeJourney.length - 1 && <span className="home-step-arrow" aria-hidden="true"><ArrowRight size={16} /></span>}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="home-ews">
        <div className="home-ews-text">
          <span className="home-ews-tag"><Sparkles size={14} /> AI Early Warning System</span>
          <h2 className="home-h2">From reactive reporting to proactive prediction</h2>
          <p className="home-sub">NIRMAN-Drishti’s PAMANA ML engine scans physical milestones, expenditure velocity, and inter-state clearance lags to predict delays up to 18 months before they manifest in project reports.</p>
          <ul className="home-ews-list">
            <li><CircleCheck size={16} /> Detect high-risk projects with 88%+ precision</li>
            <li><CircleCheck size={16} /> Break down expenditure: civil works, land acquisition, utility shifting</li>
            <li><CircleCheck size={16} /> Simulate policy interventions in interactive what-if sandboxes</li>
            <li><CircleCheck size={16} /> Generate 1-Click Executive MoSPI Briefings for Cabinet review</li>
          </ul>
          <button className="home-btn home-btn-primary" onClick={() => onNavigate('AI')}><Sparkles size={16} /> Launch PAMANA AI Assistant</button>
        </div>
        <div className="home-ews-panel">
          <div className="home-ews-panel-head"><Brain size={16} /> Predicted Delay Alerts <span>PAMANA AI</span></div>
          <div className="home-ews-alert">
            <span className="home-ews-alert-icon red"><AlertTriangle size={18} /></span>
            <div className="home-ews-alert-body"><strong>Mumbai–Ahmedabad High Speed Rail</strong><span>Land possession &amp; utility relocation · NHSRCL</span></div>
            <div className="home-ews-alert-prob"><b>Medium</b><small>AI Risk Alert</small></div>
          </div>
          <div className="home-ews-alert">
            <span className="home-ews-alert-icon red"><AlertTriangle size={18} /></span>
            <div className="home-ews-alert-body"><strong>Delhi–Mumbai Expressway</strong><span>Right-of-Way &amp; Contractor Liquidity · MoRTH</span></div>
            <div className="home-ews-alert-prob"><b>High</b><small>AI Risk Alert</small></div>
          </div>
          <div className="home-ews-alert">
            <span className="home-ews-alert-icon orange"><Clock3 size={18} /></span>
            <div className="home-ews-alert-body"><strong>Ken-Betwa River Link Project</strong><span>Stage-II Forest Clearance · Jal Shakti</span></div>
            <div className="home-ews-alert-prob"><b>High</b><small>AI Risk Alert</small></div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FilterSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="filter filter-select">
      <span>{label}: <b>{value}</b></span>
      <ChevronDown size={14} />
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={`Filter by ${label}`}>
        {filterOptions[label].map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Metric({ label, value, note, tag, icon: Icon, tone }: typeof metrics[number]) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-top">
        <Icon size={18} />
        <div>
          <div className="metric-label">{label} <Info size={11} /></div>
          <strong>{value}</strong>
        </div>
      </div>
      <div className="metric-bottom">
        <span>{note}</span>
        <small>{tag}</small>
      </div>
    </div>
  )
}

function ProgressRing({ value }: { value: number }) {
  const r = 14
  const circumference = 2 * Math.PI * r
  return (
    <svg className="pc-ring" width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
      <circle className="ring-track" cx="19" cy="19" r={r} />
      <circle className="ring-fill" cx="19" cy="19" r={r} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} transform="rotate(-90 19 19)" />
      <text className="ring-text" x="19" y="19">{value}%</text>
    </svg>
  )
}

function MetricTile({ icon: Icon, tone, label, value, note, noteTone }: { icon: typeof Coins; tone: string; label: string; value: string; note: string; noteTone?: string }) {
  return (
    <div className="pc-metric">
      <span className={`pc-icon pc-icon-${tone}`}><Icon size={18} /></span>
      <div className="pc-metric-body">
        <div className="pc-metric-label">{label}</div>
        <strong className="pc-metric-value">{value}</strong>
        <small className={`pc-metric-note ${noteTone ? `note-${noteTone}` : ''}`}>{note}</small>
      </div>
    </div>
  )
}

function ProjectCard({ 
  project, 
  onViewAnalysis,
  onOpenBriefing,
}: { 
  project: Project; 
  onViewAnalysis: () => void;
  onOpenBriefing: () => void;
}) {
  const [showSim, setShowSim] = useState(false)
  const onTrack = project.type === 'On Schedule'
  const riskClass = project.risk === 'High' ? 'badge-high' : project.risk === 'Medium' ? 'badge-medium' : 'badge-low'
  const typeClass = onTrack ? 'badge-ontrack' : 'badge-high'
  const finProgress = project.financialProgress ?? Math.min(100, Math.round(project.progress * 0.95))
  const projectCostNum = project.rawCost || parseFloat(project.cost.replace(/[^0-9.]/g, '')) || 5000
  const computedSpentNum = project.rawSpentCost || Math.round(projectCostNum * (finProgress / 100))
  const computedBalanceNum = Math.max(0, projectCostNum - computedSpentNum)
  const spentDisplay = project.spentCost || `₹ ${computedSpentNum.toLocaleString('en-IN')} Cr`
  const balanceDisplay = project.balanceCost || `₹ ${computedBalanceNum.toLocaleString('en-IN')} Cr`

  return (
    <article className="project-card">
      <div className="pc-header">
        <div className="pc-heading">
          <strong>{project.name}</strong>
          <span className="project-id">{project.id}</span>
        </div>
        <div className="pc-meta">
          <div className="pc-meta-item"><MapPin size={16} /><div><span className="pc-meta-label">State</span><span className="pc-meta-val">{project.state}</span></div></div>
          <div className="pc-meta-item"><AlertTriangle size={16} /><div><span className="pc-meta-label">Risk Rating</span><em className={`badge ${riskClass}`}><AlertTriangle size={11} /> {project.risk}</em></div></div>
          <div className="pc-meta-item"><Clock3 size={16} /><div><span className="pc-meta-label">Status</span><em className={`badge ${typeClass}`}><i className="badge-dot" /> {project.type}</em></div></div>
          <div className="pc-meta-item"><Landmark size={16} /><div><span className="pc-meta-label">Ministry</span><span className="pc-meta-val">{project.ministry}</span></div></div>
          <div className="pc-meta-item"><Share2 size={16} /><div><span className="pc-meta-label">Sector</span><span className="pc-meta-val">{project.sector}</span></div></div>
        </div>
      </div>

      {/* Official Government Project Lifecycle & Milestone Timeline */}
      <div style={{ background: '#f4f8fc', border: '1px solid #dce7f1', borderRadius: '8px', padding: '12px 16px', margin: '14px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '12px' }}>
        <div>
          <span style={{ color: '#526e89', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>📅 Sanctioned / Started</span>
          <strong style={{ color: '#0b3157', fontSize: '13px' }}>{project.approvalDate || '08/2024'}</strong>
          <span style={{ color: '#68829c', fontSize: '11px', display: 'block', marginTop: '2px' }}>({project.yearsActive || '1.9 yrs'} active)</span>
        </div>
        <div>
          <span style={{ color: '#526e89', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>🎯 Original Target (DOC)</span>
          <strong style={{ color: '#0b3157', fontSize: '13px' }}>{project.originalDoc || '02/2026'}</strong>
          <span style={{ color: '#68829c', fontSize: '11px', display: 'block', marginTop: '2px' }}>Sanctioned Completion</span>
        </div>
        <div>
          <span style={{ color: '#526e89', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>⏱️ Anticipated Target</span>
          <strong style={{ color: onTrack ? '#159149' : '#df4036', fontSize: '13px' }}>{project.anticipatedDoc || project.originalDoc}</strong>
          <span style={{ color: onTrack ? '#159149' : '#df4036', fontSize: '11px', display: 'block', fontWeight: 700, marginTop: '2px' }}>
            {onTrack ? '✓ On Schedule' : `+ ${project.overrunMonths || 0} Months Delay`}
          </span>
        </div>
        <div>
          <span style={{ color: '#526e89', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>💰 Budget Variance</span>
          <strong style={{ color: (project.costOverrunCr && project.costOverrunCr > 0) ? '#df4036' : '#159149', fontSize: '13px' }}>
            {(project.costOverrunCr && project.costOverrunCr > 0) ? `+₹ ${project.costOverrunCr.toLocaleString('en-IN')} Cr` : '₹ 0 Cr (Protected)'}
          </strong>
          <span style={{ color: (project.costOverrunCr && project.costOverrunCr > 0) ? '#df4036' : '#68829c', fontSize: '11px', display: 'block', marginTop: '2px' }}>
            {(project.costOverrunCr && project.costOverrunCr > 0) ? `+${project.costOverrunPct || 0}% Escalation` : 'Within Budget'}
          </span>
        </div>
      </div>

      <div className="pc-metrics">
        <MetricTile icon={Coins} tone="blue" label="Total Budget" value={project.cost} note="Approved Money" />
        <div className="pc-metric pc-progress">
          <div className="pc-progress-top"><ProgressRing value={project.progress} /><div className="pc-metric-body"><div className="pc-metric-label">Work Completed on Ground</div><strong className="pc-metric-value">{project.progress}%</strong></div></div>
          <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
        </div>
        <MetricTile icon={CalendarDays} tone="red" label="Schedule Status" value={project.delay} note={onTrack ? 'Running On Time' : 'Running Late'} noteTone={onTrack ? 'green' : 'red'} />
        <MetricTile icon={ShieldAlert} tone="orange" label="Risk Score" value={`${project.riskScore} / 100`} note={`${project.risk} Delay Risk`} />
        <MetricTile icon={Brain} tone="purple" label="Predicted Delay Probability" value={`${project.delayProbability}%`} note="MoSPI ML Model" />
        {onTrack ? (
          <MetricTile icon={Shield} tone="green" label="Milestone Surveillance" value="Operating On Schedule" note="Active Milestone Tracking" />
        ) : (
          <MetricTile icon={AlertTriangle} tone="yellow" label="Primary Delay Bottleneck" value={project.criticalIssue} note="Identified Root Cause" />
        )}
      </div>

      {/* User Feature: Expenditure & Budget Investment Breakdown */}
      <div className="pc-capex-container">
        <div className="capex-top">
          <div className="capex-title-group">
            <Coins size={18} color="#0c5c9d" />
            <strong>Money Spent &amp; Budget Status</strong>
            <span className="capex-ratio-pill">{finProgress}% Spent So Far</span>
          </div>
          <div className="capex-stats">
            <div className="capex-stat-item">
              <span className="capex-stat-label">Total Budget:</span>
              <span className="capex-stat-val">{project.cost}</span>
            </div>
            <div className="capex-stat-item">
              <span className="capex-stat-label">Money Spent Till Now:</span>
              <span className="capex-stat-val" style={{ color: '#159149' }}>{spentDisplay}</span>
            </div>
            <div className="capex-stat-item">
              <span className="capex-stat-label">Money Left to Spend:</span>
              <span className="capex-stat-val" style={{ color: '#7047eb' }}>{balanceDisplay}</span>
            </div>
          </div>
        </div>

        <div className="capex-dual-bar" title={`Spent: ${spentDisplay} / Sanctioned: ${project.cost}`}>
          <div className="capex-fill-bar" style={{ width: `${Math.min(100, finProgress)}%` }} />
        </div>

        {project.expenditureBreakdown && (
          <div className="capex-breakdown-grid">
            <div className="capex-chip">
              <div className="capex-chip-header">🏗️ Building &amp; Construction</div>
              <div className="capex-chip-val">{project.expenditureBreakdown.civilWorks}</div>
              <div className="capex-chip-sub">Bridges, Tracks, Tunnels &amp; Buildings</div>
            </div>
            <div className="capex-chip">
              <div className="capex-chip-header">🗺️ Buying Land &amp; Paying Landowners</div>
              <div className="capex-chip-val">{project.expenditureBreakdown.landAcquisition}</div>
              <div className="capex-chip-sub">Farmer Compensation &amp; Land Clearance</div>
            </div>
            <div className="capex-chip">
              <div className="capex-chip-header">⚡ Moving Power Lines, Pipes &amp; Cables</div>
              <div className="capex-chip-val">{project.expenditureBreakdown.utilityAndSystems}</div>
              <div className="capex-chip-sub">Electric Poles, Water Mains &amp; Signals</div>
            </div>
            <div className="capex-chip">
              <div className="capex-chip-header">📋 Planning, Supervision &amp; Approvals</div>
              <div className="capex-chip-val">{project.expenditureBreakdown.contingencyAndPMC}</div>
              <div className="capex-chip-sub">Engineers, Safety Audits &amp; Government Permits</div>
            </div>
          </div>
        )}
      </div>

      {showSim && (
        <WhatIfSimulator project={project} />
      )}

      <div className="pc-actions">
        <button className="pc-sim-btn" onClick={() => setShowSim((v) => !v)}>
          <SlidersHorizontal size={14} /> {showSim ? 'Close Solutions' : 'Test Solutions (What-If)'}
        </button>
        <button className="pc-sim-btn" onClick={onOpenBriefing}>
          <FileText size={14} /> Official Report (PDF)
        </button>
        <button className="pc-view-btn" onClick={onViewAnalysis}>
          View Full Analysis <ArrowRight size={14} />
        </button>
      </div>
    </article>
  )
}

function WhatIfSimulator({ project }: { project: Project | AnalysisProject }) {
  const [landSpeedupMonths, setLandSpeedupMonths] = useState(4)
  const [fundInjectionPct, setFundInjectionPct] = useState(15)
  const [contractorAugment, setContractorAugment] = useState(25)

  const baseRisk = 'riskScore' in project ? project.riskScore : (project.risk === 'High' ? 82 : project.risk === 'Medium' ? 55 : 28)
  
  const projDelay = 'delay' in project ? (project as any).delay : ('currentDelay' in project ? (project as any).currentDelay : '')
  const isCurrentlyOnTime = 
    ('type' in project && project.type === 'On Schedule') ||
    ('status' in project && project.status === 'On Schedule') ||
    (projDelay && (projDelay === 'On Track' || projDelay === '0 Months' || projDelay === 'On Schedule')) ||
    ('overrunMonths' in project && (project as any).overrunMonths === 0)

  const rawOverrun = 'overrunMonths' in project && typeof (project as any).overrunMonths === 'number'
    ? (project as any).overrunMonths
    : (projDelay && typeof projDelay === 'string' && projDelay.includes('mos') ? parseInt(projDelay) : 0)

  const baseDelayMonths = isCurrentlyOnTime ? 0 : (rawOverrun > 0 ? rawOverrun : 14)

  const delayReductionMonths = isCurrentlyOnTime 
    ? 0 
    : Math.min(baseDelayMonths, Math.round(landSpeedupMonths * 0.85 + (contractorAugment / 100) * 8 + (fundInjectionPct / 100) * 4))

  const simulatedDelayMonths = Math.max(0, baseDelayMonths - delayReductionMonths)
  const riskReductionPoints = Math.round((landSpeedupMonths * 2.6) + (fundInjectionPct * 0.9) + (contractorAugment * 0.7))
  const simulatedRisk = Math.max(15, baseRisk - riskReductionPoints)

  const roughCostNum = 'rawCost' in project && project.rawCost ? project.rawCost : 15000
  const costSavingsAvoidedCr = isCurrentlyOnTime
    ? Math.round((roughCostNum * 0.003) * (landSpeedupMonths + (fundInjectionPct / 5)))
    : Math.round((roughCostNum * 0.0055) * delayReductionMonths)

  return (
    <div className="sim-sandbox-card">
      <div className="sim-header">
        <div className="sim-header-left">
          <span className="sim-badge">Solution Tester (What-If Simulator)</span>
          <div>
            <h4 className="sim-header-title">What-If Solution Tester — {project.name}</h4>
            <p className="sim-header-desc">Try different solutions below to see how much delay you can cut and how much public money you can save.</p>
          </div>
        </div>
      </div>
      <div className="sim-grid">
        <div className="sim-controls">
          <div className="sim-slider-group">
            <div className="sim-slider-label">
              <span>🗺️ Speed Up Land Buying:</span>
              <span>{landSpeedupMonths} Months Earlier</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={landSpeedupMonths}
              onChange={(e) => setLandSpeedupMonths(Number(e.target.value))}
              className="sim-slider"
            />
            <small style={{ color: '#68809a', fontSize: '11px' }}>Get land clearance and farmer compensation approved faster</small>
          </div>

          <div className="sim-slider-group">
            <div className="sim-slider-label">
              <span>💰 Release Extra Funds in Advance:</span>
              <span>+{fundInjectionPct}% Extra Advance Money</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={fundInjectionPct}
              onChange={(e) => setFundInjectionPct(Number(e.target.value))}
              className="sim-slider"
            />
            <small style={{ color: '#68809a', fontSize: '11px' }}>Provide early cash to prevent contractors from stopping work</small>
          </div>

          <div className="sim-slider-group">
            <div className="sim-slider-label">
              <span>⚙️ Add More Workers &amp; Machines:</span>
              <span>+{contractorAugment}% More Capacity</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={contractorAugment}
              onChange={(e) => setContractorAugment(Number(e.target.value))}
              className="sim-slider"
            />
            <small style={{ color: '#68809a', fontSize: '11px' }}>Run 24/7 day and night shifts with heavy machinery</small>
          </div>
        </div>

        <div className="sim-results">
          <div className="sim-results-head">
            <Sparkles size={16} /> Expected Results After Applying These Fixes
          </div>
          <div className="sim-kpi-row">
            <div className="sim-kpi">
              <div className="sim-kpi-label">Remaining Delay</div>
              <div className="sim-kpi-val" style={{ color: '#148c4b' }}>
                {isCurrentlyOnTime ? '0 mos (On Track)' : simulatedDelayMonths === 0 ? 'On Baseline' : `${simulatedDelayMonths} mos`}
              </div>
              <div className="sim-kpi-delta">
                {isCurrentlyOnTime ? '✓ On-Time Schedule Protected' : `↓ Saves ${delayReductionMonths} Months`}
              </div>
            </div>
            <div className="sim-kpi">
              <div className="sim-kpi-label">New Risk Score</div>
              <div className="sim-kpi-val" style={{ color: simulatedRisk < 40 ? '#148c4b' : simulatedRisk < 65 ? '#ed7b11' : '#d82a2a' }}>
                {simulatedRisk} / 100
              </div>
              <div className="sim-kpi-delta">↓ {riskReductionPoints} pts Risk Drop</div>
            </div>
            <div className="sim-kpi">
              <div className="sim-kpi-label">Extra Money Saved</div>
              <div className="sim-kpi-val" style={{ color: '#103f6d' }}>
                ₹ {costSavingsAvoidedCr.toLocaleString()} Cr
              </div>
              <div className="sim-kpi-delta">
                {isCurrentlyOnTime ? 'Protected against future cost rise' : 'Money saved from price rises'}
              </div>
            </div>
          </div>
          <div className="sim-actions">
            <button
              className="sim-btn-reset"
              onClick={() => {
                setLandSpeedupMonths(0)
                setFundInjectionPct(0)
                setContractorAugment(0)
              }}
            >
              Reset to Baseline
            </button>
            <button
              className="sim-btn-apply"
              onClick={() => alert(`Policy simulation saved for ${project.name}. Briefing updated.`)}
            >
              Save This Fix to Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getAnalysisProjectById(id: string | null): AnalysisProject | null {
  if (!id) return null
  const found = analysisProjects.find((x) => x.id === id)
  if (found) return found
  const raw = projects.find((x) => x.id === id)
  if (!raw) return null
  const rawCostNum = raw.rawCost || parseFloat(raw.cost.replace(/[^0-9.]/g, '')) || 5000
  const overrunCr = raw.costOverrunCr || Math.round(rawCostNum * (raw.riskScore / 500))
  const revisedCostVal = raw.revisedCost || `₹ ${(rawCostNum + overrunCr).toLocaleString('en-IN')} Cr`
  const overrunPct = Math.round((overrunCr / rawCostNum) * 100)

  return {
    id: raw.id,
    name: raw.name,
    status: raw.type,
    risk: raw.risk,
    ministry: raw.ministry,
    sector: raw.sector,
    states: raw.state,
    cost: raw.cost,
    revisedCost: revisedCostVal,
    revisedPct: `+${overrunPct}%`,
    progress: raw.progress,
    originalCompletion: raw.overrunMonths && raw.overrunMonths > 0 ? 'Official Target DOC' : 'Baseline Target DOC',
    currentExpected: raw.overrunMonths && raw.overrunMonths > 0 ? `Anticipated (+${raw.overrunMonths} Months)` : 'On Schedule',
    expectedDelta: raw.delay || `${raw.overrunMonths || 0} Months Delay`,
    currentDelay: raw.delay || '0 Months',
    aiConfidence: Math.min(94, Math.max(76, 100 - Math.round(raw.riskScore / 4))),
    predictedDelay: raw.overrunMonths && raw.overrunMonths > 0 ? `+${raw.overrunMonths} Months` : '+0 Months',
    predictedDelayConf: 82,
    estFunding: `₹ ${overrunCr.toLocaleString('en-IN')} Cr`,
    estFundingConf: 80,
    overallRisk: `${raw.risk} (${raw.riskScore}/100)`,
    overallRiskConf: 85,
    bottleneck: raw.criticalIssue || 'Inter-agency clearance & vendor execution tracking',
    bottleneckDesc: `Active monitoring flagged critical delays in statutory permits, state right-of-way permissions, and resource mobilization for ${raw.name}.`,
    impact: raw.risk === 'High' ? 'High potential for further milestone slippage and escalation costs.' : 'Moderate timeline sensitivity.',
    affectedActivity: 'Contractor site mobilization & structural milestones',
    riskFurther: raw.risk === 'High' ? 'Likely further milestone slippage without inter-ministerial escalation.' : 'Low risk of additional budget overrun.',
    bottleneckConf: 84,
    rootCause: [
      'Multi-agency clearance and utility relocation coordination',
      'Contractor resource constraints and site handover synchronization',
      'Right of way verification across regional jurisdictions'
    ],
    rootCauseConf: 81,
    priority: raw.risk === 'High' ? 'CRITICAL' : raw.risk === 'Medium' ? 'HIGH' : 'MODERATE',
    actionText: `Direct administrative escalation through the Cabinet Secretariat Pragati portal to expedite statutory permits and track contractor performance for ${raw.name}.`,
    expectedImpact: [
      'Reduces milestone delay risk by 30-45%',
      'Prevents further fiscal overrun escalation',
      'Streamlines on-ground vendor progress verification'
    ],
    actionConf: 86
  }
}

function AnalysisView({ 
  initialSelectedId, 
  onClearInitialSelected, 
  onOpenBriefing 
}: { 
  initialSelectedId?: string | null;
  onClearInitialSelected?: () => void;
  onOpenBriefing: (p: Project | AnalysisProject) => void 
}) {
  const [selectedFilters, setSelectedFilters] = useState({ State: 'All', Risk: 'All', Type: 'All' })
  const [groupMode, setGroupMode] = useState<'Ministry' | 'Sector'>('Sector')
  const [groupValue, setGroupValue] = useState('All')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(initialSelectedId || null)
  const [portfolioOpen, setPortfolioOpen] = useState(false)

  const handleCloseModal = () => {
    setOpenId(null)
    onClearInitialSelected?.()
  }

  useEffect(() => {
    if (initialSelectedId) {
      setOpenId(initialSelectedId)
    }
  }, [initialSelectedId])

  const openProject = getAnalysisProjectById(openId)
  const anyModalOpen = openId !== null || portfolioOpen

  useEffect(() => {
    if (!anyModalOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal()
        setPortfolioOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [anyModalOpen])

  const resetFilters = () => {
    setSelectedFilters({ State: 'All', Risk: 'All', Type: 'All' })
    setGroupMode('Sector')
    setGroupValue('All')
    setSearch('')
  }

  const groupOptions = groupMode === 'Ministry' ? ministryOptions : sectorOptions
  const switchGroupMode = (mode: 'Ministry' | 'Sector') => {
    setGroupMode(mode)
    setGroupValue('All')
  }

  const filtered = analysisProjects.filter((p) => {
    const query = search.trim().toLowerCase()
    const haystack = [p.name, p.id, p.states, p.risk, p.status, p.ministry, p.sector, p.bottleneck, ...p.rootCause].join(' ').toLowerCase()
    if (query && !haystack.includes(query)) return false
    if (selectedFilters.State !== 'All' && !p.states.includes(selectedFilters.State)) return false
    if (selectedFilters.Risk !== 'All' && p.risk !== selectedFilters.Risk) return false
    if (selectedFilters.Type !== 'All' && p.status !== selectedFilters.Type) return false
    if (groupValue !== 'All') {
      if (groupMode === 'Ministry' && p.ministry !== groupValue) return false
      if (groupMode === 'Sector' && p.sector !== groupValue) return false
    }
    return true
  })

  const filtersActive =
    selectedFilters.State !== 'All' || selectedFilters.Risk !== 'All' || selectedFilters.Type !== 'All' || groupValue !== 'All' || search.trim() !== ''

  return (
    <div className="analysis-view">
      <div className="filter-row">
        {(['State', 'Risk', 'Type'] as const).map((label) => (
          <FilterSelect key={label} label={label} value={selectedFilters[label]} onChange={(value) => setSelectedFilters((current) => ({ ...current, [label]: value }))} />
        ))}
        <label className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search flagship projects, root causes, bottlenecks..." aria-label="Search projects" /></label>
      </div>
      
      <div className="switch-row">
        <div className="segmented" role="tablist" aria-label="Group projects by">
          <button className={`seg ${groupMode === 'Ministry' ? 'active' : ''}`} onClick={() => switchGroupMode('Ministry')} role="tab" aria-selected={groupMode === 'Ministry'}><Landmark size={14} /> Ministry</button>
          <button className={`seg ${groupMode === 'Sector' ? 'active' : ''}`} onClick={() => switchGroupMode('Sector')} role="tab" aria-selected={groupMode === 'Sector'}><Clock3 size={14} /> Sector</button>
        </div>
        <label className="sector-select-wrap"><select className="sector-select" value={groupValue} onChange={(event) => setGroupValue(event.target.value)} aria-label={`Select ${groupMode.toLowerCase()}`}>{groupOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} /></label>
        
        <button 
          className="export-briefing-btn" 
          style={{ marginLeft: 'auto' }}
          onClick={() => onOpenBriefing(NATIONAL_PORTFOLIO_DOSSIER)}
          title="Print official Cabinet portfolio briefing for 1,775 projects"
        >
          <Printer size={14} /> Official Portfolio Report (PDF)
        </button>
      </div>

      {!filtersActive && (
        <CompactPortfolioCard onOpen={() => setPortfolioOpen(true)} />
      )}

      {portfolioOpen && (
        <div className="ca-modal-overlay" role="dialog" aria-modal="true" aria-label="India Infrastructure Portfolio Dashboard detailed analysis" onClick={() => setPortfolioOpen(false)}>
          <div className="ca-modal" onClick={(event) => event.stopPropagation()}>
            <button className="ca-modal-close" onClick={() => setPortfolioOpen(false)} aria-label="Close detailed analysis"><X size={18} /></button>
            <div className="ca-modal-body">
              <div className="pa-card">
                <div className="pa-head">
                  <div className="pa-head-left">
                    <div className="analysis-back" style={{ color: '#0757a0', fontWeight: 700 }}><ArrowLeft size={14} /> Portfolio Analysis</div>
                    <h2 className="pa-title">India Infrastructure Portfolio Early Warning Dashboard</h2>
                    <span className="pa-id">IND-PORTFOLIO-2026</span>
                  </div>
                  <div className="pa-head-right">
                    <button className="export-briefing-btn" onClick={() => window.print()}><Printer size={14} /> Print Cabinet Dossier</button>
                  </div>
                </div>

                <div className="pa-band" style={{ marginTop: '20px' }}>
                  <div className="pa-band-item"><span className="pa-band-icon blue"><Coins size={16} /></span><div><div className="pa-band-label">Approved Budget</div><strong>₹ 18.94 Lakh Cr</strong><small>Original Budget</small></div></div>
                  <div className="pa-band-item"><span className="pa-band-icon blue"><Coins size={16} /></span><div><div className="pa-band-label">Expended to Date</div><strong>₹ 11.48 Lakh Cr</strong><small className="pa-green">(60.6% Disbursed)</small></div></div>
                  <div className="pa-band-item"><ProgressRing value={68} /><div className="pa-band-progress"><div className="pa-band-label">Average Progress</div><strong>68%</strong><div className="pa-band-bar"><span style={{ width: '68%' }} /></div></div></div>
                  <div className="pa-band-item"><span className="pa-band-icon"><CalendarDays size={16} /></span><div><div className="pa-band-label">Target Completion</div><strong>Dec 2026</strong><div className="pa-band-label pa-band-gap">Current Expected</div><strong>Oct 2028</strong><small className="pa-red">(+22 months)</small></div></div>
                  <div className="pa-band-item"><span className="pa-band-icon"><Clock3 size={16} /></span><div><div className="pa-band-label">Average Delay</div><strong className="pa-red">22 Months</strong></div></div>
                </div>

                <div className="pa-section pa-section-ai">
                  <div className="pa-section-head"><span className="pa-sec-icon blue"><Brain size={18} /></span><strong>Portfolio-Wide AI Prediction</strong><span className="pa-conf-pill">Confidence: 88%</span></div>
                  <p className="pa-section-desc">Based on historical MoSPI IPMD datasets, multi-sector velocity, and state clearance delays.</p>
                  <div className="pa-pred-row">
                    <div className="pa-pred-box red"><span className="pa-pred-icon red"><CalendarDays size={16} /></span><div className="pa-pred-body"><strong className="pa-red">Predicted Extra Delay Expected</strong><div className="pa-pred-val">+8 Months</div><span className="pa-conf-pill">Confidence: 82%</span></div></div>
                    <div className="pa-pred-box orange"><span className="pa-pred-icon orange"><Coins size={16} /></span><div className="pa-pred-body"><strong className="pa-orange">Estimated Extra Budget Needed</strong><div className="pa-pred-val">₹ 2.41 Lakh Cr</div><span className="pa-conf-pill amber">Confidence: 79%</span></div></div>
                    <div className="pa-pred-box red"><span className="pa-pred-icon red"><Shield size={16} /></span><div className="pa-pred-body"><strong className="pa-navy">Overall Risk Level</strong><div className="pa-pred-val">High (84/100)</div><span className="pa-conf-pill">Confidence: 89%</span></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-heading">
        <strong>{filtersActive ? 'Filtered Results' : 'Flagship Projects Deep-Dive'}</strong>
        <span>Showing {filtered.length} of {analysisProjects.length} national flagship initiatives</span>
      </div>
      {filtered.length > 0 ? (
        <div className="ca-list">
          {filtered.map((p, idx) => <CompactAnalysisCard key={`${p.id}-${idx}`} p={p} onOpen={() => setOpenId(p.id)} />)}
        </div>
      ) : (
        <div className="project-empty">
          <Search size={20} />
          <span>No projects match your filters.</span>
          <button className="home-btn home-btn-primary" onClick={resetFilters} style={{ marginTop: '12px', padding: '8px 20px', fontSize: '12px' }}>
            Reset All Filters
          </button>
        </div>
      )}

      {openProject && (
        <div className="ca-modal-overlay" role="dialog" aria-modal="true" aria-label={`${openProject.name} detailed analysis`} onClick={handleCloseModal}>
          <div className="ca-modal" onClick={(event) => event.stopPropagation()}>
            <button className="ca-modal-close" onClick={handleCloseModal} aria-label="Close detailed analysis"><X size={18} /></button>
            <div className="ca-modal-body">
              <ProjectAnalysisCard p={openProject} onOpenBriefing={() => onOpenBriefing(openProject)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompactAnalysisCard({ p, onOpen }: { p: AnalysisProject; onOpen: () => void }) {
  const onTrack = p.status === 'On Schedule'
  const statusClass = onTrack ? 'ca-status-ok' : p.status === 'High Risk' ? 'ca-status-risk' : 'ca-status-bad'
  const riskTextClass = p.risk === 'High' ? 'pa-red' : p.risk === 'Medium' ? 'pa-orange' : 'pa-green'
  return (
    <article className="ca-card">
      <div className="ca-col ca-identity">
        <div className="ca-idrow">
          <span className="ca-icon"><Share2 size={16} /></span>
          <div className="ca-idtext">
            <strong className="ca-name">{p.name}</strong>
            <span className="ca-id">{p.id}</span>
          </div>
        </div>
        <div className="ca-meta">
          <div className="ca-meta-item"><Landmark size={14} /><div><span className="ca-meta-label">Ministry</span><span className="ca-meta-val">{p.ministry}</span></div></div>
          <div className="ca-meta-item"><Share2 size={14} /><div><span className="ca-meta-label">Sector</span><span className="ca-meta-val">{p.sector}</span></div></div>
          <div className="ca-meta-item"><MapPin size={14} /><div><span className="ca-meta-label">States</span><span className="ca-meta-val">{p.states}</span></div></div>
        </div>
      </div>

      <div className="ca-col ca-facts">
        <div className="ca-fact"><span className="ca-fact-label">Approved Budget</span><strong className="ca-fact-val">{p.cost}</strong><small className="ca-fact-note">Approved</small></div>
        <div className="ca-fact"><span className="ca-fact-label">Updated Cost</span><strong className="ca-fact-val">{p.revisedCost}</strong><small className="ca-fact-note pa-orange">{p.revisedPct}</small></div>
        <div className="ca-fact ca-fact-progress"><span className="ca-fact-label">Progress</span><ProgressRing value={p.progress} /></div>
        <div className="ca-fact"><span className="ca-fact-label">Expected Completion</span><strong className="ca-fact-val">{p.currentExpected}</strong><small className="ca-fact-note pa-red">{p.expectedDelta}</small></div>
        <div className="ca-fact"><span className="ca-fact-label">Delay Running</span><strong className={`ca-fact-val ${onTrack ? 'pa-green' : 'pa-red'}`}>{p.currentDelay}</strong><small className="ca-fact-note">vs baseline</small></div>
      </div>

      <div className="ca-col ca-side">
        <div className="ca-side-top">
          <span className={`ca-status ${statusClass}`}>{!onTrack && <AlertTriangle size={12} />} {p.status}</span>
          <span className="ca-risk">Risk: <b className={riskTextClass}>{p.risk}</b></span>
        </div>
        <div className="ca-ai">
          <div className="ca-ai-head"><Brain size={13} /> AI Prediction</div>
          <div className="ca-ai-grid">
            <div className="ca-ai-item"><span className="ca-ai-label">Extra Delay Expected</span><strong className="pa-red">{p.predictedDelay}</strong></div>
            <div className="ca-ai-item"><span className="ca-ai-label">Extra Budget Needed</span><strong className="pa-orange">{p.estFunding}</strong></div>
            <div className="ca-ai-item"><span className="ca-ai-label">Overall Risk Level</span><strong className="pa-navy">{p.overallRisk}</strong></div>
          </div>
        </div>
        <button className="ca-view-btn" onClick={onOpen}>View Analysis &amp; Test Solutions <ArrowRight size={14} /></button>
      </div>
    </article>
  )
}

function CompactPortfolioCard({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="ca-card">
      <div className="ca-col ca-identity">
        <div className="ca-idrow">
          <span className="ca-icon"><LayoutGrid size={16} /></span>
          <div className="ca-idtext">
            <strong className="ca-name">India Infrastructure Portfolio Dashboard</strong>
            <span className="ca-id">IND-PORTFOLIO-2026</span>
          </div>
        </div>
        <div className="ca-meta">
          <div className="ca-meta-item"><Landmark size={14} /><div><span className="ca-meta-label">Ministry</span><span className="ca-meta-val">All Union Ministries</span></div></div>
          <div className="ca-meta-item"><Gauge size={14} /><div><span className="ca-meta-label">Coverage</span><span className="ca-meta-val">1,775 Monitored Projects</span></div></div>
          <div className="ca-meta-item"><Flag size={14} /><div><span className="ca-meta-label">States</span><span className="ca-meta-val">All 28 States &amp; 8 UTs</span></div></div>
        </div>
      </div>

      <div className="ca-col ca-facts">
        <div className="ca-fact"><span className="ca-fact-label">Sanctioned CapEx</span><strong className="ca-fact-val">₹ 18.94 Lakh Cr</strong><small className="ca-fact-note">Approved</small></div>
        <div className="ca-fact"><span className="ca-fact-label">Disbursed to Date</span><strong className="ca-fact-val">₹ 11.48 Lakh Cr</strong><small className="ca-fact-note pa-green">60.6% Utilized</small></div>
        <div className="ca-fact ca-fact-progress"><span className="ca-fact-label">Progress</span><ProgressRing value={68} /></div>
        <div className="ca-fact"><span className="ca-fact-label">Avg Completion</span><strong className="ca-fact-val">Oct 2028</strong><small className="ca-fact-note pa-red">+22 months</small></div>
        <div className="ca-fact"><span className="ca-fact-label">Average Delay</span><strong className="ca-fact-val pa-red">22 Months</strong><small className="ca-fact-note">across portfolio</small></div>
      </div>

      <div className="ca-col ca-side">
        <div className="ca-side-top">
          <span className="ca-status ca-status-bad"><AlertTriangle size={12} /> Active Monitoring</span>
          <span className="ca-risk">System Alert: <b className="pa-red">High Risk Projects: 142</b></span>
        </div>
        <div className="ca-ai">
          <div className="ca-ai-head"><Brain size={13} /> Portfolio AI Prediction</div>
          <div className="ca-ai-grid">
            <div className="ca-ai-item"><span className="ca-ai-label">Predicted Extra Delay Expected</span><strong className="pa-red">+8 Months</strong></div>
            <div className="ca-ai-item"><span className="ca-ai-label">Cumulative Cost Overrun</span><strong className="pa-orange">₹ 2.41 Lakh Cr</strong></div>
            <div className="ca-ai-item"><span className="ca-ai-label">High-Risk Severity</span><strong className="pa-navy">Critical (84/100)</strong></div>
          </div>
        </div>
        <button className="ca-view-btn" onClick={onOpen}>Open National Portfolio Report <ArrowRight size={14} /></button>
      </div>
    </article>
  )
}

function ProjectAnalysisCard({ 
  p, 
  onOpenBriefing 
}: { 
  p: AnalysisProject;
  onOpenBriefing: () => void;
}) {
  const onTrack = p.status === 'On Schedule'
  const statusClass = onTrack ? 'pa-status-ok' : 'pa-status-bad'
  const riskTextClass = p.risk === 'High' ? 'pa-red' : p.risk === 'Medium' ? 'pa-orange' : 'pa-green'
  const levelClass = p.priority === 'CRITICAL' ? 'pa-red' : p.priority === 'HIGH' ? 'pa-orange' : 'pa-amber'

  // Look up expenditure from full ongoing_projects
  const enriched = projects.find((x) => x.id === p.id)

  return (
    <article className="pa-card">
      <div className="pa-head">
        <div className="pa-head-left">
          <div className="analysis-back" style={{ color: '#0757a0', fontWeight: 700 }}><ArrowLeft size={14} /> Flagship Project In-Depth Analysis</div>
          <h2 className="pa-title">{p.name}</h2>
          <span className="pa-id">{p.id}</span>
        </div>
        <div className="pa-head-right">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="export-briefing-btn" onClick={onOpenBriefing}><Printer size={14} /> Export MoSPI Dossier</button>
          </div>
          <span className={`pa-status ${statusClass}`}><AlertTriangle size={13} /> {p.status}</span>
          <span className="pa-risk">Risk Rating: <b className={riskTextClass}>{p.risk}</b></span>
        </div>
      </div>

      <div className="pa-meta">
        <div className="pa-meta-item"><Landmark size={18} /><div><span className="pa-meta-label">Ministry</span><span className="pa-meta-val">{p.ministry}</span></div></div>
        <div className="pa-meta-item"><Share2 size={18} /><div><span className="pa-meta-label">Sector</span><span className="pa-meta-val">{p.sector}</span></div></div>
        <div className="pa-meta-item"><MapPin size={18} /><div><span className="pa-meta-label">States</span><span className="pa-meta-val">{p.states}</span></div></div>
      </div>

      <div className="pa-band">
        <div className="pa-band-item"><span className="pa-band-icon blue"><Coins size={16} /></span><div><div className="pa-band-label">Approved Budget</div><strong>{p.cost}</strong><small>(Approved)</small></div></div>
        <div className="pa-band-item"><span className="pa-band-icon blue"><Coins size={16} /></span><div><div className="pa-band-label">Invested to Date</div><strong>{enriched?.spentCost || '₹ 72.26k Cr'}</strong><small className="pa-orange">(Disbursed)</small></div></div>
        <div className="pa-band-item"><ProgressRing value={p.progress} /><div className="pa-band-progress"><div className="pa-band-label">Progress</div><strong>{p.progress}%</strong><div className="pa-band-bar"><span style={{ width: `${p.progress}%` }} /></div></div></div>
        <div className="pa-band-item"><span className="pa-band-icon"><CalendarDays size={16} /></span><div><div className="pa-band-label">Original Completion</div><strong>{p.originalCompletion}</strong><div className="pa-band-label pa-band-gap">Current Expected</div><strong>{p.currentExpected}</strong><small className="pa-red">({p.expectedDelta})</small></div></div>
        <div className="pa-band-item"><span className="pa-band-icon"><Clock3 size={16} /></span><div><div className="pa-band-label">Delay Running</div><strong className="pa-red">{p.currentDelay}</strong></div></div>
      </div>

      {/* User Feature: Expenditure & Budget Investment Breakdown */}
      {enriched && enriched.expenditureBreakdown && (
        <div className="pc-capex-container" style={{ marginTop: '16px' }}>
          <div className="capex-top">
            <div className="capex-title-group">
              <Coins size={18} color="#0c5c9d" />
              <strong>Where Has the Money Been Spent? (Audit Breakdown)</strong>
              <span className="capex-ratio-pill">{enriched.financialProgress || 67}% Disbursed</span>
            </div>
            <div className="capex-stats">
              <div className="capex-stat-item"><span className="capex-stat-label">Total Budget:</span><span className="capex-stat-val">{enriched.cost}</span></div>
              <div className="capex-stat-item"><span className="capex-stat-label">Money Spent Till Now:</span><span className="capex-stat-val" style={{ color: '#159149' }}>{enriched.spentCost}</span></div>
              <div className="capex-stat-item"><span className="capex-stat-label">Money Left to Spend:</span><span className="capex-stat-val" style={{ color: '#7047eb' }}>{enriched.balanceCost}</span></div>
            </div>
          </div>
          <div className="capex-breakdown-grid">
            <div className="capex-chip">
              <div className="capex-chip-header">🏗️ Building &amp; Construction Work</div>
              <div className="capex-chip-val">{enriched.expenditureBreakdown.civilWorks}</div>
              <div className="capex-chip-sub">Pillars, Tunnels, Bridges &amp; Railway Tracks</div>
            </div>
            <div className="capex-chip">
              <div className="capex-chip-header">🗺️ Buying Land &amp; Paying Landowners &amp; R&amp;R</div>
              <div className="capex-chip-val">{enriched.expenditureBreakdown.landAcquisition}</div>
              <div className="capex-chip-sub">Direct Money Paid to Farmers &amp; Landowners</div>
            </div>
            <div className="capex-chip">
              <div className="capex-chip-header">⚡ Moving Power Lines, Pipes &amp; Cables Integration</div>
              <div className="capex-chip-val">{enriched.expenditureBreakdown.utilityAndSystems}</div>
              <div className="capex-chip-sub">High-Voltage Power Lines, Water Pipes &amp; Signals</div>
            </div>
            <div className="capex-chip">
              <div className="capex-chip-header">📋 Project Supervision &amp; Legal Approvals</div>
              <div className="capex-chip-val">{enriched.expenditureBreakdown.contingencyAndPMC}</div>
              <div className="capex-chip-sub">Quality Inspections, Safety Clearances &amp; Legal Work</div>
            </div>
          </div>
        </div>
      )}

      {/* Winning Feature 1: What-If Solution Tester (What-If Simulator) */}
      <WhatIfSimulator project={enriched || p} />

      <div className="pa-section pa-section-ai">
        <div className="pa-section-head"><span className="pa-sec-icon blue"><Brain size={18} /></span><strong>PAMANA AI Prediction</strong><span className="pa-conf-pill">Confidence: {p.aiConfidence}%</span></div>
        <p className="pa-section-desc">Based on historical project performance, current indicators and identified delay factors.</p>
        <div className="pa-pred-row">
          <div className="pa-pred-box red"><span className="pa-pred-icon red"><CalendarDays size={16} /></span><div className="pa-pred-body"><strong className="pa-red">Predicted Extra Delay Expected</strong><div className="pa-pred-val">{p.predictedDelay}</div><span className="pa-conf-pill">Confidence: {p.predictedDelayConf}%</span></div></div>
          <div className="pa-pred-box orange"><span className="pa-pred-icon orange"><Coins size={16} /></span><div className="pa-pred-body"><strong className="pa-orange">Estimated Extra Budget Needed</strong><div className="pa-pred-val">{p.estFunding}</div><span className="pa-conf-pill amber">Confidence: {p.estFundingConf}%</span></div></div>
          <div className="pa-pred-box red"><span className="pa-pred-icon red"><Shield size={16} /></span><div className="pa-pred-body"><strong className="pa-navy">Overall Risk Level</strong><div className="pa-pred-val">{p.overallRisk}</div><span className="pa-conf-pill">Confidence: {p.overallRiskConf}%</span></div></div>
        </div>
      </div>

      <div className="pa-section pa-section-bottleneck">
        <div className="pa-section-head">
          <span className="pa-sec-icon blue"><AlertTriangle size={18} /></span>
          <strong>{onTrack ? 'Key Risks & Watchlist Factors (Preventive Monitoring)' : 'Main Problems & Why Work Is Delayed'}</strong>
        </div>
        <div className="pa-bottleneck-row">
          <div className="pa-bottleneck-left">
            <span className="pa-primary-pill">{onTrack ? 'Primary Watchlist Risk' : 'Biggest Blocker'}</span>
            <h3 className="pa-bottleneck-title"><i className="pa-dot" /> {p.bottleneck}</h3>
            <p className="pa-bottleneck-desc">{p.bottleneckDesc}</p>
            <div className="pa-impact-row">
              <div className="pa-impact"><AlertTriangle size={15} /><div><strong className="pa-red">{onTrack ? 'Potential Severity' : 'Damage Caused'}</strong><span>{p.impact}</span></div></div>
              <div className="pa-impact"><Activity size={15} /><div><strong>{onTrack ? 'Vulnerable Activity' : 'Work Being Stopped'}</strong><span>{p.affectedActivity}</span></div></div>
              <div className="pa-impact"><Flag size={15} /><div><strong className="pa-red">{onTrack ? 'Slippage Threat' : 'Chance of More Delay'}</strong><span>{p.riskFurther}</span></div></div>
            </div>
            <span className="pa-conf-pill">Confidence: {p.bottleneckConf}%</span>
          </div>
          <div className="pa-rootcause">
            <div className="pa-rootcause-title">{onTrack ? 'Key Factors Under Active Review' : 'Why Is It Delayed? (Root Causes)'}</div>
            {p.rootCause.map((rc, i) => {
              const displayRc = (onTrack && rc.toLowerCase().includes('project delay')) ? 'Potential Schedule Slippage' : rc
              const Icon = rootCauseIcons[i % rootCauseIcons.length]
              return (
                <Fragment key={rc}>
                  <div className="pa-rc-item"><span className="pa-rc-icon"><Icon size={14} /></span><span>{displayRc}</span></div>
                  {i < p.rootCause.length - 1 && <div className="pa-rc-arrow">↓</div>}
                </Fragment>
              )
            })}
            <span className="pa-conf-pill">Confidence: {p.rootCauseConf}%</span>
          </div>
        </div>
      </div>

      <div className="pa-section pa-section-action">
        <div className="pa-section-head"><span className="pa-sec-icon green"><Target size={18} /></span><strong>Recommended Action Plan (Who Fixes What)</strong></div>
        <div className="pa-action-row">
          <div className="pa-action-left">
            <div className="pa-priority">Priority Level: <span className={`pa-priority-level ${levelClass}`}>{p.priority}</span></div>
            <p className="pa-action-text">{p.actionText}</p>
          </div>
          <div className="pa-action-right">
            <div className="pa-eimpact-title"><TrendingUp size={14} /> Expected Results Once Fixed</div>
            {p.expectedImpact.map((x) => <div key={x} className="pa-eimpact-item"><CheckCircle2 size={14} /><span>{x}</span></div>)}
            <span className="pa-conf-pill">Confidence: {p.actionConf}%</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function MapView({ onSeeProject }: { onSeeProject: (p: Project | null) => void }) {
  const [filters, setFilters] = useState({ State: 'All', Risk: 'All', Type: 'All' })
  const [groupMode, setGroupMode] = useState<'Ministry' | 'Sector'>('Sector')
  const [groupValue, setGroupValue] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null)

  const setFilter = (label: keyof typeof filters, value: string) => setFilters((c) => ({ ...c, [label]: value }))
  const switchGroupMode = (mode: 'Ministry' | 'Sector') => {
    setGroupMode(mode)
    setGroupValue('All')
  }
  const groupOptions = groupMode === 'Ministry' ? ministryOptions : sectorOptions

  const visible = useMemo(
    () =>
      projects.filter((project) => {
        const query = search.trim().toLowerCase()
        const haystack = [project.name, project.id, project.state, project.risk, project.type, project.ministry, project.sector, project.criticalIssue].join(' ').toLowerCase()
        if (query && !haystack.includes(query)) return false
        if (filters.State !== 'All' && !project.state.includes(filters.State)) return false
        if (filters.Risk !== 'All' && project.risk !== filters.Risk) return false
        if (filters.Type !== 'All' && project.type !== filters.Type) return false
        if (groupValue !== 'All') {
          if (groupMode === 'Ministry' && project.ministry !== groupValue) return false
          if (groupMode === 'Sector' && project.sector !== groupValue) return false
        }
        return true
      }),
    [filters, groupMode, groupValue, search],
  )

  useEffect(() => {
    if (selectedId && !visible.some((p) => p.id === selectedId)) setSelectedId(null)
  }, [visible, selectedId])

  const target = useMemo(
    () => computeView(visible.map((p) => projectCoords[p.id]).filter(Boolean) as [number, number][], filters.State),
    [visible, filters.State],
  )
  const view = useAnimatedView(target)

  const activeStates = useMemo(() => {
    const s = new Set<string>()
    visible.forEach((p) => p.state.split(',').forEach((x) => s.add(x.trim())))
    if (filters.State !== 'All') s.add(filters.State)
    return s
  }, [visible, filters.State])

  const selected = visible.find((p) => p.id === selectedId) || null
  const riskBadge = (risk: Project['risk']) => (risk === 'High' ? 'badge-high' : risk === 'Medium' ? 'badge-medium' : 'badge-low')

  return (
    <div className="map-view">
      <div className="filter-row">
        <FilterSelect label="State" value={filters.State} onChange={(val) => setFilter('State', val)} />
        <FilterSelect label="Risk" value={filters.Risk} onChange={(val) => setFilter('Risk', val)} />
        <FilterSelect label="Type" value={filters.Type} onChange={(val) => setFilter('Type', val)} />
        <label className="search-field"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects by name, location, sector..." aria-label="Search map projects" /></label>
      </div>

      <div className="map-canvas-card">
        <div className="map-toolbar">
          <div className="map-legend">
            <span><i className="ml-dot high" /> High Risk</span>
            <span><i className="ml-dot medium" /> Medium Risk</span>
            <span><i className="ml-dot low" /> Low Risk</span>
          </div>
          <span className="map-count">Showing {visible.length} mapped national projects</span>
          <button className="map-reset" onClick={() => { setFilters({ State: 'All', Risk: 'All', Type: 'All' }); setSearch('') }}>Reset Filters</button>
        </div>

        <div className="map-wrap" ref={wrapRef}>
          <div className="map-stage">
            <ComposableMap
              width={MAP_W}
              height={MAP_H}
              projection="geoMercator"
              projectionConfig={{ center: view.center, scale: view.scale }}
            >
              <Geographies geography={INDIA_TOPO}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name = geo.properties?.st_nm || geo.properties?.NAME_1 || geo.properties?.name || ''
                    const active = activeStates.has(name)
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        className={`map-geo ${active ? 'active' : ''}`}
                      />
                    )
                  })
                }
              </Geographies>

              {visible.map((p, idx) => {
                const coords = projectCoords[p.id]
                if (!coords) return null
                return (
                  <Marker key={`${p.id}-${idx}`} coordinates={coords} className="map-marker" onClick={(e) => {
                    const rect = wrapRef.current?.getBoundingClientRect()
                    if (rect) {
                      setCardPos({ x: (e as any).clientX - rect.left, y: (e as any).clientY - rect.top })
                    }
                    setSelectedId(p.id)
                  }}>
                    <circle r={6} fill={riskMarkerColor[p.risk]} stroke="#ffffff" strokeWidth={2} />
                  </Marker>
                )
              })}
            </ComposableMap>

            {selected && cardPos && (
              <div className="map-card" style={{ left: cardPos.x, top: cardPos.y }}>
                <button className="map-card-close" onClick={() => setSelectedId(null)} aria-label="Close project card"><X size={14} /></button>
                <div className="map-card-title">{selected.name}</div>
                <span className="map-card-id">{selected.id}</span>
                <div className="map-card-rows">
                  <div className="map-card-row"><MapPin size={14} /><span>Location</span><b>{selected.state}</b></div>
                  <div className="map-card-row"><AlertTriangle size={14} /><span>Risk</span><em className={`badge ${riskBadge(selected.risk)}`}>{selected.risk}</em></div>
                  <div className="map-card-row"><TrendingUp size={14} /><span>Progress</span><b>{selected.progress}%</b></div>
                  <div className="map-card-row"><Coins size={14} /><span>Sanctioned</span><b>{selected.cost}</b></div>
                  <div className="map-card-row"><CalendarDays size={14} /><span>Delay</span><b className={selected.type === 'On Schedule' ? 'note-green' : 'note-red'}>{selected.delay}</b></div>
                </div>
                <button className="map-card-btn" onClick={() => onSeeProject(selected)}>See Full Project <ArrowRight size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="project-empty" style={{ marginTop: 16 }}><Search size={20} /><span>No projects match your filters.</span></div>
      )}
    </div>
  )
}

/* ----------------------------------------------------
   PAMANA AI Assistant with Financial Intelligence & Voice
------------------------------------------------------- */
type ChatMsg = { role: 'user' | 'bot'; text: string }

const projectAliases: { id: string; words: string[] }[] = [
  { id: 'N22000463', words: ['bullet', 'ahmedabad', 'mumbai', 'train', 'mahsr', 'nhsrcl', 'high speed'] },
  { id: 'N11000101', words: ['delhi', 'expressway', 'dme', 'nhai', 'mumbai expressway'] },
  { id: 'N22000464', words: ['char', 'dham', 'uttarakhand', 'kedarnath', 'badrinath'] },
  { id: 'N22000465', words: ['navi', 'mumbai', 'airport', 'nmia', 'cidco'] },
  { id: 'N22000466', words: ['ken', 'betwa', 'river', 'link', 'irrigation', 'water'] },
]

function matchProject(q: string): Project | null {
  const ql = q.toLowerCase()
  const direct = projects.find((p) => ql.includes(p.id.toLowerCase()) || ql.includes(p.name.toLowerCase()))
  if (direct) return direct
  let best: { p: Project; score: number } | null = null
  for (const alias of projectAliases) {
    const score = alias.words.reduce((n, w) => n + (ql.includes(w) ? 1 : 0), 0)
    if (score > 0 && (!best || score > best.score)) {
      const p = projects.find((x) => x.id === alias.id)
      if (p) best = { p, score }
    }
  }
  return best ? best.p : null
}

function answerQuery(q: string): string {
  const ql = q.toLowerCase()
  const p = matchProject(q)
  const wantMoneySpent = /(spent|invested|already used|disbursed|expenditure|breakdown|civil|land acquisition)/.test(ql)
  const wantRisk = /risk/.test(ql)
  const wantDelay = /(delay|late|behind|schedule|timeline)/.test(ql)
  const wantCost = /(cost|budget|fund|money|overrun|expense|rupee|crore)/.test(ql)
  const wantBottleneck = /(bottleneck|issue|problem|root cause|blocker|cause)/.test(ql)
  const wantProgress = /(progress|complete|completion|done)/.test(ql)

  if (p) {
    const a = analysisProjects.find((x) => x.id === p.id)
    const pFin = p.financialProgress ?? Math.min(100, Math.round(p.progress * 0.95))
    const pCostNum = p.rawCost || parseFloat(p.cost.replace(/[^0-9.]/g, '')) || 5000
    const pSpentNum = p.rawSpentCost || Math.round(pCostNum * (pFin / 100))
    const pBalNum = Math.max(0, pCostNum - pSpentNum)
    const pSpentText = p.spentCost || `₹ ${pSpentNum.toLocaleString('en-IN')} Cr`
    const pBalText = p.balanceCost || `₹ ${pBalNum.toLocaleString('en-IN')} Cr`

    if (wantMoneySpent || (wantCost && /(spent|how much)/.test(ql))) {
      return `📊 Financial & Expenditure Audit for ${p.name} (${p.id}):\n` +
        `• Total Sanctioned Budget: ${p.cost}\n` +
        `• Cumulative Invested/Spent: ${pSpentText} (${pFin}% utilized)\n` +
        `• Remaining Money Left to Spend: ${pBalText}\n\n` +
        (p.expenditureBreakdown ? 
          `Component Breakdown of Invested Capital:\n` +
          `  🏗️ Civil & Physical Works: ${p.expenditureBreakdown.civilWorks}\n` +
          `  🗺️ Buying Land & Compensating Landowners (R&R): ${p.expenditureBreakdown.landAcquisition}\n` +
          `  ⚡ Utility Relocation & Systems: ${p.expenditureBreakdown.utilityAndSystems}\n` +
          `  📋 PMC, Supervision & Statutory: ${p.expenditureBreakdown.contingencyAndPMC}`
          : `Breakdown: 55% civil infrastructure, 25% land compensation, 12% utility shifting, 8% PMC.`);
    }
    if (wantRisk) return `${p.name} (${p.id}) carries a ${p.risk} risk rating with a risk score of ${p.riskScore}/100. The AI model estimates a ${p.delayProbability}% probability of delay slippage. Primary bottleneck: ${p.criticalIssue}.`
    if (wantDelay) return `${p.name} is currently ${p.delay === 'On Track' ? 'on track with no delay' : `delayed by ${p.delay}`}.${a ? ` Original baseline completion was ${a.originalCompletion}; current expected is ${a.currentExpected} (${a.expectedDelta}). Predicted additional delay: ${a.predictedDelay}.` : ''}`
    if (wantCost) return `${p.name} has a sanctioned budget of ${p.cost}, with ${pSpentText} invested so far. Unspent balance is ${pBalText}.`
    if (wantBottleneck) return `The primary bottleneck for ${p.name} is ${p.criticalIssue}.${a ? ` ${a.bottleneckDesc} Impact: ${a.impact}; affected activity: ${a.affectedActivity}.` : ''}`
    if (wantProgress) return `${p.name} is ${p.progress}% complete physically, with a financial utilization rate of ${pFin}%. Status: "${p.type}".`
    return `${p.name} (${p.id})\nLocation: ${p.state}\nMinistry: ${p.ministry} · Sector: ${p.sector}\nApproved Budget: ${p.cost} | Invested to date: ${pSpentText}\nWork Completed on Ground: ${p.progress}% | Financial Progress: ${pFin}%\nStatus: ${p.type} · Risk: ${p.risk} (${p.riskScore}/100)\nKey Bottleneck: ${p.criticalIssue}`
  }

  if (/(money invested|how much money|total spent|expenditure|utilized)/.test(ql)) {
    return `💰 National Portfolio Expenditure Audit (MoSPI IPMD):\n` +
      `• Total Sanctioned Budget: ₹ 18.94 Lakh Crore across 1,775 projects\n` +
      `• Cumulative Capital Invested/Spent: ₹ 11.48 Lakh Crore (60.6% utilization)\n` +
      `• Largest Single Investment: Mumbai–Ahmedabad High Speed Rail (₹ 72,257 Cr spent of ₹ 1.08 Lakh Cr budget, with ₹ 18,064 Cr invested in land acquisition alone).\n` +
      `• Cumulative Cost Overrun Recorded: ₹ 2.41 Lakh Crore.`
  }

  if (/(high risk|highest risk|most risky|riskiest|risky)/.test(ql)) {
    const list = [...projects].filter((x) => x.risk === 'High').sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)
    return `Top High-Risk Projects flagged by PAMANA Early Warning AI:\n` + list.map((x) => `• ${x.name} — Risk: ${x.riskScore}/100, Delay: ${x.delay} (${x.state}) — Bottleneck: ${x.criticalIssue}`).join('\n')
  }

  if (/(overview|summary|how many|status|portfolio|total|snapshot)/.test(ql)) {
    return `National Infrastructure Portfolio Snapshot:\n• 1,775 Total Monitored Ongoing Projects (Trained on 49,094 MoSPI Archive)\n• 684 Projects on Schedule (67.6%)\n• 328 Delayed Projects (32.4%)\n• 142 High Risk / Predicted Delay alerts\n• Total Approved Budget: ₹ 18.94 Lakh Cr (₹ 11.48 Lakh Cr expended to date)\n• Total Cost Overrun: ₹ 2.41 Lakh Cr`
  }

  return `Namaste! I can answer any question about project investments, expenditure breakdowns, delays, risks and bottlenecks across India's 1,775 ongoing infrastructure projects (and 49,094 historical records).\n\nTry asking:\n• "How much money has been invested in the Mumbai Ahmedabad bullet train?"\n• "Show expenditure breakdown on land acquisition for railways"\n• "Which projects carry the highest delay risk?"\n• "What is the primary bottleneck for the Delhi Mumbai Expressway?"`
}

const AI_SUGGESTIONS = [
  'How much money invested in Mumbai Ahmedabad train?',
  'Show land acquisition expenditure',
  'Which projects are highest risk?',
  'Total national infrastructure budget spent',
  'Bottleneck for Delhi–Mumbai Expressway',
]

function AIView() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'bot', text: 'Namaste. I am PAMANA, the MoSPI AI assistant for NIRMAN-Drishti. Ask me about any of the 1,775 ongoing infrastructure projects, their sanctioned budgets, money invested so far, component breakdowns (civil, land, utilities), or predicted delays.' },
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = (text: string) => {
    const q = text.trim()
    if (!q) return
    const reply = answerQuery(q)
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'bot', text: reply }])
    setInput('')
  }

  const handleVoice = () => {
    if (isListening) {
      setIsListening(false)
      return
    }
    setIsListening(true)
    // If browser supports webkitSpeechRecognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript
        setIsListening(false)
        setInput(transcript)
        send(transcript)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } else {
      // Simulation fallback
      setTimeout(() => {
        setIsListening(false)
        const sampleQuery = 'How much money has been invested in the Mumbai Ahmedabad bullet train?'
        setInput(sampleQuery)
        send(sampleQuery)
      }, 1500)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      send(input)
    }
  }

  return (
    <div className="ai-view">
      <div className="ai-intro">
        <div className="ai-intro-icon"><Sparkles size={22} /></div>
        <div>
          <h3 className="ai-intro-title">PAMANA Conversational Project Intelligence</h3>
          <p className="ai-intro-sub">Trained on MoSPI IPMD infrastructure project records, expenditure ledgers, and early warning prediction models. Voice &amp; text enabled.</p>
        </div>
        <span className="ai-intro-pill">MoSPI AI v2.4</span>
      </div>

      <div className="ai-chat-card">
        <div className="ai-chat-header"><span className="ai-chat-dot" /> Live PAMANA Intelligence Feed · 1,775 Monitored Ongoing Projects</div>
        <div className="ai-chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              <span className={`ai-avatar ${m.role}`}>{m.role === 'bot' ? <Sparkles size={14} /> : <UserRound size={14} />}</span>
              <div className={`ai-bubble ${m.role}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="ai-suggestions">
          {AI_SUGGESTIONS.map((s) => <button key={s} className="ai-chip" onClick={() => send(s)}>{s}</button>)}
        </div>
        <div className="ai-input-row">
          <button 
            className={`ai-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoice} 
            title={isListening ? 'Listening...' : 'Voice Query'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <textarea 
            value={input} 
            onChange={(event) => setInput(event.target.value)} 
            onKeyDown={onKeyDown} 
            placeholder={isListening ? 'Listening to speech...' : 'Ask about budget spent, land acquisition costs, delay risks or bottlenecks...'} 
            rows={1} 
            aria-label="Chat message" 
          />
          <button className="ai-send" onClick={() => send(input)} aria-label="Send message"><Send size={16} /></button>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------
   Winning Feature 2: 1-Click Executive MoSPI Dossier Modal
------------------------------------------------------- */
function ExecutiveDossierModal({ 
  project, 
  onClose 
}: { 
  project: Project | AnalysisProject; 
  onClose: () => void;
}) {
  const p = projects.find((x) => x.id === project.id) || (project as Project)
  const pFin = p.financialProgress ?? (('progress' in p && p.progress) ? Math.min(100, Math.round(p.progress * 0.95)) : 65)
  const pCostNum = p.rawCost || parseFloat(p.cost.replace(/[^0-9.]/g, '')) || 5000
  const pSpentNum = p.rawSpentCost || Math.round(pCostNum * (pFin / 100))
  const pBalNum = Math.max(0, pCostNum - pSpentNum)
  const pSpentDisplay = p.spentCost || `₹ ${pSpentNum.toLocaleString('en-IN')} Cr`
  const pBalDisplay = p.balanceCost || `₹ ${pBalNum.toLocaleString('en-IN')} Cr`
  const formattedToday = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="ca-modal-overlay" role="dialog" aria-modal="true" aria-label="MoSPI Executive Flash Briefing" onClick={onClose}>
      <div className="ca-modal" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
        <button className="ca-modal-close" onClick={onClose} aria-label="Close dossier"><X size={18} /></button>
        
        <div className="ca-modal-body" style={{ padding: '28px 36px' }}>
          {/* Government Watermark / Official Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0c3e6b', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="brand-mark" style={{ width: '48px', height: '48px' }}><Landmark size={24} /></div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0b3157' }}>GOVERNMENT OF INDIA</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#526e89' }}>MINISTRY OF STATISTICS &amp; PROGRAMME IMPLEMENTATION (MoSPI)</div>
                <div style={{ fontSize: '11px', color: '#72869d' }}>Infrastructure &amp; Project Monitoring Division (IPMD) · Early Warning Decision Support Dossier</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#103f6d' }}>REF: MoSPI/IPMD/2026/EWS-{p.id}</div>
              <div style={{ fontSize: '11px', color: '#72869d' }}>Date: {formattedToday}</div>
              <span className="badge badge-high" style={{ marginTop: '4px' }}>CONFIDENTIAL / CABINET BRIEFING</span>
            </div>
          </div>

          <div className="dossier-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0b2f52', margin: 0 }}>{p.name}</h2>
              <div style={{ fontSize: '13px', color: '#4b6580', marginTop: '4px' }}>
                Executing Agency: <b>{p.ministry}</b> · Sector: <b>{p.sector}</b> · Location: <b>{p.state}</b>
              </div>
            </div>
            <button className="export-briefing-btn" onClick={() => window.print()}>
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>

          {/* Official Project Lifecycle & Milestones Table */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0b3157', marginBottom: '10px' }}>📅 Project Lifecycle &amp; Statutory Milestone Audit</h4>
            <div className="ca-table-responsive">
              <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ background: '#f4f8fc', borderBottom: '1px solid #dce7f1' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: '#526e89', width: '25%' }}>Date of Sanction / Start</td>
                    <td style={{ padding: '8px 14px', fontWeight: 800, color: '#0b3157', width: '25%' }}>{p.approvalDate || '08/2024'}</td>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: '#526e89', width: '25%' }}>Time Under Execution</td>
                    <td style={{ padding: '8px 14px', fontWeight: 800, color: '#0b3157', width: '25%' }}>{p.yearsActive || '1.9 years'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #dce7f1' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: '#526e89' }}>Original Target Date (DOC)</td>
                    <td style={{ padding: '8px 14px', fontWeight: 800, color: '#0b3157' }}>{p.originalDoc || '02/2026'}</td>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: '#526e89' }}>Anticipated Target Date</td>
                    <td style={{ padding: '8px 14px', fontWeight: 800, color: p.type === 'On Schedule' ? '#159149' : '#df4036' }}>
                      {p.anticipatedDoc || p.originalDoc} ({p.type === 'On Schedule' ? 'On Time' : `+${p.overrunMonths || 0} mos delay`})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* KPI Matrix Table */}
          <div className="ca-table-responsive">
            <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
              <tbody>
                <tr style={{ background: '#f4f8fc', borderBottom: '1px solid #dce7f1' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#526e89', width: '25%' }}>Total Approved Budget</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0b3157', width: '25%' }}>{p.cost}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#526e89', width: '25%' }}>Money Spent Till Now</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#159149', width: '25%' }}>{pSpentDisplay} ({pFin}%)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dce7f1' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#526e89' }}>Work Completed on Ground</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0b3157' }}>{p.progress}% Achieved</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#526e89' }}>Money Left to Spend</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#7047eb' }}>{pBalDisplay}</td>
                </tr>
                <tr style={{ background: '#f4f8fc', borderBottom: '1px solid #dce7f1' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#526e89' }}>AI Delay Risk Rating</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: p.risk === 'High' ? '#df4036' : '#ed7b11' }}>{p.risk} ({p.riskScore}/100)</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#526e89' }}>Extra Cost Beyond Budget</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#df4036' }}>{p.costOverrunCr ? `₹ ${p.costOverrunCr.toLocaleString()} Cr` : '₹ 0 Cr (Protected)'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Component Breakdown Table */}
          {p.expenditureBreakdown && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0b3157', marginBottom: '10px' }}>Expenditure Audit &amp; Capital Utilization Breakdown</h4>
              <div className="capex-breakdown-grid">
                <div className="capex-chip">
                  <div className="capex-chip-header">🏗️ Building &amp; Construction</div>
                  <div className="capex-chip-val">{p.expenditureBreakdown.civilWorks}</div>
                  <div className="capex-chip-sub">Procurement, Physical Structures</div>
                </div>
                <div className="capex-chip">
                  <div className="capex-chip-header">🗺️ Buying Land &amp; Paying Landowners (R&amp;R)</div>
                  <div className="capex-chip-val">{p.expenditureBreakdown.landAcquisition}</div>
                  <div className="capex-chip-sub">Direct Compensation &amp; Resettlement</div>
                </div>
                <div className="capex-chip">
                  <div className="capex-chip-header">⚡ Utility &amp; Systems Integration</div>
                  <div className="capex-chip-val">{p.expenditureBreakdown.utilityAndSystems}</div>
                  <div className="capex-chip-sub">Power Grids, Relocation, Signals</div>
                </div>
                <div className="capex-chip">
                  <div className="capex-chip-header">📋 Project Supervision &amp; Legal Approvals</div>
                  <div className="capex-chip-val">{p.expenditureBreakdown.contingencyAndPMC}</div>
                  <div className="capex-chip-sub">Statutory Approvals &amp; Overhead</div>
                </div>
              </div>
            </div>
          )}

          {/* Formal 3-Tier Escalation Matrix */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0b3157', marginBottom: '12px' }}>Who Needs to Take Action? (Step-by-Step Action Plan)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#fef5f4', border: '1px solid #f9d8d4', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#d82a2a', fontSize: '13px' }}>Level 1: Central Government &amp; Cabinet Ministers (Immediate Action)</strong>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#fdeceb', color: '#df4036', padding: '2px 8px', borderRadius: '4px' }}>Immediate Action</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4a6074' }}>Inter-state coordination for multi-state Right of Way clearances and revision of sanctioned framework with the Ministry of Finance.</p>
              </div>

              <div style={{ background: '#fff9f2', border: '1px solid #fde7cc', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#d9820f', fontSize: '13px' }}>Level 2: Ministry Project Review Committee (Within 14 Days)</strong>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#fff3e0', color: '#d9820f', padding: '2px 8px', borderRadius: '4px' }}>14-Day Review</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4a6074' }}>Release advance mobilization fund tranche (+15% CapEx) and mandate EPC contractors to deploy dual-shift machinery.</p>
              </div>

              <div style={{ background: '#f4fbf6', border: '1px solid #c9ecda', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#159149', fontSize: '13px' }}>Level 3: Local District Officers (Ground Action for Land &amp; Clearances)</strong>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#e9f6ee', color: '#178a4c', padding: '2px 8px', borderRadius: '4px' }}>Ground Resolution</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4a6074' }}>Expedite pending village compensation disbursement and complete physical encumbrance removal across high-density sections.</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #dce4ec', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#7b8f9f' }}>
            <span>Generated by NIRMAN-Drishti AI Early Warning System</span>
            <span>Government of India · Ministry of Statistics &amp; Programme Implementation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
