import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { registrationId } = await req.json();

    if (!registrationId || registrationId.length < 5) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    await connectDB();
    
    const team = await Team.findOne({ registrationId });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.attendanceMarked) {
      return NextResponse.json({ error: "Attendance already marked", teamName: team.teamName }, { status: 400 });
    }

    team.attendanceMarked = true;
    await team.save();

    return NextResponse.json({ 
      message: "Attendance marked successfully",
      teamName: team.teamName,
      leaderName: team.leader.name 
    }, { status: 200 });
    
  } catch {
    return NextResponse.json({ error: "System failure" }, { status: 500 });
  }
}
