import { MiniInteraction } from "@minesa-org/mini-interaction";

export const mini = new MiniInteraction({
	timeoutConfig: {
		initialResponseTimeout: 30000,
		autoDeferSlowOperations: true,
	},
});

export default mini.createNodeHandler();