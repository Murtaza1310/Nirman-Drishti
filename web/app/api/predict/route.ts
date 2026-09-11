import { NextResponse } from 'next/server'
import { runPythonPrediction } from '@/lib/predictor'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const aiResult = await runPythonPrediction(body)
    return NextResponse.json(aiResult)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
