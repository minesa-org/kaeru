import { MiniInteraction } from "@minesa-org/mini-interaction";
import { commands } from "../src/commands/index.ts";

export const mini = new MiniInteraction({
	commandsDirectory: false,
	timeoutConfig: {
		initialResponseTimeout: 30000,
		autoDeferSlowOperations: true,
	},
});

mini.useCommands(commands);

export default mini.createNodeHandler();