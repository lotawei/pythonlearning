from datetime import datetime
import os
import traceback
from typing import List
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException
from appium import webdriver
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
    def getSizeWindow(driver):
        screen_size = driver.get_window_size()
        screen_width = screen_size["width"]
        screen_height = screen_size["height"]
        return screen_width, screen_height
    @staticmethod
    def extract_numbers_from_string(input_string):
        # 使用正则表达式查找字符串中的所有数字
        match = re.search(r"\d+", input_string)
        if match:
            # 将找到的数字字符串转换为整数
            return int(match.group())
        else:
            return None

    @staticmethod
    def log(message):
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")  # 格式化当前时间
        print(f"[{current_time}] {message}")

    @staticmethod
    def error(message, ec=None):
        if ec is None:
            Utils.log(f"{message}")
        else:
            traceback.print_exc()
            stack_trace = traceback.format_exc()
            Utils.log(f"异常类型-----:{ec} \n 堆栈-----:{stack_trace}")

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

    @staticmethod
    def extract_qq_number2(text):
        pattern = r"\((\d+)\)"
        match = re.search(pattern, text)
        if match:
            # 返回匹配到的QQ号码
            return match.group(1)  # group(1) 获取第一个括号内匹配的内容
        else:
            return None  #


class QQMemerber:
    def __init__(self, name, status, message, qqid):
        self.name = name
        self.status = status
        self.message = message
        self.qqid = qqid


class QQGroup:
    def __init__(self, name, status, message):
        self.name = name
        self.status = status
        self.message = message
        self.members = []
        self.count = 0

    def __str__(self):
        return f"QQ群组名: {self.name}, 状态: {self.status}, 信息: {self.message} 群成员:{self.count}"

    def pushMember(self, member: QQMemerber):
        if member is not None:
            self.members.append(member)
            self.count = self.members.count

# 初始化webDriver
def initDriver():
    desired_caps = {
        "platformName": "Android",
        "automationName": "UiAutomator2",
        "deviceName": "912KPPB2101192",
        "appPackage": "com.tencent.mobileqq",
        "appActivity": ".activity.SplashActivity",
        "noReset": True,
        "fullReset": False,
        "newCommandTimeout": 30000,
    }
    try:
        driver = webdriver.Remote(
            "http://127.0.0.1:4723/wd/hub",
            options=UiAutomator2Options().load_capabilities(desired_caps),
        )
    except Exception as e:
        Utils.error(f"初始化失败webDriver")
        return None
    return driver

# 进行死循环对界面进行分析
def tagBlockMain():
    while True:
        pass


def loadFileData():
    Utils.log("开始加载数据")
    return [QQGroup("", 0, "")]
# 对列表进行滑动处理 目前按 列表的高度 50%进行滑动
def swipcurrentNextPage(driver, source_element, itemHeight=0, duration_ms=300):
    try:
        # 创建并初始化PointerInput对象
        pointer_input = PointerInput("touch", "finger")
        # 构建动作链
        actions = ActionChains(driver)
        actions.w3c_actions = ActionBuilder(driver, mouse=pointer_input)
        Utils.log(f"列表bounds{source_element.rect}")
        # 添加移动动作
        w, h = Utils.getSizeWindow(driver)
        Utils.log(f"屏幕尺寸宽度{w},高度{h}")
        start_x = w / 2
        offsety = source_element.rect["height"] / 2  # 每次滑动距离
        start_y = h - 5

        # 注意：这里我们实际上希望滑动到源元素的上方，因此需要减去源元素的高度以确保完全覆盖
        end_y = start_y - offsety
        end_x = start_x
        Utils.log(f"{start_y},{end_y}")
        if itemHeight > 0:
            start_y = h / 2
            offsety = itemHeight + 20
            end_y = start_y + offsety
        actions.w3c_actions.pointer_action.move_to_location(start_x, start_y)
        actions.w3c_actions.pointer_action.pointer_down()
        actions.w3c_actions.pointer_action.pause(duration_ms / 1000)  # 转换为秒
        actions.w3c_actions.pointer_action.move_to_location(end_x, end_y)
        actions.w3c_actions.pointer_action.release()

        # 执行动作链
        actions.perform()
    except (NoSuchElementException, TimeoutException):
        print("元素未找到，请检查定位器。")
    except Exception as e:
        Utils.error(f"发生错误", e)

