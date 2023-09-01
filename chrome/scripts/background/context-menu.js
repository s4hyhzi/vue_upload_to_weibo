/*
 * Copyright (c) 2018 The Weibo-Picture-Store Authors. All rights reserved.
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file.
 */

import {
    M_UPLOAD_FRAME,
    M_BATCH_DELETE,
    M_UPLOAD_IMAGE,
    M_OPEN_HISTORY,
    M_DOWNLOAD_LOG,
    ET_UPLOAD_MUTATION,
    NID_COPY_URL_FAIL,
} from "../sharre/constant.js";
import { Utils } from "../sharre/utils.js";
import { Base64 } from "../sharre/base64.js";
import { PConfig } from "../sharre/constant.js";
import { WeiboUpload } from "./weibo-action.js";
import { fetchBlob } from "./fetch-blob.js";
import { Log } from "../sharre/log.js";
import { weiboConfig } from "./weibo-config.js";

const contentScriptUploader = new WeiboUpload();

contentScriptUploader.addEventListener(ET_UPLOAD_MUTATION, e => {
    chrome.browserAction.setBadgeBackgroundColor({ color: "#8E7467" }, () => {
        chrome.browserAction.setBadgeText({ text: String(e.detail.size || "") });
    });
});

/**
 * @param {{done: boolean, value: PackedItem|null}} [it]
 */
function autoCopyUrlToClipboard(it) {
    if (it && !it.done && it.value) {
        const item = it.value;
        const suffix = PConfig.weiboSupportedTypes[item.mimeType].typo;
        const url = `${weiboConfig.scheme + PConfig.randomImageHost}/large/${item.pid + suffix}`;
        const result = Utils.writeToClipboard(url);
        if (!result) {
            chrome.notifications.create(NID_COPY_URL_FAIL, {
                type: "basic",
                iconUrl: chrome.i18n.getMessage("notify_icon"),
                title: chrome.i18n.getMessage("info_title"),
                message: "操作失败：链接没有复制到剪切板中(lll￢ω￢)",
            });
        }
    }
}

/**
 * @desc 上传记录的批量删除菜单
 */
chrome.contextMenus.create({
    title: "移除选中的文件",
    id: M_BATCH_DELETE,
    contexts: ["link"],
    visible: false,
    documentUrlPatterns: [chrome.runtime.getURL("history.html"), chrome.runtime.getURL("history.html?*")],
});

/**
 * @desc 历史记录
 */
chrome.contextMenus.create({
    title: "上传记录",
    contexts: ["browser_action"],
    id: M_OPEN_HISTORY,
});

/**
 * @desc 导出日志
 */
chrome.contextMenus.create({
    title: "导出日志",
    contexts: ["browser_action"],
    id: M_DOWNLOAD_LOG,
});

/**
 * @desc 上传当前视频帧
 */
chrome.contextMenus.create({
    title: "把当前的视频帧上传到微相册",
    contexts: ["video"],
    id: M_UPLOAD_FRAME,
});

/**
 * @desc 上传图片
 */
chrome.contextMenus.create({
    title: "把这张图片上传到微相册",
    contexts: ["image"],
    id: M_UPLOAD_IMAGE,
});

/**
 * @desc contextmenu events handler
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("context-menu.js: chrome.contextMenus.onClicked.addListener")
    switch (info.menuItemId) {
        case M_DOWNLOAD_LOG:
            Log.download();
            break;
        case M_OPEN_HISTORY:
            chrome.tabs.create({ url: "history.html" });
            break;
        case M_UPLOAD_IMAGE:
            fetchBlob(info.srcUrl, info.frameUrl || info.pageUrl).then(blob => {
                contentScriptUploader.addQueues([blob]);
                contentScriptUploader.triggerIteration(autoCopyUrlToClipboard);
            });
            break;
        case M_UPLOAD_FRAME:
            chrome.tabs.sendMessage(
                tab.id,
                { type: M_UPLOAD_FRAME, srcUrl: info.srcUrl, info: info },
                { frameId: info.frameId },
                response => {
                    /**
                     * @var {{dataURL: string}} response
                     */
                    if (response) {
                        const [t, b64] = response.dataURL.split(",");
                        if (b64) {
                            const blob = new Blob([Base64.toBuffer(b64)]);
                            contentScriptUploader.addQueues([blob]);
                            contentScriptUploader.triggerIteration(autoCopyUrlToClipboard);
                        }
                    }
                },
            );
            break;
    }
});
