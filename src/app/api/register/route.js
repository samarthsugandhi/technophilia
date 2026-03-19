import connectDB from "../../../lib/mongodb";
import Team from "../../../models/Team";
import { z } from "zod";
import crypto from "crypto";
import { NextResponse } from "next/server";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  semester: z.string().min(1, "Semester is required"),
  usn: z.string().min(1, "USN/CSN is required"),
  email: z.string().email("Invalid email format"),
  branch: z.string().min(1, "Branch is required"),
  stayType: z.enum(['Local', 'Hostel']),
  hostelName: z.string().optional(),
  hostel: z.string().optional(),
});

const registerSchema = z.object({
  teamName: z.string().min(1, "Team Name is required"),
  leader: z.object({
    name: z.string().min(1, "Leader name required"),
    usn: z.string().min(1, "Leader USN required"),
    semester: z.string().min(1, "Semester required"),
    email: z.string().email("Leader email required"),
    phone: z.string().regex(/^\d{10}$/, "Valid 10-digit phone number required"),
    branch: z.string().min(1, "Branch required"),
    stayType: z.enum(['Local', 'Hostel']),
    hostelName: z.string().optional(),
    hostel: z.string().optional(),
  }),
  members: z.array(memberSchema).length(2, "Must securely have exactly 2 members"),
}).superRefine((data, ctx) => {
  const requiresCSN = (semester) => semester === "1st Sem" || semester === "2nd Sem";
  const isCSN = (value) => String(value || "").trim().toUpperCase().startsWith("CSN");
  const isUSN = (value) => String(value || "").trim().toUpperCase().startsWith("USN");

  const leaderNeedsCSN = requiresCSN(data.leader.semester);
  if (leaderNeedsCSN && !isCSN(data.leader.usn)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["leader", "usn"],
      message: "Leader must use CSN for 1st/2nd semester",
    });
  }
  if (!leaderNeedsCSN && !isUSN(data.leader.usn)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["leader", "usn"],
      message: "Leader must use USN for 3rd-8th semester",
    });
  }

  data.members.forEach((member, index) => {
    const memberNeedsCSN = requiresCSN(member.semester);
    if (memberNeedsCSN && !isCSN(member.usn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["members", index, "usn"],
        message: `Member ${index + 2} must use CSN for 1st/2nd semester`,
      });
    }
    if (!memberNeedsCSN && !isUSN(member.usn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["members", index, "usn"],
        message: `Member ${index + 2} must use USN for 3rd-8th semester`,
      });
    }
  });
});

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Zod Validation
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ 
        error: "Validation Error", 
        details: parsedData.error.issues 
      }, { status: 400 });
    }

    const payload = {
      ...parsedData.data,
      leader: {
        ...parsedData.data.leader,
        hostelName: parsedData.data.leader.hostelName || parsedData.data.leader.hostel || "",
      },
      members: parsedData.data.members.map((member) => ({
        ...member,
        hostelName: member.hostelName || member.hostel || "",
      })),
    };

    if (payload.leader.stayType === "Hostel" && !payload.leader.hostelName) {
      return NextResponse.json({ error: "Hostel is required for Hostel stay type" }, { status: 400 });
    }

    for (const member of payload.members) {
      if (member.stayType === "Hostel" && !member.hostelName) {
        return NextResponse.json({ error: "Hostel is required for members selecting Hostel stay type" }, { status: 400 });
      }
    }

    // Connect to DB
    await connectDB();

    // Generate unique TECH ID
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const registrationId = `TECH2026-${randomHex}`;

    // Create Team
    const newTeam = new Team({
      ...payload,
      registrationId,
      qrCode: registrationId,
    });

    // Mongoose pre-save throws error on validation / dupe checks
    await newTeam.save();

    return NextResponse.json({
      message: "Registration successful",
      registrationId,
      teamId: newTeam._id,
    }, { status: 201 });

  } catch (error) {
    console.error("Registration API Error:", error);
    
    if (error.status === 409 || error.message.includes("registered") || error.message.includes("Duplicate")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
