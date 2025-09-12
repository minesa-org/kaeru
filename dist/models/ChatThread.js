import mongoose from "mongoose";
const { Schema } = mongoose;
const chatThreadSchema = new Schema({
    threadId: { type: String, required: true, unique: true },
    messages: [
        {
            role: { type: String, enum: ["user", "model"], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
chatThreadSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });
chatThreadSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
const ChatThread = mongoose.model("ChatThread", chatThreadSchema, "chatThreads");
export default ChatThread;