# 点击某个位置
def perform_actions(driver, x, y):
    try:
        action_chains = ActionChains(driver)
        # 使用ActionBuilder构造点击坐标动作
        pointer_input = PointerInput("touch", "finger")
        actions = ActionBuilder(driver, pointer_input)
        actions.pointer_action.move_to_location(x, y)
        Utils.log(f"坐标点击 {x} , {y}")
        # 设置点击坐标
        actions.pointer_action.click()
        action_chains.w3c_actions = actions
        action_chains.perform()
    except (NoSuchElementException, TimeoutException):
        print("元素未找到，请检查定位器。")
    except Exception as e:
        Utils.error(f"发生错误", e)


def judgeCanAddElement(driver, nickName):
    wait = WebDriverWait(driver, 2)
    try:
        xparent = f'//android.widget.LinearLayout[@content-desc="{nickName}"]'
        parent_layout = wait.until(
            EC.presence_of_element_located((AppiumBy.XPATH, xparent))
        )
        Utils.log(f"父视图{parent_layout.rect}")
        child_add_button_xpath = f'{xparent}//android.widget.Button[@resource-id="com.tencent.mobileqq:id/h6"]'
        add_button = wait.until(
            EC.presence_of_element_located((AppiumBy.XPATH, child_add_button_xpath))
        )
        Utils.log(f"按钮位置{add_button.rect}")
        return parent_layout
    except (NoSuchElementException, TimeoutException):
        Utils.log(f"无需添加该QQ{nickName}")
        return None
    except Exception as e:
        Utils.error("定位按钮位置跑的异常", e)
        return None


# def scrollerPositionNickName(driver, nickname):
#     wait = WebDriverWait(driver, 2)
#     height = 0
#     try:
#         Utils.log(f"滚动到{nickname}")
#         # item = f'new UiScrollable(new UiSelector().resourceId("com.tencent.mobileqq:id/k05")).scrollToBeginning(55))'
#         # item = f'new UiScrollable(new UiSelector().resourceId("com.tencent.mobileqq:id/k05")).scrollIntoView(new UiSelector().description("{nickname}"))'
#         item = f'new UiScrollable(new UiSelector().resourceId("com.tencent.mobileqq:id/k05")).getChildByInstance(new UiSelector().description("{nickname}",2000))'

#         element = wait.until(
#             EC.presence_of_element_located((AppiumBy.ANDROID_UIAUTOMATOR, item))
#         )
#         height = element.rect["height"]
#         add_button_selector = f'new UiSelector().description("{nickname}").childSelector(new UiSelector().className("android.widget.Button").text("添加"))'
#         element2 = wait.until(
#             EC.presence_of_element_located(
#                 (AppiumBy.ANDROID_UIAUTOMATOR, add_button_selector)
#             )
#         )
#         Utils.log(f"找到的元素：{element.rect},{element2.rect}")
#         return (element, height)
#     except Exception as e:

#         Utils.log(f"这个没找到添加按钮的直接绕过 {e}")
#         return (None, height)


