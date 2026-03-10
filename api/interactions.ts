import { MiniInteraction } from "@minesa-org/mini-interaction";

export const mini = new MiniInteraction({
	commandsDirectory: "src/commands",
	componentsDirectory: "src/components",
	utilsDirectory: "src/utils",
	timeoutConfig: {
		initialResponseTimeout: 30000,
		autoDeferSlowOperations: true,
		enableTimeoutWarnings: true,
		enableResponseDebugLogging: true,
	},
	debug: true,
});

export default mini.createNodeHandler();
