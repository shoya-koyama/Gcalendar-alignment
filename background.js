chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getEmail") {
        chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, function (userInfo) {
            if (userInfo.email) {
                console.log("【バックグラウンド】取得したGoogleアカウント:", userInfo.email);
                sendResponse({ email: userInfo.email });
            } else {
                console.log("【バックグラウンド】メールアドレスを取得できませんでした。");
                sendResponse({ error: "メールアドレスを取得できませんでした。" });
            }
        });
        return true;
    }
});
