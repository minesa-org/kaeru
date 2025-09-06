import { Schema, model } from "mongoose";
const userTagSchema = new Schema({
    name: { type: String, required: true, maxlength: 50 },
    content: { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
});
const userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    tags: { type: [userTagSchema], default: [] },
});
export const User = model("User", userSchema);
