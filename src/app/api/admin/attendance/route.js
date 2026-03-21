import { NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";
import { markMockAttendance } from "../../../../lib/adminMockTeams";

export async function POST(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { registrationId } = payload;
  if (!registrationId || registrationId.length < 5) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  try {
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
    
  } catch (error) {
    console.error("POST /api/admin/attendance: database unavailable, trying mock attendance", error);
    const result = markMockAttendance(registrationId);

    if (result.status === "not_found") {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (result.status === "already_marked") {
      return NextResponse.json(
        { error: "Attendance already marked", teamName: result.team.teamName },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Attendance marked successfully",
        teamName: result.team.teamName,
        leaderName: result.team.leader.name,
      },
      { status: 200, headers: { "x-admin-data-source": "mock" } }
    );
  }
}
