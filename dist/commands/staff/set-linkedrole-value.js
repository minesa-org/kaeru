import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder, } from "discord.js";
import { getEmoji, sendAlertMessage, containerTemplate, isBotOwner } from "../../utils/export.js";
import { setTimelapseCount, setTicketCount, getUserData } from "../../utils/linkedRoleUtil.js";
const setLinkedRoleValue = {
    data: new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName("bağlı-rol-değeri-ayarla")
        .setDescription("Kullanıcının bağlı rol sayaç değerini ayarla ")
        .addUserOption(option => option
        .setName("kullanıcı")
        .setDescription("Bağlı rol değerleri değiştirilecek kullanıcı")
        .setRequired(true))
        .addStringOption(option => option
        .setName("rol_türü")
        .setDescription("Değiştirilecek bağlı rol türü")
        .setRequired(true)
        .addChoices({ name: "Time Master (timelapse)", value: "timelapse" }, { name: "Issue Tracker (tickets)", value: "issue_tracker" }))
        .addIntegerOption(option => option
        .setName("değer")
        .setDescription("Ayarlanacak tam değer (0 veya pozitif olmalı)")
        .setRequired(true)
        .setMinValue(0)),
    execute: async (interaction) => {
        if (!isBotOwner(interaction.user.id)) {
            return sendAlertMessage({
                interaction,
                content: `This command is restricted to the bot owner only.\n\n> ${getEmoji("reactions.user.thumbsdown")} You don't have permission to use this command.`,
                type: "error",
                tag: "Access Denied",
            });
        }
        const targetUser = interaction.options.getUser("kullanıcı", true);
        const roleType = interaction.options.getString("rol_türü", true);
        const value = interaction.options.getInteger("değer", true);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        try {
            if (targetUser.bot) {
                return sendAlertMessage({
                    interaction,
                    content: `Cannot set linked role values for bots.\n\n> ${getEmoji("reactions.user.thumbsup")} Please select a real user instead.`,
                    type: "error",
                    tag: "Invalid Target",
                });
            }
            const currentUserData = await getUserData(targetUser.id);
            const currentTimelapseCount = currentUserData?.timelapseCount || 0;
            const currentTicketCount = currentUserData?.ticketCount || 0;
            if (roleType === "timelapse") {
                await setTimelapseCount(targetUser.id, value);
            }
            else if (roleType === "issue_tracker") {
                await setTicketCount(targetUser.id, value);
            }
            console.log(`📊 Database updated for user ${targetUser.id}. User can update metadata manually if needed.`);
            const updatedUserData = await getUserData(targetUser.id);
            const newTimelapseCount = updatedUserData?.timelapseCount || 0;
            const newResolvedTickets = updatedUserData?.resolvedTickets || 0;
            const newTicketCount = updatedUserData?.ticketCount || 0; // Legacy field
            // Determine role qualifications
            const timeQualified = newTimelapseCount >= 10;
            const issueQualified = newResolvedTickets >= 10;
            const roleTypeDisplay = roleType === "timelapse" ? "Time Master" : "Issue Tracker";
            const oldValue = roleType === "timelapse" ? currentTimelapseCount : currentTicketCount;
            const newValue = roleType === "timelapse" ? newTimelapseCount : newTicketCount;
            let description = `Successfully updated **${roleTypeDisplay}** count for ${targetUser.username}.\n\n`;
            description += `**Previous value:** ${oldValue}\n`;
            description += `**New value:** ${newValue}\n\n`;
            description += `**Current Status:**\n`;
            description += `${timeQualified ? "✅" : "❌"} Time Master (${newTimelapseCount}/10)\n`;
            description += `${issueQualified ? "✅" : "❌"} Issue Tracker (${newResolvedTickets})\n`;
            description += `\n> **Note:** Database updated successfully. User can manually update their Discord metadata when needed.`;
            return interaction.editReply({
                components: [
                    containerTemplate({
                        tag: `${getEmoji("magic")} Linked Role Value Updated`,
                        title: "Successfully updated linked role count!",
                        description,
                        thumbnail: targetUser.displayAvatarURL({ size: 256 }),
                    }),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch (error) {
            console.error("Error setting linked role value:", error);
            let errorMessage = `Failed to set linked role value for ${targetUser.username}.`;
            let errorTag = "Database Error";
            if (error instanceof Error) {
                if (error.message.includes("MONGO_URI")) {
                    errorMessage += "\n\n> Database connection is not configured properly.";
                    errorTag = "Configuration Error";
                }
                else if (error.message.includes("network") || error.message.includes("timeout")) {
                    errorMessage += "\n\n> Database connection timeout. Please try again.";
                    errorTag = "Network Error";
                }
                else if (error.message.includes("permission") || error.message.includes("auth")) {
                    errorMessage += "\n\n> Database permission error. Please contact an administrator.";
                    errorTag = "Permission Error";
                }
                else {
                    errorMessage += `\n\n> ${getEmoji("reactions.user.thumbsdown")} Please try again later.`;
                }
            }
            return sendAlertMessage({
                interaction,
                content: errorMessage,
                type: "error",
                tag: errorTag,
            });
        }
    },
};
export default setLinkedRoleValue;
