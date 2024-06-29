from datetime import datetime
import os
from typing import List
from appium import webdriver
from selenium.common.exceptions import NoSuchElementException
from appium.options.android import UiAutomator2Options
import time
import re
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions.pointer_input import PointerInput
import pandas as pd
class Utils(object):
   @staticmethod
   def  getSizeWindow(driver):
    screen_size = driver.get_window_size()
    screen_width = screen_size['width']
    screen_height = screen_size['height']
    return screen_width,screen_height
   @staticmethod
   def extract_numbers_from_string(input_string):
    """
    从输入的字符串中提取所有数字并返回它们组成的列表。
    如果没有找到数字，则返回一个空列表。
    
    :param input_string: 需要提取数字的字符串
    :return: 包含提取到的所有数字的列表
    """
    # 使用正则表达式查找字符串中的所有数字
    match = re.search(r'\d+', input_string)
    if match:
        # 将找到的数字字符串转换为整数
        return int(match.group())
    else:
        return None
   @staticmethod 
   def log(message):
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')  # 格式化当前时间
        print(f"[{current_time}] {message}")
   @staticmethod
   def sleepSelf(duration):
        time.sleep(duration)
   @staticmethod
   def extract_qq_number(text):
        pattern = r"QQ号：(\d+)"
        match = re.search(pattern, text)
    
        if match:
        # 返回第一个匹配组，即括号内的内容，这里是QQ号码
            return match.group(1)
        else:
        # 如果没有找到匹配项，返回None
            return None
class  QQMemerber:
     def __init__(self,name,status,message,qqid):
          self.name = name
          self.status = status
          self.message = message
          self.qqid = qqid   
class QQGroup:
     def __init__(self,name,status,message):
          self.name = name
          self.status = status
          self.message = message
          self.members = []
          self.count = 0
     def __str__(self):
         return f"QQ群组名: {self.name}, 状态: {self.status}, 信息: {self.message} 群成员:{self.count}"
     def  pushMember(self,member:QQMemerber):
          if member is not None:
            self.members.append(member)
            self.count  = self.members.count
          

def   initDriver():
     
     desired_caps = {
        'platformName': 'Android',
        "automationName": "UiAutomator2",
        'deviceName': '912KPPB2101192',
        'appPackage': 'com.tencent.mobileqq',
        'appActivity': '.activity.SplashActivity',
        'noReset': True,
        'fullReset': False,
        'newCommandTimeout':30000,
        }
     try:
        driver = webdriver.Remote('http://127.0.0.1:4723/wd/hub', options=UiAutomator2Options().load_capabilities(desired_caps))
     except Exception as e:
        print(f"初始化失败webDriver",{e})
        return None
     return driver
def  tagBlockMain():
     while True:
           pass
def  loadFileData():
     Utils.log('开始加载数据')
     return [QQGroup("",0,"")]
def swipcurrentItemToNext(driver, source_element, duration_ms=300):
    try:
        # 创建并初始化PointerInput对象
        pointer_input = PointerInput('touch', 'finger')
        # 构建动作链
        actions = ActionChains(driver)
        actions.w3c_actions = ActionBuilder(driver, mouse=pointer_input)
        Utils.log(f'列表bounds{source_element.rect}')
        # 添加移动动作
        w,h = Utils.getSizeWindow(driver)
        Utils.log(f'屏幕尺寸宽度{w},高度{h}')
        start_x = w /2  
        offsety =  source_element.rect['height'] / 2 #每次滑动距离
        start_y = h - 5 
        # 注意：这里我们实际上希望滑动到源元素的上方，因此需要减去源元素的高度以确保完全覆盖
        end_y =  start_y  - offsety
        end_x = start_x
        Utils.log(f'{start_y},{end_y}')
        actions.w3c_actions.pointer_action.move_to_location(start_x, start_y)
        actions.w3c_actions.pointer_action.pointer_down()
        actions.w3c_actions.pointer_action.pause(duration_ms / 1000)  # 转换为秒
        actions.w3c_actions.pointer_action.move_to_location(end_x, end_y)
        actions.w3c_actions.pointer_action.release()
        
        # 执行动作链
        actions.perform()
    except NoSuchElementException:
        print("元素未找到，请检查定位器。")
    except Exception as e:
        print(f"发生错误：{e}")
def perform_actions(driver, x,y):
    try:
        action_chains = ActionChains(driver)
# 使用ActionBuilder构造点击坐标动作
        pointer_input = PointerInput('touch', 'finger')
        actions = ActionBuilder(driver, pointer_input)
        actions.pointer_action.move_to_location(x, y)
        Utils.log(f"坐标点击 {x} , {y}")
          # 设置点击坐标
        actions.pointer_action.click()
        action_chains.w3c_actions = actions
        action_chains.perform() 
    except NoSuchElementException:
        print("元素未找到，请检查定位器。")
    except Exception as e:
        print(f"发生错误：{e}")
