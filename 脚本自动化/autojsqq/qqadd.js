// 1.搜索qq进入资料页，点添加按钮，填入验证信息和备注，加人
// 2.返回资料页后，再次点加人按钮，看看刚刚填的备注信息还在不在，然后返回
// 3-1.如果备注信息在。就继续返回加下一个人
// 3-2.如果备注不在，就从资料页点击进入qq空间，空间也有加人按钮。点击加人，输入验证信息和备注，加人
// 4.返回空间，再点击加人，查看刚刚的备注在不在，然后返回
// 5-1.如果备注不在了，程序结束
// 5-2.如果备注还在，继续加下一个人，只是下一个人不再通过资料页添加，直接走qq空间加人。加人后同样要验证备注是否还在
"ui";
auto.waitFor();
importClass(android.graphics.Paint)
importClass(android.content.Intent);
importClass(android.graphics.BitmapFactory);
importClass(android.provider.MediaStore);
importClass(android.webkit.MimeTypeMap);
importClass(android.view.View);
importClass(android.view.KeyEvent);
importClass(android.content.Intent);
importClass(android.content.BroadcastReceiver);
importClass(android.widget.Switch);
activity.getWindow().setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
// setScreenMetrics(1440, 2560);
/**
 * @typedef {Object} Rect
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * @typedef {Object} QQItem
 * @property {string} qq
 * @property {number} status  // status 0  1备注上的进入待验证 -1表示异常
 * @property {string} statusMessage
 */
//找的设备是 pixel xl 
devicePeixl = {
    width: 1440,
    height: 2560
}

var delayinteval = 3000;
var imgAnyFileRequestCode = 1005;

