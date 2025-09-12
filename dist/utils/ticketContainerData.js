import { roleMention } from "discord.js";
import { getEmoji } from "../utils/emojis.js";
import { containerTemplate, getStaffRoleId } from "../utils/export.js";
export const ticketContainerData = async (interaction) => {
    const staffRoleId = await getStaffRoleId(interaction.guild.id);
    if (!staffRoleId)
        throw new Error(`Staff role ID is not set for this ${interaction.guild.name} (${interaction.guild.id}).`);
    const container = containerTemplate({
        tag: "Pro-Ticket System",
        title: `${getEmoji("doorEnter")} Now, we did it. Here we are!`,
        description: [
            ``,
            `-# [ ${roleMention(staffRoleId)} ]`,
            "",
            "Our staff member(s) will take care of this thread sooner. While they are on their way, why don’t you talk about your ticket?",
        ],
        thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1408594076835643412/Normal.png?ex=68aa4ef6&is=68a8fd76&hm=64bc5af80ee9a98e1449e691f12876fe265b5a3f6ce4a9d9d9995e3af6e6c182&=&format=webp&quality=lossless&width=706&height=706",
    });
    return container.toJSON();
};
