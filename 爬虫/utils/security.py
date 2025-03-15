import base64
import json
import time
import hashlib
import os
from datetime import datetime, timedelta
import random
import string

class SecurityManager:
    def __init__(self):
        self.secret_key = "bilibili_downloader_2024"  # 用于加密的密钥
        self.activation_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.activation')
        
    def _generate_machine_id(self) -> str:
        """生成机器唯一标识"""
        import platform
        system_info = platform.system() + platform.machine() + platform.node()
        return hashlib.md5(system_info.encode()).hexdigest()
        
    def _encrypt(self, data: str) -> str:
        """加密数据"""
        # 使用机器ID和密钥进行加密
        machine_id = self._generate_machine_id()
        key = hashlib.sha256((machine_id + self.secret_key).encode()).digest()
        # 简单的异或加密
        encrypted = ''.join(chr(ord(c) ^ key[i % len(key)]) for i, c in enumerate(data))
        return base64.b64encode(encrypted.encode()).decode()
        
    def _decrypt(self, encrypted_data: str) -> str:
        """解密数据"""
        try:
            # 使用机器ID和密钥进行解密
            machine_id = self._generate_machine_id()
            key = hashlib.sha256((machine_id + self.secret_key).encode()).digest()
            encrypted = base64.b64decode(encrypted_data).decode()
            # 简单的异或解密
            return ''.join(chr(ord(c) ^ key[i % len(key)]) for i, c in enumerate(encrypted))
        except:
            return ""

    def generate_activation_code(self, days: int = 30, user_info: dict = None) -> str:
        """
        生成激活码
        :param days: 有效期天数
        :param user_info: 用户信息字典
        :return: 激活码
        """
        # 生成随机字符作为盐值
        salt = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        
        # 创建激活信息
        activation_data = {
            'machine_id': self._generate_machine_id(),
            'created_at': int(time.time()),
            'expires_at': int(time.time() + days * 24 * 60 * 60),
            'salt': salt
        }
        
        # 添加用户信息
        if user_info:
            activation_data.update(user_info)
            
        # 生成校验码
        check_string = f"{activation_data['machine_id']}{activation_data['created_at']}{activation_data['expires_at']}{salt}"
        activation_data['checksum'] = hashlib.sha256(check_string.encode()).hexdigest()
        
        # 加密数据
        return self._encrypt(json.dumps(activation_data))
        
    def validate_activation_code(self, code: str) -> tuple:
        """
        验证激活码
        :param code: 激活码
        :return: (是否有效, 错误信息)
        """
        try:
            # 解密数据
            decrypted_data = self._decrypt(code)
            if not decrypted_data:
                return False, "激活码无效"
                
            # 解析数据
            activation_data = json.loads(decrypted_data)
            
            # 验证机器码
            if activation_data['machine_id'] != self._generate_machine_id():
                return False, "激活码与当前机器不匹配"
                
            # 验证校验和
            check_string = f"{activation_data['machine_id']}{activation_data['created_at']}{activation_data['expires_at']}{activation_data['salt']}"
            if activation_data['checksum'] != hashlib.sha256(check_string.encode()).hexdigest():
                return False, "激活码已被篡改"
                
            # 检查是否过期
            if time.time() > activation_data['expires_at']:
                return False, "激活码已过期"
                
            # 保存激活信息
            self._save_activation_info(activation_data)
            
            # 计算剩余天数
            days_left = (activation_data['expires_at'] - time.time()) / (24 * 60 * 60)
            return True, f"激活成功，剩余 {int(days_left)} 天"
            
        except Exception as e:
            return False, f"激活码验证失败: {str(e)}"
            
    def _save_activation_info(self, activation_data: dict):
        """保存激活信息到文件"""
        try:
            with open(self.activation_file, 'w') as f:
                json.dump(activation_data, f)
        except:
            pass
            
    def check_activation(self) -> tuple:
        """
        检查当前程序是否已激活
        :return: (是否已激活, 消息)
        """
        try:
            if not os.path.exists(self.activation_file):
                return False, "程序未激活"
                
            with open(self.activation_file, 'r') as f:
                activation_data = json.load(f)
                
            # 验证机器码
            if activation_data['machine_id'] != self._generate_machine_id():
                return False, "激活信息与当前机器不匹配"
                
            # 验证校验和
            check_string = f"{activation_data['machine_id']}{activation_data['created_at']}{activation_data['expires_at']}{activation_data['salt']}"
            if activation_data['checksum'] != hashlib.sha256(check_string.encode()).hexdigest():
                return False, "激活信息已被篡改"
                
            # 检查是否过期
            if time.time() > activation_data['expires_at']:
                return False, "激活已过期"
                
            # 计算剩余天数
            days_left = (activation_data['expires_at'] - time.time()) / (24 * 60 * 60)
            return True, f"已激活，剩余 {int(days_left)} 天"
            
        except Exception as e:
            return False, f"激活状态检查失败: {str(e)}"

def main():
    """测试代码"""
    security = SecurityManager()
    
    # 生成激活码
    print("生成30天激活码...")
    code = security.generate_activation_code(30, {'user': 'test@example.com'})
    print(f"激活码: {code}\n")
    
    # 验证激活码
    print("验证激活码...")
    is_valid, message = security.validate_activation_code(code)
    print(f"验证结果: {message}\n")
    
    # 检查激活状态
    print("检查激活状态...")
    is_activated, status = security.check_activation()
    print(f"激活状态: {status}")

if __name__ == "__main__":
    main() 