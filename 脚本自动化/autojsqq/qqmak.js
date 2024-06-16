"ui";

auto.waitFor();

// // // 全局数组存储数据项
// // var globalDataItems = [];
// // var appState = {
// //     flag: 0
// // };
// // var qqState = {
// //     flag: 0
// // };

// // // 创建UI布局
// // ui.layout(
// //     <vertical padding="16">
// //         <text textSize="16sp" textColor="black" text="请输入验证信息"/>
// //         <input id="message" text=""/>
// //         <text textSize="16sp" textColor="black" text="请输入备注"/>
// //         <input id="remarks" text=""/>
// //         <text textSize="16sp" textColor="black" text="资料页延迟操作（4000ms = 4s）"/>
// //         <input id="delay_q" text="4000"/>
// //         <text textSize="16sp" textColor="black" text="空间延迟操作（8000ms = 8s）"/>
// //         <input id="delay_z" text="8000"/>

// //         <button id="start" style="Widget.AppCompat.Button.Colored" text="开始添加"/>
// //         <button id="selectDir" text="选择文件"/>
// //         <text id="selectedFile" text="未选择文件" textSize="18sp" textColor="#ff0000" padding="8dp"/>
// //         <list id="fileList">
// //             <text textSize="16sp" textColor="#000000" text="{{this.qq}}"/>
// //         </list>
// //     </vertical>
// // );

// // // 监听按钮点击事件
// // // ui.selectDir.on("click", function() {
// // //     // 读取选择的目录下的文件列表
// // //     let filesList = listFiles("/sdcard");
// // //     // 检查是否有文件
// // //     if (filesList.length > 0) {
// // //         // 弹出单选对话框让用户选择文件
// // //         dialogs.singleChoice("选择文件", filesList, -1)
// // //         .then(index => {
// // //             if (index >= 0) {
// // //                 // 获取选择的文件的完整路径
// // //                 let selectedFilePath = files.join("/sdcard", filesList[index]);
// // //                 // 更新选择的文件显示
// // //                 ui.selectedFile.setText("选中的文件: " + selectedFilePath);
// // //                 // 读取文件信息
// // //                 try {
// // //                     let file = open(selectedFilePath, 'r');
// // //                     let content = file.read();
// // //                     file.close();
// // //                     // 假设文件内容是以换行符分隔的
// // //                     let dataItems = content.split('\n').filter(item => item.trim().length > 0);
// // //                     // 将数据项添加到全局列表
// // //                     globalDataItems = dataItems;
// // //                     // 更新UI列表
// // //                     ui.fileList.setDataSource(dataItems.map(qq => ({ qq })));
// // //                 } catch (e) {
// // //                     ui.run(() => {
// // //                         toast("读取文件失败：" + e.message);
// // //                     });
// // //                 }
// // //             } else {
// // //                 ui.selectedFile.setText("未选择文件");
// // //             }
// // //         });
// // //     } else {
// // //         ui.run(() => {
// // //             toast("该目录下没有文件");
// // //         });
// // //     }
// // // });
// // ui.selectDir.on("click", function() {
// //     // 先定义路径选项
// //     let paths = ["/sdcard", "/mnt/sdcard", "输入自定义路径"];
// //     // 弹出路径选择对话框
// //     dialogs.select("选择路径", paths)
// //     .then(index => {
// //         let selectedPath;
// //         if (index === 2) {
// //             // 用户选择输入自定义路径
// //             dialogs.rawInput("请输入自定义路径", "")
// //             .then(inputPath => {
// //                 if (inputPath) {
// //                     processFiles(inputPath);  // 处理用户输入的路径
// //                 } else {
// //                     toast("未输入路径");
// //                 }
// //             });
// //         } else if (index >= 0) {
// //             // 用户选择了列表中的路径
// //             selectedPath = paths[index];
// //             processFiles(selectedPath);  // 处理选择的路径
// //         } else {
// //             toast("未选择路径");
// //         }
// //     });
// // });

