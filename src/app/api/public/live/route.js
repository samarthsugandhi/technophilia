import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const shortlisted = await Team.find({ shortlisted: true })
      .select('teamName registrationId')
      .sort({ updatedAt: -1 });

    const winnerTeams = await Team.find({
      $or: [{ winner: true }, { firstRunnerUp: true }, { secondRunnerUp: true }],
    })
      .select('teamName leader.branch members leader.name winner firstRunnerUp secondRunnerUp')
      .sort({ updatedAt: -1 });

    const winners = winnerTeams
      .map((team) => {
        const entries = [];
        if (team.winner) {
          entries.push({ ...team.toObject(), awardRank: "winner", awardLabel: "Winner", awardOrder: 1 });
        }
        if (team.firstRunnerUp) {
          entries.push({ ...team.toObject(), awardRank: "firstRunnerUp", awardLabel: "1st Runner-up", awardOrder: 2 });
        }
        if (team.secondRunnerUp) {
          entries.push({ ...team.toObject(), awardRank: "secondRunnerUp", awardLabel: "2nd Runner-up", awardOrder: 3 });
        }
        return entries;
      })
      .flat()
      .sort((a, b) => a.awardOrder - b.awardOrder);

    return NextResponse.json({ shortlisted, winners }, { status: 200 });
  } catch (error) {
    console.error("GET /api/public/live: database unavailable", error);
    return NextResponse.json(
      { error: "Database unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }
}
