import chalk from "chalk";
export const colors = {
    info: chalk.hex("#78c0fe").bold, // Canlı mavi
    warning: chalk.hex("#FFB300").underline, // Yumuşak turuncu
    error: chalk.hex("#ff7a71").bold, // Koyu kırmızı
    separator: chalk.hex("#8b939e").dim, // Koyu gri
    timestamp: chalk.hex("#8b939e"), // Açık gri
    command: chalk.hex("#7ee788"), // Kahverengi ton
    button: chalk.hex("#d2a8fe"), // Kahverengi ton
    modal: chalk.hex("#d2a8fe"), // Açık yeşil
    selectMenu: chalk.hex("#d2a8fe"), // Mor
    event: chalk.hex("#ffa657").bold, // Altın sarısı
};
const timestamp = new Date().toLocaleTimeString("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
});
/**
 * Log a message with a color
 */
export function log(type, message, error) {
    const colorFn = colors[type] || chalk.white;
    const formattedMessage = `${colors.timestamp(`[${timestamp}]`)} [${type.toUpperCase()}] ${message}`;
    if (error) {
        console.error(colorFn(formattedMessage), error);
    }
    else {
        console.log(colorFn(formattedMessage));
    }
}
/**
 * Separator for logs
 */
export function separator() {
    console.log(colors.separator("╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌"));
}
/**
 * Header for logs
 */
export function header(message) {
    console.log(chalk.bgHex("#c9d2d9").white.bold(` [${timestamp}] ${message} `), colors.separator("\n╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌"));
}
/**
 * ASCII logo for bot startup
 */
export function printLogo() {
    console.log(chalk.hex("#A1887F").bold(`
  ╔═══════════════════════════════════════╗
  ║     Kaeru Bot Started - ${timestamp}      ║
  ╚═══════════════════════════════════════╝
  `));
}
