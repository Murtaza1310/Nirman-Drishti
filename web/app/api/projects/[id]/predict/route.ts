import { NextResponse } from 'next/server'
import projectsData from '@/lib/ongoing_projects.json'
import { runPythonPrediction } from '@/lib/predictor'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const project = (projectsData as any[]).find(p => p.id === resolvedParams.id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const payload = {
      Sector: project.sector,
      State: project.state,
      Original_Cost_Cr: project.rawCost || 500,
      Revised_Cost_Cr: project.rawRevisedCost || project.rawCost || 500,
      Physical_Progress_Pct: project.progress || 50,
      Financial_Progress_Pct: project.progress ? Math.min(100, project.progress + 15) : 60,
      Planned_Duration_Months: 36,
      Cumulative_Expenditure_Cr: (project.rawCost || 500) * ((project.progress || 50) / 100)
    }

    const aiResult = await runPythonPrediction(payload)

    return NextResponse.json({
      project,
      ai_diagnosis: aiResult
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
