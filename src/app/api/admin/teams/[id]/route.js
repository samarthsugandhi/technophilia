import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongodb";
import Team from "../../../../../models/Team";
import { verifyAdminToken } from "../../../../../lib/auth";

export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    await Team.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Team deleted successfully", deletedId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/teams/[id]: database unavailable", error);
    return NextResponse.json(
      { error: "Database unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { updates } = body;

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    await connectDB();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Use $set so only provided fields are changed; everything else is preserved
    await Team.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: false });

    return NextResponse.json({ message: "Team updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/teams/[id]:", error);
    return NextResponse.json(
      { error: "Database unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }
}

