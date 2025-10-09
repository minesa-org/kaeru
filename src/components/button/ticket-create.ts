import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ButtonInteraction,
	TextDisplayBuilder,
	LabelBuilder,
} from "discord.js";
import type { BotComponent } from "../../interfaces/botTypes.js";

const createTicketSelectMenu: BotComponent = {
	customId: "ticket-create-button",

	execute: async (interaction: ButtonInteraction): Promise<void> => {
		const modal = new ModalBuilder()
			.setCustomId(`ticket-create-modal`)
			.setTitle("Ticket creation")
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent("Explain as much as you can with your issue."),
			)
			.addLabelComponents(
				new LabelBuilder()
					.setId(1)
					.setLabel("Issue explanation")
					.setDescription("Please describe your issue in detail")
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId("ticket-message")
							.setPlaceholder("I am trying to tap the '+' icon, but I can't upload files?")
							.setStyle(TextInputStyle.Paragraph)
							.setMinLength(20)
							.setMaxLength(800)
							.setRequired(true),
					),
			);

		await interaction.showModal(modal);
	},
};

export default createTicketSelectMenu;
