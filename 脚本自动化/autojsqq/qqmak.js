"ui";
auto.waitFor();
importClass(android.widget.Switch);
setScreenMetrics(1440,2560);
devicePeixl = {
    width: 1440,
    height: 2560
}
// 初始化日志变量
var logMessages = [];

// 创建 UI 界面
$ui.layout(
    <vertical padding="16">
        <text textSize="20sp" textColor="#000000" text="开关控制与日志显示"/>
        <horizontal>
            <text text="功能开关:" textSize="18sp" />
            <Switch id="toggleSwitch" checked="false"/>
        </horizontal>
        <button id="startButton" text="开始"/>
        <text id="statusText" text="当前状态：关闭" textSize="16sp" textColor="#FF0000"/>
        <vertical padding="16">
            <text text="日志:" textSize="18sp" textColor="#000000"/>
            <scroll>
                <vertical id="logContainer"/>
            </scroll>
        </vertical>
    </vertical>
);



/**
 * 贝塞尔曲线
 * @param {坐标点} ScreenPoint 
 * @param {偏移量} Offset 
 */
function bezier_curves(ScreenPoint, Offset) {
    cx = 3.0 * (ScreenPoint[1].x - ScreenPoint[0].x);
    bx = 3.0 * (ScreenPoint[2].x - ScreenPoint[1].x) - cx;
    ax = ScreenPoint[3].x - ScreenPoint[0].x - cx - bx;
    cy = 3.0 * (ScreenPoint[1].y - ScreenPoint[0].y);
    by = 3.0 * (ScreenPoint[2].y - ScreenPoint[1].y) - cy;
    ay = ScreenPoint[3].y - ScreenPoint[0].y - cy - by;
    tSquared =Offset * Offset;
    tCubed = tSquared * Offset;
    result = {
        "x": 0,
        "y": 0
    };
    result.x = (ax * tCubed) + (bx * tSquared) + (cx * Offset) + ScreenPoint[0].x;
    result.y = (ay * tCubed) + (by * tSquared) + (cy * Offset) + ScreenPoint[0].y;
    return result;
};

function sml_move(qx, qy, zx, zy, time) {
    var xxy = [time];
    var point = [];
    var dx0 = {
        "x": qx,
        "y": qy
    };
    var dx1 = {
        "x": random(qx - 100, qx + 100),
        "y": random(qy, qy + 50)
    };
    var dx2 = {
        "x": random(zx - 100, zx + 100),
        "y": random(zy, zy + 50),
    };
    var dx3 = {
        "x": zx,
        "y": zy
    };
    for (var i = 0; i < 4; i++) {
        eval("point.push(dx" + i + ")");
    };
    for (let i = 0; i < 1; i += 0.08) {
        let newPoint=bezier_curves(point, i);
        xxyy = [parseInt(newPoint.x), parseInt(newPoint.y)]
        xxy.push(xxyy);
    }
    gesture.apply(null, xxy);
};

