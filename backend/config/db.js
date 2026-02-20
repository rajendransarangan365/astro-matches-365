import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = (process.env.MONGODB_URI || "").trim();
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
});

let db, usersCollection, matchesCollection, profilesCollection;

export const connectToDb = async () => {
    if (db) return { usersCollection, matchesCollection, profilesCollection };
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected successfully to MongoDB");
        db = client.db("astro365");
        usersCollection = db.collection("users");
        matchesCollection = db.collection("matches");
        profilesCollection = db.collection("profiles");
        return { usersCollection, matchesCollection, profilesCollection };
    } catch (error) {
        console.error("MongoDB Connection Error Details:", {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack
        });
        throw error;
    }
};
