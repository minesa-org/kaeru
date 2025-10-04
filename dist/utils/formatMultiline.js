export function formatMultiline(input) {
    return input
        .split("\n")
        .flatMap(function (line) {
        const headingMatch = line.match(/^(#+)\s+(.*)$/);
        if (headingMatch) {
            const hashes = headingMatch[1];
            const content = headingMatch[2];
            const parts = content
                .split(/\s{2,}/)
                .map((str) => str.trim())
                .filter(Boolean);
            return [hashes + " " + parts[0]].concat(parts.slice(1));
        }
        return line
            .split(/\s{2,}/)
            .map((str) => str.trim())
            .filter(Boolean);
    })
        .join("\n");
}
