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

        // 1. Remove admin rights from everyone
        const removeResult = await usersCollection.updateMany(
            {},
            { $set: { isAdmin: false, canUseVoiceAssistant: false } }
        );
        console.log(`Removed admin rights from ${removeResult.modifiedCount} users.`);

        // 2. Grant admin rights ONLY to sarangan365@gmail.com
        const grantResult = await usersCollection.updateOne(
            { email: "sarangan365@gmail.com" },
            { $set: { isAdmin: true, canUseVoiceAssistant: true } }
        );
        console.log(`Granted admin rights to ${grantResult.modifiedCount} user (sarangan365@gmail.com).`);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
