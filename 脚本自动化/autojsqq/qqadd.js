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
var delayinteval = 4000;
var imgAnyFileRequestCode = 1005;
var defaultConfig = {
    verifyInfo: "待答案的验证目前可选", // 验证信息
    requestverifyInfo: "也许上天派我来加你笑脸😁~~~~~",
    bakInfo:"客户#",
    btnw: 150,
    filePath: "", // 文本提示信息 可以不改界面配置
    scanSaveQQPath: "", // 默认存储路径
    groupQQ:1, // 一批次加多少个QQ
    index: 0, // 执行标记
    failCount: 0, //
    startProcess: false, 
    flagQQZonePorcessAdd:false, // 是否从QQ空间直接加人 标记决定是否触发风控 触发后就不在加人
    byredirectQQCount:0,
    byQQZoneCount:0
}   
var  autoScriptThread  = null;

function requestPermission() {
    // if (auto.service == null) {
    //     toast("请开启脚本的无障碍服务");
    //     auto.waitFor();
    //     return
    // }
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
    console.log(`logger: key:${key}:data:${JSON.stringify(data)}`)
    ui.run(()=>{
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
function buildInputText2(key, title, fontSize, textColor) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text id={key} text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text></horizontal>
}


function buildFileLoad(key, title, fontSize, hintText, textColor, initalText, fileTip, btnId) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'><text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text><input id={key} hint={hintText} maxWidth={device.width / 2} text={initalText} /><button id={btnId} paddingLeft="8" style="Widget.AppCompat.Button.Widget.AppCompat.Button.Borderless" bg="#00000000" textColor="#0000FF" text={fileTip} w="*"></button></horizontal>
}
function buildDrowpLineDelayInterval(){
    return  <horizontal paddingLeft="16">
                <text textSize="16sp" textStyle='bold|italic'>延迟交互操作(快|中|慢)</text>
                <spinner id="delaydrop" entries="4000|6000|7000"/>
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
    return <list  id="waitqqlist" maxHeight={device.height * 0.5 - defaultConfig.btnw - 120}>
        <card w="*" h="auto" margin="10 5" cardCornerRadius="3dp"
            cardElevation="1dp" foreground="?selectableItemBackground">
            <horizontal gravity="center_vertical">
                <View bg= "#00ff00" h="*" w="3" />
                <vertical padding="5" h="auto" w="0" layout_weight="1">
                    <text text="{{this.qq}}" textColor="#222222" textSize="14sp" textStyle="bold" maxLines="2" />
                    <text id="requestverifyInfo" text={defaultConfig.requestverifyInfo} textColor="#999999" textSize="9sp" maxLines="2" />
                    <text id="bakInfo" text={defaultConfig.bakInfo} textColor="#88667755" textSize="10sp" maxLines="2" />
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
            {buildInputText('requestverifyInfo', '验证信息（必填）:', "12sp", "请输入验证信息~~~", "#000000", defaultConfig.requestverifyInfo)}
            {buildInputText('bakInfo', '备注:', "12sp", "请输入备注信息~~~", "#000000", defaultConfig.bakInfo)}
            {buildFileLoad('filePath', 'QQFile:', "12sp", "请选择文件~~~", "#000000", defaultConfig.filePath, "选择文件", "btnselectFile")}
            {buildDrowpLineDelayInterval()}
            {buildWaitQQList()}
            {buildInputText2("qqcount","", "12sp", "#000000")}
            <text id="result"></text>
            {/* {buildStartButton()} */}
        </vertical>
    </frame>
);
// $ui.startbtn.on('click',()=>{

// });
// 设置圆形按钮的背景和样式
// var colors = [android.graphics.Color.GREEN, android.graphics.Color.GRAY, android.graphics.Color.BLUE]; // 设置渐变的颜色数组
// var bgDrawable = new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.BL_TR, colors);
// bgDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
// $ui.startbtn.setBackground(bgDrawable);


$ui.waitqqlist.on("item_bind", function (itemView, itemHolder) {
    itemView.delete.on("click", () => {
        let item = itemHolder.item;
        confirm("删除这条?")
        .then(clear => {
            log(clear)
            if(clear){
                let index = qqFirends.findIndex(element => element.qq === item.qq);
                // 如果找到，则删除该元素
                if (index !== -1) {
                    qqFirends.splice(index, 1);
                    ui.run(() =>{
                        $ui.waitqqlist.setDataSource(qqFirends);
                    })
                }
            }
            else{
                ui.run(() =>{
                $ui.waitqqlist.setDataSource(qqFirends);
                });
            }
        });
    });
});
$ui.btnselectFile.on('click',  () =>{
        let fileType = "*/*";
        let requestCode = imgAnyFileRequestCode;
        var intent = new Intent();
        intent.setType(fileType);
        intent.setAction(Intent.ACTION_GET_CONTENT);
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
        log("originalurl",uri.toString())
    if (uri.getScheme().equalsIgnoreCase("content")) {
        if (isKitKat && android.provider.DocumentsContract.isDocumentUri(activity, uri)) {
            if (String(uri.getAuthority()) == "com.android.externalstorage.documents") {
                docs = String(android.provider.DocumentsContract.getDocumentId(uri)).split(":");
                if (docs[0] == "primary") {
                    return android.os.Environment.getExternalStorageDirectory() + "/" + docs[1];
                }
            } else if (String(uri.getAuthority()) == "com.android.providers.downloads.documents") {
                var id = android.provider.DocumentsContract.getDocumentId(uri);
                log('idxx',id)
                if (id.startsWith("raw:")) {
                    return id.substring(4);
                }else{
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
function loadFileListByJson(filepath) {
    if (!files.exists(filepath)) {
        toastLog('File not found');
        return;
    }
    var  res = files.read(filepath)
    if(isValidJson(res)){
        qqFirends = loadQQInfos(res);
        $ui.waitqqlist.setDataSource(qqFirends);
    }
    else if (typeof res === 'string'){
        var  resAdd = res.split("\n")
        var i = 0;
        qqFirends = resAdd.map((e) => {
            return {"qq":e,"index":i}
        })
        log("txtfileload",qqFirends);
        $ui.waitqqlist.setDataSource(qqFirends);
    }
    else{
        toastLog('文件格式不正确');
        return;
    }
    $ui.qqcount.setText(`qq计数：共${qqFirends.length}条`)
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
    log("processing",defaultConfig.startProcess)
    try {
        if (defaultConfig.startProcess === true){
            ui.run(() =>toastLog("目前有正在执行的自动化脚本任务，请耐心等待"));
            return;
        }
        if (isEmptystr(ui.requestverifyInfo.getText())) {
            toastLog("请输入验证信息")
            return
        }
        if (qqFirends.length == 0 && isEmptystr(ui.filePath.getText())) {
            toastLog("请先设置要添加的QQ列表");
            return;
        }
        confirm("开始添加列表中的QQ?")
        .then(sure => {
            if (sure) {
                    autoScriptThread = threads.start(function () {
                        startAddQQ();
                    });
            }else{
                exit();
            }
        });
    } catch (error) {
        log("error",error);
    }   
    
  
}
function  startScanQQGroup(){
    if (isEmptystr(ui.requestverifyInfo.getText())) {
        toastLog("请输入验证信息")
        return
    }
    toastLog('开始爬取qq群组')
}
// addFloatStartButton("startscan", "采集", 50, device.height - defaultConfig.btnw - 210,defaultConfig.btnw,defaultConfig.btnw, () => {
//     updateByDelayInterval();
//     startScanQQGroup();
// });

var startWindowBtn = addFloatStartButton("startbtn", "开始", device.width - (defaultConfig.btnw) - 50, 200, defaultConfig.btnw,defaultConfig.btnw, () => {
    updateByDelayInterval()
    startProcess()
});
startWindowBtn.exitOnClose();
startWindowBtn.startbtn.longClick(()=>{
    startWindowBtn.setAdjustEnabled(!startWindowBtn.isAdjustEnabled());
    return true;
 });
setInterval(()=>{}, 1000);
function addFloatStartButton(btnid, title, x, y,w,h,clickaction) {
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
    return btnWindow ;
}

function hideFloaty() {
    ui.run(function() {
        startWindowBtn.startbtn.setVisibility(android.view.View.GONE);
    });
}

// 定义一个函数用于显示悬浮窗
function showFloaty() {
    ui.run(function() {
        startWindowBtn.startbtn.setVisibility(android.view.View.VISIBLE);
    });
}

events.observeKey();
//监听Home键弹起
events.onceKeyDown("home", function(event){
    hideFloaty()
});
events.on("activity_paused", function(activity) {
    log("activity_paused")
    hideFloaty();
});

events.on("activity_resumed", function(activity) {
    log("resumed activity")
    showFloaty();
});


function updateByDelayInterval(){
    if ($ui.delaydrop.getSelectedItemPosition() === 0){
        delayinteval = 3000;
     }else if  ($ui.delaydrop.getSelectedItemPosition() === 1){
        delayinteval = 4000;
     }else{
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


//录入验证信息的页面
function retryAddFriendByQQZone(item) {
    // 检查是否存在备注输入框
    var bakexist = className("android.widget.EditText").exists();
    if (bakexist) {
        var verifyobj = className("android.widget.EditText").findOne();
        verifyobj.click();
        sleepSelf(delayinteval);
        // 设置验证消息
        verifyobj.setText(defaultConfig.requestverifyInfo);
        // 设置备注信息
        if (className("android.widget.EditText").text('输入备注').exists()) {
            className("android.widget.EditText").text('输入备注').setText(defaultConfig.bakInfo + (defaultConfig.index + 1));
            sleepSelf(delayinterval);
        }
        // 点击发送按钮
        className("android.widget.Button").text("发送").findOne().click();

        // 记录日志
        loggerTrace(item.qq, {
            "code": "success",
            "message": "二次确认加好友",
            "data": JSON.stringify({"qq": item.qq})
        });

        return true; // 成功添加好友
    } else {
        return false; // 未找到备注输入框，添加好友失败
    }
}


function addFriendPageOperation(item) {
    var isExistVertify = className("android.widget.EditText").text("输入答案").exists()
    const message = (isExistVertify === true) ? `${item.qq}开启了好友认证` : `${item.qq}未开启可直接加好友`
    if (isExistVertify === true) {
        sleepSelf(delayinteval);
        className("android.widget.Button").text("取消").findOne(1000).click();
        sleepSelf(delayinteval);
        if (className("android.widget.Button").text("返回").exists()){
            className("android.widget.Button").text("返回").findOne().click()
        }
        if (className("android.widget.Button").desc("返回").exists()){
            className("android.widget.Button").desc("返回").findOne().click()
        }
        loggerTrace(item.qq,{"code":"failed","msg":"该qq开启了答案验证无法加此QQ"})
        defaultConfig.index += 1;
        return;
    }
    var bakexist = className("android.widget.EditText").exists();
    // 找到备注开启添加好友流程
    if (bakexist === true) {
        var verifyobj = className("android.widget.EditText").findOne()
        verifyobj.click();
        sleepSelf(delayinteval);
        verifyobj.setText(defaultConfig.requestverifyInfo)
        if( className("android.widget.EditText").text('输入备注').exists()){
            className("android.widget.EditText").text('输入备注').setText(defaultConfig.bakInfo + defaultConfig.index + 1)
            sleepSelf(delayinteval);
        }
        className("android.widget.Button").text("发送").findOne().click()
        loggerTrace(item.qq, {"code": "success", "message": "加好友成功首次", "data": JSON.stringify({"qq": item.qq})})
        log("进入check备注流程")
        sleepSelf(delayinteval);
        if (className("android.widget.Button").text("加好友").exists()){
            className("android.widget.Button").text("加好友").findOne().click();
            sleepSelf(delayinteval);
            if (className("android.widget.EditText").text('输入备注').exists() === true){
                className("android.widget.Button").text("取消").findOne().click();
                sleepSelf(delayinteval);
                if(className("android.widget.LinearLayout").desc('他的QQ空间').exists()){
                    className("android.widget.LinearLayout").desc('他的QQ空间').findOne().click();
                }
                else if (className("android.widget.LinearLayout").desc('她的QQ空间').exists()){
                    className("android.widget.LinearLayout").desc('她的QQ空间').findOne().click();
                }
                sleepSelf(delayinteval);
                if(className("android.widget.TextView").text('加好友').exists() === false){
                    className("android.widget.ImageView").clickable(true).click();
                    loggerTrace(item.qq,{"code":"failed","msg":"qq空间维护升级或者他的qq空间您无隐私权限查看"})
                    defaultConfig.index += 1;
                    return;
                }
                className("android.widget.TextView").text("加好友").findOne().click()
                sleepSelf(delayinteval);
                //再次尝试加好友
                if(retryAddFriendByQQZone(item)){
                    sleepSelf(delayinteval);
                    className("android.widget.TextView").text("加好友").findOne().click()
                    sleepSelf(delayinteval);
                    if (className("android.widget.EditText").text('输入备注').exists() === true){
                         toastLog("诸事不顺触发风控不易加人😭")
                         ui.run(() => {
                            closeApp();
                         })
                    }else{
                        defaultConfig.flagQQZonePorcessAdd = true;
                        defaultConfig.byQQZoneCount += 1;
                        defaultConfig.index += 1;
                    }
                }else{
                    //加失败了遇到网络问题等那么
                    sleepSelf(delayinteval);
                    className("android.widget.Button").text("取消").findOne().click();
                }
            }else{
                defaultConfig.flagQQZonePorcessAdd = false;
                defaultConfig.index += 1;
                defaultConfig.byredirectQQCount += 1; 
                sleepSelf(delayinteval);
            }
        }else{
            // 有些好友不存在的情况下 qq空间这个号直接跳过
            className("android.widget.ImageView").clickable(true).click();
            loggerTrace(item.qq,{"code":"failed","msg":"无添加好友按钮可能是你的好友了"})
            defaultConfig.index += 1;
        }
    }
    else {
        loggerTrace(item.qq, { "code":"failed","msg":"请重新开始流程", "data":JSON.stringify({"qq":item.qq}) })
        sleepSelf(delayinteval);
        className("android.widget.Button").text("取消").findOne(1000).click();
    }
}
  function processAddFriend(item){
    if (item === null || item === undefined){
        toast('列表中存在不规范无法解析')
        defaultConfig.index += 1;
        return;
    }
    log(`第${defaultConfig.index + 1}位选手:${item.qq} 正在添加`)
    sleepSelf(delayinteval);
    if (isEmptyString(item.qq)) {
                toast('列表中存在不规范的数据')
                defaultConfig.index += 1;
                return;
    }
     sleepSelf(delayinteval);
     app.startActivity({
        action: "android.intent.action.VIEW",
        data: "mqq://card/show_pslcard?src_type=internal&version=1&uin=" + item.qq,
        packageName: "com.tencent.mobileqq",
    }); 
    //  className("android.widget.Button").desc("返回").findOne().click()
     sleepSelf(delayinteval);
     if(defaultConfig.flagQQZonePorcessAdd){
        className("android.widget.LinearLayout").desc('他的QQ空间').findOne().click();
        sleepSelf(delayinteval);
        className("android.widget.TextView").text("加好友").findOne().click()
        sleepSelf(delayinteval);
        if(retryAddFriendByQQZone(item)){
            sleepSelf(delayinteval);
            className("android.widget.TextView").text("加好友").findOne().click()
            sleepSelf(delayinteval);
            if (className("android.widget.EditText").text('输入备注').exists() === true){
                 toastLog("诸事不顺触发风控不易加人😭")
                 exit();
            }else{
                defaultConfig.flagQQZonePorcessAdd = true;
            }
        }else{
            //加失败了遇到网络问题等那么
            sleepSelf(delayinteval);
            className("android.widget.Button").text("取消").findOne().click();
        }
     }else{
        // 异常账号检查 异常账号会出现弹窗
        if(className("android.widget.Button").text("确认").exists()){
            className("android.widget.Button").text("确认").findOne().click()
            sleepSelf(delayinteval);
            loggerTrace(item.qq,{"code":"failed","msg":"该qq异常无法添加","data":JSON.stringify(item)})
            defaultConfig.index += 1;
        }
        else  if (className("android.widget.Button").text("加好友").exists() === true){
                className("android.widget.Button").text("加好友").findOne().click()
                sleepSelf(delayinteval);
                addFriendPageOperation(item);
        }
        else {
            className("android.widget.ImageView").clickable(true).click();
            loggerTrace(item.qq,{"code":"failed","msg":"该qq可能已经是您的好友了"})
            defaultConfig.index += 1;
        }
      
     }
  
  }
function resetConfig(){
     defaultConfig.index = 0;
     defaultConfig.failCount = 0;
     defaultConfig.startProcess = false;
     defaultConfig.byredirectQQCount = 0;
     defaultConfig.byQQZoneCount = 0;
}
function returnToHomeScreen() {
    while (currentActivity() !== "com.tencent.mobileqq.activity.SplashActivity") {
        back();
        sleep(delayinteval); // 等待一秒再检查
    }
}
function startAddQQ(){
    defaultConfig.startProcess = true;
    toast("开始加QQ啦😁~~~~");
    log(delayinteval);
    resetConfig();
    sleepSelf(delayinteval);
    home();
    sleepSelf(delayinteval);
    launch("com.tencent.mobileqq");
    sleepSelf(delayinteval);
    log(currentActivity())
    console.log("QQ 打开中");
    try {
        while(defaultConfig.index < qqFirends.length){
            log("index task",defaultConfig.index)
            processAddFriend(qqFirends[defaultConfig.index])
            log("next task ",qqFirends[defaultConfig.index])
            returnToHomeScreen()
        }
        loggerTrace("taskfinish",{"code":"finish","msg":"任务完成","data":JSON.stringify({"byAccount":defaultConfig.byredirectQQCount,"byQQZone":defaultConfig.byQQZoneCount,"failCount":defaultConfig.index - defaultConfig.byQQZoneCount - defaultConfig.byredirectQQCount,"total":defaultConfig.index})});
        $ui.run(() => ui.result.setText(JSON.stringify({"用户直接添加成功数":defaultConfig.byredirectQQCount,"byQQZone":defaultConfig.byQQZoneCount,"failCount":defaultConfig.index - defaultConfig.byQQZoneCount - defaultConfig.byredirectQQCount,"total":defaultConfig.index})));
        autoScriptThread.interrupt();
        defaultConfig.startProcess = false;
    } catch (error) {
        log("error",error)
    }
}
