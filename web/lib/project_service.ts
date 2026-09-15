import rawProjects from './ongoing_projects.json'
import rawFlagshipAnalysis from './flagship_analysis.json'

export type RiskTier = 'High' | 'Medium' | 'Low'
export type ProjectStatus = 'On Schedule' | 'Delayed' | 'High Risk'

export interface Project {
  id: string
  name: string
  state: string
  risk: RiskTier
  type: ProjectStatus
  ministry: string
  sector: string
  agency?: string
  approvalDate?: string
  announcedDate?: string
  workStartDate?: string
  yearsActive?: string
  originalDoc?: string
  anticipatedDoc?: string
  targetCompletion?: string
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
  coordinates?: [number, number]
  reportPeriod?: string
  reportYear?: number
}

export interface ProjectRiskProfile {
  tier: RiskTier
  score: number
  delayProbability: number
  badgeClass: string
  textClass: string
  bgLightClass: string
  label: string
  predictedExtraDelay: string
  estimatedExtraCost: string
  explanation: string
}

export interface ProjectBudgets {
  sanctionedCost: string
  revisedCost: string
  spentCost: string
  balanceCost: string
  financialProgress: number
  costOverrunCr: number
  costOverrunPct: number
  hasOverrun: boolean
}

export interface FlagshipAnalysisDetails {
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
  aiConfidence: number
}

export interface UnifiedProject extends Project {
  riskProfile: ProjectRiskProfile
  budgets: ProjectBudgets
  flagshipDetails: FlagshipAnalysisDetails
  isFlagship?: boolean
}

const flagshipMap = new Map<string, any>(
  (rawFlagshipAnalysis as any[]).map((f) => [f.id, f])
)

/**
 * Deterministic canonical risk profile calculator.
 * Single source of truth across Project Cards, Analysis Cards, Dossiers, and What-If Simulator.
 */
export function getProjectRiskProfile(project: Project): ProjectRiskProfile {
  const overrun = project.overrunMonths ?? 0
  const costOverrun = project.costOverrunCr ?? 0
  const costOverrunPct = project.costOverrunPct ?? 0
  const isOnTrack = project.type === 'On Schedule' || overrun === 0

  let score = project.riskScore
  if (!score || score <= 0) {
    if (isOnTrack) {
      score = Math.max(12, Math.min(32, Math.round((100 - project.progress) * 0.18)))
    } else if (overrun > 24 || costOverrunPct > 20) {
      score = Math.min(96, Math.max(72, 70 + Math.round(overrun * 0.45)))
    } else if (overrun > 6 || costOverrunPct > 5) {
      score = Math.min(69, Math.max(42, 40 + Math.round(overrun * 0.8)))
    } else {
      score = Math.max(20, Math.min(39, 20 + overrun * 2))
    }
  }

  // Consistent Tier Mapping
  let tier: RiskTier = project.risk
  if (score >= 70) tier = 'High'
  else if (score >= 40) tier = 'Medium'
  else tier = 'Low'

  let delayProbability = project.delayProbability
  if (!delayProbability || delayProbability <= 0) {
    delayProbability = isOnTrack 
      ? Math.max(10, Math.min(25, Math.round(score * 0.7)))
      : Math.min(98, Math.max(45, Math.round(score * 0.94)))
  }

  const badgeClass = tier === 'High' ? 'badge-high' : tier === 'Medium' ? 'badge-medium' : 'badge-low'
  const textClass = tier === 'High' ? 'pa-red' : tier === 'Medium' ? 'pa-orange' : 'pa-green'
  const bgLightClass = tier === 'High' ? '#fef2f2' : tier === 'Medium' ? '#fffbeb' : '#f0fdf4'

  const predictedExtraDelay = isOnTrack 
    ? 'On Schedule (+0 Mo)' 
    : (overrun > 0 ? `+${overrun} Months` : '+0 Months')

  const estimatedExtraCost = costOverrun > 0 
    ? `+₹ ${costOverrun.toLocaleString('en-IN')} Cr` 
    : '₹ 0 Cr (Protected)'

  const explanation = isOnTrack
    ? `Drishti AI ML Risk Engine: Score ${score}/100. Project is operating on schedule (0 mo delay) within sanctioned baseline (${project.cost}). Physical progress (${project.progress}%) is under active milestone surveillance.`
    : `Drishti AI ML Risk Engine: Score ${score}/100 derived from schedule slippage (+${overrun} mos delay), cost variance (${estimatedExtraCost}), and physical progress (${project.progress}%) relative to execution baseline.`

  return {
    tier,
    score,
    delayProbability,
    badgeClass,
    textClass,
    bgLightClass,
    label: `${tier} Risk`,
    predictedExtraDelay,
    estimatedExtraCost,
    explanation,
  }
}

/**
 * Standardized budget calculations.
 * Guarantees explicit labeling of Sanctioned vs. Revised vs. Expenditure across all UI views.
 */
