import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { verifyAdminToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    // Verify admin token
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

    const { id } = params;

    // Find and delete team
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
    console.error("DELETE /api/admin/teams/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
