const FIRST_NAMES = [
  "Aarav",
  "Ananya",
  "Vihaan",
  "Diya",
  "Reyansh",
  "Ishita",
  "Kabir",
  "Mira",
  "Arjun",
  "Saanvi",
  "Rohan",
  "Meera",
  "Nikhil",
  "Pooja",
  "Karthik",
  "Sneha",
  "Aditya",
  "Nisha",
  "Harsha",
  "Tanvi",
];

const LAST_NAMES = [
  "Sharma",
  "Patil",
  "Rao",
  "Nair",
  "Shetty",
  "Kulkarni",
  "Gowda",
  "Kumar",
  "Joshi",
  "Bhat",
];

const BRANCHES = ["CSE", "ISE", "ECE", "EEE", "ME", "CE", "AIML", "DS"];
const SEMESTERS = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];
const HOSTELS = ["Aryabhata", "Vivekananda", "Nehru", "Bhagat Singh", "Kalpana Chawla"];

function seededRandomFactory(seed = 20260320) {
  let value = seed >>> 0;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

function makeName(random) {
  return `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`;
}

function buildParticipant(random, teamIndex, memberIndex, branch, semester) {
  const ordinal = teamIndex * 3 + memberIndex + 1;
  const isJunior = semester === "1st Sem" || semester === "2nd Sem";
  const usnPrefix = isJunior ? "CSN" : "USN";
  const stayType = random() > 0.55 ? "Hostel" : "Local";

  return {
    name: makeName(random),
    semester,
    usn: `${usnPrefix}${String(2600 + ordinal).padStart(4, "0")}`,
    email: `team${teamIndex + 1}.member${memberIndex + 1}@technophilia.test`,
    branch,
    stayType,
    hostelName: stayType === "Hostel" ? pick(random, HOSTELS) : "",
  };
}

function buildMockTeam(random, teamIndex) {
  const semester = pick(random, SEMESTERS);
  const branch = pick(random, BRANCHES);
  const leader = buildParticipant(random, teamIndex, 0, branch, semester);
  const memberOne = buildParticipant(random, teamIndex, 1, branch, semester);
  const memberTwo = buildParticipant(random, teamIndex, 2, branch, semester);

  const createdAt = new Date(Date.now() - teamIndex * 60 * 60 * 1000).toISOString();
  const isWinner = teamIndex === 0;
  const isFirstRunnerUp = teamIndex === 1;
  const isSecondRunnerUp = teamIndex === 2;

  return {
    _id: `mock-${teamIndex + 1}`,
    teamName: `Team ${pick(random, ["Quantum", "Binary", "Nebula", "Circuit", "Velocity", "Lambda", "Titan", "Pulse"])} ${teamIndex + 1}`,
    registrationId: `TECH2026-M${String(teamIndex + 1).padStart(3, "0")}`,
    qrCode: `TECH2026-M${String(teamIndex + 1).padStart(3, "0")}`,
    leader: {
      ...leader,
      phone: `${Math.floor(7000000000 + random() * 1999999999)}`,
    },
    members: [memberOne, memberTwo],
    attendanceMarked: random() > 0.35,
    shortlisted: random() > 0.6 || isWinner || isFirstRunnerUp || isSecondRunnerUp,
    winner: isWinner,
    firstRunnerUp: isFirstRunnerUp,
    secondRunnerUp: isSecondRunnerUp,
    createdAt,
    updatedAt: createdAt,
  };
}

function generateMockTeams(count = 18) {
  const random = seededRandomFactory();
  return Array.from({ length: count }, (_, index) => buildMockTeam(random, index));
}

function getStore() {
  if (!globalThis.__TECHNOPHILIA_ADMIN_MOCK_TEAMS__) {
    globalThis.__TECHNOPHILIA_ADMIN_MOCK_TEAMS__ = generateMockTeams();
  }
  return globalThis.__TECHNOPHILIA_ADMIN_MOCK_TEAMS__;
}

export function getMockTeams() {
  return [...getStore()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateMockTeam(teamId, field, value) {
  const store = getStore();
  const index = store.findIndex((team) => team._id === teamId);
  if (index === -1) return null;

  const updated = {
    ...store[index],
    [field]: value,
    updatedAt: new Date().toISOString(),
  };

  if (value === true && ["winner", "firstRunnerUp", "secondRunnerUp"].includes(field)) {
    if (field !== "winner") updated.winner = false;
    if (field !== "firstRunnerUp") updated.firstRunnerUp = false;
    if (field !== "secondRunnerUp") updated.secondRunnerUp = false;
  }

  store[index] = updated;
  return updated;
}

export function deleteMockTeam(teamId) {
  const store = getStore();
  const index = store.findIndex((team) => team._id === teamId);
  if (index === -1) return false;

  store.splice(index, 1);
  return true;
}

export function markMockAttendance(registrationId) {
  const store = getStore();
  const id = String(registrationId || "").trim().toUpperCase();

  const team = store.find((item) => String(item.registrationId).toUpperCase() === id);
  if (!team) return { status: "not_found" };
  if (team.attendanceMarked) return { status: "already_marked", team };

  team.attendanceMarked = true;
  team.updatedAt = new Date().toISOString();
  return { status: "success", team };
}