// // function processFiles(path) {
// //     // 读取选择的目录下的文件列表
// //     let filesList = listFiles(path);
// //     // 检查是否有文件
// //     if (filesList.length > 0) {
// //         // 弹出单选对话框让用户选择文件
// //         dialogs.singleChoice("选择文件", filesList, -1)
// //         .then(index => {
// //             if (index >= 0) {
// //                 // 获取选择的文件的完整路径
// //                 let selectedFilePath = files.join(path, filesList[index]);
// //                 // 更新选择的文件显示
// //                 ui.selectedFile.setText("选中的文件: " + selectedFilePath);
// //                 // 读取文件信息
// //                 try {
// //                     let file = open(selectedFilePath, 'r');
// //                     let content = file.read();
// //                     file.close();
// //                     // 假设文件内容是以换行符分隔的
// //                     let dataItems = content.split('\n').filter(item => item.trim().length > 0);
// //                     // 将数据项添加到全局列表
// //                     globalDataItems = dataItems;
// //                     // 更新UI列表
// //                     ui.fileList.setDataSource(dataItems.map(qq => ({ qq })));
// //                 } catch (e) {
// //                     ui.run(() => {
// //                         toast("读取文件失败：" + e.message);
// //                     });
// //                 }
// //             } else {
// //                 ui.selectedFile.setText("未选择文件");
// //             }
// //         });
// //     } else {
// //         ui.run(() => {
// //             toast("该目录下没有文件");
// //         });
// //     }
// // }


// // // 定义函数，列出指定目录下的所有文件
// // function listFiles(dir) {
// //     try {
// //         let fileList = files.listDir(dir, function(name) {
// //             return files.isFile(files.join(dir, name));
// //         });
// //         return fileList;
// //     } catch (e) {
// //         ui.run(() => {
// //             toast("无法读取目录，请确保路径正确并有足够权限");
// //         });
// //         return [];
// //     }
// // }

// // // 监听按钮点击事件:开始添加
// // ui.start.on("click", function() {
// //     // 获取信息和备注
// //     var message = ui.message.getText().toString();
// //     var remarks = ui.remarks.getText().toString();

// //     // 延迟操作
// //     var delay_q = parseInt(ui.delay_q.getText().toString());
// //     var delay_z = parseInt(ui.delay_z.getText().toString());

// //     // 数据校验
// //     if (message.trim() === "" || remarks.trim() === "") {
// //         ui.run(() => {
// //             toast("请输入留言和备注");
// //         });
// //         return;
// //     }
// //     if (globalDataItems.length === 0) {
// //         ui.run(() => {
// //             toast("请选择文件");
// //         });
// //         return;
// //     }

// //     // 在新线程中处理，避免UI线程阻塞
// //     threads.start(function() {
// //         run(message, remarks, delay_q, delay_z);  // 调用新定义的 run 函数
// //     });
// // });

// // // 加QQ脚本主函数
// // function run(message, remarks, delay_q, delay_z) {
// //     launchQQ();
// //     for (var i = 0; i < globalDataItems.length && appState.flag != 2; i++) {
// //         log(globalDataItems[i]);

// //         if (appState.flag == 2) {
// //             // 重置状态，终止程序
// //             appState.flag = 0;
// //             break;
// //         }

// //         // 搜索QQ
// //         searchQQ(globalDataItems[i], delay_q, function() {
// //             log("searchQQ 结束");
// //         });
// //         if (qqState.flag == 1) {
// //             // 重置状态，终止本次添加
// //             qqState.flag = 0;
// //             continue;
// //         }

// //         try {
// //             // textContains(globalDataItems[i]).waitFor();
// //             // print("找到文本：" + globalDataItems[i]);
// //             addAsFriend(message, remarks, delay_q, delay_z, function() {
// //                 log("addAsFriend 结束");
// //             });
// //             print("添加成功：" + globalDataItems[i]);

// //             // 返回搜索页面
// //             try {
// //                 returnToSearchPage();
// //             } catch (e) {
// //                 log("返回搜索页面时发生错误：" + e.message);
// //             }
            
// //         } catch (e) {
// //             log("等待超时，未找到文本：" + globalDataItems[i]);
// //         }
// //     }
// //     ui.run(() => {
// //         appState.flag = 0;
// //         print("操作完成！");
// //         toast("操作完成！");
// //     });
// // }


