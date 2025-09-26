import mongoose from "mongoose";
import { config } from "dotenv";
config();
const userDataSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    timelapseCount: { type: Number, default: 0 },
    ticketCount: { type: Number, default: 0 },
    resolvedTickets: { type: Number, default: 0 },
    ticketResolutions: [
        {
            guildId: String,
            threadId: String,
            resolvedAt: { type: Date, default: Date.now },
            resolvedBy: String,
            resolutionType: {
                type: String,
                enum: ["completed", "duplicate", "comment"],
                default: "completed",
            },
        },
    ],
    lastResolutionTime: Date,
    resolutionsToday: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
    guildsWithResolutions: [String],
});
const UserDataModel = mongoose.model("UserData", userDataSchema);
async function connectToDB() {
    if (mongoose.connection.readyState === 1)
        return;
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to mongodb");
    }
    catch (error) {
        console.error("❌ MongoDB error:", error);
        throw error;
    }
}
export async function incrementTimelapseCount(userId) {
    try {
        await connectToDB();
        await UserDataModel.findOneAndUpdate({ userId }, { $inc: { timelapseCount: 1 } }, { upsert: true });
        console.log(`✅ Timelapse count incremented for user ${userId}`);
    }
    catch (error) {
        console.error(`❌ Failed to increment timelapse for user ${userId}:`, error);
        throw error;
    }
}
export async function getUserData(userId) {
    try {
        await connectToDB();
        const userData = await UserDataModel.findOne({ userId });
        console.log(`✅ User data retrieved for user ${userId}`);
        return userData;
    }
    catch (error) {
        console.error(`❌ Failed to get user data for user ${userId}:`, error);
        throw error;
    }
}
export async function setTimelapseCount(userId, count) {
    try {
        await connectToDB();
        await UserDataModel.findOneAndUpdate({ userId }, { timelapseCount: count }, { upsert: true });
        console.log(`✅ Timelapse count set to ${count} for user ${userId}`);
    }
    catch (error) {
        console.error(`❌ Failed to set timelapse count for user ${userId}:`, error);
        throw error;
    }
}
export async function setTicketCount(userId, count) {
    try {
        await connectToDB();
        await UserDataModel.findOneAndUpdate({ userId }, { ticketCount: count }, { upsert: true });
        console.log(`✅ Ticket count set to ${count} for user ${userId}`);
    }
    catch (error) {
        console.error(`❌ Failed to set ticket count for user ${userId}:`, error);
        throw error;
    }
}
export async function recordTicketResolution(userId, guildId, threadId, resolvedBy, resolutionType = "completed") {
    try {
        await connectToDB();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const userData = await UserDataModel.findOne({ userId });
        if (userData) {
            const lastReset = userData.lastResetDate ? new Date(userData.lastResetDate) : new Date(0);
            const lastResetDay = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
            if (today.getTime() !== lastResetDay.getTime()) {
                await UserDataModel.findOneAndUpdate({ userId }, {
                    resolutionsToday: 0,
                    lastResetDate: now,
                });
            }
            if (userData.resolutionsToday >= 5) {
                console.warn(`⚠️ User ${userId} has reached daily resolution limit`);
                return false;
            }
            if (userData.lastResolutionTime) {
                const timeSinceLastResolution = now.getTime() - userData.lastResolutionTime.getTime();
                const tenMinutes = 10 * 60 * 1000;
                if (timeSinceLastResolution < tenMinutes) {
                    console.warn(`⚠️ User ${userId} is rate limited for ticket resolutions`);
                    return false;
                }
            }
            const guildsWithResolutions = userData.guildsWithResolutions || [];
            if (!guildsWithResolutions.includes(guildId) && guildsWithResolutions.length >= 3) {
                console.warn(`⚠️ User ${userId} has resolved tickets in too many guilds`);
                return false;
            }
        }
        const shouldIncrementCounter = resolutionType === "completed";
        const updateData = {
            $push: {
                ticketResolutions: {
                    guildId,
                    threadId,
                    resolvedAt: now,
                    resolvedBy,
                    resolutionType,
                },
            },
            $inc: {
                resolutionsToday: 1,
            },
            $set: {
                lastResolutionTime: now,
            },
            $addToSet: {
                guildsWithResolutions: guildId,
            },
        };
        if (shouldIncrementCounter) {
            updateData.$inc.resolvedTickets = 1;
        }
        await UserDataModel.findOneAndUpdate({ userId }, updateData, { upsert: true });
        console.log(`✅ Ticket resolution recorded for user ${userId} in guild ${guildId} (type: ${resolutionType})`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to record ticket resolution for user ${userId}:`, error);
        throw error;
    }
}
export async function getResolvedTicketCount(userId) {
    try {
        await connectToDB();
        const userData = await UserDataModel.findOne({ userId });
        return userData?.resolvedTickets || 0;
    }
    catch (error) {
        console.error(`❌ Failed to get resolved ticket count for user ${userId}:`, error);
        throw error;
    }
}