def logRectCollectionAdd(addcollection):
    for item in addcollection:
        Utils.log(f'添加的rect：{item.rect}')

# def  findElementByXpath(driver, nickName):
#      wait = WebDriverWait(driver, 3);
#      try:
#          elementXpath = f'//android.widget.TextView[@resource-id="com.tencent.mobileqq:id/tv_name" and @text="{nickName}"]'
#          element = wait.until(EC.presence_of_element_located((By.XPATH, elementXpath)))
#         #  parent_layout = wait.until(EC.presence_of_element_located((By.XPATH, f"{elementXpath}/../..")))
#         #  Utils.log(f'父视图{parent_layout.rect}')
#         #  childAdd = (AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().text("添加")')
#         #  add_button = wait.until(EC.presence_of_element_located(childAdd))
#         #  Utils.log(f'找到的元素：{element.rect},{add_button.rect}')
#          return element
#      except Exception as e:
#         print(f"发生错误：{e}")
     
def  scrollerPositionNickName(driver,nickname) :
        wait = WebDriverWait(driver, 3)
        try:
            Utils.log(f'滚动到{nickname}')
            item = f'new UiScrollable(new UiSelector().resourceId("com.tencent.mobileqq:id/k05")).scrollIntoView(new UiSelector().text("{nickname}"))'
            element =  wait.until(EC.presence_of_element_located(
                        (AppiumBy.ANDROID_UIAUTOMATOR,
                        item
            )))
            add_button_selector = f'new UiSelector().description("{nickname}").childSelector(new UiSelector().className(\"android.widget.Button\").text("添加"))'
            element2 = wait.until(EC.presence_of_element_located(
                        (AppiumBy.ANDROID_UIAUTOMATOR,
                        add_button_selector
            )))
            Utils.log(f'找到的元素：{element.rect},{element2.rect}')
            return element
        except Exception as e:
            Utils.log('这个没找到添加按钮的直接绕过')
            return None
def  collectionItemsProcess(driver, scrollerList):
    wait = WebDriverWait(driver, 10)
    has_new_elements = True
    lastnickname = None
    Utils.log(f'列表每页的高度{scrollerList.rect}')
    nicknames = []
    while(has_new_elements):
        try:
            avilableListNickNames = wait.until(EC.presence_of_all_elements_located((AppiumBy.ANDROID_UIAUTOMATOR,
                                                                        'new UiSelector().className(\"android.widget.TextView\").resourceId(\"com.tencent.mobileqq:id/tv_name\")')))
            currentLastNickname = None
            # 计算这一屏第一条和最后一条的y偏移值
            if avilableListNickNames is not None:
                if len(avilableListNickNames) > 0:
                    currentLastNickname = avilableListNickNames[-1].text
                    if lastnickname == currentLastNickname and lastnickname is not None:
                        has_new_elements = False
                        Utils.log(f'没有新元素了')
                    else:
                        currentDisplayNickName = [name.text for name in avilableListNickNames]
                        for nicname in currentDisplayNickName:
                            if nicname not in nicknames:
                                Utils.log(f'发现新昵称：{nicname}')
                                nicknames.append(nicname)
                        swipcurrentItemToNext(driver,scrollerList)
                        lastnickname = currentLastNickname
                else:
                    Utils.log(f'列表没有元素')
                    has_new_elements = False
            Utils.log(f'发现新元素，数量：{len(nicknames)}')
        except Exception as e:
            Utils.log(f'获取添加元素失败{e}')
            break
    # 进行倒序排列好找
    return nicknames[::-1]