def collectionItemsProcess(driver, scrollerList):
    wait = WebDriverWait(driver, 2)
    has_new_elements = True
    lastdisplayElement = {"id": None, "name": None, "element": None}
    Utils.log(f"列表每页的高度{scrollerList.rect}")
    pageResultQQ = []
    while has_new_elements:
        try:
            idsElementsBeans = []
            currentPageShouldAddList: List[QQGroup] = []
            avilableListNickNames = wait.until(
                EC.presence_of_all_elements_located(
                    (
                        AppiumBy.ANDROID_UIAUTOMATOR,
                        'new UiSelector().className("android.widget.TextView").resourceId("com.tencent.mobileqq:id/tv_name")',
                    )
                )
            )
            currentLast = {"id": None, "name": None, "element": None}
            # 计算这一屏第一条和最后一条的y偏移值
            if avilableListNickNames is not None:
                if len(avilableListNickNames) > 0:
                    currentLastelement = avilableListNickNames[-1]
                    currentLast["id"] = currentLastelement.id
                    currentLast["name"] = currentLastelement.text
                    currentLast["element"] = currentLastelement
                    if (
                        lastdisplayElement["id"] == currentLast["id"]
                        and lastdisplayElement["id"] is not None
                        and lastdisplayElement["name"] == currentLast["name"]
                    ):
                        has_new_elements = False
                        Utils.log(f"没有新元素了")
                        return pageResultQQ
                    else:
                        currentPageElements = [
                            (elementnick.id, elementnick.text, elementnick)
                            for elementnick in avilableListNickNames
                        ]
                        for elementPair in currentPageElements:
                            if elementPair not in idsElementsBeans:
                                Utils.log(f"发现新昵称：{elementPair[1]}")
                                canAddElement = judgeCanAddElement(
                                    driver, elementPair[1]
                                )
                                if canAddElement is not None:
                                    idsElementsBeans.append(elementPair)
                                    Utils.log(
                                        f"需要操作的***************{elementPair[1]}可以添加************"
                                    )
                                    mermerBer = processNickSearchResult(
                                        driver, canAddElement, elementPair[1]
                                    )
                                    if mermerBer is not None:
                                        # 这里需要判断不在当前列表中 还需要不能在上一页添加过的列表中
                                        if not any(
                                            existing_mermerBer.qqid == mermerBer.qqid
                                            for existing_mermerBer in currentPageShouldAddList
                                        ) and not any(
                                            existing_mermerBer.qqid == mermerBer.qqid
                                            for existing_mermerBer in pageResultQQ
                                        ):
                                            currentPageShouldAddList.append(mermerBer)
                                            Utils.log(
                                                f"添加成功，QQID：{mermerBer.qqid} {mermerBer.name}"
                                            )
                                        else:
                                            Utils.log(f"重复添加")
                                    else:
                                        pass
                                else:
                                    Utils.log(f"{elementPair[1]}跳过无需添加")
                        lastdisplayElement = currentLast
                        if len(currentPageShouldAddList) > 0:
                            pageResultQQ += currentPageShouldAddList
                        swipcurrentNextPage(driver, scrollerList)
                else:
                    Utils.log(f"列表没有元素")
                    has_new_elements = False
            else:
                Utils.log(f"列表没有元素")
                has_new_elements = False
        except Exception as e:
            Utils.log(f"获取添加元素失败{e}")
            break
    return pageResultQQ


def swipe_down(driver, duration=1000):
    try:
        # 创建并初始化PointerInput对象
        pointer_input = PointerInput("touch", "finger")
        # 构建动作链
        actions = ActionChains(driver)
        actions.w3c_actions = ActionBuilder(driver, mouse=pointer_input)

        w, h = Utils.getSizeWindow(driver)

        # 设置滑动的起始和结束位置
        start_x = w / 2

        # 否则，从屏幕底部开始滑动
        start_y = h / 2

        # 计算向上滑动的目标位置
        end_y = h / 4
        end_x = start_x

        # 构建并执行滑动动作
        actions.w3c_actions.pointer_action.move_to_location(start_x, start_y)
        actions.w3c_actions.pointer_action.pointer_down()
        actions.w3c_actions.pointer_action.pause(400 / 1000)  # 转换为秒
        actions.w3c_actions.pointer_action.move_to_location(end_x, end_y)
        actions.w3c_actions.pointer_action.release()

        # 执行动作链
        actions.perform()
    except Exception as e:
        print(f"发生错误：{e}")


def swipe_up(driver, itemHeight=0, duration_ms=300):
    try:
        # 创建并初始化PointerInput对象
        pointer_input = PointerInput("touch", "finger")
        # 构建动作链
        actions = ActionChains(driver)
        actions.w3c_actions = ActionBuilder(driver, mouse=pointer_input)

        w, h = Utils.getSizeWindow(driver)

        # 设置滑动的起始和结束位置
        start_x = w / 2
        if itemHeight > 0:
            # 如果指定了itemHeight，则从该元素的下方开始滑动
            start_y = h - itemHeight - 20  # 留有一定余量避免刚好错过元素
        else:
            # 否则，从屏幕底部开始滑动
            start_y = h - 5
        # 计算向上滑动的目标位置
        end_y = start_y - (
            itemHeight if itemHeight > 0 else h * 0.5
        )  # 如果有指定itemHeight则滑过该高度，否则滑至屏幕一半高度
        end_x = start_x

        # 构建并执行滑动动作
        actions.w3c_actions.pointer_action.move_to_location(start_x, start_y)
        actions.w3c_actions.pointer_action.pointer_down()
        actions.w3c_actions.pointer_action.pause(duration_ms / 1000)  # 转换为秒
        actions.w3c_actions.pointer_action.move_to_location(end_x, end_y)
        actions.w3c_actions.pointer_action.release()
        # 执行动作链
        actions.perform()
    except Exception as e:
        print(f"发生错误：{e}")


