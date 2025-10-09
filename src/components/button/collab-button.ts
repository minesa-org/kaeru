import {
	ButtonInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
	LabelBuilder,
} from "discord.js";
import { BotComponent } from "../../interfaces/botTypes.js";
import { sendAlertMessage } from "../../utils/error&containerMessage.js";

const collabButton: BotComponent = {
	customId: /^collab_(edit|view)_/,
	execute: async (interaction: ButtonInteraction) => {
		const [action, type, collabKey] = interaction.customId.split("_", 3);

		const fileData = interaction.client.fileCache.get(collabKey);
		if (!fileData) {
			return sendAlertMessage({
				interaction,
				content: `File data not found.`,
				type: "error",
				tag: "File Data",
			});
		}

		const isOwner = interaction.user.id === fileData.owner;
		const isCollaborator = fileData.collaborators.includes(interaction.user.id);

		if (type === "edit") {
			if (!isOwner && !isCollaborator) {
				return sendAlertMessage({
					interaction,
					title: "No-no! You look confused",
					content: `You don't have permission to edit this file.`,
					type: "error",
					tag: "Missing Permission",
				});
			}

			const modal = new ModalBuilder()
				.setCustomId(`collab_modal_${collabKey}`)
				.setTitle(`Edit: ${fileData.name}`)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel("File Content")
						.setDescription("Please write down your changes.")
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId("file_content")
								.setStyle(TextInputStyle.Paragraph)
								.setValue(fileData.text)
								.setMaxLength(4000)
								.setRequired(true)
								.setPlaceholder("Changes..."),
						),
				);

			return interaction.showModal(modal);
		}

		if (type === "view") {
			if (!fileData.isViewable && !isOwner && !isCollaborator) {
				return sendAlertMessage({
					interaction,
					title: "They made this superrr hidden",
					content: `You don't have permission to view this file.`,
					type: "error",
					tag: "Missing Permission",
				});
			}

			return interaction.reply({
				content: `\`\`\`${fileData.ext.slice(1)}\n${fileData.text}\n\`\`\``,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};

export default collabButton;
