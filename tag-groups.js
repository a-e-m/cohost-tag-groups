const KEY = "cohostTagGroups";

const extension = (typeof browser === "undefined") ? chrome : browser;

let mapping = {};
extension.storage.sync.get(KEY).then(res => {
    mapping = res[KEY];
});

extension.storage.onChanged.addListener(e => {
    mapping = e.cohostTagGroups.newValue;
});

const hiddenStyle = `
div[role="combobox"] ul {
    display: none;
}
`.replace(/\n/g, "");

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = "";
document.head.appendChild(styleSheet);

function keyPress(input, key) {
    ["keypress", "keydown"].forEach(eventType => {
        input.dispatchEvent(
            new KeyboardEvent(eventType, { key: key, bubbles: true, cancelable: true })
        );
    })
}

function inputTag(tags, currentIndex) {
    if (currentIndex >= tags.length) {
        setTimeout(() => {
            styleSheet.innerText = "";
        }, 100);
        return;
    }
    input.value = tags[currentIndex];
    input.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true })
    );
    setTimeout(() => {
        input.click();
        keyPress(input, "Tab");
    }, 1);

    setTimeout(inputTag, 2, tags, ++currentIndex);
}

let input = document.querySelector('input[placeholder$="tags"]');

const ENTER_KEYS = new Set(["Enter", "Comma", "Semicolon", ",", ";", "Tab"]);

window.addEventListener("keydown", e => {
    if (ENTER_KEYS.has(e.key) && e.target.placeholder === "#add tags") {
        input = document.querySelector('input[placeholder$="tags"]');

        const value = e.target.value;
        if (value in mapping) {
            styleSheet.innerText = hiddenStyle;
            const tags = mapping[value].filter(v => v !== value);
            setTimeout(inputTag, 2, tags, 0);
        }
    }
}, true);