import connectDB from "../../../lib/mongodb";
import Team from "../../../models/Team";
import { z } from "zod";
import crypto from "crypto";
import { NextResponse } from "next/server";

function generateRegistrationId(count, attempt) {
  const numId = count + 1 + attempt;
  return `BA-IS-${String(numId).padStart(3, '0')}`;
}

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
  members: z.array(memberSchema).length(1, "Must have exactly 1 additional member"),
}).superRefine((data, ctx) => {
  const requiresCSN = (semester) => semester === "1st Sem" || semester === "2nd Sem";
  const isCSN = (value) => /^\d{10}$/.test(String(value || "").trim());
  const isUSN = (value) => /^2BA\d{2}[A-Z]{2}\d{3}$/i.test(String(value || "").trim());

  const leaderNeedsCSN = requiresCSN(data.leader.semester);
  if (leaderNeedsCSN && !isCSN(data.leader.usn)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["leader", "usn"],
      message: "Leader CSN must be a valid 10-digit number",
    });
  }
  if (!leaderNeedsCSN && !isUSN(data.leader.usn)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["leader", "usn"],
      message: "Leader USN must be in format 2BA23IS080",
    });
  }

  data.members.forEach((member, index) => {
    const memberNeedsCSN = requiresCSN(member.semester);
    if (memberNeedsCSN && !isCSN(member.usn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["members", index, "usn"],
        message: `Member ${index + 2} CSN must be a valid 10-digit number`,
      });
    }
    if (!memberNeedsCSN && !isUSN(member.usn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["members", index, "usn"],
        message: `Member ${index + 2} USN must be in format 2BA23IS080`,
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
    try {
      await connectDB();
    } catch (dbError) {
      console.error("Registration DB connection failed:", dbError);
      return NextResponse.json(
        { error: "Database unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }

    // Create Team (retry if registrationId collides)
    let savedTeam = null;
    let registrationId = "";

    const baseCount = await Team.countDocuments();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      registrationId = generateRegistrationId(baseCount, attempt);

      try {
        const newTeam = new Team({
          ...payload,
          registrationId,
          qrCode: registrationId,
        });

        // Mongoose pre-save throws error on validation / dupe checks
        savedTeam = await newTeam.save();
        break;
      } catch (saveError) {
        const isRegistrationIdCollision =
          saveError?.code === 11000 && saveError?.keyPattern?.registrationId;

        if (isRegistrationIdCollision) {
          continue;
        }

        throw saveError;
      }
    }

    if (!savedTeam) {
      return NextResponse.json(
        { error: "Failed to generate unique registration ID. Please retry." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      message: "Registration successful",
      registrationId,
      teamId: savedTeam._id,
    }, { status: 201 });

  } catch (error) {
    console.error("Registration API Error:", error);

    if (error?.code === 11000) {
      if (error?.keyPattern?.registrationId) {
        return NextResponse.json(
          { error: "Registration ID collision. Please retry registration." },
          { status: 409 }
        );
      }

      if (error?.keyPattern?.["leader.email"] || error?.keyPattern?.["members.email"]) {
        return NextResponse.json(
          { error: "Email already registered globally. Please change and retry." },
          { status: 409 }
        );
      }

      if (error?.keyPattern?.["leader.usn"] || error?.keyPattern?.["members.usn"]) {
        return NextResponse.json(
          { error: "USN/CSN already registered globally. Please change and retry." },
          { status: 409 }
        );
      }
    }
    
    if (error.status === 409 || error.message.includes("registered") || error.message.includes("Duplicate")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
