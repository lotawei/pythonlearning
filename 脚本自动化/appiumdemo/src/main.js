const {remote} = require('webdriverio');
const capabilities = {
  'appium:platformName': 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'emulator-5554',
  'appium:appPackage': 'com.tencent.mm',
  "appium:appActivity": "com.tencent.mm.ui.LauncherUI",
  "appium:automationName": "UiAutomator2",
  "appium:noReset":"true", // 是否重置
  "appium:fullReset":"false", //是否重置安装
  "appium:newCommandTimeout":"30000", //没有命令多少退出

};

const wdOpts = {
  hostname: '127.0.0.1',
  path:"/wd/hub",
  port: 4723,
  logLevel: 'info',
  capabilities,
};

async function runTest() {
  const driver = await remote(wdOpts);
  console.log("开始怕群")
  try{
    await driver.pause(1000);
    const searchAdd = await driver.$('android=new UiSelector().resourceId("com.tencent.mm:id/jga")');
    await searchAdd.click();
    
    await driver.pause();
  }catch(error){
    console.log('error',error)
  }
}

runTest().catch(console.error);