// // // 打开QQ好友添加页面
// // function launchQQ() {
// //     launchApp("QQ");
// //     sleep(2000);
// //     while(!id("ba3").findOne().click());
// //     sleep(2000);
// //     while(!click('加好友'));
// // }

// // // 搜索点击资料页
// // function searchQQ(qq, delay_q, callback){
// //     log("函数 searchQQ 被调用");
// //     sleep(delay_q);
// //     textContains('QQ号/').waitFor();
// //     textContains('QQ号/').click();
// //     sleep(delay_q);
// //     setText(qq);
// //     sleep(delay_q);
// //     id("tce").waitFor();
// //     id("tce").findOne().click();
// //     sleep(delay_q);
// //     if(desc('添加按钮').exists()){
// //         var x = desc("添加按钮").findOne().parent().parent().bounds().centerX();
// //         var y = desc("添加按钮").findOne().parent().parent().bounds().centerY();
// //         if (!textContains("加好友").exists()){
// //             click(x,y);
// //         }
// //         sleep(delay_q);
// //         // log("searchQQ 结束");
// //         if (typeof callback === 'function') {
// //             callback();  // 执行回调表示完成
// //         }
// //     } else {
// //         while(!click('取消'));
// //         // 返回，终止本次循环，进入下一个循环
// //         qqState.flag = 1;
// //         if (typeof callback === 'function') {
// //             callback();  // 执行回调表示完成
// //         }
// //     }
    
// // }

// // // 添加QQ好友
// // function addAsFriend(message, remarks, delay_q, delay_z, callback){
// //     print("函数 addAsFriend 被调用");
// //     try {
// //         if (appState.flag === 0) {
// //             print("检查 flag 状态: 0");
// //             if (addProfile(message, remarks, delay_q)) {
// //                 print("addProfile 执行成功");
// //             } else {
// //                 appState.flag = 1;
// //                 print('更改 flag 为:', appState.flag);
// //             }
// //         }
// //         if (appState.flag === 1) {
// //             print("检查 flag 状态: 1");
// //             if (!addQzone(message, remarks, delay_z)) {
// //                 appState.flag = 2;
// //                 ui.run(() => {
// //                     toast("频繁添加！");
// //                 });
// //                 print('更改 flag 为:', appState.flag);
// //             } else {
// //                 print("addQzone 执行成功");
// //             }
// //         }
// //         if (typeof callback === 'function') {
// //             callback();
// //         }
// //     } catch (e) {
// //         ui.run(() => {
// //             print("操作失败: " + e.message);
// //             toast("操作失败: " + e.message);
// //         });
// //         if (typeof callback === 'function') {
// //             callback();
// //         }
// //     }
// // }

	
// // // 加资料
// // function addProfile(message, remarks, delay_q) {
// //     textContains("加好友").waitFor();
// //     if(click("加好友")){
// //         sleep(delay_q);
// //         setText(0, message);
// //         setText(1, remarks);
// //         sleep(delay_q);
// //         while(!click("发送") );
// //         sleep(delay_q);
// //         if(click("加好友")){
// //             sleep(delay_q);
// //             // 判断之前的备注信息是否还存在
// //             // 根据属性获取第二个输入框
// //             var inputBoxes = className("android.widget.EditText").filter(function(widget) {
// //                 return widget.text() !== ""; // 或者使用其他属性比如hint
// //             }).find();
// //             if (inputBoxes.size() > 1) {
// //                 var secondInputBox = inputBoxes.get(1);
// //                 var text = secondInputBox.text();
// //             } else {
// //                 console.log("未找到足够的输入框");
// //             }
// //             if(text == remarks){
// //                 back();
// //                 return true;
// //             }else{
// //                 print("备注信息不一致")
// //                 back();
// //                 return false;
// //             }
// //         }
// //     }else{
// //         print("出错了")
// //         return true;
// //     }
// // }

