"ui";
importClass(android.provider.Settings);
importClass(android.content.Context);
/**
 * @typedef {Object} CardInfo
 * @property {string} cardKey
 * @property {string} expireTime  // 过期时效
 * @property {string} mid //设备号
 * @property {string} generateTime //生成时间
 */

function getAndroidId() {
    return Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
}
var androidId = getAndroidId();
const privateKey = "wss1031231234567"; 
var   defaultConfig = {
    mmidList: [androidId],
    author: 'TG:@ctqq9',
    expirationDate: new Date(2024, 8, 22, 23, 59, 59),
    expire: "5分",
    isgenerating:false,
    generateResult:[],
    validecode:"",
}

function isEmptystr(str) {
    if (str == null || str == undefined || str == "") {
        return true
    } else {
        return false
    }
}
function getFormattedTimestamp() {
    // 获取当前时间戳
    let now = new Date();
    // 获取各个时间部分
    let year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，因此需要+1
    let day = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    // 格式化日期时间为 yyyy-mm-dd hh:mm:ss
    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

function checkExpiration() {
    var expirationTimeMillis = defaultConfig.expirationDate.getTime();
    var result = 0;
    var currentTimeMillis = new Date().getTime();
    if (currentTimeMillis > expirationTimeMillis) {
        result = 1;
    } else {
        result = 0;
    }
    return result;
}
function buildInputText(key, title, fontSize, hintText, textColor,initalText) {
    return <horizontal paddingLeft="16" paddingRight="16" h='auto'>
        <text text={title} textColor={textColor} textSize={fontSize} textStyle='bold|italic'></text>
        <input id={key} hint={hintText} textSize={fontSize} w="*" h='auto' text={initalText}/>
    </horizontal>
}
function buildDrowpLineDelayInterval() {
    return <horizontal paddingLeft="16">
        <text textSize="12sp" textColor="#FF000000" textStyle='bold|italic'>卡密时效时间(5分钟方便测试) </text>
        <spinner id="expire" entries="5分|1天|3天|1月" />
    </horizontal>
}
function buildCardList(){
  return  <vertical padding="16">
    <horizontal>
        <text id="cardidtitle" textSize="14sp" textColor="#000000" textStyle='bold|italic' text="卡密列表"/>
        <button id="clean" style="Widget.AppCompat.Button.Borderless"  w="auto" h="auto" marginLeft="4" marginRight="6" text="清理" textColor="#ff0000" fontSize="13sp" />
        <button id="copyall" style="Widget.AppCompat.Button.Borderless" bg="#000000" w="*" h="auto" marginLeft="4" marginRight="6" text="拷贝所有" textColor="#ffffff" fontSize="13sp" />
    </horizontal>

    <list id="cardInfoList">
        <horizontal w="*" h='auto' margin="5 5 5 5" bg="#44BB77"  padding="10">
            <vertical radius="20" id="item">
                 <text id="mid" textSize="14sp" textColor="#0A0909" text="Mid-{{this.mid}}"/>
                <text id="cardKey" textSize="14sp" textColor="#333333" text="卡密-{{this.cardKey}}"/>
                <text id="expireTime" textSize="14sp" textColor="#666666" text="过期时效-{{this.expireTime}}"/>
                <text id="generateTime" textSize="14sp" textColor="#666666" text="生成时间-{{this.generateTime}}"/>
            </vertical>
        </horizontal>
    </list>
</vertical>
}
function  dialogCopyItem(item){
    dialogs.build({
        title: "选择要拷贝的内容",
        items: ["卡密", "Mid", "所有"],
        itemsSelectMode: "single",
        itemsSelectedIndex: 3
    }).on("single_choice", (i, option)=>{
        if (i === 0) {
            setClip(item.cardKey)
            toastLog('已拷贝',item.cardKey)
        }
        else if (i === 1){
            setClip(item.mid)
            toastLog('已拷贝')
        }
        else{
            setClip(`Mid:${item.mid}卡密:${item.cardKey}时效:${item.expireTime}生成时间:${item.generateTime}`)
            toastLog('已拷贝')
        }
    }).show();
   
}

function   layoutGenerateKey() {

    var  generateThread = null;
    $ui.layout(
        <frame >
            <vertical>
                <appbar>
                    <toolbar id="toolbar" title="卡密生成器"></toolbar>
                </appbar>
                <scroll bg="#ffffff">
                    <vertical>
                    <horizontal>
                        <text paddingLeft="16">更多请联系:</text>
                        <text id='cantact' text={defaultConfig.author}></text>
                    </horizontal>
                    {buildInputText('MidList', '客户设备Mid号（必填）:', "12sp", "mmid号列表换行符分隔", "#000000",androidId)}
                    <text id="validresult"></text>
                    {buildDrowpLineDelayInterval()}
                    {buildInputText('validcode', '卡密录入测试:', "12sp", "", "#000000","")}
                    {buildCardList()}
                    <button id="btnvalid" text="校验" bg="#FFFFFF" textColor="#666666" textSize="16sp" h="auto" w="*" />
                    <button id="generate" text="生成" bg="#FFFFFF" textColor="#666666" textSize="16sp" h="auto" w="*" />
                    </vertical>
                </scroll>
            </vertical>
        </frame>
    );
    ui.clean.on('click', ()=>{
        confirm('清除列表?').then((res) => {
                if(res){
                    defaultConfig.generateResult = [];
                    updateUi();
                }
        })
    });
    ui.copyall.on('click', ()=>{
        if(defaultConfig.generateResult.length == 0){
            return;
        }
        var  result = "";
        for(var i = 0;i<defaultConfig.generateResult.length;i++){
            const item = defaultConfig.generateResult[i];
            const str = `Mid:${item.mid}卡密:${item.cardKey}时效:${item.expireTime}生成时间:${item.generateTime}`
            result += str + "\n\n";
        }
        setClip(result);
        toastLog('已拷贝',result)
    });
    ui.cardInfoList.on("item_bind", function(itemView, itemHolder) {
        itemView.item.on("click", function(){
            let item = itemHolder.item;
            dialogCopyItem(item)
        });
    });
    function updateUi(){
        ui.run(() => {
            if(defaultConfig.generateResult.length > 0){
                ui.cardInfoList.setDataSource(defaultConfig.generateResult);
            }else{
   
                ui.cardInfoList.setDataSource([]);
            }
            ui.cardidtitle.setText(defaultConfig.generateResult.length > 0 ? "卡密结果":"未产生任何卡密")
        });
    }
    function updateExipreTime() {
        if ($ui.expire.getSelectedItemPosition() === 0) {
            defaultConfig.expire = '5分';
        } else if ($ui.expire.getSelectedItemPosition() === 1) {
            defaultConfig.expire = '1天';
        }
        else if($ui.expire.getSelectedItemPosition() === 2){
            defaultConfig.expire = '3天';
        }
         else if($ui.expire.getSelectedItemPosition() === 3){
            defaultConfig.expire = '1月';
        }
        else{
            defaultConfig.expire = '5分';
        }
    }
    function startGenerating() {
        defaultConfig.isgenerating = true;
        ui.run(() => {
            $ui.generate.setText('停止');
        })
        var  index = 0 ;
        generateThread = threads.start(() => {
            while(index <= defaultConfig.mmidList.length - 1){
                const  amid = defaultConfig.mmidList[index];
                if (!defaultConfig.isgenerating) {
                    // 当接收到停止信号时，跳出循环
                    break;
                }
                const {cardKey, m} = generateCardKey(defaultConfig.expire,amid);
                const cardInfo = {
                    cardKey,
                    mid:m,
                    generateTime: getFormattedTimestamp(),
                    expireTime: defaultConfig.expire
                }
                log(cardKey)
                defaultConfig.generateResult.push(cardInfo);
                index += 1
            }
            updateUi();
            // 生成结束后，重置标志
            defaultConfig.isgenerating = false
            ui.run(() => {
                    $ui.generate.setText('生成');
            });
        });
    }
    function stopGenerating() {
        defaultConfig.isgenerating = false;
        if (generateThread && generateThread.isAlive()) {
            defaultConfig.isgenerating = false; // 假设这是用来控制生成流程的标志
            generateThread.interrupt(); // 中断生成线程
            ui.run(() => {
                $ui.generateresult.text = '生成已停止';
                $ui.generate.setText('生成');
            });
        }
    }
    $ui.generate.on('click',() =>{
       try{
        updateExipreTime();
        if(checkExpiration() === 1){
            alert("卡密生成器已失效");
            return;
        }
        if(!isEmptystr($ui.MidList.getText().toString())){
            var  midT = removeExtraSpaces($ui.MidList.getText().toString())
            defaultConfig.mmidList = midT.split("\n");
        }else{
            alert('请输入mid序列号组')
            return;
        }
        if (!defaultConfig.isgenerating) {
            // 如果当前没有在生成，开始生成并更新按钮文本
            startGenerating();
        } else {
            // 如果正在生成，尝试停止生成并恢复按钮文本
            stopGenerating();
        }
       }catch(error){
            log(error);
       }
       
    });

    $ui.btnvalid.on('click',() => {
        if(isEmptystr($ui.validcode.getText().toString())){
            alert('请输入测试卡密')
            return;
        }
        if(checkExpiration() === 1){
            alert("卡密生成器已失效");
            return;
        }
        const  {isValid, message} = checkValidCode($ui.validcode.getText().toString(),androidId)
        ui.btnvalid.setText(`${isValid} ${message}`)
    });
}
function removeExtraSpaces(str) {
    // 去掉行首和行尾的空格
    str = str.trim();
    // 用正则表达式替换多个空格为一个空格，并保留换行符
    str = str.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').replace(/\s+\n/g, '\n');
    return str;
}



function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
//秘钥必须为16位
function preparePrivateKey(){
    let key = new $crypto.Key(privateKey);
    return key;
}
function  encryMessage(message){
    try {
        let aes = $crypto.encrypt(message, preparePrivateKey(), "AES/ECB/PKCS5padding" ,{
            output: "base64",
          });
        return aes;
    } catch (error) {
        log("Encry failed", error)
    }
    return null
}
function  decryMessage(decryInfo){
    try {
        let result =  $crypto.decrypt(decryInfo, preparePrivateKey(), "AES/ECB/PKCS5padding", {
            "input": "base64",
            "output": "string"
          })
        return result;
    } catch (error) {
        log("Decry failed: ", error)
    } 
    return null;
}
function generateCardKey(duration,mid) { // Example key, ensure it's 16 bytes for AES
    const randomString = generateRandomString(8);
    const currentTime = Date.now();
    let expiryTime;
    switch (duration) {
        case '5分':
            expiryTime = currentTime + 5 * 60 * 1000;
            break;
        case '3天':
            expiryTime = currentTime + 3 * 24 * 60 * 60 * 1000;
            break;
        case '1月':
            expiryTime = currentTime + 30 * 24 * 60 * 60 * 1000;
            break;
        case '1年':
            expiryTime = currentTime + 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            expiryTime = currentTime + 5 * 60 * 1000;
    }
    const payload = `${randomString}|${expiryTime}|${mid}`;
    log("明文",payload)
    const encrypted = encryMessage(payload);
    log("密文",encrypted)
    return { cardKey: encrypted, m: mid };
}
function checkValidCode(code, currentMmid) {
    if (isEmptystr(code)) {
        return { isValid: false, message: "请输入卡密" };
    }
    try {
        const decrypted = decryMessage(code);
        log("aes解密后",decrypted)
        const [randomString, expiryTime, mid] = decrypted.split('|');
        log(randomString,expiryTime,mid,currentMmid)
        if (!randomString || !expiryTime || !mid) {
            return { isValid: false, message: "卡密格式错误" };
        }
        if (mid !== currentMmid) {
            return { isValid: false, message: "该卡密无法在此设备使用" };
        }

        if (Date.now() > parseInt(expiryTime)) {
            return { isValid: false, message: "卡密已过期" };
        }

        return { isValid: true, message: "卡密验证成功" };
    } catch (error) {
        log('error', error);
        return { isValid: false, message: "卡密验证失败" };
    }
}


function main(){
     log(device.serial)
     layoutGenerateKey();
}
main()


// function testValidCode(duration) {
//     try {
//         const cardKey = generateCardKey(duration);
//         log("先生成一个码:", cardKey);
//         // // 验证卡密
//         const validationResult = checkValidCode(cardKey,getAndroidId());
//         log("第一次校验", validationResult.isValid);
//         tagAnalysis(10000);
//         const validationResult2 = checkValidCode(cardKey,getAndroidId());
//         log("第二次校验", validationResult2.isValid);
//         tagAnalysis(10000);
//         const validationResult3 = checkValidCode(cardKey,getAndroidId());
//         log("第三次校验", validationResult3.isValid);
//         tagAnalysis(10000);
//         const validationResult4 = checkValidCode(cardKey,getAndroidId());
//         log("第四次校验", validationResult4.isValid);
//         tagAnalysis(10000);
//         const validationResult5 = checkValidCode(cardKey,getAndroidId());
//         log("第五次校验", validationResult5.isValid);
//     } catch (error) {
//         log('error', error);
//     }
// }
// function randomLargeNumberCode(number) {
//     //产生大量的 validCode case验证
//     //定义一个子线程，然后在子线程操作
//     va = threads.start(function () {
//         log("子线程开始执行")
//         for (let i = 0; i < number; i++) {
//             testValidCode();
//             sleep(2000)
//         }
//         sleep(1500)
//     });
//     log("等待子线程测试完毕处理完成")

// }
