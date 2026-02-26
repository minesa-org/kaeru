import {
    CommandBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionFlags,
    MiniPermFlags,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "@minesa-org/mini-interaction";
import type {
    InteractionCommand,
    CommandInteraction,
    MessageActionRowComponent,
} from "@minesa-org/mini-interaction";

const ping: InteractionCommand = {
    data: new CommandBuilder()
        .setDefaultMemberPermissions(MiniPermFlags.Administrator)
        .setName("ping")
        .setDescription("pong"),

    handler: async (interaction: CommandInteraction) => {
        await interaction.deferReply({ flags: InteractionFlags.IsComponentsV2 });

        const container = new ContainerBuilder()
            .addComponent(
                new SectionBuilder()
                    .addComponent(
                        new TextDisplayBuilder()
                            .setContent("This is a test message using Components V2.")
                    )
                    .setAccessory(
                        new ButtonBuilder()
                            .setCustomId("ping_button")
                            .setLabel("Pong")
                            .setStyle(ButtonStyle.Primary)
                    )
            ).addComponent(
                new ActionRowBuilder<MessageActionRowComponent>().addComponents(
                    new StringSelectMenuBuilder().setCustomId("ping_menu").addOptions(
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
            );;

        await interaction.editReply({
            components: [container]
        });
    },
};

export default ping;