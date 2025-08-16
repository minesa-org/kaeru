import { GuildMember, MessageFlags, PermissionFlagsBits, PermissionsBitField, } from "discord.js";
import { getEmoji, sendErrorMessage } from "../../utils/export.js";
import { RULE_NAME } from "../../commands/general/focus.js";
const focusClear = {
    customId: "focus-list-clear",
    execute: async (interaction) => {
        const { member, guild } = interaction;
        if (!guild || !member) {
            return await interaction.reply({
                content: `${getEmoji("error")}`,
                flags: MessageFlags.Ephemeral,
            });
        }
        let rules = await guild.autoModerationRules.fetch();
        let rule = rules.find(r => r.name === RULE_NAME);
        const perms = member instanceof GuildMember
            ? member.permissions
            : new PermissionsBitField(BigInt(member.permissions));
        if (!perms.has(PermissionFlagsBits.ManageGuild)) {
            return sendErrorMessage(interaction, `Permission missing... Oof.`, "reactions.user.emphasize");
        }
        await rule?.edit({ triggerMetadata: { keywordFilter: [] } });
        return await interaction.reply({
            content: `# ${getEmoji("reactions.kaeru.thumbsup")}\n-# Focus mode cleared for everyone. Happy!`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
export default focusClear;
