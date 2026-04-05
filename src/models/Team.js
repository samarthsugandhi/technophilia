import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  registrationId: { type: String, required: true, unique: true },
  qrCode: { type: String }, // Can store base64 string or just generate on client with registrationId
  leader: {
    name: { type: String, required: true },
    usn: { type: String, required: true },
    semester: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    branch: { type: String, required: true },
    stayType: { type: String, required: true, enum: ['Local', 'Hostel'] },
    hostelName: { type: String } // optional, only if stayType === 'Hostel'
  },
  members: {
    type: [{
      name: { type: String, required: true },
      semester: { type: String, required: true },
      usn: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      branch: { type: String, required: true },
      stayType: { type: String, required: true, enum: ['Local', 'Hostel'] },
      hostelName: { type: String },
    }],
    validate: [arrayLimit, '{PATH} must have at most 1 member']
  },
  attendanceMarked: { type: Boolean, default: false },
  shortlisted: { type: Boolean, default: false },
  winner: { type: Boolean, default: false },
  firstRunnerUp: { type: Boolean, default: false },
  secondRunnerUp: { type: Boolean, default: false },
  consolationAward: { type: Boolean, default: false },
}, { timestamps: true });

function arrayLimit(val) {
  return val.length <= 1;
}

// Global Uniqueness Check
teamSchema.pre('save', async function() {
  const members = Array.isArray(this.members) ? this.members : [];
  const usns = [this.leader?.usn, ...members.map((m) => m?.usn)]
    .map((v) => String(v || '').trim().toUpperCase())
    .filter(Boolean);
  const emails = [this.leader?.email, ...members.map((m) => m?.email)]
    .map((v) => String(v || '').trim().toLowerCase())
    .filter(Boolean);
  
  // Check internal uniqueness
  if ((new Set(usns)).size !== usns.length) {
    const e = new Error("Duplicate USN/CSN in this team. Please change and retry.");
    e.status = 409;
    throw e;
  }
  if ((new Set(emails)).size !== emails.length) {
    const e = new Error("Duplicate email in this team. Please change and retry.");
    e.status = 409;
    throw e;
  }

  // Check global DB uniqueness
  const existingUSN = await this.constructor.findOne({
    $or: [
      { "leader.usn": { $in: usns } },
      { "members.usn": { $in: usns } }
    ],
    _id: { $ne: this._id } // skip self on updates
  });
  
  if (existingUSN) {
    const e = new Error("USN/CSN already registered globally. Please change and retry.");
    e.status = 409;
    throw e;
  }

  const existingEmail = await this.constructor.findOne({
    $or: [
      { "leader.email": { $in: emails } },
      { "members.email": { $in: emails } }
    ],
    _id: { $ne: this._id }
  });
  
  if (existingEmail) {
    const e = new Error("Email already registered globally. Please change and retry.");
    e.status = 409;
    throw e;
  }

});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team;