def processNickSearchResult(driver, element, nickname):
    wait = WebDriverWait(driver, 2)
    if element is not None:
        perform_actions(driver, element.rect["x"] + 30, element.rect["y"] + 3)
        Utils.sleepSelf(0.5)
        if (closeEXCEPTIONDialog(driver)) is True:
            Utils.log(f"该账号不可添加{nickname}")
            return None
        try:
            selector = (
                AppiumBy.ANDROID_UIAUTOMATOR,
                'new UiSelector().textContains("QQ号")',
            )
            qq = wait.until(EC.presence_of_element_located(selector))
            qqid = Utils.extract_qq_number(qq.text)
            driver.back()
            return QQMemerber(nickname, 1, "", qqid)
        except Exception as e:
            # 尝试花里胡哨的界面筛选器
            try:
                swipe_down(driver)
                selector = (
                    AppiumBy.ANDROID_UIAUTOMATOR,
                    f'new UiSelector().className("android.widget.TextView").textContains("(")',
                )
                qq = wait.until(EC.presence_of_element_located(selector))
                Utils.log(f"二次尝试获取QQ{qq.text}")
                qqid = Utils.extract_qq_number2(qq.text)
                driver.back()
                return QQMemerber(nickname, 1, "", qqid)
            except Exception as e:
                Utils.log(f"花里����的界面��选器也出问题{e}")
                driver.back()
                return None
    else:
        Utils.log(f"不需要添加的{nickname}元素")


def processFileData(driver, initalData):
    try:
        wait = WebDriverWait(driver, 10)
        Utils.log("开始处理数据")
        result = []
        for element in initalData:
            resultGroup = QQGroup("", 0, "")
            groupCount = wait.until(
                EC.presence_of_element_located(
                    (
                        AppiumBy.ANDROID_UIAUTOMATOR,
                        'new UiSelector().textContains("名群成员")',
                    )
                )
            )
            Utils.log(f"群人数个数:{groupCount.text}")
            groupName = wait.until(
                EC.presence_of_element_located(
                    (
                        AppiumBy.ANDROID_UIAUTOMATOR,
                        'new UiSelector().resourceId("com.tencent.mobileqq:id/wri").instance(1)',
                    )
                )
            )
            resultGroup.name = groupName.text
            resultGroup.count = Utils.extract_numbers_from_string(groupCount.text)
            Utils.log(f'****************开始拉取{resultGroup}')
            try:
                Utils.log(f"群组名:{resultGroup.name} 开始自动扫描群成员")
                groupCount.click()
                Utils.sleepSelf(2)
                bodyList = driver.find_element(
                    AppiumBy.ANDROID_UIAUTOMATOR,
                    'new UiSelector().className("android.widget.AbsListView").resourceId("com.tencent.mobileqq:id/k05")',
                )
                Utils.log(f"开始获取群成员列表")
                collectionItmes = collectionItemsProcess(driver, bodyList)
                Utils.log(f"最终扫描到结果{collectionItmes}")
                resultGroup.members = collectionItmes
                result.append(resultGroup)
                return result
            except Exception as e:
                Utils.log(f"扫描{resultGroup.name}出现异常 {e}")
                driver.back()
                return result
    except Exception as e:
        Utils.log(f"处理数据失败:{e}")
        driver.quit()
        return result


