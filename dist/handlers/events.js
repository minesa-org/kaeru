import fs from "fs";
import path from "path";
import { log, separator, header } from "../utils/export.js";
import chalk from "chalk";
export async function loadEvents(client) {
    console.log("\n");
    header("Loading Events");
    const eventsPath = path.join(process.cwd(), "dist", "events");
    const files = fs
        .readdirSync(eventsPath)
        .filter(file => file.endsWith(".js") || file.endsWith(".ts"));
    const loadedEvents = [];
    for (const file of files) {
        const filePath = path.join(eventsPath, file);
        try {
            const eventModule = (await import(filePath)).default;
            if (!eventModule || typeof eventModule.execute !== "function") {
                log("warning", `Invalid event module: ${file}`);
                continue;
            }
            const eventName = eventModule.name;
            const handler = async (...args) => {
                try {
                    await eventModule.execute(...args);
                }
                catch (error) {
                    log("error", `Failed to execute event ${eventName}`, error);
                }
            };
            if (eventModule.once) {
                client.once(eventName, handler);
                log("event", `${chalk.dim.underline("once")} ${eventName}`);
            }
            else {
                client.on(eventName, handler);
                log("event", `${chalk.dim.underline("on")} ${eventName}`);
            }
            loadedEvents.push({ type: "event", name: eventName, path: filePath });
        }
        catch (error) {
            log("error", `Failed to load event at ${filePath}`, error);
        }
    }
    separator();
}
