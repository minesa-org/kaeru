import { Schema, model, Document } from "mongoose";

export interface IServerTag {
	name: string;
	content: string;
	userId: string;
	createdAt: Date;
}

export interface IGuild extends Document {
	guildId: string;
	staffRoleId?: string | null;
	loggingChannelId?: string | null;
	hubChannelId?: string | null;
	imageChannel?: {
		channelId: string | null;
		postCount: number;
	};
	warnings: Map<string, number>;
	tags: IServerTag[];
}

const serverTagSchema = new Schema<IServerTag>({
	name: { type: String, required: true, maxlength: 50 },
	content: { type: String, required: true, maxlength: 2000 },
	userId: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
});

const guildSchema = new Schema<IGuild>({
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
		default: new Map<string, number>(),
	},
	tags: { type: [serverTagSchema], default: [] },
});

export const Guild = model<IGuild>("Guild", guildSchema);
