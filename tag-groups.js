const KEY = "cohostTagGroups";

let mapping = {};
browser.storage.sync.get(KEY).then(res => {
    mapping = res[KEY];
    console.log('testing tag groups', mapping);
});

browser.storage.onChanged.addListener(e => {
    mapping = e.cohostTagGroups.newValue;
});

const hiddenStyle = `
div[role="combobox"] ul {
    display: none;
}
`.replace(/\n/g, "");

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = hiddenStyle;
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
if (input) {

    window.addEventListener("keydown", e => {
        if (e.key === "Enter" && e.target.placeholder === "#add tags") {
            const value = e.target.value;
            if (value in mapping) {
                styleSheet.innerText = hiddenStyle;
                console.log(value, mapping[value]);
                setTimeout(inputTag, 2, mapping[value], 0);
            }
        }
    });
}
