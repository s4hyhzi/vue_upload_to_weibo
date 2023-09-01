/*
 * Copyright (c) 2018 The Weibo-Picture-Store Authors. All rights reserved.
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file.
 */

/**
 * @desc 仅需要引入让其执行
 */
import "./background/start-popup.js";
import "./background/start-changelog.js";
import "./background/weibo-referer.js";
import "./background/context-menu.js";
import "./background/file-progress.js";
import "./background/events-handler.js";
import "./background/reflect-store.js";

/**
 * @desc 不需要初始化，但是需要导出到外部
 */
import { LogStore, ShareStore, WeiboStore } from "./background/persist-store.js";
import { fetchBlob } from "./background/fetch-blob.js";
import { WeiboStatic, WeiboUpload } from "./background/weibo-action.js";
import { weiboConfig } from "./background/weibo-config.js";
import { requestUpload } from "./weibo/upload.js";

// 生成一个uuid文件名
const generateUUID = () => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line no-bitwise
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);

        // eslint-disable-next-line no-bitwise
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}


// 传入一个base64字符串返回一个File对象
const dataURLtoFile = (dataurl) => {
    // 获取文件的后缀名，并且生成一个uuid文件名，然后拼接在一起
    const filename = generateUUID() + '.' + dataurl.split(';')[0].split('/')[1];
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
};

// 监听来自content-script的消息
chrome.runtime.onMessageExternal.addListener(async function (request, sender, sendResponse) {
    // console.log(request);
    // 可以针对sender做一些白名单检查
    // sendResponse返回响应
    if (request.type == 'UploadToWeibo') {
        if (!request.data.base64) {
            sendResponse({ code: -1, msg: 'base64不能为空' });
            return;
        }
        const file = dataURLtoFile(request.data.base64);
        // console.log("file", file);
        try {
            const result = await requestUpload(file);
            const { pid } = result;
            let file_name;
            // 判断文件类型时，如果是gif，用.gif结尾，否则用.jpg结尾
            if (file.type === 'image/gif') {
                file_name = `${pid}.gif`;
            } else {
                file_name = `${pid}.jpg`;
            }
            const url = `https://fc.sinaimg.cn/large/${file_name}`;
            const data = {
                pid,
                url,
                file_name,
            }
            // console.log("result", result);
            sendResponse({ code: 0, msg: '上传成功', data });
        }
        catch (e) {
            sendResponse({ code: -1, msg: e.message });
        }
    }
});


/**
 * @desc Core Share Module (APIs)
 */
self.coreAPIs = { LogStore, ShareStore, WeiboStore, weiboConfig, fetchBlob, WeiboStatic, WeiboUpload };
