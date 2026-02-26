import {
    type ComponentCommand,
    type ButtonInteraction,
    ModalBuilder,
    LabelBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@minesa-org/mini-interaction";

const ping_button: ComponentCommand = {
    customId: "ping_button",

    handler: async (interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId("ping_modal")
            .setTitle("Mini-Interaction Test")
            .addComponents(
                new LabelBuilder()
                    .setLabel("Select an option")
                    .setDescription("Say hi or hello")
                    .setComponent(
                        new StringSelectMenuBuilder()
                            .setCustomId("ping_menu_modal")
                            .setPlaceholder("Select an option")
                            .setMinValues(1)
                            .setMaxValues(2)
                            .setDisabled(false)
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Hello")
                                    .setDescription("This is hello")
                                    .setValue("value_hello"),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Hi")
                                    .setDescription("This is hi")
                                    .setValue("value_hi")
                            )
                    )
            );

        return interaction.showModal(modal);
    },
};

export default ping_button;