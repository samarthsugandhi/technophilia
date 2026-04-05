import mongoose from "mongoose";
import Team from "../src/models/Team.js";

const MONGODB_URI = "mongodb+srv://sangamgaddi17_db_user:GHF37w86RaQLryUI@cluster0.otcxywi.mongodb.net/?appName=Cluster0";

const teamData = {
  teamName: "Innovara",
  registrationId: "IS-TP-175",
  qrCode: "IS-TP-175",
  leader: {
    name: "Apoorva Joshi",
    usn: "2BA23CS016",
    semester: "6th Sem",
    email: "apoorvajoshika2005@gmail.com",
    phone: "8123520663",
    branch: "Computer Science and Engineering",
    stayType: "Hostel",
    hostelName: "Girls Hostel",
  },
  members: [
    {
      name: "Aishwarya C Billadi",
      semester: "6th Sem",
      usn: "2BA23CS005",
      email: "billadaishwarya@gmail.com",
      phone: "9449311134",
      branch: "Computer Science and Engineering",
      stayType: "Hostel",
      hostelName: "Girls Hostel",
    },
  ],
};

async function main() {
  await mongoose.connect(MONGODB_URI);

  const existing = await Team.findOne({ registrationId: teamData.registrationId });
  if (existing) {
    await Team.replaceOne({ _id: existing._id }, { ...teamData, _id: existing._id });
    console.log(`Updated existing team ${teamData.registrationId}`);
  } else {
    await Team.create(teamData);
    console.log(`Inserted team ${teamData.registrationId}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
