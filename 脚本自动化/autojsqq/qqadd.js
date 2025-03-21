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
importClass(android.provider.Settings);
importClass(android.content.Context);

function getAndroidId() {
    return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
}
var androidId = getAndroidId();
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
 * @property {number} status  // status 0  1备注上的进入待验证 -1表示异常  -2 风控的单独领出来
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
var  timeoutId = null;
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
    operationItemtimeout: 240000 ,
    validQQlist: [],
    userForceClose: false, //用户强制关闭 不发电脑
    normalFinish: true, //触发风控或者不正常需要终止的关闭
    schemeTaskByTimeDay: getTomorrowMorningSevenOClock(),
    enterByAutoScheme: false,
    // 备注丢失情况下
    qqzoneMissCount: 0,
}
function getTomorrowMorningSevenOClock() {
    // 获取当前时间的Date对象
    const today = new Date();
    // 增加一天
    today.setDate(today.getDate() + 1);
    
    // 设置时间为早上7点
    today.setHours(7);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

      today.setDate(today.getDate());
    
    // 设置时间为早上7点
    // today.setHours(15);
    // today.setMinutes(4);
    // today.setSeconds(0);
    // today.setMilliseconds(0);
    return today;
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
    });
}
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
    log('任务执行状态','用户是否强制执行',defaultConfig.startProcess,defaultConfig.userForceClose)
    if (defaultConfig.startProcess === false || defaultConfig.userForceClose === true) {
        return ;
    }
    // 生成1秒到3秒的随机值，单位为毫秒
    var randomValue = Math.floor(Math.random() * 700) + 1000;
    // 最终的睡眠时间为传入的间隔时间加上随机值
    var finalInterval = interval + randomValue;
    // 调用sleep函数进行睡眠
    sleep(finalInterval);
}
function getFormattedTimestamp(now) {
    // 获取当前时间戳
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
function parseFormattedDateToDateNotInPast(formattedDateStr) {
    try {
        // 分割字符串以获取年、月、日、时、分、秒
        const [year, month, day, hours, minutes, seconds] = formattedDateStr.split(/[- :]/);
        
        // 创建新的Date对象
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        // 检查Date对象是否有效且不是过去的日期
        if (isNaN(parsedDate) || parsedDate < new Date()) {
            log('不能是过去的时间');
            return {isValid: false, date:null, message: '不能是过去的时间'}
        }
        
        return  {isValid: true, date:parsedDate, message: '合法时间'};
    } catch (error) {
        console.error('Error parsing or validating date:', error.message);
        return {isValid: false, date:null, message: '格式不正确的时间'}
    }
}

function buildInputText(key, title, fontSize, hintText, textColor, initalText) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text><input id={key} hint={hintText} textSize={fontSize} w="*" h='auto' text={initalText} /></horizontal>
}
function buildInputPWDText(key, title, fontSize, hintText, textColor, initalText) {
    return <vertical  paddingLeft="16" paddingRight="16" h='auto'>
        <horizontal>
            <text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text>
            <input id={key} hint={hintText} textSize={fontSize} h='auto' maxWidth={device.width / 2} text={initalText} />
            <button paddingLeft='0s' id='showpwd' w='50px' h='50px' style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#00000000" textSize="14"></button>
        </horizontal>
        <horizontal>
            <button w='*'  gravity="center"  padding={`0 0 12 0`} style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#000000" textColor="#FFFFFF" id='saveksn'>**修改保存**</button>
        </horizontal>
    </vertical>
}
//日期选择
function  buildDateSelectPic(){
   return <horizontal gravity="center"  h='auto' w="*" bg="#000000" >
        <text  id="datestart" textColor="#ffffff" text={getFormattedTimestamp( defaultConfig.schemeTaskByTimeDay)} ></text>
        <button id="autoscheme" w='*'   style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#000000" textColor="#FFFFFF"  text="  设置定时时间"></button>
   </horizontal>
}
function  updateTimeElement(){
    ui.run(() => {
        ui.datestart.setText(getFormattedTimestamp( defaultConfig.schemeTaskByTimeDay))
    })

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
                    <horizontal paddingLeft="16" >
                        <text id="Mid" textSize="12sp"  text={`Mid:${androidId} 购买需要提供该信息点击可复制`} />
                    </horizontal>
                    <horizontal paddingLeft="16" visibility={defaultConfig.isdebug ? "visible":"gone"} >
                        <text text="打开日志:" textSize="18sp" />
                        <Switch id="toggleSwitch" checked={defaultConfig.displayLog} />
                    </horizontal>
                    <horizontal>
                        <text paddingLeft="16">更多请联系:</text>
                        <text id='cantact' text={defaultConfig.author}></text>
                    </horizontal>
                    <horizontal padding="16 0 16 0" >
                    {buildDateSelectPic()}
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
ui.autoscheme.on('click', () => {
   rawInput('请输入时间: YYYY-MM-DD hh:mm:ss',getFormattedTimestamp(defaultConfig.schemeTaskByTimeDay))
   .then( (inputres) => {
        const {isValid, message ,date}  =  parseFormattedDateToDateNotInPast(inputres);
        if(isValid === false){
            toastLog(message);
            return;
        }
        defaultConfig.schemeTaskByTimeDay = date;
        updateTimeElement();
        scheduleTaskAtSpecificTime(defaultConfig.schemeTaskByTimeDay,schemeTaskByTimeDay)
        toastLog('保存成功')
   })
})

events.observeKey();
var logThread = null;
ui.toggleSwitch.setOnCheckedChangeListener(function (view, isChecked) {
    if (isChecked) {
        logThread = threads.start(function () {
            console.show();
        });
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
        $ui.triggerQQ.setText("上次触发风控的QQ:" + (lastQQTrigger.time === undefined ? " " : lastQQTrigger.time) + " " + (lastQQTrigger.qq === undefined ? "暂无" : lastQQTrigger.qq));
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

$ui.Mid.on('click', () => {
    if (androidId !== null || androidId !== undefined) {
        setClip(`${androidId}`);
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
    log('当前卡密', $ui.validCode.getText().toString())
    if (isEmptystr($ui.validCode.getText().toString())) {
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
            if(defaultConfig.enterByAutoScheme === false) {
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
            }else{
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
                // 更新数据源
                $ui.waitqqlist.setDataSource(qqFirends);
                $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`);
                log("更新后的数据", qqFirends);
                resolve();
            }
        } else {
            $ui.waitqqlist.setDataSource(qqFirends);
            $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`);
            log("使用源数据", qqFirends);
            resolve();
        }
    });
}



function startProcess() {
    // if (checkExpiration() === 1) {
    //     $ui.run(() => {
    //         toastLog("脚本已失效")
    //         confirm("该脚本已失效").then(() => {
    //             engines.myEngine().forceStop();
    //         })
    //     })
    //     return;
    // }
    $ui.requestverifyInfo.setText(defaultConfig.requestverifyInfo);
    log("processing", defaultConfig.startProcess)
    if (!defaultConfig.isdebug) {
        if(isEmptystr(defaultConfig.validCode)){
            toastLog("请先保存你的卡密");
            return;
        }
        var checkResult = checkValidCode(defaultConfig.validCode,androidId);
        if (!checkResult.isValid) {
            toastLog(checkResult.message);
            return
        }
        else {
            log("success", checkResult.message)
            storage.put("ksn", defaultConfig.validCode);
        }
    }
    if (defaultConfig.startProcess === true) {
        ui.run(() => toastLog("目前有正在执行的自动化脚本任务，请耐心等待"));
        confirm("停止当前任务")
            .then(sure => {
                if (sure) {
                    if (autoScriptThread != null && autoScriptThread.isAlive()) {
                        const  indexItem = defaultConfig.index <= qqFirends.length -1 ? qqFirends[defaultConfig.index]:null;
                        defaultConfig.userForceClose = true;
                        defaultConfig.normalFinish = false;
                        closeApp(indexItem === null ? '未记录到任务':{"qq":indexItem.qq},'用户取消了本次任务', true);
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
                if(defaultConfig.enterByAutoScheme === false){
                    confirm("开始添加列表中的QQ?")
                    .then(sure => {
                        if (sure) {
                            startTask();
                        }
                });
                }else{
                    startTask();
                }
             

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
function startTask() {
    threads.shutDownAll();
    autoScriptThread = threads.start(function () {
        startAddQQ();
    });
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

function closeApp(item,reason, byuserForce) {
    if (!byuserForce) {
        // 发送QQ信息到电脑
        sendQQToComputer(item, reason);
    }
    if(typeof item === 'object') {
        if (item.status === -2){
            ui.run(() => {
                ui.triggerQQ.setText("上次触发风控的QQ:" + item.qq);
            })
        }
    }
    ui.run(() => {

        startWindowBtn.startbtn.setText('开始')
    })
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
        if (className("android.widget.EditText").depth(4).drawingOrder(1).text('输入备注').exists()) {
            className("android.widget.EditText").depth(4).drawingOrder(1).text('输入备注').findOne(defaultConfig.findOneTimeOut).setText(defaultConfig.bakInfo + " " + (item.index + 1));
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
        if (checkTimeout()) return false;
        return true; // 成功添加好友
    } else {
        return false; // 未找到备注输入框，添加好友失败
    }
}
function gestScorller() {
    gesture(1000, [device.width / 2, device.height / 2], [device.width / 2, device.height], [0, 0])
    sleepSelf(delayinteval);
}

function gestScorllerUp() {
    gesture(1000, [device.width / 2, device.height - 200], [device.width / 2,0], [0, 0])
    sleepSelf(delayinteval);
}

function addFriendPageOperation(item, checkTimeout) {
    var isExistVertify = className("android.widget.EditText").text("输入答案").exists()
    const message = (isExistVertify === true) ? `${item.qq}开启了好友认证` : `${item.qq}未开启可直接加好友`
    log(message)
    if (isExistVertify === true) {
        updateQQItemStatus(item.index, -1, "该QQ开启了答案验证无法加QQ")
        loggerTrace(item.qq, { "code": "failed", "msg": "该qq开启了答案验证无法加此QQ","data":JSON.stringify({"qq":item.qq})})
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
            updateQQItemStatus(item.index, -1, "备注已备注过已发送过验证")
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
            defaultConfig.normalFinish = false;
            closeApp({"qq":item.qq},"你自己的QQ号被举报了", false);
            return;
        }

        loggerTrace(item.qq, { "code": "success", "message": "操作了加好友首次", "data": JSON.stringify({ "qq": item.qq }) })
        log("账号无异常没弹出警告")
        if (className("android.widget.Button").text("加好友").exists()) {
            log("加好友按钮存在")
            className("android.widget.Button").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
            sleepSelf(delayinteval + 3000);
            checkExcptionTask(item);
            sleepSelf(delayinteval);
            if (checkTimeout()) return;
            checkExcptionTask(item);
            log("点击了加好友按钮 检查备注")
            if (checkTimeout()) return;
            if (id("bz4").text('输入备注').exists()) {
                back()
                sleepSelf(delayinteval);
                if (checkTimeout()) return;
                log(`首次加人备注丢失选手${item.qq}尝试进QQ空间加人}`)
                gestScorller();
                if (className("android.widget.LinearLayout").descContains('QQ空间').exists()) {
                    className("android.widget.LinearLayout").descContains('QQ空间').findOne(defaultConfig.findOneTimeOut).click();
                    sleepSelf(delayinteval + 2000);
                    if (checkTimeout()) return;
                }else{
                    updateQQItemStatus(item.index,-1,`${item.qq}QQ空间没找到`)
                    loggerTrace(item.qq, { "code": "failed", "message": "进QQ空间加人失败", "data": JSON.stringify({ "qq": item.qq }) })
                    return;
                }
                if (className("android.widget.TextView").text("加好友").exists()) {
                    className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click()
                }
                gestScorller();
                sleepSelf(delayinteval);
                checkExcptionTask(item);
                sleepSelf(delayinteval);
                if (checkTimeout()) return;
                log('-----准备进入QQ空间加人-----')
                //再次尝试加好友
                if (retryAddFriendByQQZone(item, checkTimeout)) {
                    log('操作过QQ空间加人')
                    sleepSelf(delayinteval);
                    if (className("android.widget.TextView").text("加好友").exists()) {
                        className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click()
                    }
                    sleepSelf(delayinteval);
                    checkExcptionTask(item);
                    sleepSelf(delayinteval);
                    if (checkTimeout()) return;
                    checkExcptionTask(item)
                    sleepSelf(delayinteval);
                    if (checkTimeout()) return;
                    if (className("android.widget.EditText").text('输入备注').exists() === true) {
                        loggerTrace('existQQ', { "qq": item.qq, "time": getFormattedTimestamp(new Date())})
                        if (defaultConfig.qqzoneMissCount >= 1){
                            updateQQItemStatus(item.index, -2, `${item.qq}QQ空间资料二次加人触发备注丢失`)
                            defaultConfig.normalFinish = false;
                            closeApp({"qq":item.qq},"QQ空间资料二次加人触发备注丢失", false);
                            return;
                        }else{
                            defaultConfig.flagQQZonePorcessAdd = true;
                            updateQQItemStatus(item.index, -1, `${item.qq}QQ空间直接丢失了备注`)
                            defaultConfig.qqzoneMissCount += 1;
                        }
                    } else {
                        defaultConfig.flagQQZonePorcessAdd = true;
                        defaultConfig.byQQZoneCount += 1;
                        updateQQItemStatus(item.index, 1, "QQ空间资料直接加人成功")
                        loggerTrace(item.qq, { "code": "success", "message": "二次QQ空间加人成功", "data": JSON.stringify({ "qq": item.qq }) })
                        return;
                    }
                } else {
                    log('操作过QQ空间加人但是失败')
                    updateQQItemStatus(item.index, -1, "尝试从QQ空间加人遭遇异常")
                    loggerTrace(item.qq, { "code": "false", "message": "异常情况", "data": JSON.stringify({ "qq": item.qq }) })
                    return;
                }
            } 
            else {
                defaultConfig.byredirectQQCount += 1;
                updateQQItemStatus(item.index, 1, "直接加人成功")
                loggerTrace(item.qq, { "code": "success", "message": "直接加人成功", "data": JSON.stringify({ "qq": item.qq }) })
            }
        }
        else{
            updateQQItemStatus(item.index, -1, "加好友按钮不存在")
            loggerTrace(item.qq, { "code": "failed", "msg": "加好友按钮不存在", "data": JSON.stringify({ "qq": item.qq }) })
            return;
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
    if (className('android.widget.TextView').text("用户").exists()) {
        return className('android.widget.TextView').text("用户").findOne(defaultConfig.findOneTimeOut).bounds();
    }
    return null;
}

/**
 * Finds the bounds of a specific item in a RecyclerView.
 * @returns {Rect | null} The bounds of the found item, or null if not found.
 */
function findRecycleItem() {
    var  resultBounds = null;
    if (className('android.view.ViewGroup').clickable(true).drawingOrder(1).indexInParent(0).exists()) {
        resultBounds = className('android.view.ViewGroup').clickable(true).drawingOrder(1).indexInParent(0).findOne(defaultConfig.findOneTimeOut).bounds();
    }
    return resultBounds;
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
        qqFirends[index]['status'] = status;
        qqFirends[index]['statusMessage'] = statusMessage;
    }
}
function handleAddFriend(item, checkTimeout) {
    log('直接加QQ空间？ ',defaultConfig.flagQQZonePorcessAdd, defaultConfig.flagQQZonePorcessAdd === true ? '是':'否')
    if (defaultConfig.flagQQZonePorcessAdd) {
        log('===============================已经有过QQ触发备注丢失的情况================================');
        log(`${item.qq}本次任务触发下}`);
        if (checkTimeout()) return;
        if (className("android.widget.LinearLayout").descContains('QQ空间').exists()) {
            className("android.widget.LinearLayout").descContains('QQ空间').findOne(defaultConfig.findOneTimeOut).click();
        }else{
            updateQQItemStatus(item.index, -1, `${item.qq}QQ空间没找到`)
            loggerTrace(item.qq, { "code": "failed", "message": "进QQ空间加人失败", "data": JSON.stringify({ "qq": item.qq }) })
            return;
        }
        sleepSelf(delayinteval);
        if (checkTimeout()) return;

        gestScorller();
        if (checkTimeout()) return;
        if (className("android.widget.TextView").text("加好友").exists()) {
            className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
        }
        sleepSelf(delayinteval);
        checkExcptionTask(item);
        if (checkTimeout()) return;
        if (retryAddFriendByQQZone(item, checkTimeout)) {
            sleepSelf(delayinteval);
            if (className("android.widget.TextView").text("加好友").exists()) {
                className("android.widget.TextView").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
                sleepSelf(delayinteval);
                checkExcptionTask(item);
            } else {
                updateQQItemStatus(item.index, -1, `${item.qq}QQ空间没找到加好友`)
                return;
            }
            sleepSelf(delayinteval);
            if (checkTimeout()) return;
            if (className("android.widget.EditText").text('输入备注').exists() === true) {
                toastLog("二次资料页诸事不顺触发风控不易加人😭");
                loggerTrace('existQQ', { "qq": item.qq, "time": getFormattedTimestamp(new Date()) });
                sleepSelf(delayinteval);
                if (defaultConfig.qqzoneMissCount >= 1){
                    updateQQItemStatus(item.index, -2, `${item.qq}选手在尝试从QQ空间资料加人就备注丢失的情况`)
                    defaultConfig.normalFinish = false;
                    closeApp({"qq":item.qq},"前面已有备注丢失后进入QQ空间加人遭遇备注不上", false);
                    return;
                }else{
                    defaultConfig.flagQQZonePorcessAdd = true
                    updateQQItemStatus(item.index, -1, `${item.qq}QQ空间直接丢失了备注`)
                    defaultConfig.qqzoneMissCount += 1;
                }
            } else {
                defaultConfig.flagQQZonePorcessAdd = true
                defaultConfig.qqzoneMissCount = 0;
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
            loggerTrace(item.qq, { "code": "failed", "msg": "该qq异常无法添加", "data":JSON.stringify({"qq":item.qq}) });
            return;
        }
        // 检查是否有加好友按钮
        if (className("android.widget.Button").text("加好友").exists()) {
            className("android.widget.Button").text("加好友").findOne(defaultConfig.findOneTimeOut).click();
            sleepSelf(delayinteval);
            checkExcptionTask(item)
            if (checkTimeout()) return;
            if( className("android.widget.Button").desc('确定').exists()){
                className("android.widget.Button").desc('确定').findOne(defaultConfig.findOneTimeOut).click();
                updateQQItemStatus(item.index, -1, "该账号异常出现弹窗无法进行")
                return;
            }
            if (checkTimeout()) return;
            gestScorller();
            addFriendPageOperation(item, checkTimeout);
        } 
        else {
            //该QQ 没有添加好友按钮可能存在异常
            loggerTrace(item.qq, { "code": "failed", "msg": "未找到好友", "data":JSON.stringify({"qq":item.qq})});
            updateQQItemStatus(item.index, -1, "加人过程已经是你的好友或者是你自己也可能没搜到")
        }
    }
}
function  CloseWindowPop() {
      // 消息推送窗口检测
      log("关闭窗口检测")
      if( className("android.widget.Button").desc('马上开启').exists()){
        back();
        return;
    }
    if( className("android.widget.Button").textContains('马上开启').exists()){
        back();
        return;
    }
    if( className("android.widget.Button").textContains('关闭').exists()){
        back();
        return;
    }
}
function checkExcptionTask(item){
    if( className("android.widget.Button").desc('确定').exists()){
        className("android.widget.Button").desc('确定').findOne(defaultConfig.findOneTimeOut).click();
        updateQQItemStatus(item.index, -1, "该账号异常出现弹窗无法进行")
        return;
    }
    if( className("android.widget.Button").desc('去发短信').exists()){
        updateQQItemStatus(item.index, -1, "该加人账号触发发短信验证")
        back();
        return;
    }
    if( className("android.widget.Button").text('去发短信').exists()){
        updateQQItemStatus(item.index, -1, "该加人账号触发发短信验证")
        back();
        return;
    }

}

function processAddFriend(item) {
    const startTime = new Date().getTime();
    // 封装检查超时的函数
    function checkTimeout() {
        log("任务超时检测",threads.currentThread())
        if(defaultConfig.startProcess === false ||  defaultConfig.userForceClose === true){
            log('任务都结束了 用户点了强制执行');
            return true;
        }
        log(`${item.qq}用时:`,(new Date().getTime() - startTime) / 1000)
        if (new Date().getTime() - startTime > defaultConfig.operationItemtimeout) {
            log('已经超时本次任务两分钟了', defaultConfig.operationItemtimeout);
            return true;
        }

        return false;
    }
    if (item === null || item === undefined) {
        toast('列表中存在不规范无法解析')
        return;
    }
    if(defaultConfig.normalFinish === false || defaultConfig.userForceClose){
        log('任务处于结束状态中');
        return;
    }
    log(`第${item.index + 1}位选手:${item.qq} 正在添加`)
    if (isEmptystr(item.qq)) {
        toast('列表中存在不规范的数据');
        return;
    }
    if (checkTimeout()) return;
    if (!returnToHomeScreen()) {
        return;
    }
    CloseWindowPop();
    sleepSelf(1000);
    if (checkTimeout()) return;
    findTabIndex(0);
    if (className("android.widget.RelativeLayout").depth(4).clickable(true).exists()) {
        className("android.widget.RelativeLayout").depth(4).clickable(true).findOne(defaultConfig.findOneTimeOut).click()
    }
    sleepSelf(delayinteval);
    log("我查搜索框");
    if (className('android.widget.Button').desc('搜索框').exists()) {
        log("我查搜索框存在");
        className('android.widget.Button').desc('搜索框').findOne(defaultConfig.findOneTimeOut).click();
        if (checkTimeout()) return;
    }
    //首次可能没找到搜索框那么点击下中间双击会出现
    else {
        const addiconbounds  = className("android.widget.ImageView").desc('快捷入口').clickable(true).findOne(defaultConfig.findOneTimeOut).bounds()
        click(device.width/2.0,addiconbounds.centerY());
        sleep(50);
        click(device.width/2.0,addiconbounds.centerY());
        log('先让搜索出来')
    }
    sleepSelf(delayinteval)
    if (className('android.widget.Button').desc('搜索框').exists()) {
        className('android.widget.Button').desc('搜索框').findOne(defaultConfig.findOneTimeOut).click();
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
    }
    if (checkTimeout()) return;
    sleepSelf(delayinteval);
    //某些时候这个找不到需要用这种
    if (className("android.view.ViewGroup").desc('搜索').clickable(true).exists()){
        className("android.view.ViewGroup").desc('搜索').clickable(true).findOne(defaultConfig.findOneTimeOut).click();
        sleepSelf(delayinteval);
        log('走QQ特殊的搜索入口')
    }
    if (checkTimeout()) return;
    //搜索框填入QQ号
    className("android.widget.EditText").desc('搜索').desc('搜索').findOne(defaultConfig.findOneTimeOut).setText(item.qq);
    sleepSelf(delayinteval+ 500);
    if (checkTimeout()) return;
    //点击搜索按钮
    if(className("android.widget.TextView").text(`${item.qq}`).exists()){
        log('奇葩的搜索按钮')
        //  TODO: 0.9.075
        var  searchBounds =  className("android.widget.TextView").text(`${item.qq}`).findOne(defaultConfig.findOneTimeOut).bounds();
        log('搜索位置',searchBounds)
        click(searchBounds.left + 3, searchBounds.top + 2);
        sleepSelf(delayinteval);
        // TODO: 0.9.6
        // className("android.widget.TextView").text(`${item.qq}`).findOne(defaultConfig.findOneTimeOut).parent().click();
    }else{
        updateQQItemStatus(item.index, -1, "该QQ未搜索到")
        return;
    }
    
    if (checkTimeout()) return;
    log("等待我分析搜索页中.....")
    const itemBounds = findRecycleMenuBarItemUser();
    log('================================cool================================', itemBounds)
    click(itemBounds.left, itemBounds.top + 3)
    sleepSelf(delayinteval + 1000);
    if (checkTimeout()) return;
    // 点击用户第一行的bounds 
    const userInfo = findRecycleItem();
    log('================================cool================================', userInfo)
    if (checkTimeout()) return;
    if (userInfo === null) {
        loggerTrace(item.qq, { 'code': "failed", 'msg': '该QQ不存在' ,"data":JSON.stringify({"qq":item.qq})})
        updateQQItemStatus(item.index,-1,'qq未搜索到不存在')
        return;
    } else {
        click(userInfo.left + 10, userInfo.top + 10)
        sleepSelf(delayinteval);
        if (checkTimeout()) return;
        handleAddFriend(item, checkTimeout);
    }
    if(checkTimeout()) return;
    checkExcptionTask(item);
}
function resetConfig() {
    defaultConfig.index = 0;
    defaultConfig.failCount = 0;
    defaultConfig.startProcess = false;
    defaultConfig.byredirectQQCount = 0;
    defaultConfig.byQQZoneCount = 0;
    defaultConfig.failCount = 0;
    defaultConfig.flagQQZonePorcessAdd = false;
    defaultConfig.userForceClose = false;
    defaultConfig.normalFinish = true;
    defaultConfig.qqzoneMissCount = 0;
    //定时相关的
    defaultConfig.schemeTaskByTimeDay = getTomorrowMorningSevenOClock()
    defaultConfig.enterByAutoScheme = false;
    scheduleTaskAtSpecificTime(defaultConfig.schemeTaskByTimeDay,schemeTaskByTimeDay)
}
function sureSplashScreen(){
    if (className("android.widget.Button").descStartsWith('取消').exists()){
        className("android.widget.Button").descStartsWith('取消').findOne(defaultConfig.findOneTimeOut).click();
        sleepSelf(delayinteval);
    }
}

function returnToHomeScreen() {
    const maxAttempts = 6;
    const targetActivity = "com.tencent.mobileqq.activity.SplashActivity";
    if (currentActivity() === targetActivity) {
        log("已经在主页: " + targetActivity);
        sureSplashScreen();
        return true;
    }
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        if(defaultConfig.userForceClose === true ){
            return false;
        }
        log("loop找主页 " + currentActivity() + defaultConfig.startProcess);
           // 再次检查是否已经在主页
           if (currentActivity() === targetActivity) {
            log("成功返回主页: " + targetActivity);
            sureSplashScreen();
            return true;
        }
        // 发送返回键并等待
        back();
        sleep(2000);
        // 再次检查是否已经在主页
        if (currentActivity() === targetActivity) {
            log("成功返回主页: " + targetActivity);
            sureSplashScreen();
            return true;
        }
    }
    log("已达到最大尝试次数，退出循环");
}
function analysisCurrentTask() {
    log("qqProcess",qqFirends);
    let categorizedResults = {
        "成功的": [],
        "异常的": [],
        "未操作的": [],
        "风控QQ号结束": [],
    };
    // 遍历 results 数组并分类
    qqFirends.forEach(item => {
        if (item.status === 1) {
            categorizedResults.成功的.push(item.qq);
        } else if (item.status === -1) {
            categorizedResults.异常的.push(`${item.statusMessage} ${item.qq}`);
        }else if (item.status === -2){
            categorizedResults.风控QQ号结束.push(`${item.statusMessage} ${item.qq}`);
        }
         else if (item.status === 0) {
            categorizedResults.未操作的.push(item.qq);
        }
    });
    let jsonString = JSON.stringify(categorizedResults, null, 2);
    sendQQToComputer(jsonString, getFormattedTimestamp(new Date()) + "操作记录");
    
}

function dealFinishProcess(item) {
    log("进入处理完成流程");
    if(item !== null){
        var lastqq = item.qq;
        storage.put("closebycurrentQQ", lastqq)
        defaultConfig.lastOperationQQ = lastqq;
        ui.run(() => {
                $ui.lastOperationQQ.setText("最后操作的QQ号" + defaultConfig.lastOperationQQ);
        });
    }
    analysisCurrentTask();
    const taskFinish = { "byAccount": defaultConfig.byredirectQQCount, "byQQZone": defaultConfig.byQQZoneCount, "failCount": qqFirends.length - defaultConfig.byQQZoneCount - defaultConfig.byredirectQQCount, "total": qqFirends.length, "time": getFormattedTimestamp(new Date()) };
    loggerTrace("recordfinished", taskFinish);
    taskrecord = singleTaskRecord();
    updateRecordResult();
    log('本次任务全部结束')
    defaultConfig.startProcess = false;
    ui.run(() => {
        startWindowBtn.startbtn.setText('开始')
    })
    if (autoScriptThread !== null && autoScriptThread.isAlive) {
        autoScriptThread.interrupt();
    }
 
    resetConfig();
    
}
function findTabIndex(index) {
    if (index < 0 || index > 4) {
        log("Index out of bounds");
        return;
    }
    log(device.width, device.height);
    if (className("android.widget.TabWidget").exists()) {
        const tabs = className("android.widget.TabWidget").findOne(defaultConfig.findOneTimeOut).bounds();
        // 正确的x坐标计算
        const x = device.width / 5 * index + device.width / 10;
        const y = device.height - tabs.height() / 2.0;

        log(x, y, tabs);
        sleepSelf(1000);
        click(x, y);
    } else {
        log("TabWidget not found");
    }
}
function InputHide() {
    if(className("android.widget.ImageView").desc("聊天设置").exists()){
       log('找到了并点击')
       target = className("android.widget.ImageView").desc("聊天设置").findOne(defaultConfig.findOneTimeOut).bounds();
       click(target.left, target.top + 140);
    }
}
function sendQQToComputer(lastqq, reason) {
    const sendinfo = typeof lastqq === "string" ? lastqq : lastqq.qq;
    log(`发结果到文件 ${sendinfo} ${reason},${threads.currentThread()}`);
    if (returnToHomeScreen()) {
        findTabIndex(3);
        CloseWindowPop();
        sleepSelf(delayinteval);
        if (id("kbi").className("android.widget.TextView").text("联系人").exists()) {
            log('kibi already')
            id("kbi").className("android.widget.TextView").text("联系人").findOne(defaultConfig.findOneTimeOut).parent().parent().click()
        }
        sleepSelf(delayinteval);
        if (className("android.widget.TextView").text("设备").clickable(true).exists()) {
            className("android.widget.TextView").text("设备").findOne(defaultConfig.findOneTimeOut).click();
            sleepSelf(delayinteval);
            log('找到我的电脑');
            sleep(500)
            if (className("android.widget.FrameLayout").idStartsWith('os9').exists()) {
                className("android.widget.FrameLayout").idStartsWith('os9').findOne(defaultConfig.findOneTimeOut).click();
            }
            sleepSelf(delayinteval);
            if (className("android.widget.FrameLayout").clickable(true).depth(6).exists()) {
                className("android.widget.FrameLayout").clickable(true).depth(6).findOne(defaultConfig.findOneTimeOut).click();
            }
            sleep(500)
            if (className("android.widget.FrameLayout").clickable(true).depth(4).drawingOrder(15).exists()) {
                className("android.widget.FrameLayout").clickable(true).depth(4).drawingOrder(15).findOne(defaultConfig.findOneTimeOut).click();
            }
            sleep(500)
            //这里点击下 消除键盘
            if ( className("android.widget.TextView").text('我的电脑').exists()){
                var  bounds =   className("android.widget.TextView").text('我的电脑').findOne(defaultConfig.findOneTimeOut).bounds();
                click(bounds.left,bounds.bottom + 120);
            }
            sleepSelf(delayinteval);
            if (className("android.widget.EditText").exists()) {
                // 判断 reason 的类型并处理
                let reasonText = typeof reason === 'object' ? JSON.stringify(reason) : reason;
                className("android.widget.EditText").findOne(defaultConfig.findOneTimeOut).setText(reasonText + sendinfo);
                if (className("android.widget.Button").text("发送").exists()) {
                    className("android.widget.Button").text("发送").findOne(defaultConfig.findOneTimeOut).click();
                    return;
                }
                if (id("send_btn").exists()) {
                    id("send_btn").findOne(defaultConfig.findOneTimeOut).click()
                }
            } else {
                log("找不到输入框，无法发送信息", currentActivity());
            }
        } else {
            log("找不到设备Tab");
        }
    } 
    else {
        log("未能返回主页，无法发送QQ号到电脑");
    }
}

function lauchAppForIndex() {
    sleepSelf(2000);
    launch("com.tencent.mobileqq");
    sleepSelf(delayinteval);
}
function startAddQQ() {
        //埋个暗门 
    log("数据准备:", qqFirends);
    resetConfig();
    defaultConfig.startProcess = true;
    ui.run(() => {
        startWindowBtn.startbtn.setText('...');
    })
    toast("开始加QQ啦~~~~🤣🤣");
    lauchAppForIndex();
    sleep(2000);
    while (defaultConfig.index < qqFirends.length && defaultConfig.startProcess === true && defaultConfig.userForceClose !== true &&  defaultConfig.normalFinish === true) {
        var currentTask = qqFirends[defaultConfig.index];
        log("当前任务处理 current task ", currentTask,threads.currentThread())
        storage.put("closebycurrentQQ", currentTask.qq)
        defaultConfig.lastOperationQQ = currentTask.qq;
        try {
            processAddFriend(currentTask)
        } catch (error) {
            log('startQQ error异常出来:', error)
            sleepSelf(delayinteval);
            const  item = (defaultConfig.index <= qqFirends.length - 1) ? qqFirends[defaultConfig.index]:null;
            if (item!== null) {
                updateQQItemStatus(item.index,-1,`遭遇异常: ${error.message}\n堆栈信息:\n${error.stack}`)
            }
        }
        defaultConfig.index += 1;
        log('当前任务完结')
    }
    var  lastqq = defaultConfig.index <= qqFirends.length - 1 ? qqFirends[defaultConfig.index] : null;
    dealFinishProcess(lastqq);
}




function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
const privateKey = "wss1031231234567";
function preparePrivateKey(){
    let key = new $crypto.Key(privateKey);
    return key;
}

function  decryMessage(decryInfo){
    try {
        let result =  $crypto.decrypt(decryInfo, preparePrivateKey(), "AES/ECB/PKCS5padding", {
            "input": "base64",
            "output": "string"
          })
        return result;
    } catch (error) {
        log("Decry failed: ", error)
    } 
    return null;
}
function checkValidCode(code, currentMmid) {
    if (isEmptystr(code)) {
        return { isValid: false, message: "请输入卡密" };
    }
    try {
        const decrypted = decryMessage(code);
        log("aes解密后",decrypted)
        const [randomString, expiryTime, mid] = decrypted.split('|');
        log(randomString,expiryTime,mid,currentMmid)
        if (!randomString || !expiryTime || !mid) {
            return { isValid: false, message: "卡密格式错误" };
        }
        if (mid !== currentMmid) {
            return { isValid: false, message: "该卡密无法在此设备使用" };
        }

        if (Date.now() > parseInt(expiryTime)) {
            return { isValid: false, message: "卡密已过期" };
        }

        return { isValid: true, message: "卡密验证成功" };
    } catch (error) {
        log('error', error);
        return { isValid: false, message: "卡密验证失败" };
    }
}

function  schemeTaskByTimeDay(){
    defaultConfig.enterByAutoScheme = true;
    startProcess()
    clearTimeout(timeoutId)
    timeoutId = null;
}

function scheduleTaskAtSpecificTime(targetDate, taskFunction) {
    // 计算目标执行时间与当前时间的差值（以毫秒计）
    log('定时执行检测中')
    const now = new Date();
    const timeUntilExecution = targetDate.getTime() - now.getTime();
    
    if (timeUntilExecution <= 0) {
        console.log("该时间已过无法执行");
        return; // 目标时间已过，不安排任务
    }
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }
   timeoutId = setTimeout(taskFunction, timeUntilExecution);
}

scheduleTaskAtSpecificTime(defaultConfig.schemeTaskByTimeDay,schemeTaskByTimeDay)
