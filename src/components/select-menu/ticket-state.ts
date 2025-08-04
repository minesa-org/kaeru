import { BotComponent } from "@interfaces/botTypes.js";
import { emojis, getEmoji } from "@utils/emojis.js";
import { ticketContainerData } from "@utils/ticketContainerData.js";
import { lockButtonRow } from "@utils/ticketRows.js";
import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	time,
	MessageFlags,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuInteraction,
	GuildMember,
	APIInteractionGuildMember,
} from "discord.js";

const menu3 = new StringSelectMenuBuilder()
	.setCustomId("ticket-select-menu")
	.setDisabled(false)
	.setMaxValues(1)
	.setPlaceholder("Action to close ticket")
	.addOptions(
		new StringSelectMenuOptionBuilder()
			.setLabel("Close as completed")
			.setValue("ticket-menu-done")
			.setDescription("Done, closed, fixed, resolved")
			.setEmoji(emojis.ticket.circle.done)
			.setDefault(false),
		new StringSelectMenuOptionBuilder()
			.setLabel("Close as not planned")
			.setValue("ticket-menu-duplicate")
			.setDescription("Won’t fix, can’t repo, duplicate, stale")
			.setEmoji(emojis.ticket.circle.stale)
			.setDefault(false),
		new StringSelectMenuOptionBuilder()
			.setLabel("Close with comment")
			.setValue("ticket-menu-close")
			.setEmoji(emojis.ticket.circle.close)
			.setDefault(false),
	);

export const row3 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu3);

const ticketState: BotComponent = {
	customId: "ticket-select-menu",

	execute: async (interaction: StringSelectMenuInteraction) => {
		const authorId = interaction.user.id;
		const selectedValue = interaction.values[0];
		const formattedTime = time(new Date(), "R");

		if (!interaction.channel?.isThread()) {
			throw new Error();
		}

		const member = interaction.member as GuildMember | APIInteractionGuildMember;
		const displayName = "displayName" in member ? member.displayName : interaction.user.username;

		switch (selectedValue) {
			case "ticket-menu-close": {
				const modal = new ModalBuilder()
					.setCustomId("ticket-close-modal")
					.setTitle("Close Ticket")
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId("close-reason")
								.setLabel("Reason for closing")
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(true),
						),
					);

				await interaction.showModal(modal);
				break;
			}

			case "ticket-menu-done": {
				const menu3 = new StringSelectMenuBuilder()
					.setCustomId("ticket-select-menu")
					.setDisabled(false)
					.setMaxValues(1)
					.setPlaceholder("What do you want to do?")
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as completed")
							.setValue("ticket-menu-done")
							.setDescription("Done, closed, fixed, resolved")
							.setEmoji(emojis.ticket.circle.done)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as not planned")
							.setValue("ticket-menu-duplicate")
							.setDescription("Won’t fix, can’t repo, duplicate, stale")
							.setEmoji(emojis.ticket.circle.stale)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close with comment")
							.setValue("ticket-menu-close")
							.setEmoji(emojis.ticket.circle.close),
					);

				const row3 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu3);
				await interaction.update({
					components: [await ticketContainerData(interaction), row3, lockButtonRow],
					flags: MessageFlags.IsComponentsV2,
				});

				await interaction.channel.send({
					components: [
						new TextDisplayBuilder().setContent(`# ${getEmoji("ticket.bubble.done")}`),
						new TextDisplayBuilder().setContent(
							`-# **<@!${authorId}>** __closed__ this as completed ${formattedTime},`,
						),
						new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
					],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: { parse: [] },
				});

				await interaction.channel.setLocked(true);
				await interaction.channel.setArchived(true, `${displayName} marked as completed`);
				break;
			}

			case "ticket-menu-duplicate": {
				const menu2 = new StringSelectMenuBuilder()
					.setCustomId("ticket-select-menu")
					.setDisabled(false)
					.setMaxValues(1)
					.setPlaceholder("What do you want to do?")
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as completed")
							.setValue("ticket-menu-done")
							.setDescription("Done, closed, fixed, resolved")
							.setEmoji(emojis.ticket.circle.done)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as not planned")
							.setValue("ticket-menu-duplicate")
							.setDescription("Won’t fix, can’t repo, duplicate, stale")
							.setEmoji(emojis.ticket.circle.stale)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close with comment")
							.setValue("ticket-menu-close")
							.setEmoji(emojis.ticket.circle.close),
					);

				const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu2);

				await interaction.update({
					components: [await ticketContainerData(interaction), row2, lockButtonRow],
					flags: MessageFlags.IsComponentsV2,
				});

				await interaction.channel.send({
					components: [
						new TextDisplayBuilder().setContent(`# ${getEmoji("ticket.bubble.stale")}`),
						new TextDisplayBuilder().setContent(
							`-# **<@!${authorId}>** __closed__ this as not planned ${formattedTime},`,
						),
						new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
					],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: { parse: [] },
				});

				await interaction.channel.setArchived(true, `${displayName} marked as not planned`);
				break;
			}

			default:
				break;
		}
	},
};

export default ticketState;
