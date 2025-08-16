import { ContainerBuilder, roleMention, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, } from "discord.js";
import { getEmoji } from "../utils/emojis.js";
import { getStaffRoleId } from "../utils/saveStaffRole.js";
export const ticketContainerData = async (interaction) => {
    const staffRoleId = await getStaffRoleId(interaction.guild.id);
    if (!staffRoleId)
        throw new Error(`Staff role ID is not set for this ${interaction.guild.name} (${interaction.guild.id}).`);
    const container = new ContainerBuilder().addSectionComponents(new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent([
        `## ${getEmoji("doorEnter")} Now, we did it. Here we are!`,
        `-# [ ${roleMention(staffRoleId)} ]`,
        "",
        "Our staff member(s) will take care of this thread sooner. While they are on their way, why don’t you talk about your ticket?",
    ].join("\n")))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://cdn.discordapp.com/attachments/736571695170584576/1327617435418755185/23679.png")));
    return container.toJSON();
};
