import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Team from "../../../../models/Team";

export async function POST(req) {
  try {
    const body = await req.json();
    const usns = Array.isArray(body?.usns)
      ? body.usns.map((v) => String(v || "").trim().toUpperCase()).filter(Boolean)
      : [];
    const emails = Array.isArray(body?.emails)
      ? body.emails.map((v) => String(v || "").trim().toLowerCase()).filter(Boolean)
      : [];

    if (!usns.length && !emails.length) {
      return NextResponse.json({ hasDuplicate: false }, { status: 200 });
    }

    await connectDB();

    let duplicateUsn = "";
    let duplicateEmail = "";

    if (usns.length) {
      const usnRegex = usns.map((u) => new RegExp(`^${u}$`, "i"));
      const teamWithUsn = await Team.findOne({
        $or: [
          { "leader.usn": { $in: usnRegex } },
          { "members.usn": { $in: usnRegex } },
        ],
      })
        .select("leader.usn members.usn")
        .lean();

      if (teamWithUsn) {
        const dbUsns = [
          String(teamWithUsn?.leader?.usn || "").trim().toUpperCase(),
          ...(teamWithUsn?.members || []).map((m) => String(m?.usn || "").trim().toUpperCase()),
        ];
        duplicateUsn = usns.find((u) => dbUsns.includes(u)) || "";
      }
    }

    if (emails.length) {
      const emailRegex = emails.map((e) => new RegExp(`^${e}$`, "i"));
      const teamWithEmail = await Team.findOne({
        $or: [
          { "leader.email": { $in: emailRegex } },
          { "members.email": { $in: emailRegex } },
        ],
      })
        .select("leader.email members.email")
        .lean();

      if (teamWithEmail) {
        const dbEmails = [
          String(teamWithEmail?.leader?.email || "").trim().toLowerCase(),
          ...(teamWithEmail?.members || []).map((m) => String(m?.email || "").trim().toLowerCase()),
        ];
        duplicateEmail = emails.find((e) => dbEmails.includes(e)) || "";
      }
    }

    return NextResponse.json(
      {
        hasDuplicate: Boolean(duplicateUsn || duplicateEmail),
        duplicateUsn,
        duplicateEmail,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { hasDuplicate: false, unavailable: true },
      { status: 200 }
    );
  }
}
