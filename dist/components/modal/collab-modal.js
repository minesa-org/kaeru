import { MessageFlags } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
import { getEmoji } from "../../utils/emojis.js";
const collabModal = {
    customId: /^collab_modal_/,
    execute: async (interaction) => {
        const [action, type, collabKey] = interaction.customId.split("_", 3);
        if (action !== "collab" || type !== "modal")
            return;
        const fileData = interaction.client.fileCache.get(collabKey);
        if (!fileData) {
            return sendAlertMessage({
                interaction,
                content: `File data not found`,
                type: "error",
                tag: "Non-supported Data",
            });
        }
        const isOwner = interaction.user.id === fileData.owner;
        const isCollaborator = fileData.collaborators.includes(interaction.user.id);
        if (!isOwner && !isCollaborator) {
            return sendAlertMessage({
                interaction,
                content: `You don't have permission to edit this file.`,
                type: "error",
                tag: "Missing Permission",
            });
        }
        const newContent = interaction.fields.getTextInputValue("file_content");
        fileData.text = newContent;
        interaction.client.fileCache.set(collabKey, fileData);
        if (fileData.threadId) {
            const thread = interaction.guild?.channels.cache.get(fileData.threadId);
            if (thread && thread.isThread()) {
                await thread.send({
                    components: [
                        containerTemplate({
                            tag: "Changes happened",
                            description: `${getEmoji("reactions.user.thumbsup")} File was updated by <@${interaction.user.id}>`,
                        }),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }
        return interaction.reply({
            components: [
                containerTemplate({
                    tag: "Changes",
                    title: getEmoji("reactions.user.thumbsup"),
                    description: `> Okay. Updated. I know that Kaeru saves changes history in thread, now.`,
                }),
            ],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
        });
    },
};
export default collabModal;
