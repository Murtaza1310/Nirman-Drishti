import { NextResponse } from 'next/server'
import projectsData from '@/lib/ongoing_projects.json'

export async function GET() {
  try {
    const totalProjects = projectsData.length
    const onScheduleProjects = projectsData.filter(p => p.type === 'On Schedule').length
    const delayedProjects = projectsData.filter(p => p.type === 'Delayed').length
    const highRiskProjects = projectsData.filter(p => p.risk === 'High').length
    
    const totalCostCr = projectsData.reduce((acc, p) => acc + (p.rawCost || 0), 0)
    const totalCostOverrunCr = projectsData.reduce((acc, p) => acc + (p.costOverrunCr || 0), 0)
    const costVariancePct = totalCostCr > 0 ? (totalCostOverrunCr / totalCostCr) * 100 : 0

    const formatCr = (val: number) => {
      if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh Cr`
      if (val >= 1000) return `₹ ${(val / 1000).toFixed(2)}k Cr`
      return `₹ ${val.toFixed(2)} Cr`
    }

    return NextResponse.json({
      metrics: [
        {
          label: 'TOTAL PROJECTS',
          value: totalProjects.toLocaleString(),
          note: 'Active ongoing national initiatives',
          tag: '100% Tracked',
          tone: 'blue',
          count: totalProjects
        },
        {
          label: 'ON SCHEDULE PROJECTS',
          value: onScheduleProjects.toLocaleString(),
          note: 'Healthy milestone adherence',
          tag: `${((onScheduleProjects / totalProjects) * 100).toFixed(1)}% Ratio`,
          tone: 'green',
          count: onScheduleProjects
        },
        {
          label: 'DELAYED PROJECTS',
          value: delayedProjects.toLocaleString(),
          note: 'Past original completion schedule',
          tag: `${((delayedProjects / totalProjects) * 100).toFixed(1)}% Ratio`,
          tone: 'orange',
          count: delayedProjects
        },
        {
          label: 'HIGH RISK / PREDICTED DELAY',
          value: highRiskProjects.toLocaleString(),
          note: 'AI early warning alerts (National Portfolio)',
          tag: 'Urgent Action',
          tone: 'red',
          count: highRiskProjects
        },
        {
          label: 'TOTAL PROJECT COST',
          value: formatCr(totalCostCr),
          note: 'Original approved allocation',
          tag: 'Sanctioned',
          tone: 'blue',
          rawCostCr: totalCostCr
        },
        {
          label: 'TOTAL COST OVERRUN',
          value: formatCr(totalCostOverrunCr),
          note: 'Cumulative budget variance',
          tag: `${costVariancePct.toFixed(2)}% Variance`,
          tone: 'orange',
          rawOverrunCr: totalCostOverrunCr
        }
      ]
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
