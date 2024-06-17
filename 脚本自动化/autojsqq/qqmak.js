"ui";
auto.waitFor();
importClass(android.widget.Switch);
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

// 获取 UI 元素
var toggleSwitch = ui.toggleSwitch;
var startButton = ui.startButton;
var statusText = ui.statusText;
var logContainer = ui.logContainer;

// 更新日志显示
function updateLog(message) {
    logMessages.push(message);
    ui.run(() => {
        logContainer.removeAllViews();
        for (var i = 0; i < logMessages.length; i++) {
            var logText = logMessages[i];
            logContainer.addView(ui.inflate(<text text={logText} textSize="14sp" textColor="#000000"/>));
        }
    });
}

// 开关监听事件
ui.toggleSwitch.setOnCheckedChangeListener(function(view, isChecked) {
    if (isChecked) {
        statusText.setText("当前状态：开启");
        statusText.setTextColor(colors.parseColor("#00FF00"));
        updateLog("功能已开启");
    } else {
        statusText.setText("当前状态：关闭");
        statusText.setTextColor(colors.parseColor("#FF0000"));
        updateLog("功能已关闭");
    }
});

// 按钮点击事件
ui.startButton.on("click", function() {
    if (toggleSwitch.isChecked()) {
        updateLog("开始执行任务...");
        // 在这里添加你想执行的任务代码
    } else {
        toast("请先开启功能开关");
        updateLog("尝试开始任务但开关未开启");
    }
});

// 示例日志更新
updateLog("日志初始化完成");
