import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sangamgaddi17_db_user:GHF37w86RaQLryUI@cluster0.otcxywi.mongodb.net/?appName=Cluster0";

async function resetDB() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('teams')) {
      const result = await db.collection('teams').deleteMany({});
      console.log(`Successfully cleared 'teams' collection. Deleted ${result.deletedCount} documents.`);
    } else {
      console.log("'teams' collection not found or already empty.");
    }

    console.log("Reset complete. Closing connection...");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error during DB reset:", err);
    process.exit(1);
  }
}

resetDB();
