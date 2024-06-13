"ui";
importClass(android.graphics.Paint)
importClass(android.content.Intent);
importClass(android.graphics.BitmapFactory);
importClass(android.provider.MediaStore);
importClass(android.webkit.MimeTypeMap);
/**
 * @typedef {Object} Rect
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * @typedef {Object} QQInfo
 * @property {string} qq
 * @property {number} status  // status 0 待添加 1 待验证  2 已添加
 * @property {any} result
 */
var delayinteval = 3000;
var imgAnyFileRequestCode = 1005;
var defaultConfig = {
    verifyInfo: "待答案的验证目前可选", // 验证信息
    bakInfo: "OK跟单员没事就来跟我单，大哥带你吃币币, 私有化部署懂得来，不要问我为啥挣这么多了...", //备注信息
    btnw: 150,
    filePath: "", // 文本提示信息 可以不改界面配置
    scanSaveQQPath: "", // 默认存储路径
    groupQQ: 1, // 一批次加多少个QQ
    index: 0, // 执行标记
    successCount: 0, // 已加好友个数
    failCount: 0, //
    startProcess: false,
}

var autoScriptThread = null;
auto.waitFor();
if (!auto.service) {
    toast("请开启无障碍服务");
}
toast("自动添加QQ好友~~😁")
const storage = storages.create("logStorage");
function loggerTrace(key, data) {
    storage.put(key, data);
    console.log(`logger: key:${key}:data:${JSON.stringify(data)}`)
    ui.run(() => {
        toast(JSON.stringify(data));
    })

}
var qqFirends = [];
function loadQQInfos(jsonString) {
    // var jsonString = '{"waitQQ":[{"qq":"1286594907"},{"qq":"1328566929"}]}';
    var jsonObject = JSON.parse(jsonString);
    // 提取 QQ 信息
    var qqArray = jsonObject.waitQQ.map(function (item) {
        return item
    });
    return qqArray;
}
function sleepSelf(interval) {
    sleep(interval)
}


function isEmptyString(str) {
    return str === null || str === undefined || str.trim() === '';
}

function buildInputText(key, title, fontSize, hintText, textColor, initalText) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text><input id={key} hint={hintText} w="*" h='auto' text={initalText} /></horizontal>
}
function buildFileLoad(key, title, fontSize, hintText, textColor, initalText, fileTip, btnId) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text><input id={key} hint={hintText} maxWidth={device.width / 2} text={initalText} /><button id={btnId} paddingLeft="8" style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#00000000" textColor="#0000FF" text={fileTip} w="*"></button></horizontal>
}
function buildDrowpLineDelayInterval() {
    return <horizontal paddingLeft="16">
        <text textSize="16sp" textStyle='bold|italic'>延迟交互操作(快|中|慢)</text>
        <spinner id="delaydrop" entries="3000|4000|6000" />
    </horizontal>
}
const statusColors = {
    0: "#ff0000",
    1: "#00ff00",
    2: "#0000ff"
};
// 处理数据函
// 待添加的QQ列表
function buildWaitQQList() {
    return <list id="waitqqlist" h='*'>
        <card w="*" h="auto" margin="10 5" cardCornerRadius="3dp"
            cardElevation="1dp" foreground="?selectableItemBackground">
            <horizontal gravity="center_vertical">
                <View bg="#00ff00" h="*" w="3" />
                <vertical padding="5" h="auto" w="0" layout_weight="1">
                    <text text="{{this.qq}}" textColor="#222222" textSize="14sp" textStyle="bold" maxLines="2" />
                    <text id="verifyInfo" text={defaultConfig.verifyInfo} textColor="#88667755" textSize="10sp" maxLines="2" />
                    <text id="bakInfo" text={defaultConfig.bakInfo} textColor="#999999" textSize="9sp" maxLines="2" />
                </vertical>
                <button id="delete" style="Widget.AppCompat.Button.Borderless" bg="#FFFFFF" w="auto" h="auto" marginLeft="4" marginRight="6" text="删除" textColor="#ff0000" fontSize="13sp" />
            </horizontal>
        </card>
    </list>
}
function isEmptystr(str) {
    if (str == null || str == undefined || str == "") {
        return true
    } else {
        return false
    }
}

