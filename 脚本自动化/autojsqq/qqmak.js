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

function  findTableInex(index){
    log(device.width,device.height)
   if(className("android.widget.TabWidget").exists()){
    const  tabs = className("android.widget.TabWidget").findOne(2000).bounds();
    const x = (devicePeixl.width / 5 * index) / 2.0;
    const y =  (devicePeixl.height - (tabs.height()/2.0));
    log(x,y,tabs);
    click(x,y);
   }
}
function  testQQAdd(){
    className("android.widget.TextView").text('加好友').findOne().click();
}
function startScript(){
    threads.start(() =>{
        sleep(2000);
        launch("com.tencent.mobileqq");
        sleep(2000);
        // gesture(1000, [device.width/2, device.height/2], [device.width/2, device.height/2 - 300], [0, 0])
        // className("androidx.recyclerview.widget.RecyclerView").scrollable(true).findOne().scrollForward()
        // findTableInex(1);
        testQQAdd();
    });
}
startScript();

