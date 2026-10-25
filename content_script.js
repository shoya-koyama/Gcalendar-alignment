//メールアドレスとスプレッドシート情報を入れるグローバル変数
let email, info;

//使用者のメールアドレスとスプレッドシートの情報を取得
async function fetchOptionsFromSheet() {
    try {
        let response = await fetch(URL);
        info = await response.json();
    } catch (error) {
        console.error("エラー:", error);
    }
}

function fetchGoogleAccountEmail() {
    chrome.runtime.sendMessage({ action: "getEmail" }, response => {
        email = response.email;
    });
}

fetchOptionsFromSheet();
fetchGoogleAccountEmail();

//ボタンを作成
function createDropdownButton(id, menuName) {
    let button = document.createElement("button");
    Object.assign(button.style, {
        border: "1px solid", borderRadius: "5px", cursor: "pointer", fontSize: "15px", width: "65px", height: "25px"
    });
    button.id = id;
    button.textContent = menuName;

    return button;
}

//リストを作成
function createDropdownList(id) {
    let list = document.createElement("ul");
    Object.assign(list.style, {
        position: "absolute", listStyle: "none", padding: "8px",
        margin: "0", background: "white", border: "1px solid",
        borderRadius: "5px",
        display: "none", zIndex: "9999"
    });
    list.id = id;
    return list;
}

//リストに選択肢を追加 & 押したらタイトル欄に挿入されるように設定
function populateDropdown(list, items, titleInput) {
    items.forEach(option => {
        let listItem = document.createElement("li");
        listItem.style.color = "#444746";
        Object.assign(listItem.style, { padding: "5px 10px", cursor: "pointer" });
        listItem.innerText = option;

        listItem.addEventListener("click", () => {
            titleInput.focus();
            titleInput.value = titleInput.value.trim() === "" ? option : titleInput.value + option;
            const inputEvent = new Event('input', { bubbles: true });
            titleInput.dispatchEvent(inputEvent);
            list.style.display = "none";
        });

        listItem.addEventListener("mouseover", () => listItem.style.background = "#ddd");
        listItem.addEventListener("mouseout", () => listItem.style.background = "white");

        list.appendChild(listItem);
    });
}

//ボタンを押したらリストが出てくる仕組みを作成
function setupDropdownToggle(button, list, otherList) {
    button.addEventListener("click", event => {
        event.stopPropagation();
        if (otherList.style.display === "block") {
            otherList.style.display = "none";
        }
        list.style.display = list.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", event => {
        if (!button.contains(event.target) && !list.contains(event.target)) {
            list.style.display = "none";
        }
    });
}

//予定追加のモーダル画面に余白を追加してボタンを設置してリスト表示できるようにする。
function addCustomDropdown(screen) {

    //もう既にボタンが作成されていたら操作を中止
    if (document.getElementById("custom-menu-button")) return;

    let titleWrapper = document.querySelector(screen.target);

    //ボタンとリストを作成
    let menuButton = createDropdownButton("custom-menu-button", "タグ1");
    let menuButton2 = createDropdownButton("custom-menu-button2", "タグ2");
    let dropdownList = createDropdownList("custom-dropdown-list");
    let dropdownList2 = createDropdownList("custom-dropdown-list2");

    let titleInput = document.querySelector(screen.title);

    //使用者のユーザーメールとスプレッドシートのメール欄を照らし合わせ、該当のタグをリストに追加
    let userInfo = info.find(user => user.email === email);
    if (userInfo) {
        populateDropdown(dropdownList, userInfo.categories, titleInput);
        populateDropdown(dropdownList2, userInfo.options, titleInput);
    }

    //ボタンを押すとリストが出てくるように設定
    setupDropdownToggle(menuButton, dropdownList, dropdownList2);
    setupDropdownToggle(menuButton2, dropdownList2, dropdownList);

    //ボタンとリストを挿入
    titleWrapper.parentNode.insertBefore(menuButton, titleWrapper);
    titleWrapper.parentNode.insertBefore(dropdownList, titleWrapper);
    titleWrapper.parentNode.insertBefore(menuButton2, titleWrapper);
    titleWrapper.parentNode.insertBefore(dropdownList2, titleWrapper);
}

// モーダルのIDとその関連情報を格納する辞書
let modalIdMap = {
    defaultScreen: {
        target: '.Fgl6fe-fmcmS-yrriRe-OWXEXe-H9tDt.shdZ7e',
        title: 'input[aria-label="タイトルを追加"]'
    },
    detailScreen: {
        target: '.UXzdrb',
        title: 'input[aria-label="タイトル"]'
    }
};

//モーダルが出てきたら一連の操作を開始する
const observer = new MutationObserver(() => {
    if (document.querySelector(modalIdMap.defaultScreen.target)) {
        addCustomDropdown(modalIdMap.defaultScreen);
        document.getElementById("custom-menu-button2").style.marginLeft = "10px";
        document.querySelector(".mvRfff").style.padding = "0 0 0 20px";
    }

    if (document.querySelector(modalIdMap.detailScreen.target)) {
        addCustomDropdown(modalIdMap.detailScreen)
        document.getElementById("custom-menu-button").style.margin = "5px 0 0 64px";
        document.getElementById("custom-menu-button2").style.margin = "5px 0 0 10px";
        document.getElementById("custom-dropdown-list").style.margin = "0 0 0 64px";
        document.getElementById("custom-dropdown-list2").style.margin = "0 0 0 64px";
        document.querySelector(".RfMZ0c").style.padding = "0 0 16px 0";
        document.querySelector(".UywwFc-LgbsSe.UywwFc-StrnGf-YYd4I-VtOx3e.guz9kb").style.margin = "0 0 0 16px";
    }
});

//予定追加のモーダルが出てこないか常時監視
observer.observe(document.body, { childList: true, subtree: true });