$ui.layout(
    <frame >
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="自动QQ脚本"></toolbar>
            </appbar>
            {buildInputText('verifyInfo', '答案验证（可选）:', "16sp", "请输入答案~~~", "#000000", defaultConfig.verifyInfo)}
            {buildInputText('bakInfo', '备注信息（必填）:', "16sp", "请输入备注信息~~~", "#000000", defaultConfig.bakInfo)}
            {buildFileLoad('filePath', 'QQFile:', "16sp", "请选择文件~~~", "#000000", defaultConfig.filePath, "选择文件", "btnselectFile")}
            {buildDrowpLineDelayInterval()}
            {buildWaitQQList()}
        </vertical>
    </frame>
);


$ui.waitqqlist.on("item_bind", function (itemView, itemHolder) {
    itemView.delete.on("click", () => {
        let item = itemHolder.item;
        confirm("删除这条?")
            .then(clear => {
                log(clear)
                if (clear) {
                    let index = qqFirends.findIndex(element => element.qq === item.qq);
                    // 如果找到，则删除该元素
                    if (index !== -1) {
                        qqFirends.splice(index, 1);
                        ui.run(() => {
                            $ui.waitqqlist.setDataSource(qqFirends);
                        })
                    }
                }
                else {
                    ui.run(() => {
                        $ui.waitqqlist.setDataSource(qqFirends);
                    });
                }
            });
    });
});
$ui.btnselectFile.on('click', () => {
    let fileType = "application/json";
    let requestCode = imgAnyFileRequestCode;
    var intent = new Intent();
    intent.setType(fileType);
    intent.setAction(Intent.ACTION_GET_CONTENT);
    activity.startActivityForResult(intent, requestCode);

});

