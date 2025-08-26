import { time, MessageFlags, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, PermissionFlagsBits, } from "discord.js";
import { getEmoji } from "../utils/emojis.js";
import { containerTemplate } from "./error&containerMessage.js";
export async function setLockedAndUpdateMessage(interaction, reason = "") {
    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageThreads)) {
        await interaction.reply({
            content: `# ${getEmoji("danger")}\n-# It seems like I don't have permission to manage threads to lock...`,
        });
        return;
    }
    const formattedTime = time(new Date(), "R");
    if (!interaction.channel?.isThread()) {
        throw new Error(); // For condition
    }
    await interaction.channel.setLocked(true);
    try {
        await interaction.update({
            components: [
                containerTemplate({
                    tag: "Locking Ticket",
                    description: `Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
                }),
            ],
        });
    }
    catch {
        await interaction.channel.send(`Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`);
    }
    await interaction.channel.send({
        components: [
            new TextDisplayBuilder().setContent(`# ${getEmoji("ticket.bubble.lock")}`),
            new TextDisplayBuilder().setContent(`-# **<@!${interaction.user.id}>** has __locked__ the thread${reason ? ` ${reason}` : ""} and limited conversation to staffs ${formattedTime}`),
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        ],
        allowedMentions: {
            parse: [],
        },
        flags: MessageFlags.IsComponentsV2,
    });
}
