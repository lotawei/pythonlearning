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
function startScript(){
    athread =   threads.start(() =>{
        sleep(2000);
        launch("com.tencent.mobileqq");
        sleep(2000);
        while(index < arrrp.length  ){
            log('执行任务中')
            dotask(arrrp[arrrp[index]]);
            index+=1;
            sleep(1000);
        }
        var startTime = new Date().getTime(); 
        while (athread.isAlive()) {
            log('主线程正在等待子线程完成...');
            sleep(1000);  // 每隔2秒检查一次子线程状态
            var currentTime = new Date().getTime();
            if (currentTime - startTime > taskTimeout) {
                log('超时，正在中断子线程...');
                athread.interrupt(); // 中断子线程
                break; // 退出循环
            }
        }
        log('脚本执行结束');
        // if (id('input').exists()) {
        //     if (id("send_btn").exists()){
        //         id("send_btn").findOne(2000)
        //     }else {
        //         log("找不到发送按钮");

        //     }
        // }
        // gesture(1000, [device.width/2, device.height/2], [device.width/2, device.height/2 - 300], [0, 0])
        // // className("androidx.recyclerview.widget.RecyclerView").scrollable(true).findOne().scrollForward()
        // findTabIndex(3);
        // testQQAdd();
        // var sendBtn = id("send_btn").findOne(2000).click();
        // log(sendBtn);
        // id('sss').findOne(2000).exists() //crash  八错
        
          // app.startActivity({
    //     action: "android.intent.action.VIEW",
    //     data: "mqq://card/show_pslcard?src_type=internal&version=1&uin=" + item.qq,
    //     packageName: "com.tencent.mobileqq",
    // }); 
    });

}
startScript();


