
//激活码相关程序
function generateActivationCode() {
    // 获取当前时间戳
    const currentTime = Date.now();
    
    // 设置有效期（例如1个月，以毫秒为单位）
    const validityPeriod = 30 * 24 * 60 * 60 * 1000;
    
    // 计算激活码到期时间
    const expiryTime = currentTime + validityPeriod;
    
    // 创建激活码对象
    const activationCodeObj = {
        expiryTime: expiryTime
    };
    
    // 将对象转换为 JSON 字符串
    const activationCodeStr = JSON.stringify(activationCodeObj);
    
    // 将 JSON 字符串转换为 Base64 编码
    const activationCode = btoa(activationCodeStr);
    
    return activationCode;
}
function validateActivationCode(code) {
    try {
        // 解码 Base64 激活码
        const decodedStr = atob(code);
        
        // 解析 JSON 字符串
        const activationCodeObj = JSON.parse(decodedStr);
        
        // 获取当前时间戳
        const currentTime = Date.now();
        
        // 检查激活码是否在有效期内
        if (currentTime <= activationCodeObj.expiryTime) {
            return true; // 激活码有效
        } else {
            return false; // 激活码已过期
        }
    } catch (e) {
        return false; // 激活码无效
    }
}