function formatBakDefault() {
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth() + 1;
    var currentDay = currentDate.getDate();
    var formattedMonth = currentMonth < 10 ? '0' + currentMonth : currentMonth;
    var formattedDay = currentDay < 10 ? '0' + currentDay : currentDay;
    var formattedDate = `${formattedMonth}-${formattedDay}`;
    return formattedDate;
}
var defaultConfig = {
    verifyInfo: "待答案的验证目前可选", // 验证信息
    requestverifyInfo: "交个朋友在QQ看到你资料很感兴趣~~~",
    bakInfo: '',
    btnw: 150,
    filePath: "", // 文本提示信息 可以不改界面配置
    scanSaveQQPath: "", // 默认存储路径
    groupQQ: 1, // 一批次加多少个QQ
    index: 0, // 执行标记
    failCount: 0, //
    startProcess: false,
    flagQQZonePorcessAdd: false, // 是否从QQ空间直接加人 标记决定是否触发风控 触发后就不在加人
    byredirectQQCount: 0,
    byQQZoneCount: 0,
    qqsInput: "", //
    author: 'TG:@ctqq9',
    validCode: "",
    usepwd: 'true',
    isdebug: true,
    lastOperationQQ: "",
    findOneTimeOut: 5000,
    expirationDate: new Date(2024, 9, 30, 0, 0, 0),
    displayLog: false,
    operationItemtimeout: 120 * 1000,
    validQQlist: [],
}
defaultConfig.bakInfo = formatBakDefault();
var autoScriptThread = null;
function requestPermission() {
    if (!floaty.checkPermission()) {
        toast("请开启悬浮窗和后台弹出界面权限");
        floaty.requestPermission();
        return
    }
}
requestPermission();
const storage = storages.create("logStorage");
function loggerTrace(key, data) {
    storage.put(key, data);
    log(`logger: key:${key}:data:${JSON.stringify(data)}`)
    ui.run(() => {
        toast(JSON.stringify(data));
    })
}
//  暗门
function checkExpiration() {
    var expirationTimeMillis = defaultConfig.expirationDate.getTime();
    var result = 0;
    var currentTimeMillis = new Date().getTime();
    if (currentTimeMillis > expirationTimeMillis) {
        result = 1;
    } else {
        result = 0;
    }
    return result;
}
function getLastOperationQQ() {
    const lastOperationQQ = storage.get('closebycurrentQQ', null)
    return lastOperationQQ;
}
defaultConfig.lastOperationQQ = getLastOperationQQ();
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
    if (defaultConfig.startProcess === false) {
        return;
    }
    // 生成1秒到3秒的随机值，单位为毫秒
    var randomValue = Math.floor(Math.random() * 700) + 1000;
    // 最终的睡眠时间为传入的间隔时间加上随机值
    var finalInterval = interval + randomValue;

    // 调用sleep函数进行睡眠
    sleep(finalInterval);
}
function getFormattedTimestamp() {
    // 获取当前时间戳
    let now = new Date();
    // 获取各个时间部分
    let year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，因此需要+1
    let day = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');

    // 格式化日期时间为 yyyy-mm-dd hh:mm:ss
    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

function buildInputText(key, title, fontSize, hintText, textColor, initalText) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text><input id={key} hint={hintText} textSize={fontSize} w="*" h='auto' text={initalText} /></horizontal>
}
function buildInputPWDText(key, title, fontSize, hintText, textColor, initalText) {
    return <vertical visibility="gone" paddingLeft="16" paddingRight="16" h='auto'>
        <horizontal>
            <text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text>
            <input id={key} hint={hintText} textSize={fontSize} h='auto' maxWidth={device.width / 2} text={initalText} />
            <button paddingLeft='0s' id='showpwd' w='50px' h='50px' style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#00000000" textSize="14"></button>
        </horizontal>
        <horizontal>
            <button w='*' padding={`16 0 12 0`} style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#00000000" textColor="#187218" id='saveksn'>保存</button>
        </horizontal>
    </vertical>
}
function buildInputText2(key, title, fontSize, textColor) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text id={key} text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text></horizontal>
}
function buildFileLoad(key, title, fontSize, hintText, textColor, initalText, fileTip, btnId) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text><input id={key} hint={hintText} textSize={fontSize} maxWidth={device.width / 2} text={initalText} /><button id={btnId} paddingLeft="8" style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#00000000" textColor="#187218" text={fileTip} w="*"></button></horizontal>
}
function buildDrowpLineDelayInterval() {
    return <horizontal paddingLeft="16">
        <text textSize="16sp" textStyle='bold|italic'>延迟交互操作(快|中|慢)</text>
        <spinner id="delaydrop" entries="4000|6000|7000" />
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
    return <list id="waitqqlist" minHeight={device.height / 2.0}>
        <card w="*" h="auto" margin="10 5" cardCornerRadius="3dp"
            cardElevation="1dp" foreground="?selectableItemBackground">
            <horizontal gravity="center_vertical">
                <View bg="#00ff00" h="*" w="3" />
                <vertical padding="5" h="auto" w="0" layout_weight="1">
                    <text text="{{this.qq}}" textColor="#222222" textSize="14sp" textStyle="bold" maxLines="2" />
                    <text id="requestverifyInfo" text="{{this.requestverifyInfo}}" textColor="#999999" textSize="9sp" maxLines="2" />
                    <text id="bakInfo" text="{{this.bakInfo}}" textColor="#88667755" textSize="9sp" maxLines="2" />
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
function triggerQQ() {
    const triqq = storage.get("existQQ")
    if (triqq === null || triqq === undefined) {
        return { time: "", qq: "" }
    }
    return triqq
}

function singleTaskRecord() {
    const record = storage.get("recordfinished")
    return record;
}
var lastQQTrigger = triggerQQ();
$ui.layout(
    <frame >
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="QQ摸人"></toolbar>
            </appbar>
            <scroll>
                <vertical>
                    <horizontal paddingLeft="16">
                        <text text="打开日志:" textSize="18sp" />
                        <Switch id="toggleSwitch" checked={defaultConfig.displayLog} />
                    </horizontal>
                    <horizontal>
                        <text paddingLeft="16">~~~😁更多请联系:</text>
                        <text id='cantact' text={defaultConfig.author}></text>
                    </horizontal>
                    <text paddingLeft="16" w='*' id='cleardata' textSize="9" textColor="#ff0000">出现重大问题,卡密需再次输入,点击可清理缓存,</text>
                    <text padding="16 0 0 0" id="result" h="auto" textSize="9" textStyle='bold' textColor='#BBBBBB'></text>
                    <text padding="16 0 0 0" id="lastOperationQQ" textColor='#000000' textSize="9">最后一次操作的QQ号:{defaultConfig.lastOperationQQ === null ? "暂无" : defaultConfig.lastOperationQQ}</text>
                    <text padding="16 0 0 0" id="triggerQQ" textColor='#FF0000' textSize="9">上次触发风控的QQ:{lastQQTrigger.time + lastQQTrigger.qq}</text>
                    {buildInputPWDText('validCode', `卡密(${defaultConfig.isdebug ? "可选" : "必填"}):`, "12sp", "请输入卡密~~~", "#000000", defaultConfig.validCode)}
                    {buildInputText('requestverifyInfo', '验证信息（必填）:', "12sp", "请输入验证信息~~~", "#000000", defaultConfig.requestverifyInfo)}
                    {buildInputText('bakInfo', '备注:', "12sp", "请输入备注信息~~~", "#000000", defaultConfig.bakInfo)}
                    {buildFileLoad('filePath', 'QQFile:', "12sp", "请选择文件~~~", "#000000", defaultConfig.filePath, "选择文件", "btnselectFile")}
                    {buildInputText('qqsInput', '手动录入QQ:', "12sp", "请录入qq换行符号分割", "#000000", defaultConfig.qqsInput)}
                    {buildDrowpLineDelayInterval()}
                    {buildInputText2("qqcount", "", "12sp", "#000000")}
                    {buildWaitQQList()}
                </vertical>
            </scroll>
        </vertical>
    </frame>
);


events.observeKey();
var logThread = null;
ui.toggleSwitch.setOnCheckedChangeListener(function (view, isChecked) {
    if (isChecked) {
        if (logThread == null || !logThread.isAlive()) {
            logThread = threads.start(function () {
                console.show();
            });
        }
    } else {
        if (logThread != null && logThread.isAlive()) {
            logThread.interrupt();
            logThread = null;
        }
        console.hide();
    }
});
function refreshUIFromStorage() {
    // 刷新卡密信息
    loadksn();
    ui.run(() => {
        $ui.validCode.setText(defaultConfig.validCode);
    });

    // 刷新最后操作的QQ
    defaultConfig.lastOperationQQ = getLastOperationQQ();
    ui.run(() => {
        $ui.lastOperationQQ.setText("最后一次操作的QQ号:" + (defaultConfig.lastOperationQQ === null ? "暂无" : defaultConfig.lastOperationQQ));
    });

    // 刷新上次触发风控的QQ
    lastQQTrigger = triggerQQ();
    ui.run(() => {
        $ui.triggerQQ.setText("上次触发风控的QQ:" + (lastQQTrigger.time === undefined ? "" : lastQQTrigger.time) + " " + (lastQQTrigger.qq === undefined ? "暂无" : lastQQTrigger.qq));
    });

    // 刷新操作记录结果
    updateRecordResult();

    // 刷新QQ列表
    qqFirends = []; // 清空当前列表
    ui.run(() => {
        $ui.waitqqlist.setDataSource(qqFirends);
        $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`);
    });

    // 其他可能需要刷新的UI元素...
}
//开发时刻需要随时注意
// storage.clear();
$ui.lastOperationQQ.on('click', () => {
    if (lastQQTrigger) {
        setClip(`${defaultConfig.lastOperationQQ}`);
        toast("已拷贝")
    }
});
$ui.triggerQQ.on('click', () => {
    if (lastQQTrigger !== null && lastQQTrigger !== undefined) {
        setClip(`${lastQQTrigger.qq === undefined ? "" : lastQQTrigger.qq}`);
        toast("已拷贝")
    }
});
$ui.cleardata.on('click', () => {
    confirm('确认清理缓存?').then((sure) => {
        if (sure) {
            storage.clear();
            ui.run(() => {
                refreshUIFromStorage();
                toast('清理成功')

            })
        }
    }
    );
});
updateIconShowPwd();
function updateIconShowPwd() {
    var icon = defaultConfig.usepwd === 'true' ? '🙈' : '👁️';
    $ui.showpwd.setText(icon)
    var inputType = defaultConfig.usepwd === 'true' ?
        (android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD) :
        (android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD);
    $ui.validCode.setInputType(inputType);
}
$ui.showpwd.on('click', () => {
    if (defaultConfig.usepwd === 'true') {
        defaultConfig.usepwd = 'false';
    } else {
        defaultConfig.usepwd = 'true';
    }
    updateIconShowPwd();
});

$ui.saveksn.on('click', () => {
    log('当前卡密', $ui.validCode.getText())
    if (isEmptystr($ui.validCode.getText())) {
        toast('卡密不能为空!')
        return;
    }
    confirm('确认更改卡密?').then((sure) => {
        if (sure) {
            storage.put('ksn', $ui.validCode.getText().toString())
            loadksn();
            log('变更ksn', defaultConfig.validCode);
        }
    }
    );
});
$ui.requestverifyInfo.addTextChangedListener({
    onTextChanged: function (text) {
        // 更新默认数据
        defaultConfig.requestverifyInfo = text;
    }
});

$ui.bakInfo.addTextChangedListener({
    onTextChanged: function (text) {
        // 更新默认数据
        defaultConfig.bakInfo = text;
    }
});
$ui.cantact.on("click", () => {
    setClip('TG:@ctqq9');
    toast("已拷贝")
});
$ui.triggerQQ.on("click", () => {
    if (lastQQTrigger !== null && lastQQTrigger !== undefined) {
        setClip(lastQQTrigger.qq);
        toast("已拷贝")
    }
});


function loadksn() {
    log('storageksn', storage.get('ksn', null));
    if (storage.get('ksn')) {
        defaultConfig.validCode = storage.get('ksn').toString();
        ui.run(() => {
            $ui.validCode.setText(defaultConfig.validCode);
        })
    }
    return "";
}
loadksn();

$ui.waitqqlist.on("item_bind", function (itemView, itemHolder) {
    itemView.delete.on("click", () => {
        let item = itemHolder.item;
        confirm("删除这条?")
            .then(clear => {
                if (clear) {
                    let index = qqFirends.findIndex(element => element.qq === item.qq);
                    // 如果找到，则删除该元素
                    if (index !== -1) {
                        qqFirends.splice(index, 1);
                        ui.run(() => {
                            $ui.waitqqlist.setDataSource(qqFirends);
                            $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`)
                        })
                    }
                }
                else {
                    ui.run(() => {
                        $ui.waitqqlist.setDataSource(qqFirends);
                        $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`)
                    });
                }
            });
    });
});
$ui.btnselectFile.on('click', () => {
    let fileType = "*/*";
    let requestCode = imgAnyFileRequestCode;
    var intent = new Intent();
    intent.setType(fileType);
    intent.setAction(Intent.ACTION_GET_CONTENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    activity.startActivityForResult(intent, requestCode);

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
function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
function removeExtraSpaces(str) {
    // 去掉行首和行尾的空格
    str = str.trim();
    // 用正则表达式替换多个空格为一个空格，并保留换行符
    str = str.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').replace(/\s+\n/g, '\n');
    return str;
}
function loadFileListByJson(filepath) {
    try {
        if (!files.exists(filepath)) {
            toastLog('File not found');
            return;
        }
        var res = files.read(filepath)
        log("源文件", res)
        if (typeof res === 'string') {
            var dealRes = removeExtraSpaces(res)
            var resAdd = dealRes.split("\n")
            var i = 0;
            qqFirends = resAdd.map((e) => {
                var data = { "qq": e, "index": i, "requestverifyInfo": defaultConfig.requestverifyInfo, "bakInfo": defaultConfig.bakInfo, "status": 0, "statusMessage": "" };
                i += 1;
                return data
            })
            log("txtfileload", qqFirends);
            $ui.waitqqlist.setDataSource(qqFirends);
        }
        else if (isValidJson(res)) {
            qqFirends = loadQQInfos(res);
            $ui.waitqqlist.setDataSource(qqFirends);
        }
        else {
            toastLog('文件格式不正确');
            return;
        }
        $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`)
    } catch (error) {
        log("文件错误", `${error}`)
    }

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


// 检查和弹出确认窗口的函数
function checkAndConfirm(lastQQ) {
    return new Promise((resolve, reject) => {
        if (lastQQ === null || lastQQ === undefined) {
            $ui.waitqqlist.setDataSource(qqFirends);
            $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`);
            log("使用源数据", qqFirends);
            return resolve();
        }

        let index = qqFirends.findIndex(friend => friend.qq === lastQQ);
        if (index !== -1 && index < qqFirends.length - 1) {
            // 弹出确认窗口
            confirm("确认", `是否截取QQ号 ${lastQQ} 之后的所有QQ号?,取消使用录入数据忽略上次操作`)
                .then(sure => {
                    if (sure) {
                        // 截取 lastQQ 之后的数据
                        var updatedQqFirends = qqFirends.slice(index).map(function (e, i) {
                            return {
                                index: i,
                                qq: e.qq,
                                requestverifyInfo: e.requestverifyInfo,
                                bakInfo: e.bakInfo,
                                status: e.status,
                                statusMessage: e.statusMessage
                            };
                        });
                        // 更新数据源
                        qqFirends = updatedQqFirends;
                    }
                    // 更新数据源
                    $ui.waitqqlist.setDataSource(qqFirends);
                    $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`);
                    log("更新后的数据", qqFirends);
                    resolve();
                });
        } else {
            $ui.waitqqlist.setDataSource(qqFirends);
            $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`);
            log("使用源数据", qqFirends);
            resolve();
        }
    });
}



function startProcess() {
    if (checkExpiration() === 1) {
        $ui.run(() => {
            toastLog("脚本已失效")
            confirm("该脚本已失效").then(() => {
                engines.myEngine().forceStop();
            })
        })
        return;
    }
    $ui.requestverifyInfo.setText(defaultConfig.requestverifyInfo);
    log("processing", defaultConfig.startProcess)
    if (!defaultConfig.isdebug) {
        var checkResult = checkValidCode(defaultConfig.validCode);
        if (!checkResult.isValid) {
            toastLog(checkResult.message);
            return
        }
        else {
            storage.put("ksn", defaultConfig.validCode);
        }
    }
    if (defaultConfig.startProcess === true) {
        ui.run(() => toastLog("目前有正在执行的自动化脚本任务，请耐心等待"));
        confirm("停止当前任务")
            .then(sure => {
                if (sure) {
                    if (autoScriptThread != null && autoScriptThread.isAlive) {
                        closeApp('用户取消了本次任务', true);
                    }
                }
            });
        return;
    }
    try {
        const inputText = $ui.qqsInput.getText().toString();
        if (!isEmptystr(inputText)) {
            var dealRes = removeExtraSpaces(inputText)
            var resAdd = dealRes.split("\n")
            var i = 0;
            qqFirends = resAdd.map((e) => {
                var data = { "qq": e, "index": i, "requestverifyInfo": defaultConfig.requestverifyInfo, "bakInfo": defaultConfig.bakInfo, "status": 0, "statusMessage": '' };
                i += 1;
                return data
            })
            log("手动录入数据", qqFirends);
            checkAndConfirm(defaultConfig.lastOperationQQ).then(() => {
                if (isEmptystr(ui.requestverifyInfo.getText())) {
                    toastLog("请输入验证信息")
                    return
                }
                if (qqFirends.length == 0) {
                    toastLog("请先设置要添加的QQ列表或者手动录入");
                    return;
                }
                confirm("开始添加列表中的QQ?")
                    .then(sure => {
                        if (sure) {
                            autoScriptThread = threads.start(function () {
                                //埋个暗门 
                                startAddQQ();
                            });
                        }
                    });

            });
        }
        else {
            if (qqFirends.length == 0) {
                toastLog("请先设置要添加的QQ列表或者手动录入");
                return;
            }
        }
    } catch (error) {
        toastLog("startProcess 发生异常 error", error);
        log("error", error);
    }
}
function startScanQQGroup() {
    if (isEmptystr(ui.requestverifyInfo.getText())) {
        toastLog("请输入验证信息")
        return
    }
    toastLog('开始爬取qq群组')
}
// addFloatStartButton("startscan", "采集", 50, device.height - defaultConfig.btnw - 210,defaultConfig.btnw,defaultConfig.btnw, () => {
//     updateByDelayInterval(
//     startScanQQGroup();
// });


var startWindowBtn = addFloatStartButton("startbtn", "开始", device.width - (defaultConfig.btnw) - 50, device.height * 0.2, defaultConfig.btnw, defaultConfig.btnw, () => {
    updateByDelayInterval()
    startProcess()

});
startWindowBtn.exitOnClose();
startWindowBtn.startbtn.longClick(() => {
    startWindowBtn.setAdjustEnabled(!startWindowBtn.isAdjustEnabled());
    return true;
});

var moving = false;
var x, y, windowX, windowY;
var startTime, endTime;
var screenWidth = device.width;
var screenHeight = device.height;
var longPressThreshold = 500; // 长按时间阈值（毫秒）
var moveThreshold = 10; // 移动距离阈值（像素）

startWindowBtn.startbtn.setOnTouchListener(function (view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            // 按下时记录当前悬浮窗的坐标和手指按下的坐标
            moving = true;
            x = event.getRawX();
            y = event.getRawY();
            windowX = startWindowBtn.getX();
            windowY = startWindowBtn.getY();
            startTime = Date.now();
            return true;

        case event.ACTION_MOVE:
            // 移动时更新悬浮窗的位置
            if (moving) {
                var dx = event.getRawX() - x;
                var dy = event.getRawY() - y;
                var left = windowX + dx;
                var top = windowY + dy;
                if (left < 0) left = 0;
                if (left > screenWidth - startWindowBtn.getWidth()) left = screenWidth - startWindowBtn.getWidth();
                if (top < 0) top = 0;
                if (top > screenHeight - startWindowBtn.getHeight()) top = screenHeight - startWindowBtn.getHeight();
                startWindowBtn.setPosition(left, top);
            }
            return true;

        case event.ACTION_UP:
            // 抬起时停止移动
            moving = false;
            endTime = Date.now();
            var elapsedTime = endTime - startTime;
            var dx = Math.abs(event.getRawX() - x);
            var dy = Math.abs(event.getRawY() - y);

            if (elapsedTime >= longPressThreshold && dx < moveThreshold && dy < moveThreshold) {
                // 长按且未发生显著移动
                // 触发长按事件
                startWindowBtn.startbtn.longClick();
            } else if (elapsedTime < 300 && dx < moveThreshold && dy < moveThreshold) {
                // 手指在悬浮窗上移动300毫秒以内算作点击
                startWindowBtn.startbtn.click();
            }
            return true;
    }
    return true;
});


const floatW = device.width / 3;
const floatH = device.height / 3;
log(floatH, floatW)
function addFloatStartButton(btnid, title, x, y, w, h, clickaction) {
    var btnWindow = floaty.window(
        <frame gravity="center" w='auto'>
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
    return btnWindow;
}
events.observeKey();
setInterval(() => {

}, 1000);
function updateRecordResult() {
    const result = singleTaskRecord();
    if (result !== undefined && result !== null) {
        $ui.run(() => {
            $ui.result.setText(`时间:${result.time} QQ直接添加成功数:${result.byAccount} QQZone添加数:${result.byQQZone} 失败条数:${result.failCount} 总计处理:${result.total}`)
        })
    } else {
        $ui.run(() => {
            $ui.result.setText(`暂无操作记录`)
        })
    }

}
updateRecordResult()
function updateByDelayInterval() {
    if ($ui.delaydrop.getSelectedItemPosition() === 0) {
        delayinteval = 3000;
    } else if ($ui.delaydrop.getSelectedItemPosition() === 1) {
        delayinteval = 8000;
    } else {
        delayinteval = 10000;
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

function closeApp(reason, byuserForce) {
    defaultConfig.startProcess = false;
    ui.run(() => {
        startWindowBtn.startbtn.setText('开始')
    })
    if (defaultConfig.index >= 0 && defaultConfig.index <= qqFirends.length - 1) {
        let qqFriend = qqFirends[defaultConfig.index];
        if (qqFriend !== null && qqFriend !== undefined) {
            // 记录最后一次操作的QQ号
            log("记录了最后一次操作的QQ", qqFriend.qq);
            // 存储最后操作的QQ号到本地存储
            storage.put("closebycurrentQQ", qqFriend.qq);
            // 更新最后操作的QQ号显示在界面上
            defaultConfig.lastOperationQQ = qqFriend.qq;
            ui.run(() => {
                $ui.lastOperationQQ.setText("最后操作的QQ号：" + defaultConfig.lastOperationQQ);
            });
            if (!byuserForce) {
                // 发送QQ信息到电脑
                sendQQToComputer(qqFriend, reason);
            }
        }
    }
}


//录入验证信息的页面
function retryAddFriendByQQZone(item, checkTimeout) {
    // 检查是否存在备注输入框
    var bakexist = className("android.widget.EditText").exists();
    if (bakexist) {
        var verifyobj = className("android.widget.EditText").findOne(defaultConfig.findOneTimeOut);
        verifyobj.click();
        sleepSelf(delayinteval);
        if (checkTimeout()) return false;
        // 设置验证消息
        verifyobj.setText(defaultConfig.requestverifyInfo);
        // 设置备注信息
        if (className("android.widget.EditText").text('输入备注').exists()) {
            className("android.widget.EditText").text('输入备注').setText(defaultConfig.bakInfo + " " + (item.index + 1));
            sleepSelf(delayinteval);
            if (checkTimeout()) return false;
        }
        // 点击发送按钮
        className("android.widget.Button").text("发送").findOne(defaultConfig.findOneTimeOut).click();
        // 记录日志
        loggerTrace(item.qq, {
            "code": "success",
            "message": "二次确认加好友",
            "data": JSON.stringify({ "qq": item.qq })
        });
        return true; // 成功添加好友
    } else {
        return false; // 未找到备注输入框，添加好友失败
    }
}
function gestScorller() {
    gesture(1000, [device.width / 2, device.height / 2], [device.width / 2, device.height / 2 - 300], [0, 0])
    sleepSelf(delayinteval);
}

function addFriendPageOperation(item, checkTimeout) {
    var isExistVertify = className("android.widget.EditText").text("输入答案").exists()
    const message = (isExistVertify === true) ? `${item.qq}开启了好友认证` : `${item.qq}未开启可直接加好友`
    log(message)
    if (isExistVertify === true) {
        updateQQItemStatus(item.index, -1, "该QQ开启了答案验证无法加QQ")
        loggerTrace(item.qq, { "code": "failed", "msg": "该qq开启了答案验证无法加此QQ" })
        return;
    }
    var bakexist = className("android.widget.EditText").exists();
    // 找到备注开启添加好友流程
    if (bakexist === true) {
        var verifyobj = className("android.widget.EditText").findOne(defaultConfig.findOneTimeOut)
        verifyobj.click();
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
        verifyobj.setText(defaultConfig.requestverifyInfo)
        if (className("android.widget.EditText").text('输入备注').exists()) {
            className("android.widget.EditText").text('输入备注').setText(`${defaultConfig.bakInfo} ${item.index + 1}`)
            sleepSelf(delayinteval);
            if (checkTimeout()) return;
        } else {
            updateQQItemStatus(item.index, -1, "该QQ处于待验证状态")
            return;
        }
        className("android.widget.Button").text("发送").findOne(defaultConfig.findOneTimeOut).click()
        log("首次检查备注信息是否备注")
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
        if (className("android.widget.Button").desc("取消").text("取消").exists()) {
            log("检查了账号异常性")
            className("android.widget.Button").desc("取消").text("取消").findOne(defaultConfig.findOneTimeOut).click();
            toastLog("该账号被多人举报需要先处理😭~~");
            updateQQItemStatus(item.index, -1, "你自己的QQ号被举报需要处理")
            closeApp("你的QQ号被举报了在添加", false);
            return;
        }
        loggerTrace(item.qq, { "code": "success", "message": "操作了加好友首次", "data": JSON.stringify({ "qq": item.qq }) })
        log("账号无异常没弹出警告")
        if (className("android.widget.Button").text("加好友").exists()) {
            log("加好友按钮存在")
            className("android.widget.Button").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
            sleepSelf(delayinteval + 3000);
            if (checkTimeout()) return;
            log("点击了加好友按钮 检查备注")
            if (id("bz4").text('输入备注').exists()) {
                back()
                sleepSelf(delayinteval);
                if (checkTimeout()) return;
                log(`首次加人备注丢失选手${item.qq}尝试进QQ空间加人}`)
                gestScorller();
                if (className("android.widget.LinearLayout").desc('他的QQ空间').exists()) {
                    className("android.widget.LinearLayout").desc('他的QQ空间').findOne(defaultConfig.findOneTimeOut).click();
                    sleepSelf(delayinteval + 2000);
                    if (checkTimeout()) return;
                }
                else if (className("android.widget.LinearLayout").desc('她的QQ空间').exists()) {
                    className("android.widget.LinearLayout").desc('她的QQ空间').findOne(defaultConfig.findOneTimeOut).click();
                    sleepSelf(delayinteval + 2000);
                    if (checkTimeout()) return;
                }
                gestScorller();
                if (className("android.widget.TextView").text("加好友").exists()) {
                    className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click()
                }
                sleepSelf(delayinteval);
                if (checkTimeout()) return;
                //再次尝试加好友
                if (retryAddFriendByQQZone(item, checkTimeout)) {
                    sleepSelf(delayinteval);
                    if (className("android.widget.TextView").text("加好友").exists()) {
                        className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click()
                    }
                    sleepSelf(delayinteval);
                    if (checkTimeout()) return;
                    if (className("android.widget.EditText").text('输入备注').exists() === true) {
                        loggerTrace('existQQ', { "qq": item.qq, "time": getFormattedTimestamp() })
                        updateQQItemStatus(item.index, -2, "风控 QQ空间资料加人未备注上")
                        closeApp('QQ空间资料加人触发', false);
                        return;
                    } else {
                        defaultConfig.flagQQZonePorcessAdd = true;
                        defaultConfig.byQQZoneCount += 1;
                        updateQQItemStatus(item.index, 1, "QQ空间资料直接加人成功")
                        loggerTrace(item.qq, { "code": "success", "message": "二次QQ空间加人成功", "data": JSON.stringify({ "qq": item.qq }) })
                        return;
                    }
                } else {
                    updateQQItemStatus(item.index, -1, "尝试从QQ空间加人遭遇异常")
                    loggerTrace(item.qq, { "code": "false", "message": "异常情况", "data": JSON.stringify({ "qq": item.qq }) })
                    sleepSelf(delayinteval);
                    if (checkTimeout()) return;
                    return;
                }
            } else {
                defaultConfig.byredirectQQCount += 1;
                updateQQItemStatus(item.index, 1, "直接加人成功")
                loggerTrace(item.qq, { "code": "success", "message": "直接加人成功", "data": JSON.stringify({ "qq": item.qq }) })
            }
        }
    }
    else {
        updateQQItemStatus(item, -1, "资料页没找到备注可能出现啥弹窗异常")
        loggerTrace(item.qq, { "code": "failed", "msg": "请重新开始流程", "data": JSON.stringify({ "qq": item.qq }) })
    }
}
/**
 * Finds the bounds of a specific item in a RecyclerView.
 * @returns {Rect | null} The bounds of the found item, or null if not found.
 */
function findRecycleMenuBarItemUser() {
    if (className('android.widget.FrameLayout').desc("用户按钮").exists()) {
        return className('android.widget.FrameLayout').desc("用户按钮").findOne(defaultConfig.findOneTimeOut).bounds();
    }
    return null;
}

/**
 * Finds the bounds of a specific item in a RecyclerView.
 * @returns {Rect | null} The bounds of the found item, or null if not found.
 */
function findRecycleItem() {
    if (className('android.widget.FrameLayout').depth(3).drawingOrder(2).indexInParent(0).exists()) {
        return className('android.widget.FrameLayout').depth(3).drawingOrder(2).indexInParent(0).findOne(defaultConfig.findOneTimeOut).bounds();
    }
    return null;
}
function tagActivityLog() {
    log("tagActivityLog", currentActivity())
}

function tagAnalysis(timeout) {
    log("tagAnalysis ----------");
    var startTime = Date.now();
    var duration = timeout; // 超时时间，单位为毫秒
    while (true) {
        var elapsedTime = Date.now() - startTime;
        if (elapsedTime > duration) {
            log("超时未找到元素");
            break;
        }

        var button = className("android.widget.Button").desc('xxx').findOnce();
        if (button) {
            log("找到元素:", button);
            break;
        }

        sleep(100); // 短暂休眠，避免 CPU 过高
    }
}
function updateQQItemStatus(index, status, statusMessage) {
    if (index <= qqFirends.length - 1) {
        qqFirends[index].status = status;
        qqFirends[index].statusMessage = statusMessage;
    }
}
function handleAddFriend(item, checkTimeout) {
    if (defaultConfig.flagQQZonePorcessAdd) {
        log('===============================警告QQ空间加人================================');
        log(`${item.qq}本次任务触发下}`);
        if (className("android.widget.LinearLayout").desc('他的QQ空间').exists()) {
            className("android.widget.LinearLayout").desc('他的QQ空间').findOne(defaultConfig.findOneTimeOut).click();
        } else if (className("android.widget.LinearLayout").desc('她的QQ空间').exists()) {
            className("android.widget.LinearLayout").desc('她的QQ空间').findOne(defaultConfig.findOneTimeOut).click();
        }
        sleepSelf(delayinteval);
        if (checkTimeout()) return;

        gestScorller();

        if (className("android.widget.TextView").text("加好友").exists()) {
            className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
        }

        sleepSelf(delayinteval);
        if (checkTimeout()) return;

        if (retryAddFriendByQQZone(item, checkTimeout)) {
            sleepSelf(delayinteval);
            if (className("android.widget.TextView").text("加好友").exists()) {
                className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
            } else {
                log("尝试QQ空间加好友未没找到加好友按钮待优化");
            }
            sleepSelf(delayinteval);
            if (checkTimeout()) return;

            if (className("android.widget.EditText").text('输入备注').exists() === true) {
                toastLog("二次资料页诸事不顺触发风控不易加人😭");
                loggerTrace('existQQ', { "qq": item.qq, "time": getFormattedTimestamp() });
                sleepSelf(delayinteval);
                updateQQItemStatus(item.index, -1, "QQ空间资料加人也失败了，首次备注丢失的情况")
                closeApp("QQ空间加人遭遇风控", false);
                return;
            } else {
                defaultConfig.flagQQZonePorcessAdd = true;
                defaultConfig.byQQZoneCount += 1;
                updateQQItemStatus(item.index, 1, "QQ空间加人成功")
            }
        } else {
            sleepSelf(delayinteval);
            return;
        }
    } else {
        // 检查是否有异常账号弹窗
        if (className("android.widget.Button").text("确认").exists()) {
            updateQQItemStatus(item.index, -1, "该QQ账号异常")
            loggerTrace(item.qq, { "code": "failed", "msg": "该qq异常无法添加", "data": item.toString() });
            return;
        }
        // 检查是否有加好友按钮
        if (className("android.widget.Button").text("加好友").exists() === true) {
            className("android.widget.Button").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
            sleepSelf(delayinteval);
            if (checkTimeout()) return;
            gestScorller();
            addFriendPageOperation(item, checkTimeout);
        } else {
            //该QQ 没有添加好友按钮可能存在异常
            loggerTrace(item.qq, { "code": "failed", "msg": "请重新开始流程", "data": item.toString() });
            updateQQItemStatus(item.index, -1, "加人过程中未找到加好友")
        }
    }
}
function processAddFriend(item) {
    // 120 seconds timeout
    const startTime = new Date().getTime();
    // 封装检查超时的函数
    function checkTimeout() {
        if (new Date().getTime() - startTime > defaultConfig.operationItemtimeout) {
            log('已经超时本次任务两分钟了行不行不行就别搞了');
            return true;
        }
        return false;
    }
    if (item === null || item === undefined) {
        toast('列表中存在不规范无法解析')
        return;
    }
    log(`第${defaultConfig.index + 1}位选手:${item.qq} 正在添加`)
    sleepSelf(delayinteval);
    if (isEmptystr(item.qq)) {
        toast('列表中存在不规范的数据');
        return;
    }
    sleepSelf(delayinteval);
    if (checkTimeout()) return;
    if (!returnToHomeScreen() || defaultConfig.startProcess === false) {
        log('未能返回主页');
        return;
    }

    // findTabIndex(0);
    if (className("android.widget.RelativeLayout").clickable(true).exists()) {
        id("j_k").className("android.view.View").longClickable(true).findOne().parent().click()
    }

    sleepSelf(delayinteval);
    if (checkTimeout()) return;
    log("努力查找");
    sleepSelf(delayinteval);
    if (className('android.widget.Button').desc('搜索框').exists()) {
        className('android.widget.Button').desc('搜索框').findOne(defaultConfig.findOneTimeOut).click();
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
        //搜索框填入QQ号
        className("android.widget.EditText").desc('搜索').findOne(defaultConfig.findOneTimeOut).setText(item.qq);
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
        //点击搜索按钮
        className("android.widget.TextView").text(`${item.qq}`).findOne(defaultConfig.findOneTimeOut).parent().click();
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
        log("等待我分析搜索页中.....")
        const itemBounds = findRecycleMenuBarItemUser();
        log('================================cool================================', itemBounds)
        click(itemBounds.left, itemBounds.top + 3)
        sleepSelf(delayinteval + 2000);
        if (checkTimeout()) return;
        // 点击用户第一行的bounds 
        const userInfo = findRecycleItem();
        log('================================cool================================', userInfo)
        if (userInfo === null) {
            loggerTrace(item.qq, { 'code': "failed", 'msg': '该QQ不存在' })
            return;
        } else {
            click(userInfo.left + 10, userInfo.top + 10)
            sleepSelf(delayinteval);
            if (checkTimeout()) return;
            handleAddFriend(item, checkTimeout);
        }
    }
    // app.startActivity({
    //     action: "android.intent.action.VIEW",
    //     data: "mqq://card/show_pslcard?src_type=internal&version=1&uin=" + item.qq,
    //     packageName: "com.tencent.mobileqq",
    // }); 

}
function resetConfig() {
    defaultConfig.index = 0;
    defaultConfig.failCount = 0;
    defaultConfig.startProcess = false;
    defaultConfig.byredirectQQCount = 0;
    defaultConfig.byQQZoneCount = 0;
    defaultConfig.failCount = 0;
    defaultConfig.flagQQZonePorcessAdd = false;
}

function returnToHomeScreen() {
    if (defaultConfig.startProcess === false) return false;
    const maxAttempts = 8;
    const targetActivity = "com.tencent.mobileqq.activity.SplashActivity";
    if (currentActivity().startsWith('com.android.launcher')) {
        return false;
    }
    if (currentActivity() === targetActivity) {
        return true;
    }
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        if (defaultConfig.startProcess === false) {
            return true;
        }
        log("loop找主页 " + currentActivity() + defaultConfig.startProcess);
        back();
        sleepSelf(delayinteval - 2000);
        if (currentActivity() === targetActivity && defaultConfig.startProcess === true) {
            log("成功返回主页: " + targetActivity);
            return true;
        }
    }
    log("已达到最大尝试次数，退出循环");
    return false;
}
function analysisCurrentTask() {
    log(qqFirends);
    let categorizedResults = {
        "成功的": [],
        "异常的": [],
        "未操作的": []
    };
    // 遍历 results 数组并分类
    qqFirends.forEach(item => {
        if (item.status === 1) {
            categorizedResults.成功的.push(item.qq);
        } else if (item.status === -1) {
            categorizedResults.异常的.push(`${item.statusMessage} ${item.qq}`);
        } else if (item.status === 0) {
            categorizedResults.未操作的.push(item.qq);
        }
    });
    let jsonString = JSON.stringify(categorizedResults, null, 2);
    sendQQToComputer(jsonString, getFormattedTimestamp() + "操作记录");
}

function dealFinishProcess() {
    log("进入处理完成流程,", defaultConfig.index, qqFirends.length);
    if (defaultConfig.index > 0 && (defaultConfig.index === qqFirends.length)) {
        var lastqq = qqFirends[defaultConfig.index - 1].qq;
        storage.put("closebycurrentQQ", lastqq)
        defaultConfig.lastOperationQQ = lastqq;
        ui.run(() => {
            $ui.lastOperationQQ.setText("最后操作的QQ号" + defaultConfig.lastOperationQQ);
        });
    }
    analysisCurrentTask();
    const taskFinish = { "byAccount": defaultConfig.byredirectQQCount, "byQQZone": defaultConfig.byQQZoneCount, "failCount": qqFirends.length - defaultConfig.byQQZoneCount - defaultConfig.byredirectQQCount, "total": qqFirends.length, "time": getFormattedTimestamp() };
    loggerTrace("recordfinished", taskFinish);
    taskrecord = singleTaskRecord();
    updateRecordResult();
    defaultConfig.startProcess = false;

    if (autoScriptThread !== null && autoScriptThread.isAlive) {
        autoScriptThread.interrupt();
    }
    ui.run(() => {
        startWindowBtn.startbtn.setText('开始')
    })
    resetConfig();
}
function findTabIndex(index) {
    if (index < 0 || index > 4) {
        log("Index out of bounds");
        return;
    }
    log(device.width, device.height);

    if (className("android.widget.TabWidget").exists()) {
        const tabs = className("android.widget.TabWidget").findOne(2000).bounds();

        // 正确的x坐标计算
        const x = device.width / 5 * index + device.width / 10;
        const y = device.height - tabs.height() / 2.0;

        log(x, y, tabs);
        click(x, y);
    } else {
        log("TabWidget not found");
    }
}
function sendQQToComputer(lastqq, reason) {
    if (defaultConfig.startProcess === false) {
        return;
    }
    const snedInfo = typeof lastqq === "string" ? lastqq : lastqq.toString();
    log(`发结果到文件 ${snedInfo} ${reason}`);
    if (returnToHomeScreen()) {
        // findTabIndex(3);
        if (id("kbi").className("android.widget.TextView").text("联系人").exists()) {
            id("kbi").className("android.widget.TextView").text("联系人").findOne().parent().parent().click()
        }
        sleepSelf(delayinteval);
        if (className("android.widget.TextView").text("设备").clickable(true).exists()) {
            className("android.widget.TextView").text("设备").findOne(defaultConfig.findOneTimeOut).click();
            sleepSelf(delayinteval);
            log('找到我的电脑');
            sleepSelf(delayinteval);
            if (className("android.widget.FrameLayout").clickable(true).depth(10).exists()) {
                className("android.widget.FrameLayout").clickable(true).depth(10).findOne(defaultConfig.findOneTimeOut).click();
            }
            if (className("android.widget.FrameLayout").clickable(true).depth(6).exists()) {
                className("android.widget.FrameLayout").clickable(true).depth(6).findOne(defaultConfig.findOneTimeOut).click();
            }
            sleepSelf(delayinteval);
            if (className("android.widget.EditText").exists()) {
                // 判断 reason 的类型并处理
                let reasonText = typeof reason === 'object' ? JSON.stringify(reason) : reason;
                className("android.widget.EditText").findOne(defaultConfig.findOneTimeOut).setText(reasonText + snedInfo);
                var  bounds =   className("android.widget.TextView").text('我的电脑').findOne(defaultConfig.findOneTimeOut).bounds();
                click(bounds.left,bounds.bottom + 120);
                sleepSelf(delayinteval);
                if (className("android.widget.Button").text("发送").exists()) {
                    className("android.widget.Button").text("发送").findOne(defaultConfig.findOneTimeOut)
                    return
                }
                if (id("send_btn").exists()) {
                    id("send_btn").findOne(defaultConfig.findOneTimeOut).click()
                    return
                }
            } else {
                log("找不到输入框，无法发送信息", currentActivity());
            }
        } else {
            log("找不到设备Tab");
        }
    } else {
        log("未能返回主页，无法发送QQ号到电脑");
    }
}

function lauchAppForIndex() {
    sleep(500);
    home();
    sleepSelf(delayinteval - 2000);
    launch("com.tencent.mobileqq");
    sleepSelf(delayinteval);
}
function startAddQQ() {
    log("数据准备:", qqFirends);
    resetConfig();
    defaultConfig.startProcess = true;
    ui.run(() => {
        startWindowBtn.startbtn.setText('...');
    })
    toast("开始加QQ啦~~~~🤣🤣");
    lauchAppForIndex();
    try {
        while (defaultConfig.index < qqFirends.length && defaultConfig.startProcess === true) {
            var currentTask = qqFirends[defaultConfig.index];
            log("当前任务处理 current task ", currentTask)
            storage.put("closebycurrentQQ", currentTask.qq)
            defaultConfig.lastOperationQQ = currentTask.qq;
            processAddFriend(currentTask)
            defaultConfig.index += 1;
            log('任务完结')
        }
    } catch (error) {
        log('startQQ error异常出来:', error)
        closeApp(error, false);
    }
    dealFinishProcess();
}




function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function generateCardKey(duration) { // Example key, ensure it's 16 bytes for AES
    const randomString = generateRandomString(12);
    const currentTime = Date.now();
    let expiryTime;

    switch (duration) {
        case '30s':
            expiryTime = currentTime + 30 * 1000;
            break;
        case '3 days':
            expiryTime = currentTime + 3 * 24 * 60 * 60 * 1000;
            break;
        case '7 days':
            expiryTime = currentTime + 7 * 24 * 60 * 60 * 1000;
            break;
        case '1 month':
            expiryTime = currentTime + 30 * 24 * 60 * 60 * 1000;
            break;
        case '1 year':
            expiryTime = currentTime + 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            expiryTime = currentTime + 30 * 1000;
    }

    const codeData = {
        randomString: randomString,
        expiryTime: expiryTime
    };

    const codeString = JSON.stringify(codeData);
    return $base64.encode(codeString);
}


function checkValidCode(code) {
    if (isEmptystr(code)) {
        return { isValid: false, message: "请输入卡密" };
    }
    try {
        const decodedCode = $base64.decode(code);
        const parsedData = JSON.parse(decodedCode);
        const expiryTime = parsedData.expiryTime;
        if (Date.now() > expiryTime || parsedData.randomString === undefined || parsedData.expiryTime === null) {
            return { isValid: false, message: "卡密失效了" };
        }
        return { isValid: true, message: "卡密无效" };
    } catch (error) {
        log('error', error);
        return { isValid: false, message: "卡密验证失败" };
    }
}
const va = null;
function testValidCode(duration) {
    try {
        const cardKey = generateCardKey(duration);
        log("先生成一个码:", cardKey);
        // // 验证卡密
        const validationResult = checkValidCode(cardKey);
        log("第一次校验", validationResult.isValid);
        tagAnalysis(10000);
        const validationResult2 = checkValidCode(cardKey);
        log("第二次校验", validationResult2.isValid);
        tagAnalysis(10000);
        const validationResult3 = checkValidCode(cardKey);
        log("第三次校验", validationResult3.isValid);
        tagAnalysis(10000);
        const validationResult4 = checkValidCode(cardKey);
        log("第四次校验", validationResult4.isValid);
        tagAnalysis(10000);
        const validationResult5 = checkValidCode(cardKey);
        log("第五次校验", validationResult5.isValid);
    } catch (error) {
        log('error', error);
    }
}
function randomLargeNumberCode(number) {
    //产生大量的 validCode case验证
    //定义一个子线程，然后在子线程操作
    va = threads.start(function () {
        log("子线程开始执行")
        for (let i = 0; i < number; i++) {
            testValidCode('3 days');
            sleepSelf(delayinteval);
        }
        sleep(1500)
    });
    log("等待子线程测试完毕处理完成")

}