events.on('activity', function (activity) {
    log("Activity changed to: " + activity);
    if (activity.includes("com.tencent.mobileqq")) {
        log("QQ Activity Detected: " + activity);
        // 在特定的QQ Activity上执行操作
        if (activity.includes(".activity.SplashActivity")) {
            // QQ 启动页活动
            log("QQ启动页活动");
        } else if (activity.includes(".activity.FriendProfileCardActivity")) {
            // QQ 好友资料卡活动
            log("QQ好友资料卡活动");
        }
    }
});
function URIUtils_uriToFile(uri) {
    //Source : https://www.cnblogs.com/panhouye/archive/2017/04/23/6751710.html
    var r = null,
        cursor,
        column_index,
        selection = null,
        selectionArgs = null,
        isKitKat = android.os.Build.VERSION.SDK_INT >= 19,
        docs;
    log("originalurl", uri.toString())
    if (uri.getScheme().equalsIgnoreCase("content")) {
        if (isKitKat && android.provider.DocumentsContract.isDocumentUri(activity, uri)) {
            if (String(uri.getAuthority()) == "com.android.externalstorage.documents") {
                docs = String(android.provider.DocumentsContract.getDocumentId(uri)).split(":");
                if (docs[0] == "primary") {
                    return android.os.Environment.getExternalStorageDirectory() + "/" + docs[1];
                }
            } else if (String(uri.getAuthority()) == "com.android.providers.downloads.documents") {
                var id = android.provider.DocumentsContract.getDocumentId(uri);
                log('idxx', id)
                if (id.startsWith("raw:")) {
                    return id.substring(4);
                } else {
                    uri = android.content.ContentUris.withAppendedId(
                        android.net.Uri.parse("content://downloads/public_downloads"),
                        parseInt(id.split(":")[1])
                    );
                    return getFilePathFromURI(uri)
                }
            }
            else if (String(uri.getAuthority()) == "com.android.providers.media.documents") {
                docs = String(android.provider.DocumentsContract.getDocumentId(uri)).split(":");
                if (docs[0] == "image") {
                    uri = android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if (docs[0] == "video") {
                    uri = android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if (docs[0] == "audio") {
                    uri = android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }
                selection = "_id=?";
                selectionArgs = [docs[1]];
            }
        }
        try {
            cursor = activity.getContentResolver().query(uri, ["_data"], selection, selectionArgs, null);
            if (cursor && cursor.moveToFirst()) {
                r = String(cursor.getString(cursor.getColumnIndexOrThrow("_data")));
            }
        } catch (e) {
            log(e);
        }
        if (cursor) cursor.close();
        return r;
    } else if (uri.getScheme().equalsIgnoreCase("file")) {
        return String(uri.getPath());
    }
    return null;
}
function getFilePathFromURI(uri) {
    var filePath = null;
    if ("content" == uri.getScheme()) {
        try {
            var documentFile = android.support.v4.provider.DocumentFile.fromSingleUri(context, uri);
            if (documentFile != null && documentFile.exists()) {
                filePath = documentFile.getUri().getPath();
            }
        } catch (e) {
            log(e);
        }
    }
    return filePath;
}
function loadFileListByJson(filepath) {
    log(files.read(filepath))
    if (!files.exists(filepath)) {
        toastLog('File not found');
        return;
    }
    qqFirends = loadQQInfos(files.read(filepath));
    $ui.waitqqlist.setDataSource(qqFirends);
}

activity.getEventEmitter().on("activity_result", (requestCode, resultCode, data) => {
    if (resultCode != -1) {
        toastLog("没有选择文件!");
        return false;
    } else {
        var uri = data.getData();
        log("uri: %s", uri.toString());
        let filepath = URIUtils_uriToFile(uri);
        log(filepath)
        if (filepath != null) {
            ui.run(() => {
                ui.filePath.setText(filepath);
                loadFileListByJson(filepath);
            });
        } else {
            ui.run(() => {
                toast('file not selected');
            });
        }
    }
});
function startProcess() {
    log("processing", defaultConfig.startProcess)
    try {
        if (defaultConfig.startProcess === true) {
            ui.run(() => toastLog("目前有正在执行的自动化脚本任务，请耐心等待"));
            return;
        }
        if (isEmptystr(ui.bakInfo.getText())) {
            toastLog("请输入备注信息")
            return
        }
        if (qqFirends.count == 0 || isEmptystr(ui.filePath.getText())) {
            toastLog("请先设置要添加的QQ列表");
            return;
        }
        confirm("开始添加列表中的QQ?")
            .then(sure => {
                if (sure) {
                    autoScriptThread = threads.start(function () {
                        startAddQQ();
                    });
                }
            });
    } catch (error) {
        log("error", error);
    }


}
function startScanQQGroup() {
    if (isEmptystr(ui.bakInfo.getText())) {
        toastLog("请输入备注信息")
        return
    }
    toastLog('开始爬取qq群组')
}
// addFloatStartButton("startscan", "采集", 50, device.height - defaultConfig.btnw - 140,defaultConfig.btnw,defaultConfig.btnw, () => {
//     updateByDelayInterval();
//     startScanQQGroup();
// });

addFloatStartButton("startbtn", "开始", device.width - (defaultConfig.btnw) - 50, device.height - defaultConfig.btnw - 140, defaultConfig.btnw, defaultConfig.btnw, () => {
    updateByDelayInterval()
    startProcess()
});
function addFloatStartButton(btnid, title, x, y, w, h, clickaction) {
    var btnWindow = floaty.window(
        <frame gravity="center">
            <button id={btnid} style="Widget.AppCompat.Button.Colored" bg="#ffffff00" text={title} textColor="#FFFFFF" textStyle='bold' w={`${w}px`} h={`${h}px`} textSize="13sp" />
        </frame>
    );
    btnWindow.setPosition(x, y);
    btnWindow[btnid].on('click', clickaction);
    // 设置圆形按钮的背景和样式
    var colors = [android.graphics.Color.GREEN, android.graphics.Color.GRAY, android.graphics.Color.BLUE]; // 设置渐变的颜色数组
    var bgDrawable = new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.BL_TR, colors);
    bgDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
    btnWindow[btnid].setBackground(bgDrawable);
}

function updateByDelayInterval() {
    if ($ui.delaydrop.getSelectedItemPosition() === 0) {
        delayinteval = 3000;
    } else if ($ui.delaydrop.getSelectedItemPosition() === 1) {
        delayinteval = 4000;
    } else {
        delayinteval = 6000;
    }
}
// 延迟函数操作
function executeDelayedClosure(closure, delayInSeconds, numberOfExecutions) {
    let count = 0;
    const intervalId = setInterval(() => {
        if (count < numberOfExecutions) {
            closure();
            count++;
        } else {
            clearInterval(intervalId);
        }
    }, delayInSeconds * 1000);
}
function closeApp() {
    ui.finish()
}


function addFriendPageOperation(item) {
    var isExistVertify = className("android.widget.EditText").text("输入答案").exists()
    const message = (isExistVertify === true) ? `${item.qq}开启了好友认证` : `${item.qq}未开启可直接加好友`
    console.log(`${message}`)
    if (isExistVertify === true) {
        var verifyobj = className("android.widget.EditText").text("输入答案").findOne()
        verifyobj.click();
        sleepSelf(delayinteval);
        verifyobj.setText(defaultConfig.verifyInfo)
        sleepSelf(delayinteval);
    }
    var bakexist = className("android.widget.EditText").text("输入备注").exists();
    // 找到备注开启添加好友流程
    if (bakexist === true) {
        var result = className("android.widget.EditText").text("输入备注").findOne();
        result.click();
        sleepSelf(delayinteval);
        result.setText(defaultConfig.bakInfo);
        sleepSelf(delayinteval);
        className("android.widget.Button").text("发送").findOne().click()
        loggerTrace(item.qq, { "qq": item.qq, "result": { "code": true, "message": "加好友成功", "data": JSON.stringify(item) } })
        defaultConfig.successCount += 1;
    }
    else {
        loggerTrace(item.qq, { "qq": item.qq, "result": { "code": false, "message": "加好友失败,继续QQ空间操作", "data": JSON.parse(item) } })
        sleepSelf(delayinteval);
        processQQZone(item);
    }
}

function processAddFriend(item) {
    log(`第${defaultConfig.index}位选手:${item.qq} 正在添加`)
    // 当前主页
    if (isEmptyString(item.qq)) {
        toast('qq为空请设置')
        return;
    } else {
        // 打开好友
        app.startActivity({
            action: "android.intent.action.VIEW",
            data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + item.qq,
            packageName: "com.tencent.mobileqq",
        });
        sleepSelf(delayinteval);
        if (className("android.widget.TextView").text("加为好友").exists() === true) {
            className("android.widget.TextView").text("加为好友").findOne().click()
            sleepSelf(delayinteval);
            addFriendPageOperation(item);
        } else {
            loggerTrace(item.qq, { "code": "dupulicateqq", "msg": "该QQ是你的好友" })
        }
    }
}
/**
 * Finds the bounds of a specific item in a RecyclerView.
 * @returns {Rect | null} The bounds of the found item, or null if not found.
 */
function findRecycleItem() {
    var recyclerView = className("androidx.recyclerview.widget.RecyclerView").indexInParent(5).findOne();
    console.log(JSON.stringify(recyclerView));
    if (recyclerView) {
        console.log("搜索找item");
        var bounds = recyclerView.bounds();
        console.log("RecyclerView bounds:", JSON.stringify(bounds));

        let result = null;
        recyclerView.children().forEach(function (child) {
            if (child.className() === "androidx.recyclerview.widget.RecyclerView") {
                console.log("Child RecyclerView found at index:", child.indexInParent());
                if (child.indexInParent() === 0) {
                    console.log("Searching deeper into child RecyclerView");
                    child.children().forEach(function (depchild) {
                        console.log("Depth child className and index:", depchild.className(), depchild.indexInParent());
                        if (depchild.indexInParent() === 5) {
                            console.log("Target item bounds found:", depchild.bounds());
                            result = depchild.bounds();
                        }
                    });
                }
            }
        });

        if (result) {
            return result;
        } else {
            console.log("未找到目标元素");
            return null;
        }
    } else {
        console.log("未找到 RecyclerView");
        return null;
    }
}
function processQQZone(item) {
    desc('搜索框').findOne().click()
    sleepSelf(delayinteval);
    var resultsearch = className("android.widget.EditText").text("搜索").findOne()
    sleepSelf(delayinteval);
    resultsearch.click();
    resultsearch.setText(item.qq);
    sleepSelf(delayinteval);
    className("android.widget.LinearLayout").clickable(true).findOne().click()
    sleepSelf(delayinteval);
    var bounds = findRecycleItem();
    if (bounds === null) {
        toast("QQ版本不兼容问题未找到该元素")
        return;
    }
    click(bounds)
    //添加好友
    sleepSelf(delayinteval);
    className("android.widget.Button").text("加好友").findOne().click()
    sleepSelf(delayinteval);
    addFriendPageOperation(item);
}
function resetConfig() {
    defaultConfig.index = 0;
    defaultConfig.successCount = 0;
    defaultConfig.failCount = 0;
    defaultConfig.startProcess = false;
}
function startAddQQ() {
    defaultConfig.startProcess = true;
    toast("开始加QQ啦😁~~~~");
    log(delayinteval);
    resetConfig();
    sleepSelf(delayinteval);
    home();
    sleepSelf(delayinteval);
    launch("com.tencent.mobileqq");
    sleepSelf(delayinteval);
    console.log("QQ 打开中");
    try {
        while (defaultConfig.index <= qqFirends.length - 1) {
            processAddFriend(qqFirends[defaultConfig.index])
            defaultConfig.index++;
        }
        loggerTrace("taskfinish", { "code": "finish", "msg": "任务完成", "data": JSON.stringify({ "successCount": defaultConfig.successCount, "failCount": defaultConfig.index - defaultConfig.successCount, "total": defaultConfig.index }) });
        autoScriptThread.interrupt();
        defaultConfig.startProcess = false;
    } catch (error) {
        log("error", error)
    }
}