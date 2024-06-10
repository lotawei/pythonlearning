// 确保 Auto.js 等待应用启动
auto.waitFor();

// 定义搜索和加好友的功能
function addFriend(QQNumber, remark, verificationMessage) {
    // 启动QQ应用
    launchApp("QQ");
    sleep(5000); // 等待应用启动

    // 搜索QQ号码
    let searchBox = id("search_src_text").findOne();
    searchBox.setText(QQNumber);
    sleep(2000); // 等待搜索结果加载

    // 进入QQ资料页
    let result = textContains(QQNumber).findOne();
    result.click();
    sleep(3000); // 等待资料页加载

    // 点击加好友按钮
    let addFriendButton = text("加好友").findOne();
    addFriendButton.click();
    sleep(2000); // 等待加好友页面加载

    // 设置备注和验证信息
    let remarkField = id("remark").findOne();
    remarkField.setText(remark);
    let verificationField = id("verification").findOne();
    verificationField.setText(verificationMessage);

    // 发送加好友请求
    let sendButton = text("发送").findOne();
    sendButton.click();
    sleep(3000); // 等待请求发送

    // 再次点击加好友按钮检查备注信息
    addFriendButton.click();
    sleep(2000);

    // 检查备注信息是否正确
    let currentRemark = id("remark").findOne().getText();
    if (currentRemark === remark) {
        console.log("备注信息正确，添加好友成功");
        return true;
    } else {
        console.log("备注信息错误，添加好友失败");
        return false;
    }
}

// 定义从QQ空间加好友的功能
function addFriendFromQZone(QQNumber, remark, verificationMessage) {
    // 进入QQ空间
    let qZoneButton = text("QQ空间").findOne();
    qZoneButton.click();
    sleep(5000); // 等待QQ空间加载

    // 点击加好友按钮
    let addFriendButton = text("加好友").findOne();
    addFriendButton.click();
    sleep(2000);

    // 设置备注和验证信息
    let remarkField = id("remark").findOne();
    remarkField.setText(remark);
    let verificationField = id("verification").findOne();
    verificationField.setText(verificationMessage);

    // 发送加好友请求
    let sendButton = text("发送").findOne();
    sendButton.click();
    sleep(3000); // 等待请求发送

    // 再次点击加好友按钮检查备注信息
    addFriendButton.click();
    sleep(2000);

    // 检查备注信息是否正确
    let currentRemark = id("remark").findOne().getText();
    if (currentRemark === remark) {
        console.log("备注信息正确，添加好友成功");
        return true;
    } else {
        console.log("备注信息错误，添加好友失败");
        return false;
    }
}

// 主函数
function main() {
    let QQNumber = "123456789"; // 要添加的QQ号码
    let remark = "备注信息"; // 备注信息
    let verificationMessage = "验证信息"; // 验证信息
    console.log("================================");
    // 尝试通过资料页添加好友
    // if (!addFriend(QQNumber, remark, verificationMessage)) {
    //     console.log("通过资料页添加好友失败，尝试通过QQ空间添加");
        
    //     // 如果资料页添加好友失败，尝试通过QQ空间添加好友
    //     if (!addFriendFromQZone(QQNumber, remark, verificationMessage)) {
    //         console.log("通过QQ空间添加好友也失败，终止程序");
    //     }
    // }
}

// 运行主函数
main();
