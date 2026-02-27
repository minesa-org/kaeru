import {
	ContainerBuilder,
	InteractionFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "@minesa-org/mini-interaction";
import { emojis, getEmoji, RecursiveKeyOf } from "./emojis.js";

type AlertType = "error" | "info";

interface SendAlertMessageParams {
	interaction: any; // Using any to avoid type friction with different interaction helpers
	content: string;
	tag?: string;
	title?: string;
	ephemeral?: boolean;
	type?: AlertType;
	alertReaction?: RecursiveKeyOf<typeof emojis>;
}


const ALERT_THUMBNAILS: Record<AlertType, string> = {
	error:
		"https://media.discordapp.net/attachments/736571695170584576/1408502320312090664/Error.png?ex=68a9f981&is=68a8a801&hm=425eebd8135735b15a2f7d1eb0ec7af1f73c7c8dcdb80ab0d6268ce8d243e3cd&=&format=webp&quality=lossless&width=1224&height=1224",
	info: "https://media.discordapp.net/attachments/736571695170584576/1408502320660221992/Info.png?ex=68a9f981&is=68a8a801&hm=f5c6c3b118c81993e5dd81ff0c4f99790aa77229a750868a7244773d2c62f39e&=&format=webp&quality=lossless&width=1224&height=1224",
};

const ALERT_COLORS: Record<AlertType, number> = {
	error: 0xff5353,
	info: 0x0a84ff,
};

export function containerTemplate({
	tag,
	description,
	title,
	thumbnail,
}: {
	tag: string;
	description: string;
	title?: string;
	thumbnail?: string;
}): ContainerBuilder {
	const container = new ContainerBuilder()
		.addComponent(new TextDisplayBuilder().setContent(`-# ${tag}`))
		.addComponent(
			new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
		);

	const lines: string[] = [];
	if (title) lines.push(`# ${title}`);
	lines.push(description);

	const textDisplay = new TextDisplayBuilder().setContent(lines.join("\n"));

	if (thumbnail) {
		const section = new SectionBuilder()
			.addComponent(textDisplay)
			.setAccessory(new ThumbnailBuilder().setMedia({ url: thumbnail } as any));

		container.addComponent(section);
	} else {
		container.addComponent(textDisplay);
	}

	return container;
}

export async function sendAlertMessage({
	interaction,
	content,
	tag = "Alert",
	title = "Attention!",
	ephemeral = true,
	type = "info",
	alertReaction,
}: SendAlertMessageParams): Promise<void> {
	const thumbnail = ALERT_THUMBNAILS[type];
	const container = containerTemplate({ tag, description: content, thumbnail, title });

	container.setAccentColor(ALERT_COLORS[type]);

	const components: any[] = [];
	if (alertReaction) {
		components.push(new TextDisplayBuilder().setContent(getEmoji(alertReaction)));
	}
	components.push(container);

	const flags = [InteractionFlags.IsComponentsV2];
	if (ephemeral) flags.push(InteractionFlags.Ephemeral);

	const response = interaction.getResponse();

	if (response && (response.type === 5 || response.type === 1)) {
		// type 5 is DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
		await interaction.editReply({
			components,
		});
	} else {
		await interaction.reply({
			components,
			flags,
		});
	}
}

