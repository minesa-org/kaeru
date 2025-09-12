import { PermissionFlagsBits, MessageFlags } from "discord.js";
import { containerTemplate, getEmoji, sendAlertMessage } from "../../utils/export.js";
const ticketKaruButton = {
    customId: "ticket-karu-button",
    execute: async (interaction) => {
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageThreads)) {
            return sendAlertMessage({
                interaction,
                content: `Hmm... I don't have permission to change thread's name to AI support.`,
                type: "error",
                tag: "Missing Permission",
            });
        }
        if (!interaction.channel?.isThread()) {
            throw new Error();
        }
        const thread = interaction.channel;
        const currentName = thread.name;
        const aiEmoji = "💭 ";
        let newName;
        let actionMessage;
        if (currentName.startsWith(aiEmoji)) {
            newName = currentName.substring(aiEmoji.length);
            actionMessage = `AI support has been **disabled** for this ticket.`;
        }
        else {
            newName = aiEmoji + currentName;
            actionMessage = `AI support has been **enabled** for this ticket.`;
        }
        try {
            await thread.setName(newName);
            await interaction.reply({
                components: [
                    containerTemplate({
                        tag: `${getEmoji("intelligence")} Karu Support`,
                        description: actionMessage,
                    }),
                ],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });
        }
        catch (error) {
            console.error("Error updating thread name:", error);
            return sendAlertMessage({
                interaction,
                content: `${getEmoji("error")} I couldn't update the thread name... maybe next time, hehe... :/`,
                type: "error",
            });
        }
    },
};
export default ticketKaruButton;
