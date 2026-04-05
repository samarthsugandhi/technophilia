import { NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";

export async function GET(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await connectDB();
    const teams = await Team.find({}).sort({ createdAt: 1 });
    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/teams: database unavailable", error);
    return NextResponse.json(
      { error: "Database unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }
}

export async function PATCH(req) {
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

  const { teamId, field, value } = payload;
  if (!['shortlisted', 'winner', 'firstRunnerUp', 'secondRunnerUp', 'consolationAward', 'attendanceMarked'].includes(field)) {
    return NextResponse.json({ error: "Invalid field update" }, { status: 400 });
  }

  try {
    await connectDB();

    const updatePayload = { [field]: value };
    if (value === true && ["winner", "firstRunnerUp", "secondRunnerUp", "consolationAward"].includes(field)) {
      if (field !== "winner") updatePayload.winner = false;
      if (field !== "firstRunnerUp") updatePayload.firstRunnerUp = false;
      if (field !== "secondRunnerUp") updatePayload.secondRunnerUp = false;
      if (field !== "consolationAward") updatePayload.consolationAward = false;
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId, 
      updatePayload,
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/teams: database unavailable", error);
    return NextResponse.json(
      { error: "Database unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }
}
