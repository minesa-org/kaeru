import mongoose from "mongoose";
const { Schema } = mongoose;
const messageSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    threadId: { type: String },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
messageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 });
const Message = mongoose.model("Message", messageSchema, "messages");
export default Message;
