const {remote} = require('webdriverio');
const fsPromises = require('fs').promises;
const path = require('path');
const { log, dir } = require('console');

const capabilities = {
  "appium:platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "com.tencent.mm",
  "appium:appActivity": "com.tencent.mm.ui.LauncherUI",
  "appium:noReset":"true", // 是否重置
  "appium:fullReset":"false", //是否重置安装
  "appium:newCommandTimeout":"30000", //没有命令多少退出
};
const   configInfo = {
        bakInfo:"我是你的小迷妹"
}
// 定义一个基类
class WeTaskInfo {
  constructor(wid, status, message, bakInfo) {
    this.wid = wid;
    this.status = status; // 新增的status属性
    this.message = message; // 新增的message属性
    this.bakInfo = bakInfo
  }
}
const wdOpts = {
  hostname: '127.0.0.1',
  path:"/wd/hub",
  port: 4723,
  logLevel: 'info',
  capabilities,
};

var  wids = []
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
async function  loadWidData() {
    try {
      const filepath = path.join(__dirname, 'testwx.txt');
      const data = await fsPromises.readFile(filepath, 'utf8');
      console.log('data', data);
      const originalWids = data.split('\n');
      originalWids.forEach(item => {
          wids.push(new WeTaskInfo(item, 0, "",configInfo.bakInfo));
      });
      return wids;
    } catch (error) {
      console.log('errorxxx',error)
    }
    return [];
     
}
async function isElementPresent(selector) {
  try {
      // 尝试查找元素
      var  res = await driver.$(selector);
      console.log("结果元素",...res)
      if(res.error !== null && res.error !== undefined){
        return false
      }
      // 如果成功找到元素，没有抛出异常，则元素存在
      return true;
  } catch (error) {
      // 捕获NoSuchElementError或其他错误
      if (error.name === 'NoSuchElementError') {
          // 元素不存在
          return false;
      } else {
          // 其他类型的错误，可能需要特殊处理
          return  false
      }
  }
}
async function dealFinish() {
  wids.sort((a,b) =>  a.status - b.status )
  let resultText = '';

  // 遍历wids数组，根据status属性统计并记录每个任务的状态
  wids.forEach(wxtask => {
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
  const summary = `${formatDate(new Date())}本次统计结果\n未添加的任务数: ${wids.filter(task => task.status === 0).length}\n添加成功的任务数: ${wids.filter(task => task.status === 1).length}\n出现异常的任务数: ${wids.filter(task => task.status === -1).length}`;
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
        wids =  await loadWidData()
        if(wids.length === 0){
          log('error','请先准备好数据')
          return;
        }
        driver = await remote(wdOpts);
        for (let i = 0; i < wids.length; i++) {
              const wxtask = wids[i];
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
      if (activity === '.ui.LauncherUI'){
        return true
      }
      while(backcount < maxBakCount){
        try {
               var  activity1 = await driver.getCurrentActivity();
              console.log('当前主页1',activity1)
              if (activity1 === '.ui.LauncherUI'){
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
    const searchAdd = await driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/jga")');
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
    
   
    const  isexist = await isElementPresent('android=new UiSelector().resourceId("com.tencent.mm:id/cam")')
    log('xxx搜索到',isexist)
    if(isexist  === true){
        wxtask.status = -1 
        wxtask.message = '好友不存在'
        await backHome(driver)
        await waitForSecond(driver)
        return
    }
    // 添加到通讯录
    const  isexistAddB = await isElementPresent('android=new UiSelector().resourceId("com.tencent.mm:id/o3b")')
    log('xxx备忘录',isexistAddB)
    if(isexistAddB === false){
      wxtask.status = -1 
      wxtask.message = "不存在添加到通讯录按钮"
      await backHome(driver)
      await waitForSecond(driver)
      return;
    }
    driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/o3b")').click();
    await   waitForSecond(driver);
    await   driver.$('new UiSelector().resourceId("com.tencent.mm:id/m9y")').setValue(wxtask.bakInfo)
    await   waitForSecond(driver);
    const  sendbtn =  await driver.$('new UiSelector().resourceId("com.tencent.mm:id/g68")')
    sendbtn.click()
    wxtask.status = 1
    wxtask.message = "添加好友成功"
    await backHome(driver)
  }catch(error){
    console.log('logerror',error)
    wxtask.status = -1
    wxtask.message = "error"
    await backHome(driver)
  }
}

runMain();