def writeTaskToExcel(driver, result: List[QQGroup]):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    Utils.log("处理结果")

    if len(result) > 0:
        # 准备一个总的DataFrame来存储所有群组的数据，每个群组作为一个记录
        all_data = []

        for group in result:
            # 收集每个群组的成员信息到一个列表中，每个成员用一个元组表示(name, qqid)
            members_info = [(member.name, member.qqid) for member in group.members]

            # 构建该群组的数据行，群组名称、成员数量及成员列表
            group_row = {
                "群组名称": group.name,
                "可添加成员数量": len(group.members),
                "成员信息": members_info,  # 将成员信息作为一个整体放入一个列表或字符串中
            }

            # 将该群组的信息转换为Series并添加到总数据列表中
            all_data.append(pd.Series(group_row))

            # 为每个群组单独创建Excel文件
            filename = os.path.join(
                script_dir, f"{sanitize_filename(group.name)}结果.xlsx"
            )
            # 直接使用成员信息列表创建DataFrame
            group_df = pd.DataFrame(members_info, columns=["成员姓名", "QQ号"])
            group_df.to_excel(filename, index=False)
            Utils.log(f"{group.name} 已完成写入操作 {os.path.abspath(filename)}")

        # 将所有群组数据合并到一个DataFrame并保存到Excel文件中
        # combined_df = pd.DataFrame(all_data)
        # combined_filename = os.path.join(script_dir, "所有群组结果.xlsx")
        # combined_df.to_excel(combined_filename, index=False)
        # Utils.log(f'所有群组数据已合并并写入 {os.path.abspath(combined_filename)}')

    Utils.log("脚本已退出")
    driver.quit()
def dealFinishTask(driver, result: List[QQGroup]):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    Utils.log("处理结果")
    if len(result) > 0:
        for group in result:
            # 使用群组名称作为文件名，确保文件名合法（去除非法字符等）
            filename = os.path.join(
                script_dir, f"{sanitize_filename(group.name)}结果.txt"
            )
            with open(
                filename, "w", encoding="utf-8"
            ) as file:  # 为每个群组创建单独的文件
                groupData = f"{group.name}可添加成员数量：{len(group.members)}\n"
                for member in group.members:
                    groupData += f"{member.name} {member.qqid}\n"
                groupData += "\n\n"  # 每个群组信息后增加空行
                file.write(groupData)  # 写入当前群组的所有信息到单独的文件中
            Utils.log(f"{group.name} 已完成写入操作 {os.path.abspath(filename)}")

    Utils.log("脚本已退出")
    driver.quit()


# 辅助函数，用于清理文件名，确保其合法
def sanitize_filename(filename):
    import re

    # 移除Windows不允许的字符，可以根据需要调整规则
    return re.sub(r'[\/:*?"<>|]', "", filename)


def closeEXCEPTIONDialog(driver):
    wait = WebDriverWait(driver, 2)
    try:
        selector = (
            AppiumBy.ANDROID_UIAUTOMATOR,
            'new UiSelector().className("android.widget.Button").textContains("确认")',
        )
        close = wait.until(EC.presence_of_element_located(selector))
        close.click()
        Utils.sleepSelf(1)
        driver.back()
        return True
    except Exception as e:
        Utils.log(f"无对话需要关闭")
        return False


def QQGrouoSolution():
    isenterGroup = False
    initalData = loadFileData()
    driver = initDriver()
    if driver is None:
        Utils.log("初始化失败")
        return
    wait = WebDriverWait(driver, 5)
    while not isenterGroup:
        Utils.log("请按Enter键继续，或按其他键退出...")
        user_input = input()
        if user_input == "":
            isenterGroup = True
            Utils.log("输入了Enter键，开始执行")
            result = processFileData(driver, initalData)
            Utils.log(f"处理结果：{result}")
            writeTaskToExcel(driver, result)
        # 测试的数据流程
        #   selector = (AppiumBy.ANDROID_UIAUTOMATOR,'new UiSelector().textContains("QQ号")')
        #   qq = wait.until(EC.presence_of_element_located(selector))
        #   Utils.log(f'qq{qq.text}')
        # 这里可以方便写一些测试脚本
        #   bodyList = driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().className("android.widget.AbsListView").resourceId("com.tencent.mobileqq:id/k05")')
        #   swipcurrentItemToNext2(driver,bodyList,200)
        #   Utils.log(f'测试的结果{scrollerPositionNickName(driver,"次客")}')
        #   closeEXCEPTIONDialog(driver)
        #   tagBlockMain()
        else:
            Utils.log("输入了其他键，脚本已退出")
            driver.quit()
            return


QQGrouoSolution()
