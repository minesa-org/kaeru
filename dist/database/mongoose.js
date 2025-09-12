import { header, log } from "../utils/export.js";
import mongoose, { connect } from "mongoose";
let connection = null;
export async function initializeMongoose() {
    header("Database Connection");
    if (connection) {
        log("info", "Reusing existing MongoDB connection");
        return connection;
    }
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        // Register Mongoose event listeners
        mongoose.connection.on("connected", () => log("info", "Mongoose connected successfully"));
        mongoose.connection.on("disconnected", () => log("warning", "Mongoose disconnected"));
        mongoose.connection.on("error", err => log("error", "Mongoose connection error:", err));
        mongoose.connection.on("reconnected", () => log("info", "Mongoose reconnected successfully"));
        mongoose.connection.on("close", () => log("warning", "Mongoose connection closed"));
        await connect(uri);
        connection = mongoose.connection;
        console.log("\n");
        return connection;
    }
    catch (error) {
        log("error", "Failed to connect to MongoDB:", error);
        throw error;
    }
}
export function getMongooseConnection() {
    return connection;
}
