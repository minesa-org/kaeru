import { ContainerBuilder, MessageFlags, SeparatorBuilder, TextDisplayBuilder, } from "discord.js";
import { getEmoji, log } from "../utils/export.js";
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
                const handler = [...interaction.client.buttons.values()].find(h => {
                    if (h.customId instanceof RegExp)
                        return h.customId.test(interaction.customId);
                    return h.customId === interaction.customId;
                });
                if (!handler) {
                    log("warning", `No button handler found for button: ${interaction.customId}`);
                    return;
                }
                await handler.execute(interaction);
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
            if (interaction.isUserSelectMenu()) {
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
                    components: [
                        new TextDisplayBuilder().setContent(getEmoji("reactions.kaeru.heart")),
                        new ContainerBuilder()
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent("Sometimes, things can go as unexpected. Like this one, this one is failed. Anyway lemme tell you a story"))
                            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent("-# It was 3 years ago, while I was sitting with my grandfather, my grandfather asked for water, I said okay and I took the water from the kitchen and gave the water to my grandfather.\n-# I sat down and he said to me; Look, son, a day will come when people will waste time reading your message.. it just is")),
                    ],
                    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                });
            }
        }
    },
};
export default interactionCreateEvent;
