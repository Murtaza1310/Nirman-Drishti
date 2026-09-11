import { NextResponse } from 'next/server'
import projectsData from '@/lib/ongoing_projects.json'

export async function GET() {
  try {
    const sectorMap: Record<string, { total: number; delayed: number; highRisk: number; costCr: number }> = {}
    const stateMap: Record<string, { total: number; delayed: number; highRisk: number; costCr: number }> = {}

    for (const p of projectsData as any[]) {
      const sec = p.sector || 'Other'
      if (!sectorMap[sec]) sectorMap[sec] = { total: 0, delayed: 0, highRisk: 0, costCr: 0 }
      sectorMap[sec].total += 1
      if (p.type === 'Delayed') sectorMap[sec].delayed += 1
      if (p.risk === 'High') sectorMap[sec].highRisk += 1
      sectorMap[sec].costCr += (p.rawCost || 0)

      const st = p.state || 'Multi-State'
      if (!stateMap[st]) stateMap[st] = { total: 0, delayed: 0, highRisk: 0, costCr: 0 }
      stateMap[st].total += 1
      if (p.type === 'Delayed') stateMap[st].delayed += 1
      if (p.risk === 'High') stateMap[st].highRisk += 1
      stateMap[st].costCr += (p.rawCost || 0)
    }

    const sectors = Object.entries(sectorMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)

    const states = Object.entries(stateMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      sectors,
      states,
      totalTracked: projectsData.length
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
