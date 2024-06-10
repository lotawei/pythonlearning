/**
 * @typedef {Object} Rect
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */
delayinteval = 4000;
auto.waitFor();
if (!auto.service) {
    toast("请开启无障碍服务");
}
toast("自动添加QQ好友~~😁")
const storage = storages.create("logStorage");
// 确保 Auto.js 等待应用启动

let qqFirends = loadQQInfos();
qqBakInfo = "不会跟单想看大佬如何买？挣米好xm";
function loadQQInfos() {
    // var jsonString = '{"waitQQ":[{"qq":"1286594907"},{"qq":"1328566929"}]}';
    // 解析 JSON 字符串
    var jsonString = '{"waitQQ":[{"qq":"1286594907"}]}';
    var jsonObject = JSON.parse(jsonString);

    // 提取 QQ 信息
    var qqArray = jsonObject.waitQQ.map(function (item) {
        return item.qq;
    });
    return qqArray;
}
function sleepSelf(interval) {
    sleep(interval);
}

function isEmptyString(str) {
    return str === null || str === undefined || str.trim() === '';
}

function addFriendPageOperation(qq) {
    var resultanwser = className("android.widget.EditText").text("输入答案").findOne()
    if (resultanwser !== null) {
        toast("加好友失败需输入答案")
        storage.put(qq, { "qq": qq, "result": { "code": false, "message": "加好友失败需输入答案" } })
        return;
    }
    console.log("走到了QQ空间加")
    var result = className("android.widget.EditText").text("输入备注").findOne()
    // 找到备注开启添加好友流程
    if (result !== null && result !== undefined) {
        result.click();
        sleepSelf(delayinteval);
        result.setText(qqBakInfo);
        sleepSelf(delayinteval);
        className("android.widget.Button").text("发送").findOne().click()
        storage.put(qq, { "qq": qq, "result": { "code": true, "message": "加好友成功" } })
    }
    else {
        storage.put(qq, { "qq": qq, "result": { "code": false, "message": "加好友失败,继续QQ空间操作" } })
        sleepSelf(delayinteval);
    }
}

function processAddFriend(qq) {
    // 当前主页
    if (isEmptyString(qq)) {
        toast('qq为空请设置')
        return;
    } else {
        // 打开好友
        app.startActivity({
            action: "android.intent.action.VIEW",
            data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + qq,
            packageName: "com.tencent.mobileqq",
        });
        sleepSelf(delayinteval);
        className("android.widget.TextView").text("加为好友").findOne().click()
        sleepSelf(delayinteval);
        var resultanwser = className("android.widget.EditText").text("输入答案").findOne()
        if (resultanwser !== null) {
            // 返回上一级 点击取消加这个好友
            className("android.widget.Button").text("取消").findOne().click()
            sleepSelf(delayinteval);
            // 返回按钮点击
            desc("返回消息未读0").findOne().click();
            sleepSelf(delayinteval);
            processQQZone(qq);
            storage.put(qq, { "qq": qq, "result": { "code": false, "message": "加好友失败需输入答案" } })
            return;
        }
        var result = className("android.widget.EditText").text("输入备注").findOne()
        // 找到备注开启添加好友流程
        if (result !== null && result !== undefined) {
            result.click();
            sleepSelf(delayinteval);
            result.setText(qqBakInfo);
            sleepSelf(delayinteval);
            className("android.widget.Button").text("发送").findOne().click()
            storage.put(qq, { "qq": qq, "result": { "code": true, "message": "加好友成功" } })
        }
        else {
            storage.put(qq, { "qq": qq, "result": { "code": false, "message": "加好友失败,继续QQ空间操作" } })
            sleepSelf(delayinteval);
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
function processQQZone(qq) {
    desc('搜索框').findOne().click()
    sleepSelf(delayinteval);
    var resultsearch = className("android.widget.EditText").text("搜索").findOne()
    sleepSelf(delayinteval);
    resultsearch.click();
    resultsearch.setText(qq);
    sleepSelf(delayinteval);
    className("android.widget.LinearLayout").clickable(true).findOne().click()
    sleepSelf(delayinteval);
    var bounds =  findRecycleItem();
    if (bounds === null){
        toast("QQ版本不兼容问题未找到该元素")
        return;
    }
    click(bounds)
    //添加好友
    sleepSelf(delayinteval);
    className("android.widget.Button").text("加好友").findOne().click()
    sleepSelf(delayinteval);
    addFriendPageOperation(qq);
}
function main() {
    home();
    sleepSelf(delayinteval);
    launch("com.tencent.mobileqq");
    sleepSelf(delayinteval);
    console.log("QQ 打开中");
    qqFirends.forEach(qq => {
        processAddFriend(qq);
    });
}

// 运行主函数
main();
