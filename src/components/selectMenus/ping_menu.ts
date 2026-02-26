import {
    type ComponentCommand,
    type StringSelectInteraction,
} from "@minesa-org/mini-interaction";

const selectmenu_menu: ComponentCommand = {
    customId: "ping_menu",

    handler: async (interaction: StringSelectInteraction) => {
        const value = interaction.getStringValues().join(", ");

        return interaction.reply({
            content: `Value(s) of select menu you selected: ${value}`,
        });
    },
};

export default selectmenu_menu;