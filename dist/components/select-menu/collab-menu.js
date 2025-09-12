import { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
import { emojis, getEmoji } from "../../utils/emojis.js";
const collabSelectMenu = {
    customId: "collab_menu",
    execute: async (interaction) => {
        const fileData = interaction.client.fileCache.get(interaction.user.id);
        if (!fileData) {
            return sendAlertMessage({
                interaction,
                content: `File data not found.`,
                type: "error",
                tag: "No File",
            });
        }
        const collaborators = interaction.values;
        fileData.collaborators = collaborators;
        const collabKey = `${interaction.user.id}_${Date.now()}`;
        interaction.client.fileCache.set(collabKey, fileData);
        const collaboratorMentions = collaborators.map(id => `- <@${id}>`).join("\n");
        const buttons = [
            new ButtonBuilder()
                .setCustomId(`collab_edit_${collabKey}`)
                .setLabel("Edit File")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(emojis.pencil),
            new ButtonBuilder()
                .setCustomId(`collab_view_${collabKey}`)
                .setLabel("View File")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(emojis.eye),
        ];
        const buttonRow = new ActionRowBuilder().addComponents(buttons);
        await interaction.update({
            components: [
                containerTemplate({
                    tag: "",
                    title: getEmoji("reactions.kaeru.heart"),
                    description: `${getEmoji("document")} Collaboration thread created for **${fileData.name}** file!`,
                }),
            ],
        });
        const channel = interaction.channel;
        if (!channel || !channel.isTextBased() || channel.isDMBased()) {
            return sendAlertMessage({
                interaction,
                content: `I cannot create thread in this channel.`,
                type: "error",
                tag: "Missing Permission",
            });
        }
        if (channel.type !== 0) {
            return sendAlertMessage({
                interaction,
                content: `You can only collaborate in text channels.`,
                type: "error",
                tag: "Missing Permission",
            });
        }
        const followUpMessage = await interaction.followUp({
            components: [
                containerTemplate({
                    tag: `${getEmoji("people")} Collaboration+`,
                    description: [
                        `## Collaboration Setup Complete!`,
                        `File shared by <@${fileData.owner}>.`,
                        `### File:\n\`${fileData.name}\``,
                        `### Viewable by everyone:\n${fileData.isViewable ? "Yes" : "No"}`,
                        `### Collaborators:\n${collaboratorMentions}`,
                        ``,
                        fileData.isViewable
                            ? `-# ${getEmoji("reactions.user.emphasize")} Everyone can view this file, but only collaborators can edit it.`
                            : `-# ${getEmoji("reactions.user.emphasize")} Only collaborators can view and edit this file.`,
                    ],
                    thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1407664558323007518/Frame_15.png?ex=68a6ed47&is=68a59bc7&hm=40e37f945a9bbbb7d65870c2010648548b25bd552ea182b8065162386945e8b6&=&format=webp&quality=lossless&width=614&height=610",
                }),
                buttonRow,
            ],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: [],
            },
        });
        const thread = await followUpMessage.startThread({
            name: `✎ ${fileData.name} - Collaboration`,
            autoArchiveDuration: 60,
            reason: `Collaboration thread for ${fileData.name}`,
        });
        fileData.threadId = thread.id;
        interaction.client.fileCache.set(collabKey, fileData);
        await thread.members.add(fileData.owner);
        for (const userId of collaborators) {
            try {
                await thread.members.add(userId);
            }
            catch (error) {
                console.log(`Failed to add user ${userId} to thread:`, error);
            }
        }
        await thread.send({
            components: [
                containerTemplate({
                    tag: `${getEmoji("banner")} Changelog`,
                    description: `Collaboration logs starts at here for **${fileData.name}**!`,
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
export default collabSelectMenu;