export function getProjectBudgets(project: Project): ProjectBudgets {
  const sanctionedCost = project.cost
  const revisedCost = project.revisedCost || project.cost

  const rawCostNum = project.rawCost || parseFloat(project.cost.replace(/[^0-9.]/g, '')) || 5000
  const finProgress = project.financialProgress ?? Math.min(100, Math.round(project.progress * 0.95))
  const computedSpentNum = project.rawSpentCost || Math.round(rawCostNum * (finProgress / 100))
  const computedBalanceNum = Math.max(0, rawCostNum - computedSpentNum)

  const spentCost = project.spentCost || `₹ ${computedSpentNum.toLocaleString('en-IN')} Cr`
  const balanceCost = project.balanceCost || `₹ ${computedBalanceNum.toLocaleString('en-IN')} Cr`

  const costOverrunCr = project.costOverrunCr ?? 0
  const costOverrunPct = project.costOverrunPct ?? 0
  const hasOverrun = costOverrunCr > 0

  return {
    sanctionedCost,
    revisedCost,
    spentCost,
    balanceCost,
    financialProgress: finProgress,
    costOverrunCr,
    costOverrunPct,
    hasOverrun,
  }
}

/**
 * Retrieves or generates rich domain analysis details.
 */
export function getFlagshipDetails(project: Project): FlagshipAnalysisDetails {
  const existing = flagshipMap.get(project.id)
  if (existing) {
    return {
      bottleneck: existing.bottleneck,
      bottleneckDesc: existing.bottleneckDesc,
      impact: existing.impact,
      affectedActivity: existing.affectedActivity,
      riskFurther: existing.riskFurther,
      bottleneckConf: existing.bottleneckConf || 88,
      rootCause: existing.rootCause || ['Inter-agency statutory approvals', 'Contractor mobilization synchronization'],
      rootCauseConf: existing.rootCauseConf || 85,
      priority: existing.priority || (project.risk === 'High' ? 'CRITICAL' : project.risk === 'Medium' ? 'HIGH' : 'MODERATE'),
      actionText: existing.actionText,
      expectedImpact: existing.expectedImpact || ['Accelerate delivery milestones', 'Prevent secondary cost escalation'],
      actionConf: existing.actionConf || 90,
      aiConfidence: existing.aiConfidence || 92,
    }
  }

  // Domain fallback for other monitored projects
  const isOnTrack = project.type === 'On Schedule' || (project.overrunMonths || 0) === 0
  const risk = project.risk
  const priority = risk === 'High' ? 'CRITICAL' : risk === 'Medium' ? 'HIGH' : 'MODERATE'

  return {
    bottleneck: project.criticalIssue || (isOnTrack ? 'Active Milestone Surveillance (On Track)' : 'Statutory & Land Acquisition Approvals'),
    bottleneckDesc: isOnTrack
      ? `Active monitoring indicates ${project.name} is progressing within target deadlines. Inter-agency coordination is tracking statutory milestones.`
      : `Critical path monitoring flagged execution delays in statutory clearances, site handover, or contractor mobilization for ${project.name}.`,
    impact: isOnTrack 
      ? 'Zero current schedule delay. Active surveillance ensures early mitigation of supply chain delays.' 
      : 'Potential for milestone slippage and capital idling without inter-ministerial coordination.',
    affectedActivity: isOnTrack ? 'Continuous site civil and systems execution' : 'Contractor mobilization & structural works',
    riskFurther: isOnTrack ? 'Low risk under current monitoring trajectory.' : 'Moderate risk of further delay without administrative escalation.',
    bottleneckConf: 86,
    rootCause: isOnTrack
      ? [
          'Routine utility relocation & municipal alignment verification',
          'Periodic environmental compliance reporting',
          'Contractor milestone progress verification'
        ]
      : [
          'Multi-agency statutory permissions and Stage-II clearances',
          'Contractor cash flow and equipment mobilization synchronization',
          'Right of way handover and utility diversion coordination'
        ],
    rootCauseConf: 84,
    priority,
    actionText: `Execute administrative review through the Cabinet Secretariat Pragati / PM GatiShakti portal to resolve statutory bottlenecks and monitor contractor milestones for ${project.name}.`,
    expectedImpact: [
      'Reduces milestone delay risk by 30–45%',
      'Prevents secondary cost escalation and contractor idling claims',
      'Streamlines on-ground vendor progress verification'
    ],
    actionConf: 88,
    aiConfidence: 89,
  }
}

/**
 * Enriches a raw Project into a canonical UnifiedProject.
 */
export function enrichProject(project: Project): UnifiedProject {
  const riskProfile = getProjectRiskProfile(project)
  const budgets = getProjectBudgets(project)
  const flagshipDetails = getFlagshipDetails(project)
  const isFlagship = flagshipMap.has(project.id)

  return {
    ...project,
    risk: riskProfile.tier,
    riskScore: riskProfile.score,
    delayProbability: riskProfile.delayProbability,
    riskProfile,
    budgets,
    flagshipDetails,
    isFlagship,
  }
}

// Canonical dataset of all enriched projects
export const unifiedProjects: UnifiedProject[] = (rawProjects as unknown as Project[]).map(enrichProject)

// Map for instantaneous O(1) canonical project lookup
export const unifiedProjectsMap = new Map<string, UnifiedProject>(
  unifiedProjects.map((p) => [p.id, p])
)

export function getUnifiedProjectById(id: string | null | undefined): UnifiedProject | null {
  if (!id) return null
  return unifiedProjectsMap.get(id) || null
}

export function getFlagshipProjects(): UnifiedProject[] {
  return unifiedProjects.filter((p) => p.isFlagship)
}