// // // 加空间
// // function addQzone(message, remarks, delay_z) {
// //     try {
// //         id("root_layout").descContains('的QQ空间').findOne(10000).click();  // 增加超时时间
// //     } catch (e) {  // 在catch后面添加参数e
// //         swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 1000);
// //         id("root_layout").descContains('的QQ空间').findOne(10000).click();  // 重试点击
// //     }

// //     textContains("加好友").waitFor();
// //     if(click("加好友")){
// //         sleep(delay_z);
// //         setText(0, message);
// //         setText(1, remarks);
// //         sleep(delay_z);
// //         while(!click("发送") );
// //         sleep(delay_z);

// //         if(textContains('的QQ空间').exists()){
// //             try {
// //                 id("root_layout").descContains('的QQ空间').findOne(10000).click();  // 增加超时时间
// //             } catch (e) {  // 在catch后面添加参数e
// //                 swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 1000);
// //                 id("root_layout").descContains('的QQ空间').findOne(10000).click();  // 重试点击
// //             }    
// //         }

// //         textContains("加好友").waitFor();
        
// //         if(click("加好友")){
// //             sleep(delay_z);
// //             // 判断之前的备注信息是否还存在
// //             // 根据属性获取第二个输入框
// //             var inputBoxes = className("android.widget.EditText").filter(function(widget) {
// //                 return widget.text() !== ""; // 或者使用其他属性比如hint
// //             }).find();
// //             if (inputBoxes.size() > 1) {
// //                 var secondInputBox = inputBoxes.get(1);
// //                 var text = secondInputBox.text();
// //             } else {
// //                 console.log("未找到足够的输入框");
// //             }
// //             if(text == remarks){
// //                 while(!back());
// //                 return true;
// //             }else{
// //                 print("备注信息不一致")
// //                 while(!back());
// //                 return false;
// //             }
// //         }
// //     }else{
// //         print("出错了")
// //         return true;
// //     }
// // }

// // // 返回搜索页
// // function returnToSearchPage() {
// //     print("函数 returnToSearchPage 被调用")
// //     if (desc("返回").exists()){
// //         var x = desc("返回").findOne().bounds().centerX();
// //         var y = desc("返回").findOne().bounds().centerY();
// //         print(x,y);
// //         while(!click(x,y));
// //     }else{
// //         print('没找到返回按钮，强制返回');
// //         while(!back());
// //     }
// //     print('返回/点击取消')
// //     // log(textContains('取消').waitFor());
// //     if(textContains('取消').exists()){
// //         while(!click('取消'));
// //     }else{
// //         print('没找到取消按钮，强制返回');
// //         while(!back());
// //         while(!back());
// //     }
    
// //     sleep(2000);
// //     print('下一个！')
// // }

// "ui";

// ui.layout(
//     <frame>
//         <vertical>
//             <appbar>
//                 <toolbar id="toolbar" title="Todo" />
//             </appbar>
//             <list id="todoList">
//                 <card w="*" h="70" margin="10 5" cardCornerRadius="2dp"
//                     cardElevation="1dp" foreground="?selectableItemBackground">
//                     <horizontal gravity="center_vertical">
//                         <View bg="{{this.color}}" h="*" w="10" />
//                         <vertical padding="10 8" h="auto" w="0" layout_weight="1">
//                             <text id="title" text="{{this.title}}" textColor="#222222" textSize="16sp" maxLines="1" />
//                             <text text="{{this.summary}}" textColor="#999999" textSize="14sp" maxLines="1" />
//                         </vertical>
//                         <checkbox id="done" marginLeft="4" marginRight="6" checked="{{this.done}}" />
//                     </horizontal>

//                 </card>
//             </list>
//         </vertical>
//         <fab id="add" w="auto" h="auto" src="@drawable/ic_add_black_48dp"
//             margin="16" layout_gravity="bottom|right" tint="#ffffff" />
//     </frame>
// );

// var materialColors = ["#e91e63", "#ab47bc", "#5c6bc0", "#7e57c2", "##2196f3", "#00bcd4",
//     "#26a69a", "#4caf50", "#8bc34a", "#ffeb3b", "#ffa726", "#78909c", "#8d6e63"];