def  processFileData(driver,initalData):
     try:
        wait = WebDriverWait(driver, 10)
        Utils.log('开始处理数据')
        result = []
        for element in initalData:
            Utils.log(element)
            resultGroup = QQGroup('',0,'')
            groupCount = wait.until(EC.presence_of_element_located((AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().textContains(\"名群成员\")")))
            Utils.log(f'群人数个数:{groupCount.text}')
            groupName = wait.until(EC.presence_of_element_located((AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().resourceId(\"com.tencent.mobileqq:id/wri\").instance(1)")))
            resultGroup.name = groupName.text
            resultGroup.count = Utils.extract_numbers_from_string(groupCount.text)
            print(resultGroup)
            try:
                Utils.log(f'群组名:{resultGroup.name} 开始自动扫描群成员')
                groupCount.click()
                bodyList = driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().className("android.widget.AbsListView").resourceId("com.tencent.mobileqq:id/k05")')
                collectionItmes = collectionItemsProcess(driver,bodyList)
                Utils.log(f'最终扫描到结果{collectionItmes}{len(collectionItmes)}')
                tagBlockMain()
                resultGroup.getMembers = []
                for nickname in collectionItmes:
                    element = scrollerPositionNickName(driver,nickname)
                    if element is not None:
                        perform_actions(driver,element.rect['x'],element.rect['y'] + 3)
                        selector = (AppiumBy.ANDROID_UIAUTOMATOR,'new UiSelector().textContains("QQ号")')
                        qq = wait.until(EC.presence_of_element_located(selector))
                        qqid = Utils.extract_qq_number(qq.text)

                        resultGroup.pushMember(QQMemerber(nickname,1,"",qqid))
                        driver.back()
                    else:
                        Utils.log(f'不需要添加的{nickname}元素')
                Utils.log(f'{element} ---- {resultGroup}')
                result.append(resultGroup)
                return result
            except Exception as e:
                Utils.log(f'扫描{resultGroup.name}出现异常 {e}')
                driver.back()
                return result
     except Exception as e:
        Utils.log(f'处理数据失败:{e}')
        driver.quit()
        return  result
def dealFinishTaskExcel(driver, result: List[QQGroup]):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    Utils.log('处理结果')
    
    if len(result) > 0:
        # 准备一个总的DataFrame来存储所有群组的数据，每个群组作为一个记录
        all_data = []
        
        for group in result:
            # 收集每个群组的成员信息到一个列表中，每个成员用一个元组表示(name, qqid)
            members_info = [(member.name, member.qqid) for member in group.members]
            
            # 构建该群组的数据行，群组名称、成员数量及成员列表
            group_row = {
                '群组名称': group.name,
                '可添加成员数量': len(group.members),
                '成员信息': members_info  # 将成员信息作为一个整体放入一个列表或字符串中
            }
            
            # 将该群组的信息转换为Series并添加到总数据列表中
            all_data.append(pd.Series(group_row))
            
            # 为每个群组单独创建Excel文件
            filename = os.path.join(script_dir, f"{sanitize_filename(group.name)}结果.xlsx")
            # 直接使用成员信息列表创建DataFrame
            group_df = pd.DataFrame(members_info, columns=['成员姓名', 'QQ号'])
            group_df.to_excel(filename, index=False)
            Utils.log(f'{group.name} 已完成写入操作 {os.path.abspath(filename)}')
            
        # 将所有群组数据合并到一个DataFrame并保存到Excel文件中
        # combined_df = pd.DataFrame(all_data)
        # combined_filename = os.path.join(script_dir, "所有群组结果.xlsx")
        # combined_df.to_excel(combined_filename, index=False)
        # Utils.log(f'所有群组数据已合并并写入 {os.path.abspath(combined_filename)}')
    
    Utils.log('脚本已退出')
    driver.quit()
def dealFinishTask(driver, result: List[QQGroup]):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    Utils.log('处理结果')
    if len(result) > 0:
        for group in result:
            # 使用群组名称作为文件名，确保文件名合法（去除非法字符等）
            filename = os.path.join(script_dir, f"{sanitize_filename(group.name)}结果.txt")
            with open(filename, 'w', encoding='utf-8') as file:  # 为每个群组创建单独的文件
                groupData = f"{group.name}可添加成员数量：{len(group.members)}\n"
                for member in group.members:
                    groupData += f"{member.name} {member.qqid}\n"
                groupData += "\n\n"  # 每个群组信息后增加空行
                file.write(groupData)  # 写入当前群组的所有信息到单独的文件中
            Utils.log(f'{group.name} 已完成写入操作 {os.path.abspath(filename)}')
            
    Utils.log('脚本已退出')
    driver.quit()
# 辅助函数，用于清理文件名，确保其合法
def sanitize_filename(filename):
    import re
    # 移除Windows不允许的字符，可以根据需要调整规则
    return re.sub(r'[\/:*?"<>|]', '', filename)


def  QQGrouoSolution():
     isenterGroup = False;
     initalData = loadFileData()
     driver = initDriver()
     if driver is None:
        Utils.log('初始化失败')
        return
     # 循环检测进入群组页是否
     wait = WebDriverWait(driver,5)
     while not isenterGroup:
          Utils.log('请按Enter键继续，或按其他键退出...')
          user_input = input()
          if user_input == '':
              isenterGroup = True
              Utils.log('输入了Enter键，开始执行')
            #   selector = (AppiumBy.ANDROID_UIAUTOMATOR,'new UiSelector().textContains("QQ号")')
            #   qq = wait.until(EC.presence_of_element_located(selector))
            #   Utils.log(f'qq{qq.text}')
            # 这里可以方便写一些测试脚本
              result =  processFileData(driver,initalData)
              Utils.log(f'处理结果：{result}')
            #   dealFinishTask(driver,result)
              dealFinishTaskExcel(driver,result)
          else:
              Utils.log('输入了其他键，脚本已退出')
              driver.quit()
              return
QQGrouoSolution()