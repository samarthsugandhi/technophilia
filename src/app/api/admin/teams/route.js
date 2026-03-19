import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const teams = await Team.find({}).sort({ createdAt: -1 });
    return NextResponse.json(teams, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { teamId, field, value } = await req.json(); // field can be 'shortlisted' or 'winner'
    
    if (!['shortlisted', 'winner'].includes(field)) {
      return NextResponse.json({ error: "Invalid field update" }, { status: 400 });
    }

    await connectDB();
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId, 
      { [field]: value }, 
      { new: true }
    );

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
