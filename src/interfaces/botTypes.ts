import type {
	Interaction,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	ClientEvents,
	Awaitable,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	ChatInputCommandInteraction,
	InteractionResponse,
	UserSelectMenuInteraction,
	ChannelSelectMenuInteraction,
	RoleSelectMenuInteraction,
	AutocompleteInteraction,
} from "discord.js";

// === Command Interfaces ===

interface BaseCommand<I extends Interaction = Interaction, D = any> {
	data: D;
	execute: (interaction: I) => Promise<any>;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

type SlashBuilder = SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

export type SlashCommand = BaseCommand<ChatInputCommandInteraction, SlashBuilder>;

export type MessageContextMenuCommand = BaseCommand<
	MessageContextMenuCommandInteraction,
	ContextMenuCommandBuilder
>;

export type UserContextMenuCommand = BaseCommand<
	UserContextMenuCommandInteraction,
	ContextMenuCommandBuilder
>;

export type BotCommand = SlashCommand | MessageContextMenuCommand | UserContextMenuCommand;

// === Component Interfaces ===

type ComponentExecuteReturn = void | Promise<void> | Promise<InteractionResponse<boolean> | void>;

interface BaseComponent<TInteraction extends Interaction> {
	customId: string | RegExp;
	execute: (interaction: TInteraction) => ComponentExecuteReturn;
}

export interface ButtonCommand extends BaseComponent<ButtonInteraction> {}

export interface SelectMenuCommand<
	T extends
		| StringSelectMenuInteraction
		| UserSelectMenuInteraction
		| ChannelSelectMenuInteraction
		| RoleSelectMenuInteraction,
> extends BaseComponent<T> {}

export interface ModalCommand extends BaseComponent<ModalSubmitInteraction> {}

export type BotComponent = ButtonCommand | SelectMenuCommand<any> | ModalCommand;

// === Event Handler Interface ===

export interface EventModule<K extends keyof ClientEvents = keyof ClientEvents> {
	name: K;
	once?: boolean;
	execute: (...args: ClientEvents[K]) => Awaitable<void>;
}

export type BotEventHandler<K extends keyof ClientEvents> = EventModule<K>;
