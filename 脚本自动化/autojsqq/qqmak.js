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
function sleepSelf(interval) {
    // 生成1秒到3秒的随机值，单位为毫秒
    var randomValue = Math.floor(Math.random() * 700) + 1000;
    // 最终的睡眠时间为传入的间隔时间加上随机值
    var finalInterval = interval + randomValue;

    // 调用sleep函数进行睡眠
    sleep(finalInterval);
}
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
function   clickRightBottomForAddQQ() {

}
var delayinteval = 3000;
function returnToHomeScreen() {
    const maxAttempts = 8;
    const targetActivity = "com.tencent.mobileqq.activity.SplashActivity";
    if (currentActivity().startsWith('com.android.launcher')) {
        return false;
    }
    if (currentActivity() === targetActivity) {
        log("回到了主页");
        return true;
    }
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        log("loop找主页" + currentActivity());
        back();
        sleep(delayinteval);
        if (currentActivity() === targetActivity) {
            log("成功返回主页: " + targetActivity);
            return true;
        }
    }
    log("已达到最大尝试次数，退出循环");
    return false;
}
function sendQQToComputer(lastqq, reason) {
    log(`发结果到文件 ${lastqq} ${reason}`);
    
    var maxRetries = 1; // 设置最大重试次数
    var retries = 0;

    while (retries < maxRetries) {
        if (returnToHomeScreen()) {
            findTabIndex(3);
            sleepSelf(delayinteval);
            if (className("android.widget.TextView").text("设备").clickable(true).exists()) {
                className("android.widget.TextView").text("设备").findOne(2000).click();
                sleepSelf(delayinteval);
                log('找到我的电脑');
                className("android.widget.FrameLayout").clickable(true).depth(10).findOne().click()
                // className("android.widget.FrameLayout").clickable(true).depth(6).findOne(2000).click()
                sleepSelf(delayinteval)
                sleepSelf(delayinteval);
                var inputField = id('input').findOne(2000);
                if (inputField !== null) {
                    // 判断 reason 的类型并处理
                    let reasonText = typeof reason === 'object' ? JSON.stringify(reason) : reason;
                    inputField.setText(reasonText + lastqq + "xxxxxxxx");
                    sleepSelf(delayinteval);
                    var sendBtn = id("send_btn").findOne(2000);
                    if (sendBtn !== null) {
                        sendBtn.click();
                        log('信息已发送');
                        return; // 成功发送后退出函数
                    } else {
                        log("找不到发送按钮");
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
        
        retries++;
        sleepSelf(delayinteval); // 加入等待时间
    }

    log("达到最大重试次数，未能发送QQ号到电脑");
}

function startScript(){
    threads.start(() =>{
        sleep(2000);
        launch("com.tencent.mobileqq");
        sleep(2000);
        // gesture(1000, [device.width/2, device.height/2], [device.width/2, device.height/2 - 300], [0, 0])
        // className("androidx.recyclerview.widget.RecyclerView").scrollable(true).findOne().scrollForward()
        findTabIndex(3);
        // testQQAdd();
        //1175280471
        // if(className("android.widget.TextView").text("加好友").findOne(3000).exists()){
        //     className("android.widget.TextView").text("加好友").findOne(3000).click()
        // }else{
        //     log("尝试QQ空间加好友未没找到加好友按钮待优化");
        // }

        if( className("android.widget.FrameLayout").clickable(true).depth(10).exists()){
            
        }
        if ( className("android.widget.FrameLayout").clickable(true).depth(6).exists())
{

}     
        sendQQToComputer("123123123","我测")
    });
}
startScript();

