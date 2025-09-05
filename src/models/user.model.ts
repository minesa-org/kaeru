import { Schema, model, Document } from "mongoose";

export interface IUserTag {
	name: string;
	content: string;
	createdAt: Date;
}

export interface IUser extends Document {
	userId: string;
	tags: IUserTag[];
}

const userTagSchema = new Schema<IUserTag>({
	name: { type: String, required: true, maxlength: 50 },
	content: { type: String, required: true, maxlength: 2000 },
	createdAt: { type: Date, default: Date.now },
});

const userSchema = new Schema<IUser>({
	userId: { type: String, required: true, unique: true },
	tags: { type: [userTagSchema], default: [] },
});

export const User = model<IUser>("User", userSchema);
