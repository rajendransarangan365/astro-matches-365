import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = (process.env.MONGODB_URI || "").trim();
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db("astro365");
        const usersCollection = db.collection("users");

        // Update all users to be an admin for testing purposes
        const result = await usersCollection.updateMany(
            {},
            { $set: { isAdmin: true, canUseVoiceAssistant: true } }
        );

        console.log(`Updated ${result.modifiedCount} users to be admins.`);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
