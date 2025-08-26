import { Schema, model } from "mongoose";
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
});
export const Guild = model("Guild", guildSchema);
