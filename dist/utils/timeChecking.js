function timezoneChecking(timezone) {
    switch (timezone) {
        case "zh-CN":
            return "Asia/Shanghai";
        case "zh-TW":
            return "Asia/Taipei";
        case "en-GB":
            return "Europe/London";
        case "tr":
            return "Europe/Istanbul";
        case "it":
            return "Europe/Rome";
        case "es":
            return "Europe/Madrid";
        case "fr":
            return "Europe/Paris";
        case "de":
            return "Europe/Berlin";
        case "ru":
            return "Europe/Moscow";
        case "ja":
            return "Asia/Tokyo";
        case "ko":
            return "Asia/Seoul";
        default:
            return "America/New_York";
    }
}
function timeChecking(duration) {
    switch (duration) {
        case "1m":
            return 60;
        case "10m":
            return 600;
        case "30m":
            return 1800;
        case "1h":
            return 3600;
        case "2h":
            return 7200;
        case "1d":
            return 86400;
        case "2d":
            return 172800;
        case "3d":
            return 604800;
        default:
            return 0;
    }
}
export { timezoneChecking, timeChecking };
