import { MessageFlags } from "discord.js";
import { log } from "../utils/export.js";
import { Events } from "discord.js";
const interactionCreateEvent = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction) => {
        try {
            if (interaction.isContextMenuCommand()) {
                const command = interaction.client.commands?.get(interaction.commandName);
                if (!command) {
                    log("warning", `No context menu command handler found for: ${interaction.commandName}`);
                    return;
                }
                // @ts-ignore - Union type issue with execute parameter
                await command.execute(interaction);
                return;
            }
            if (interaction.isCommand()) {
                const command = interaction.client.commands?.get(interaction.commandName);
                if (!command) {
                    log("warning", `No slash command handler found for: ${interaction.commandName}`);
                    return;
                }
                // @ts-ignore - Union type issue with execute parameter
                await command.execute(interaction);
                return;
            }
            if (interaction.isButton()) {
                const buttonHandler = interaction.client.buttons.get(interaction.customId);
                if (!buttonHandler) {
                    log("warning", `No button handler found for button: ${interaction.customId}`);
                    return;
                }
                await buttonHandler.execute(interaction);
                return;
            }
            if (interaction.isStringSelectMenu()) {
                const selectHandler = interaction.client.selectMenus.get(interaction.customId);
                if (!selectHandler) {
                    log("warning", `No select menu handler found for select menu: ${interaction.customId}`);
                    return;
                }
                await selectHandler.execute(interaction);
                return;
            }
            if (interaction.isModalSubmit()) {
                const customId = interaction.customId;
                const modals = interaction.client.modals;
                const modal = [...modals.values()].find(modal => {
                    const id = modal.customId;
                    if (typeof id === "string")
                        return id === customId;
                    if (id instanceof RegExp)
                        return id.test(customId);
                    return false;
                });
                if (!modal) {
                    log("warning", `No modal handler found for modal: ${interaction.customId}`);
                    return;
                }
                await modal.execute(interaction);
                return;
            }
        }
        catch (error) {
            log("error", `Failed executing interaction:`, error);
            if (interaction.isRepliable() && !interaction.replied) {
                await interaction.reply({
                    content: "Something went wrong while executing your interaction.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    },
};
export default interactionCreateEvent;