function findTabIndex(index){
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
function  testQQAdd(){
    className("android.widget.TextView").text('加好友').findOne().click();
}
var  athread = null;
var  index = 0;
var  arrrp = [1,3,2,34,123,12,3];
var  isprocessing = false;
var  taskTimeout = 120 * 1000;
function dotask(index){
    if(athread !== null && athread.isAlive && isprocessing){
        isprocessing = true;
        const iten = `do task+${index}`;
        log('默认执行任务中',iten);
        ui.run(() =>{
            ui.statusText.setText(iten);
        })
        sleep(2000);
        log('执行任务中')
    }
    else{
        log('dofinish task')
    }
}   
ui.startButton.on('click', function() {
    confirm('关闭脚本').then(function(res) {
        if (res) {
            if (athread !== null && athread.isAlive) {
                isprocessing = false;
                try {
                    athread.interrupt();
                    ui.run(() => {
                        toastLog(`执行这个任务被中断了${arrrp[index]}`)
                    });
                } catch (error) {
                    log('线程中断时出现错误:', error);
                }
            }
        }
    }).catch(function(error) {
        log('Promise被拒绝:', error);
    });
});
function scrollDown() {
    // 模拟从屏幕中间向上滑动
    swipe(device.width / 2, device.height / 2, device.width / 2, device.height / 4, 500);
}
var imm = context.getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
imm.toggleSoftInput(0, android.view.inputmethod.InputMethodManager.HIDE_NOT_ALWAYS);
function gestScorllerUp() {
    gesture(1000, [device.width / 2, device.height], [device.width / 2,0], [0, 0])
    sleep(1000);
}

function processAddFriend(item) {
    
    const startTime = new Date().getTime();
    // 封装检查超时的函数
    function checkTimeout() {
        if (new Date().getTime() - startTime > 1000) {
            log('已经超时本次任务两分钟了');
            return true;
        }
        log('任务未超时用时',(new Date().getTime() - startTime) / 1000)
        return false;
    }

    className('android.widget.Button').desc('addFriend').findOne(3000);
    if(checkTimeout()) return;
    log('阻塞中')
}
events.observeToast();
events.onToast(function(toast){
    // if(toast.getText().includes("异常提示")){
    //     handleException();
    // }
    log('检测',toast.getText())
});
function checkAndHandleDialog() {
    log('检查中检查')
    ui.run(() => {
    var dialog = className("android.app.Dialog").findOne(1000);
    if (dialog) {
        console.log("检测到dialog弹窗");
        // 尝试点击关闭按钮
        var closeButton = dialog.findOne(text("关闭"));
        if (closeButton) {
            closeButton.click();
        } else {
            // 尝试点击取消按钮或其他可能存在的按钮
            var cancelButton = dialog.findOne(text("取消"));
            if (cancelButton) {
                cancelButton.click();
            } else {
                // 如果没有找到关闭或取消按钮，尝试按返回键
                back();
            }
        }
    }});
}
threads.start(() => {
    // setInterval(checkAndHandleDialog, 3000);
})

// 定时检查弹窗
function startScript(){
    // UtilLog(1,2,3,[123123])
    athread = threads.start(() =>{
        launch("com.tencent.mobileqq");
        sleep(5000);
        //com.tencent.mobileqq.profilecard.activity.FriendProfileCardActivity
        log(currentActivity())
        //我的电脑
        if (className("android.widget.TextView").text("设备").clickable(true).exists()) {
            className("android.widget.TextView").text("设备").findOne(2000).click();
            sleepSelf(delayinteval);
            log('找到我的电脑');
        }
        //测试下点击
        //测试搜索框
        // if(  className("android.widget.TextView").text(`1111111`).exists()){
        //     log('奇葩的搜索按钮')
        //     //  TODO: 0.9.075
        //     var  searchBounds =  className("android.widget.TextView").text(`1111111`).findOne(3000).bounds();
        //     log('搜索位置',searchBounds)
        //     click(searchBounds.left + 3, searchBounds.top + 2);
        //     // TODO: 0.9.6
        //     // className("android.widget.TextView").text(`${item.qq}`).findOne(defaultConfig.findOneTimeOut).parent().click();
        // }else{
        //     updateQQItemStatus(item.index, -1, "该QQ未搜索到")
        //     return;
        // }
        // var  resultBounds = null;
        // if (className("android.view.ViewGroup").clickable(true).drawingOrder(1).indexInParent(0).exists()) {
        //     resultBounds = className("android.view.ViewGroup").clickable(true).drawingOrder(1).indexInParent(0).findOne(defaultConfig.findOneTimeOut).bounds();
        // }
        // log('搜索位置',resultBounds)
        // if( className("android.widget.Button").desc('确定').exists()){
        //     className("android.widget.Button").desc('确定').findOne(2000).click();
        //     // return;
        // }
        // log('不走')
        // sleep(2000);
        // if (className('android.widget.Button').desc('搜索框').exists()) {
        //     className('android.widget.Button').desc('搜索框').findOne(2000).click();
        //     sleep(2000);
        // }
        // //首次可能没找到搜索框那么点击下中间双击会出现
        // else {
        //     const addiconbounds  = className("android.widget.ImageView").desc('快捷入口').clickable(true).findOne(2000).bounds()
        //     click(device.width/2.0,addiconbounds.centerY());
        //     sleep(100);
        //     click(device.width/2.0,addiconbounds.centerY());
        //     log('先让搜索出来')
        // }
        // sleep(2000);
        // if (className("android.view.ViewGroup").depth(9).desc('搜索').drawingOrder(10).clickable(true).exists()){
        //     className("android.view.ViewGroup").depth(9).desc('搜索').drawingOrder(10).clickable(true).findOne(2000).click();
        //     log('走特殊的搜索入口进去')
        // }
        // if (className('android.widget.Button').desc('搜索框').exists()) {
        //     className('android.widget.Button').desc('搜索框').findOne(3000).click();
        // }else{
        //     //找不到的话尝试double click
        //    var  qqxiu = className("android.widget.Button").desc("超级QQ秀").drawingOrder(9).findOne(2000).bounds();
        //    log(qqxiu.centerX(),qqxiu.centerY());
        //    const  x = qqxiu.centerX() - 120;
        //    const  y = qqxiu.centerY();
        //    sleep(300);
        //    click(x,y);
        //    sleep(100)
        //    click(x,y);
        //    sleep(1000);
        //    if (className('android.widget.Button').desc('搜索框').exists()) {
        //     className('android.widget.Button').desc('搜索框').findOne(3000).click();
        //    }
        // }
        // if (className("android.widget.RelativeLayout").clickable(true).exists()) {
        //     className("android.widget.RelativeLayout").depth(4).clickable(true).findOne(defaultConfig.findOneTimeOut).click()
        // }

        // if (className("android.widget.FrameLayout").clickable(true).depth(10).exists()) {
        //     className("android.widget.FrameLayout").clickable(true).depth(10).findOne(2000).click();
        // }
        // if (className("android.widget.FrameLayout").clickable(true).depth(6).exists()) {
        //     className("android.widget.FrameLayout").clickable(true).depth(6).findOne(2000).click();
        // }
        // sleep(2000);

        // if (className("android.widget.EditText").exists()) {
        //     // 判断 reason 的类型并处理
        //     className("android.widget.EditText").findOne(2000).setText("12312321");
        //     sleep(2000);
        //     var  bounds =   className("android.widget.TextView").text('我的电脑').findOne(2000).bounds();
        //     click(bounds.left,bounds.bottom + 120);
        //     sleep(1000)
        //     if (className("android.widget.Button").text("发送").exists()) {
        //         // id("send_btn").findOne().click()
        //         className("android.widget.Button").text("发送").findOne(2000).click();
        //     }
        //     if(id('send_btn').exists()){
        //         id('send_btn').findOne(2000).click();
        //     }
        // } else {
        //     log("找不到输入框，无法发送信息", currentActivity());
        // }
    });
    // athread =   threads.start(() =>{
    //     sleep(2000);
    //     launch("com.tencent.mobileqq");
    //     sleep(2000);
    //     while(index < arrrp.length  ){
    //         log('执行任务中')
    //         dotask(arrrp[arrrp[index]]);
    //         index+=1;
    //         sleep(1000);
    //     }
    //     var startTime = new Date().getTime(); 
    //     while (athread.isAlive()) {
    //         log('主线程正在等待子线程完成...');
    //         sleep(1000);  // 每隔2秒检查一次子线程状态
    //         var currentTime = new Date().getTime();
    //         if (currentTime - startTime > taskTimeout) {
    //             log('超时，正在中断子线程...');
    //             athread.interrupt(); // 中断子线程
    //             break; // 退出循环
    //         }
    //     }
    //     log('脚本执行结束');
    //     // if (id('input').exists()) {
    //     //     if (id("send_btn").exists()){
    //     //         id("send_btn").findOne(2000)
    //     //     }else {
    //     //         log("找不到发送按钮");

    //     //     }
    //     // }
    //     // gesture(1000, [device.width/2, device.height/2], [device.width/2, device.height/2 - 300], [0, 0])
    //     // // className("androidx.recyclerview.widget.RecyclerView").scrollable(true).findOne().scrollForward()
    //     // findTabIndex(3);
    //     // testQQAdd();
    //     // var sendBtn = id("send_btn").findOne(2000).click();
    //     // log(sendBtn);
    //     // id('sss').findOne(2000).exists() //crash  八错
        
    //       // app.startActivity({
    // //     action: "android.intent.action.VIEW",
    // //     data: "mqq://card/show_pslcard?src_type=internal&version=1&uin=" + item.qq,
    // //     packageName: "com.tencent.mobileqq",
    // // }); 
    // });
}
startScript();


