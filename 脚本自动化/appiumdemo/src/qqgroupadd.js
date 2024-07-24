const {remote} = require('webdriverio');
const fsPromises = require('fs').promises;
const path = require('path');
const { log, dir } = require('console');

const capabilities = {
  "appium:platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "com.tencent.mobileqq",
  "appium:appActivity": ".activity.SplashActivity",
  "appium:noReset":"true", // 是否重置
  "appium:fullReset":"false", //是否重置安装
  "appium:newCommandTimeout":"30000", //没有命令多少退出
};
class  QQGroup{
    constructor(name,status,groupid,message) {
      this.name = name;
      this.status = status; 
      this.groupid = groupid;
      this.message = message; 
    }
}
// 定义一个基类
class QQItem {
  constructor(qqid,qqname,status,info) {
    this.qqid = qqid;
    this.status = status; // 新增的status属性
    this.qqname = qqname; // 新增的message属性
    this.info = info
  }
}
const wdOpts = {
  hostname: '127.0.0.1',
  path:"/wd/hub",
  port: 4723,
  logLevel: 'info',
  capabilities,
};

var  groupitems = []
function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
  const map = {
      'yyyy': date.getFullYear(),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'dd': String(date.getDate()).padStart(2, '0'),
      'HH': String(date.getHours()).padStart(2, '0'),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'ss': String(date.getSeconds()).padStart(2, '0')
  };
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => map[match]);
}
async function  loadQQGroupName() {
    try {
      const filepath = path.join(__dirname, 'qqgrouptxt.txt');
      const data = await fsPromises.readFile(filepath, 'utf8');
  
      const trimmedData = data.trim();
      console.log('trimmedData', trimmedData);
      const originalWids = trimmedData.split('\n').map(line => line.trim());
      originalWids.forEach(item => {
          groupitems.push(new QQGroup(item, 0, "",""));
      });
      return groupitems;
    } catch (error) {
      console.log('errorxxx',error)
    }
    return [];
     
}
async function dealFinish() {
  groupitems.sort((a,b) =>  a.status - b.status )
  let resultText = '';

  // 遍历wids数组，根据status属性统计并记录每个任务的状态
  groupitems.forEach(wxtask => {
      let statusText = '';
      switch (wxtask.status) {
          case 0:
              statusText = '未添加';
              break;
          case 1:
              statusText = '添加成功';
              break;
          case -1:
              statusText = '添加异常';
              break;
          default:
              statusText = '未知状态';
      }
      resultText += `${wxtask.wid} ${statusText} ${wxtask.message}\n`;
  });

  // 添加统计总结
  const summary = `${formatDate(new Date())}本次统计结果\n未添加的任务数: ${groupitems.filter(task => task.status === 0).length}\n添加成功的任务数: ${groupitems.filter(task => task.status === 1).length}\n出现异常的任务数: ${groupitems.filter(task => task.status === -1).length}`;
  resultText += summary;
  console.log("结果",resultText)
  try {
    const filepath = path.join(__dirname, 'taskresult.txt');
    // 将统计结果写入到taskresult.txt文件
    await fsPromises.appendFile(filepath, resultText);
  }catch(err){
    console.log('写入文件发生错误',err)
  }

} 
var driver = null;
async function runMain(){
  log('info','运行开始')
   try {
        groupitems =  await loadQQGroupName()
        if(groupitems.length === 0){
          log('error','请先准备好数据')
          return;
        }
        driver = await remote(wdOpts);
        for (let i = 0; i < groupitems.length; i++) {
              const wxtask = groupitems[i];
              await runScriptMain(driver,wxtask)
        }
        await dealFinish();
   } catch (error) {
      console.log('error',error)
   }
   log('info','运行结束')

}
async  function waitForSecond(driver){
  await  driver.pause(3000)
}
async  function  backHome(driver){
      var backcount = 0
      const  maxBakCount = 10;
      var  activity = await driver.getCurrentActivity();
      console.log('当前主页0',activity)
      if (activity === '.activity.SplashActivity'){
        return true
      }
      while(backcount < maxBakCount){
        try {
               var  activity1 = await driver.getCurrentActivity();
              console.log('当前主页1',activity1)
              if (activity1 === '.activity.SplashActivity'){
                await  driver.back();
                return true
              }else{
                await  driver.back();
                driver.pause(1000)
                backcount += 1
              }
        }catch(error){
             console.log('回退遇到问题',error)
             break;
        }
      }
      if (backcount ===  maxBakCount) {
          console.warn("达到最大回退次数无法回到主页")
      }
}
async function runScriptMain(driver,wxtask) {
  console.log(`开始添加好友${wxtask.wid}`)
  try{
    await driver.pause(1000);
    const  homeactiv = await driver.getCurrentActivity()
    console.log('xxxxxx',homeactiv)
    const searchAdd = await driver.$('android=new UiSelector().resourceId("com.tencent.mobileqq:id/wsg")');
    await searchAdd.click();
    await waitForSecond(driver)
    const addfriend = await driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/m7g").instance(1)');
    await addfriend.click();
    await waitForSecond(driver)
    const search = await driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/mmz")');
    await search.click();
    await waitForSecond(driver)
    const searchText = await driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/d98")');
    await searchText.setValue(wxtask.wid);
    await waitForSecond(driver)
    const searchButton = await driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/o_q")');
    await searchButton.click();
    await waitForSecond(driver)
    
    const  yichang = await driver.$('android=new UiSelector().className("android.widget.TextView").textContains(\"异常\")')?.isDisplayed() ?? false
    const  bucunzai = await driver.$('android=new UiSelector().className("android.widget.TextView").textContains(\"不存在\")')?.isDisplayed() ?? false
    log('异常和存在与否',yichang,bucunzai);
    if(yichang || bucunzai){
      wxtask.status = -1 
      wxtask.message = '好友不存在'
      await backHome(driver)
      await waitForSecond(driver)
      return
    }
    // 添加到通讯录
    await  waitForSecond(driver)
    const   addView = await driver.$('android=new UiSelector().className("android.widget.TextView").textContains(\"添加到\")')
    if(addView.isDisplayed()){
      addView.click()
      await waitForSecond(driver)
      await   driver.$('android=new UiSelector().className("android.widget.EditText").resourceId("com.tencent.mm:id/m9y")').setValue(wxtask['bakInfo'])
      await   waitForSecond(driver);
      const  sendbtn =  await driver.$('android=new UiSelector().className("android.widget.Button").text("发送")')
      sendbtn.click()
      await waitForSecond(driver)
      wxtask.status = 1
      wxtask.message = "添加好友成功"
      await backHome(driver)
      await waitForSecond(driver)
    }else{
       wxtask.status = -1
       wxtask.message = "不存在添加按钮"
       await backHome(driver)
       await waitForSecond(driver)
    }
  }catch(error){
    console.log('logerror',error)
    wxtask.status = -1
    const errorMessage = `${error.message}\n${error.stack}`;
    wxtask.message = `${errorMessage}`
    await backHome(driver)
    await waitForSecond(driver)
  }
}

runMain();