// var storage = storages.create("todoList");
// //从storage获取todo列表
// var todoList = storage.get("items", [
//     {
//         title: "写操作系统作业",
//         summary: "明天第1～2节",
//         color: "#f44336",
//         done: false
//     },
//     {
//         title: "给ui模式增加若干Bug",
//         summary: "无限期",
//         color: "#ff5722",
//         done: false
//     },
//     {
//         title: "发布Auto.js 5.0.0正式版",
//         summary: "2019年1月",
//         color: "#4caf50",
//         done: false
//     },
//     {
//         title: "完成毕业设计和论文",
//         summary: "2019年4月",
//         color: "#2196f3",
//         done: false
//     }
// ]);;

// ui.todoList.setDataSource(todoList);

// ui.todoList.on("item_bind", function (itemView, itemHolder) {
//     //绑定勾选框事件
//     itemView.done.on("check", function (checked) {
//         let item = itemHolder.item;
//         item.done = checked;
//         let paint = itemView.title.paint;
//         //设置或取消中划线效果
//         if (checked) {
//             paint.flags |= Paint.STRIKE_THRU_TEXT_FLAG;
//         } else {
//             paint.flags &= ~Paint.STRIKE_THRU_TEXT_FLAG;
//         }
//         itemView.title.invalidate();
//     });
// });

// ui.todoList.on("item_click", function (item, i, itemView, listView) {
//     itemView.done.checked = !itemView.done.checked;
// });

// ui.todoList.on("item_long_click", function (e, item, i, itemView, listView) {
//     confirm("确定要删除" + item.title + "吗？")
//         .then(ok => {
//             if (ok) {
//                 todoList.splice(i, 1);
//             }
//         });
//     e.consumed = true;
// });

// //当离开本界面时保存todoList
// ui.emitter.on("pause", () => {
//     storage.put("items", todoList);
// });

// ui.add.on("click", () => {
//     dialogs.rawInput("请输入标题")
//         .then(title => {
//             if (!title) {
//                 return;
//             }
//             dialogs.rawInput("请输入期限", "明天")
//                 .then(summary => {
//                     todoList.push({
//                         title: title,
//                         summary: summary,
//                         color: materialColors[random(0, materialColors.length - 1)]
//                     });
//                 });
//         })
// });

 
function box() {
    $ui.layout(
        <vertical>
        <input id="输入框"w="*" />
        </vertical>
    );
}
 
box()

// 获取屏幕宽高
var screenWidth = device.width;
var screenHeight = device.height;

// 设置悬浮窗的宽高
var windowWidth = screenWidth * 0.3;
var windowHeight = screenHeight * 0.4;

// 创建悬浮窗
var window = floaty.window(
    <frame>
        <vertical>
        <button id="action" text="开始" w="*" h="*"/>
        <button id="adas" text="按暂停" w="*" h="*"/>
        </vertical>
       
    </frame>
);

// 设置悬浮窗的初始位置
window.setPosition((screenWidth - windowWidth) / 2, (screenHeight - windowHeight) / 2);
window.setSize(windowWidth, windowHeight);

// 记录悬浮窗是否正在移动
var moving = false;
var x, y, windowX, windowY;

// 注册触摸监听器
window.action.setOnTouchListener(function(view, event){
    switch(event.getAction()){
        case event.ACTION_DOWN:
            // 按下时记录当前悬浮窗的坐标和手指按下的坐标
            moving = true;
            x = event.getRawX();
            y = event.getRawY();
            windowX = window.getX();
            windowY = window.getY();
            return true;
        case event.ACTION_MOVE:
            // 移动时更新悬浮窗的位置
            if (moving) {
                window.setPosition(windowX + (event.getRawX() - x), windowY + (event.getRawY() - y));
            }
            return true;
        case event.ACTION_UP:
            // 抬起时停止移动
            moving = false;
            return true;
    }
    return true;
});

// 按钮点击事件
window.action.click(function(){
    switch(window.action.text()){
        case "开始":
            window.action.setText("停止");
            toast("开始");
            break;
        case "停止":
            window.action.setText("关闭");
            toast("停止");
            break;
        case "关闭":
            window.action.setText("开始");
            toast("关闭");
            window.close();
            break;
    }
});
