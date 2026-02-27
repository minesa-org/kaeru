const timestamp = () => new Date().toLocaleTimeString("tr-TR", {
	timeZone: "Europe/Istanbul",
	hour12: false,
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
});

export function log(type: "info" | "warning" | "error", message: string, error?: Error | unknown): void {
	const formattedMessage = `[${timestamp()}] [${type.toUpperCase()}] ${message}`;

	if (error) {
		console.error(formattedMessage, error);
	} else {
		console.log(formattedMessage);
	}
}
