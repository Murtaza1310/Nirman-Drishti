import { NextResponse } from 'next/server'
import projectsData from '@/lib/ongoing_projects.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').toLowerCase().trim()
    const state = searchParams.get('state') || 'All'
    const risk = searchParams.get('risk') || 'All'
    const type = searchParams.get('type') || 'All'
    const ministry = searchParams.get('ministry') || 'All'
    const sector = searchParams.get('sector') || 'All'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let filtered = projectsData.filter((p: any) => {
      if (state !== 'All' && !p.state.toLowerCase().includes(state.toLowerCase())) return false
      if (risk !== 'All' && p.risk !== risk) return false
      if (type !== 'All' && p.type !== type) return false
      if (ministry !== 'All' && !p.ministry.toLowerCase().includes(ministry.toLowerCase())) return false
      if (sector !== 'All' && !p.sector.toLowerCase().includes(sector.toLowerCase())) return false
      
      if (search) {
        const haystack = [p.name, p.id, p.state, p.ministry, p.sector, p.criticalIssue].join(' ').toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })

    const total = filtered.length
    const offset = (page - 1) * limit
    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      projects: paginated
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
