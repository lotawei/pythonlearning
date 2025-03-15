import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
import sys
import json
from datetime import datetime
from security import SecurityManager
from gui_styles import GUIStyles

class SecurityGUI:
    def __init__(self, root=None):
        self.root = root if root else tk.Tk()
        self.styles = GUIStyles()
        self.security = SecurityManager()
        
        # 配置主窗口
        self.root.title("激活码管理工具")
        self.root.geometry("800x600")
        self.root.configure(bg=self.styles.colors.bg_gradient_top)
        
        # 初始化使用记录
        self.history_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'activation_history.json')
        self.load_history()
        
        # 检查激活状态
        self.check_activation_status()
        
        self._create_widgets()
        
    def check_activation_status(self):
        """检查激活状态并更新显示"""
        is_activated, message = self.security.check_activation()
        if is_activated:
            self.show_activation_status(message, is_success=True)
        else:
            self.show_activation_status(message, is_success=False)
        return is_activated
        
    def show_activation_status(self, message, is_success=True):
        """显示激活状态"""
        if not hasattr(self, 'status_label'):
            self.status_label = tk.Label(
                self.root,
                font=('Arial', 10),
                bg=self.styles.colors.bg_gradient_top
            )
            self.status_label.pack(anchor='e', padx=10, pady=5)
        
        self.status_label.config(
            text=message,
            fg=self.styles.colors.success if is_success else self.styles.colors.error
        )
        
    def _create_widgets(self):
        """创建GUI组件"""
        # 主容器
        main_frame = tk.Frame(
            self.root,
            bg=self.styles.colors.frame,
            bd=0,
            highlightthickness=1,
            highlightbackground=self.styles.colors.primary,
            highlightcolor=self.styles.colors.primary
        )
        main_frame.pack(padx=20, pady=20, fill='both', expand=True)
        
        # 创建Notebook用于标签页
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill='both', expand=True, padx=10, pady=10)
        
        # 生成激活码页面
        generate_frame = self._create_generate_page(notebook)
        notebook.add(generate_frame, text="生成激活码")
        
        # 验证激活码页面
        validate_frame = self._create_validate_page(notebook)
        notebook.add(validate_frame, text="验证激活码")
        
        # 使用记录页面
        history_frame = self._create_history_page(notebook)
        notebook.add(history_frame, text="使用记录")
        
    def _create_generate_page(self, parent):
        """创建生成激活码页面"""
        frame = tk.Frame(parent, bg=self.styles.colors.frame)
        
        # 选项区域
        options_frame = tk.LabelFrame(
            frame,
            text="生成选项",
            font=('Arial', 12, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        )
        options_frame.pack(fill='x', padx=20, pady=20)
        
        # 有效期选择
        days_frame = tk.Frame(options_frame, bg=self.styles.colors.frame)
        days_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Label(
            days_frame,
            text="有效期：",
            font=('Arial', 11),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(side='left')
        
        self.days_var = tk.StringVar(value='30')
        days_combo = ttk.Combobox(
            days_frame,
            textvariable=self.days_var,
            values=['1分钟(测试)', '7', '30', '180', '360'],
            width=10,
            state='readonly'
        )
        days_combo.pack(side='left', padx=(5, 0))
        
        tk.Label(
            days_frame,
            text="天",
            font=('Arial', 11),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(side='left', padx=(5, 0))
        
        # 生成数量选择
        count_frame = tk.Frame(options_frame, bg=self.styles.colors.frame)
        count_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Label(
            count_frame,
            text="生成数量：",
            font=('Arial', 11),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(side='left')
        
        self.count_var = tk.StringVar(value='10')
        count_combo = ttk.Combobox(
            count_frame,
            textvariable=self.count_var,
            values=['10', '20', '30'],
            width=10,
            state='readonly'
        )
        count_combo.pack(side='left', padx=(5, 0))
        
        # 按钮区域
        button_frame = tk.Frame(options_frame, bg=self.styles.colors.frame)
        button_frame.pack(fill='x', padx=20, pady=10)
        
        generate_btn = tk.Button(
            button_frame,
            text="一键生成",
            font=('Arial', 11),
            command=self._generate_codes,
            bg=self.styles.colors.primary,
            fg='white',
            relief='flat',
            padx=20,
            pady=5
        )
        generate_btn.pack(side='left', padx=(0, 10))
        
        copy_btn = tk.Button(
            button_frame,
            text="复制结果",
            font=('Arial', 11),
            command=self._copy_results,
            bg=self.styles.colors.secondary,
            fg='white',
            relief='flat',
            padx=20,
            pady=5
        )
        copy_btn.pack(side='left', padx=(0, 10))
        
        export_btn = tk.Button(
            button_frame,
            text="导出到文件",
            font=('Arial', 11),
            command=self._export_results,
            bg=self.styles.colors.secondary,
            fg='white',
            relief='flat',
            padx=20,
            pady=5
        )
        export_btn.pack(side='left')
        
        # 结果显示区域
        result_frame = tk.LabelFrame(
            frame,
            text="生成结果",
            font=('Arial', 12, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        )
        result_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # 创建文本框和滚动条
        self.result_text = tk.Text(
            result_frame,
            font=('Courier', 10),
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text,
            relief='flat'
        )
        self.result_text.pack(side='left', fill='both', expand=True, padx=10, pady=10)
        
        scrollbar = ttk.Scrollbar(result_frame, orient='vertical', command=self.result_text.yview)
        scrollbar.pack(side='right', fill='y', pady=10)
        self.result_text.configure(yscrollcommand=scrollbar.set)
        
        return frame
        
    def _create_validate_page(self, parent):
        """创建验证激活码页面"""
        frame = tk.Frame(parent, bg=self.styles.colors.frame)
        
        # 检查是否已激活
        is_activated, message = self.security.check_activation()
        if is_activated:
            # 已激活状态显示
            status_frame = tk.Frame(frame, bg=self.styles.colors.frame)
            status_frame.pack(fill='x', padx=20, pady=20)
            
            tk.Label(
                status_frame,
                text=message,
                font=('Arial', 12, 'bold'),
                fg=self.styles.colors.success,
                bg=self.styles.colors.frame
            ).pack(pady=10)
            
            return frame
            
        # 单个验证区域
        single_frame = tk.LabelFrame(
            frame,
            text="激活验证",
            font=('Arial', 12, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        )
        single_frame.pack(fill='x', padx=20, pady=20)
        
        # 验证输入区域
        validate_input_frame = tk.Frame(single_frame, bg=self.styles.colors.frame)
        validate_input_frame.pack(fill='x', padx=20, pady=20)
        
        tk.Label(
            validate_input_frame,
            text="输入激活码：",
            font=('Arial', 11),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(anchor='w')
        
        self.validate_entry = tk.Entry(
            validate_input_frame,
            font=('Courier', 10),
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text,
            relief='flat',
            width=50
        )
        self.validate_entry.pack(fill='x', pady=(5, 10))
        
        validate_btn = tk.Button(
            validate_input_frame,
            text="验证",
            font=('Arial', 11),
            command=self._validate_code,
            bg=self.styles.colors.primary,
            fg='white',
            relief='flat',
            padx=20,
            pady=5
        )
        validate_btn.pack()
        
        # 验证结果显示
        self.validate_result = tk.Label(
            single_frame,
            text="",
            font=('Arial', 11),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame,
            wraplength=700
        )
        self.validate_result.pack(padx=20, pady=(0, 20))
        
        return frame
        
    def _create_history_page(self, parent):
        """创建使用记录页面"""
        frame = tk.Frame(parent, bg=self.styles.colors.frame)
        
        # 创建树形视图
        columns = ('时间', '操作', '激活码', '结果')
        self.history_tree = ttk.Treeview(frame, columns=columns, show='headings')
        
        # 设置列标题
        for col in columns:
            self.history_tree.heading(col, text=col)
            self.history_tree.column(col, width=150)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(frame, orient='vertical', command=self.history_tree.yview)
        self.history_tree.configure(yscrollcommand=scrollbar.set)
        
        # 放置组件
        self.history_tree.pack(side='left', fill='both', expand=True, padx=20, pady=20)
        scrollbar.pack(side='right', fill='y', pady=20)
        
        # 更新历史记录显示
        self._update_history_display()
        
        return frame
        
    def _generate_codes(self):
        """生成激活码"""
        try:
            days_str = self.days_var.get()
            count = int(self.count_var.get())
            
            # 处理测试用的1分钟激活码
            if days_str == '1分钟(测试)':
                days = 1/1440  # 1分钟 = 1/1440天
            else:
                days = int(days_str)
            
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, f"正在生成 {count} 个 {'1分钟' if days_str == '1分钟(测试)' else str(days)+'天'} 的激活码...\n\n")
            
            generated_codes = []
            for i in range(count):
                code = self.security.generate_activation_code(
                    days=days,
                    user_info={'batch': f'{"1分钟" if days_str == "1分钟(测试)" else str(days)+"天"}批次_{i+1}号'}
                )
                generated_codes.append(code)
                self.result_text.insert(tk.END, f"{i+1}. {code}\n")
                
                # 记录生成历史
                self._add_history('生成', code, '成功')
                
            self.result_text.insert(tk.END, "\n生成完成！")
            messagebox.showinfo("成功", f"已生成 {count} 个激活码")
            
        except Exception as e:
            messagebox.showerror("错误", f"生成激活码失败: {str(e)}")
            
    def _copy_results(self):
        """复制生成结果"""
        result = self.result_text.get(1.0, tk.END).strip()
        if result:
            self.root.clipboard_clear()
            self.root.clipboard_append(result)
            messagebox.showinfo("成功", "已复制到剪贴板")
        else:
            messagebox.showwarning("提示", "没有可复制的内容")
            
    def _export_results(self):
        """导出结果到文件"""
        result = self.result_text.get(1.0, tk.END).strip()
        if not result:
            messagebox.showwarning("提示", "没有可导出的内容")
            return
            
        try:
            filename = filedialog.asksaveasfilename(
                defaultextension=".txt",
                filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")],
                title="保存激活码"
            )
            
            if filename:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(result)
                messagebox.showinfo("成功", f"已导出到文件：{filename}")
                
        except Exception as e:
            messagebox.showerror("错误", f"导出失败: {str(e)}")
            
    def _validate_code(self):
        """验证激活码"""
        code = self.validate_entry.get().strip()
        if not code:
            self.validate_result.config(
                text="请输入激活码",
                fg=self.styles.colors.error
            )
            return
            
        is_valid, message = self.security.validate_activation_code(code)
        self.validate_result.config(
            text=message,
            fg=self.styles.colors.success if is_valid else self.styles.colors.error
        )
        
        if is_valid:
            self._add_history("激活", code, "成功")
            self.check_activation_status()
            # 刷新验证页面
            for child in self.validate_result.master.master.winfo_children():
                child.destroy()
            self._create_validate_page(self.validate_result.master.master)
        else:
            self._add_history("激活", code, "失败")
        
    def _batch_validate(self):
        """批量验证激活码"""
        codes = self.batch_text.get(1.0, tk.END).strip().split('\n')
        codes = [code.strip() for code in codes if code.strip()]
        
        if not codes:
            messagebox.showwarning("提示", "请输入要验证的激活码")
            return
            
        results = []
        for code in codes:
            is_valid, message = self.security.validate_activation_code(code)
            results.append(f"激活码: {code}\n结果: {message}\n")
            # 记录验证历史
            self._add_history('批量验证', code, '成功' if is_valid else '失败')
            
        # 显示验证结果
        result_window = tk.Toplevel(self.root)
        result_window.title("批量验证结果")
        result_window.geometry("600x400")
        
        text = tk.Text(
            result_window,
            font=('Courier', 10),
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text
        )
        text.pack(fill='both', expand=True, padx=20, pady=20)
        
        for result in results:
            text.insert(tk.END, result + "\n")
            
    def _add_history(self, operation: str, code: str, result: str):
        """添加历史记录"""
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.history.append({
            'time': current_time,
            'operation': operation,
            'code': code,
            'result': result
        })
        
        # 更新显示
        self._update_history_display()
        
        # 保存历史记录
        self._save_history()
        
    def _update_history_display(self):
        """更新历史记录显示"""
        # 清空现有显示
        for item in self.history_tree.get_children():
            self.history_tree.delete(item)
            
        # 添加历史记录
        for record in self.history:
            self.history_tree.insert('', 'end', values=(
                record['time'],
                record['operation'],
                record['code'],
                record['result']
            ))
            
    def load_history(self):
        """加载历史记录"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    self.history = json.load(f)
            else:
                self.history = []
        except Exception:
            self.history = []
            
    def _save_history(self):
        """保存历史记录"""
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(self.history, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存历史记录失败: {str(e)}")
        
    def run(self):
        """运行GUI程序"""
        self.root.mainloop()

def main():
    app = SecurityGUI()
    app.run()

if __name__ == "__main__":
    main() 