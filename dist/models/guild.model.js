import { Schema, model } from "mongoose";
const serverTagSchema = new Schema({
    name: { type: String, required: true, maxlength: 50 },
    content: { type: String, required: true, maxlength: 2000 },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const guildSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    staffRoleId: { type: String, default: null },
    loggingChannelId: { type: String, default: null },
    hubChannelId: { type: String, default: null },
    imageChannel: {
        channelId: { type: String, default: null },
        postCount: { type: Number, default: 0 },
    },
    warnings: {
        type: Map,
        of: Number,
        default: new Map(),
    },
    tags: { type: [serverTagSchema], default: [] },
});
export const Guild = model("Guild", guildSchema);
