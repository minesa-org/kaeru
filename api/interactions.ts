import { MiniInteraction } from "@minesa-org/mini-interaction";

export const mini = new MiniInteraction({
	debug: process.env.NODE_ENV !== "production", // Optional debug flag
});

export default mini.createNodeHandler();