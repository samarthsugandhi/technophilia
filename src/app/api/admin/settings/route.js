import { NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/mongodb";
import Settings from "../../../../models/Settings";

export async function GET(req) {
  try {
    await connectDB();
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({ isRegistrationOpen: true });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
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

  try {
    const { isRegistrationOpen } = await req.json();
    await connectDB();
    
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({ isRegistrationOpen });
    } else {
      settings.isRegistrationOpen = isRegistrationOpen;
    }
    
    await settings.save();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
