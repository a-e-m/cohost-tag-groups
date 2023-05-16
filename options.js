const KEY = "cohostTagGroups";

const extension = (typeof browser === "undefined") ? chrome : browser;

function splitTags(tags) {
    return tags.split(/\s*[\n,]\s*/g);
}

function $(selector) {
    return document.querySelector(selector);
}

function el(tag, attribs) {
    attribs = attribs || {};
    const element = document.createElement(tag);
    const text = attribs.text;
    if (text) {
        const textChild = document.createTextNode(text);
        // add the text node to the newly created div
        element.appendChild(textChild);
    }
    delete attribs.text;
    for (const [key, value] of Object.entries(attribs)) {
        element[key] = value;
    }
    return element;
}

async function loadOptions() {  
    const res = (await extension.storage.sync.get(KEY) || {})[KEY] || {};
    $("#parent").innerHTML = "";
    for (const [key, value] of Object.entries(res)) {
        const container = el("div", { className: "edit-container" });
        const keyEl = el("input", { value: key, type: "text" })
        container.appendChild(keyEl);
        const valEl = el("textarea", { value: value.join ? value.join("\n") : value });
        container.appendChild(valEl);
        const deleteButton = el("button", { text: "Delete" });
        deleteButton.addEventListener("click", e => {
            delete options[key];
            saveOptions();
        })
        container.appendChild(deleteButton);
        const editButton = el("button", { text: "Save" });
        editButton.addEventListener("click", e => {
            options[keyEl.value] = splitTags(valEl.value);
            saveOptions();
        })
        container.appendChild(editButton);
        $("#parent").appendChild(container);
    }
    return res;
}

let options;

async function saveOptions() {
    extension.storage.sync.set({
        [KEY]: options
    });
    await loadOptions();
}

(async () => {
    options = await loadOptions();
    document.querySelector("form").addEventListener("submit", async e => {
        e.preventDefault();
        options[$("#key").value] = splitTags($("#values").value);
        $("#key").value = $("#values").value = "";
        await saveOptions();
        
    });
})();