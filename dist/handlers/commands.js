import { Collection, REST, Routes, } from "discord.js";
import fs from "fs";
import path from "path";
import { header, log, separator } from "../utils/export.js";
export async function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(await getFiles(filePath));
        }
        else if (file.endsWith(".ts") || file.endsWith(".js")) {
            results.push(filePath);
        }
    }
    return results;
}
export async function loadCommands(client) {
    client.commands = new Collection();
    client.buttons = new Collection();
    client.selectMenus = new Collection();
    client.modals = new Collection();
    client.fileCache = new Map();
    header("Loading Commands and Components");
    // Slash commands
    const commandsPath = path.join(process.cwd(), "dist", "commands");
    const commandFiles = await getFiles(commandsPath);
    for (const filePath of commandFiles) {
        try {
            const module = await import(filePath);
            const component = module.default ?? module;
            if ("data" in component && "execute" in component) {
                client.commands.set(component.data.name, component);
                log("command", `		${component.data.name.toLowerCase()}`);
            }
            else {
                log("warning", `Invalid command at ${filePath}`);
            }
        }
        catch (err) {
            log("error", `Failed to load command at ${filePath}`, err);
        }
    }
    separator();
    // Buttons
    const buttonPath = path.join(process.cwd(), "dist", "components", "button");
    const buttonFiles = await getFiles(buttonPath);
    for (const filePath of buttonFiles) {
        try {
            const module = await import(filePath);
            const component = module.default ?? module;
            if ("customId" in component && "execute" in component) {
                const buttonComponent = component;
                const customId = buttonComponent.customId instanceof RegExp
                    ? buttonComponent.customId.source
                    : buttonComponent.customId;
                client.buttons.set(customId, buttonComponent);
                log("button", `		${customId}`);
            }
            else {
                log("warning", `Invalid button at ${filePath}`);
            }
        }
        catch (err) {
            log("error", `Failed to load button at ${filePath}`, err);
        }
    }
    separator();
    // Modals
    const modalPath = path.join(process.cwd(), "dist", "components", "modal");
    const modalFiles = await getFiles(modalPath);
    for (const filePath of modalFiles) {
        try {
            const module = await import(filePath);
            const component = module.default ?? module;
            if ("customId" in component && "execute" in component) {
                const modalComponent = component;
                const customId = modalComponent.customId instanceof RegExp
                    ? modalComponent.customId.source
                    : modalComponent.customId;
                client.modals.set(customId, modalComponent);
                log("modal", `		${customId}`);
            }
            else {
                log("warning", `Invalid modal at ${filePath}`);
            }
        }
        catch (err) {
            log("error", `Failed to load modal at ${filePath}`, err);
        }
    }
    separator();
    // Select menus
    const selectMenuPath = path.join(process.cwd(), "dist", "components", "select-menu");
    const selectMenuFiles = await getFiles(selectMenuPath);
    for (const filePath of selectMenuFiles) {
        try {
            const module = await import(filePath);
            const component = module.default ?? module;
            if ("customId" in component && "execute" in component) {
                const menuComponent = component;
                const customId = menuComponent.customId instanceof RegExp
                    ? menuComponent.customId.source
                    : menuComponent.customId;
                client.selectMenus.set(customId, menuComponent);
                log("selectMenu", `	${customId}`);
            }
            else {
                log("warning", `Invalid select menu at ${filePath}`);
            }
        }
        catch (err) {
            log("error", `Failed to load select menu at ${filePath}`, err);
        }
    }
}
/**
 * Register all global commands
 */
export async function registerCommandsGlobally(client, token, clientId) {
    if (!client.commands)
        throw new Error("client.commands not initialized");
    const rest = new REST({ version: "10" }).setToken(token);
    const payload = client.commands.map(cmd => cmd.data.toJSON());
    try {
        await rest.put(Routes.applicationCommands(clientId), { body: payload });
        log("info", "Successfully registered all global commands.");
    }
    catch (err) {
        log("error", "Failed to register global commands", err);
    }
    separator();
}
