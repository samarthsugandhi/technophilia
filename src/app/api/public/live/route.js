import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const shortlisted = await Team.find({ shortlisted: true })
      .select('teamName leader.branch')
      .sort({ updatedAt: -1 });
      
    const winners = await Team.find({ winner: true })
      .select('teamName leader.branch members leader.name')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json({ shortlisted, winners }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch live data" }, { status: 500 });
  }
}
