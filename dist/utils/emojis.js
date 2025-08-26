export const emojis = {
    ticket: {
        create: { id: "1331654460325498931", name: "ticket" },
        created: { id: "1331655022357905419", name: "ticket_created" },
        bubble: {
            done: { id: "1398639729070706698", name: "bubble_done" },
            stale: { id: "1398639787891621888", name: "bubble_stale" },
            close: { id: "1398639706937495583", name: "bubble_close" },
            reopen: { id: "1398639774369316945", name: "bubble_reopen" },
            archive: { id: "1398639689371484170", name: "bubble_archive" },
            lock: { id: "1398639760481714256", name: "bubble_lock" },
            key: { id: "1398639745088884746", name: "bubble_key" },
        },
        circle: {
            done: { id: "1398639813904830484", name: "circle_done" },
            stale: { id: "1398639840421085204", name: "circle_stale" },
            close: { id: "1398639801841750076", name: "circle_close" },
            reopen: { id: "1398639827443781704", name: "circle_reopen" },
        },
        label: {
            bug: { id: "1375482268109377536", name: "label_bug" },
            reward: { id: "1375482431251152956", name: "label_reward" },
            question: { id: "1375482334232444988", name: "label_question" },
            discussion: { id: "1375482386183356446", name: "label_discussion" },
            help: { id: "1375482474280255539", name: "label_help" },
        },
    },
    reactions: {
        kaeru: {
            heart: { id: "1398610708215762976", name: "react_Heart" },
            thumbsup: { id: "1398610756588535869", name: "react_ThumbsUp" },
            thumbsdown: { id: "1398610739509461072", name: "react_ThumbsDown" },
            haha: { id: "1398610688615907428", name: "react_Haha" },
            emphasize: { id: "1398610644324061326", name: "react_Emphasize" },
            question: { id: "1398610723751596101", name: "react_Question" },
        },
        user: {
            heart: { id: "1375476629316567061", name: "reaction_heart_u" },
            thumbsup: { id: "1375476669149876234", name: "reaction_thumbsup_u" },
            thumbsdown: { id: "1375476654977319012", name: "reaction_thumbsdown_u" },
            haha: { id: "1375476616611889212", name: "reaction_haha_u" },
            emphasize: { id: "1375476602041012295", name: "reaction_emphasize_u" },
            question: { id: "1375476642104999999", name: "reaction_question_u" },
        },
    },
    brain: { id: "1398609595903250575", name: "bubble_brain" },
    sensitive: { id: "1331654389680574546", name: "sensitive" },
    bubble: { id: "1331654206540746863", name: "bubble" },
    info: { id: "1353837616256122981", name: "react_Info" },
    error: { id: "1353837592919015567", name: "react_Error" },
    danger: { id: "1353837568755765359", name: "react_Danger" },
    redirect: { id: "1331668579770306692", name: "redirect" },
    avatar: { id: "1331654153558167666", name: "avatar" },
    banner: { id: "1331654167315349535", name: "banner" },
    label: {
        bug: { id: "1375482268109377536", name: "label_bug" },
        reward: { id: "1375482431251152956", name: "label_reward" },
        question: { id: "1375482334232444988", name: "label_question" },
        discussion: { id: "1375482386183356446", name: "label_discussion" },
        help: { id: "1375482474280255539", name: "label_help" },
    },
    button: { id: "1331655705039474772", name: "button_press" },
    giftCard: { id: "1398609529595236364", name: "bubble_gift" },
    translate: { id: "1331654485096796300", name: "translate" },
    timeout: { id: "1398423360324632587", name: "bubble_timeout" },
    up: { id: "1331654045869539359", name: "up" },
    safety: { id: "1331654372744233040", name: "safety" },
    doorEnter: { id: "1331678912866156595", name: "door_enter" },
    swap: { id: "1331704952833179780", name: "swap" },
    globe: { id: "1331705467839320074", name: "globe" },
    dnd: { id: "1378835964197076992", name: "dnd" },
    intelligence: { id: "1375522815549116566", name: "Karu" },
    magic: { id: "1375436613856788550", name: "wand" },
    text_append: { id: "1375448596509495366", name: "text_append" },
    list_bullet: { id: "1375468308022951966", name: "list_bullet" },
    lock_dotted: { id: "1407076701959356596", name: "lock_dotted" },
    number_point: { id: "1407078457216733294", name: "number_point" },
    lock_fill: { id: "1407084819111739483", name: "lock_fill" },
    people: { id: "1407663609055809576", name: "people" },
    document: { id: "1407670625677475850", name: "document" },
    pencil: { id: "1407807672849403984", name: "pencil" },
    eye: { id: "1407807605048479867", name: "eye" },
    stickers: {
        thinking: { id: "1406027491403104316", name: "thinking" },
        sleepy: { id: "1406027455294210128", name: "sleepy" },
        shocked: { id: "1406027424604618773", name: "shocked" },
        approved: { id: "1406027391779999815", name: "approved" },
        confused: { id: "1406027359072555029", name: "confused" },
        angry: { id: "1406027315019911188", name: "angry" },
        wink: { id: "1406027160153751553", name: "wink" },
        mad: { id: "1406027121897373828", name: "mad" },
        pout: { id: "1406027073562345512", name: "pout" },
    },
};
/**
 * Gets the emoji string for a given path.
 * @param path The path to the emoji, e.g. "ticket.create"
 * @returns The emoji string, e.g. "<:ticket:1331654460325498931>"
 */
export function getEmoji(path) {
    const parts = path.split(".");
    let current = emojis;
    for (const part of parts) {
        if (!current[part]) {
            throw new Error(`Emoji path '${path}' not found.`);
        }
        current = current[part];
    }
    if (!("id" in current && "name" in current)) {
        throw new Error(`Emoji path '${path}' does not resolve to an emoji.`);
    }
    return `<:${current.name}:${current.id}>`;
}
/**
 * Lists all emoji paths.
 * @returns An array of all emoji paths.
 */
export function listAllEmojiPaths(obj = emojis, prefix = "") {
    let paths = [];
    for (const key in obj) {
        const val = obj[key];
        const newPath = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === "object") {
            if ("id" in val && "name" in val) {
                paths.push(newPath);
            }
            else {
                paths = paths.concat(listAllEmojiPaths(val, newPath));
            }
        }
    }
    return paths;
}
