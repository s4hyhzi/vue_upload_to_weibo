/*
 * Copyright (c) 2018 The Weibo-Picture-Store Authors. All rights reserved.
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    S_WITHOUT_CORS_MODE,
    S_COMMAND_POINTER_EVENTS,
    NID_REMAIN_LOGOUT,
    NID_MISMATCH_CORS,
} from "../sharre/constant.js";

chrome.notifications.onClicked.addListener(notificationId => {
    console.log("events-handler.js: chrome.notifications.onClicked.addListener");
    if (notificationId === NID_REMAIN_LOGOUT) {
        const url = `https://weibo.com/login.php?url=${encodeURIComponent("https://weibo.com")}`;
        chrome.tabs.create({ url }, tab => chrome.notifications.clear(NID_REMAIN_LOGOUT));
    }
});

chrome.commands.onCommand.addListener(command => {
    console.log("events-handler.js: chrome.commands.onCommand.addListener");
    if (command === "execute_pointer_events") {
        chrome.tabs.query(
            {
                active: true,
                currentWindow: true,
            },
            tabs => {
                for (const tab of tabs) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: S_COMMAND_POINTER_EVENTS,
                        command: command,
                    });
                }
            },
        );
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("events-handler.js: chrome.runtime.onMessage.addListener");
    if (message.type === S_WITHOUT_CORS_MODE) {
        chrome.notifications.create(NID_MISMATCH_CORS, {
            type: "basic",
            iconUrl: chrome.i18n.getMessage("notify_icon"),
            title: chrome.i18n.getMessage("warn_title"),
            message: "当前资源的网络请求不符合 CORS 规范，无法读取资源的数据",
        });
    }
});
