#数字n代表括号的生成对数，设计一个函数 返回所有可以匹配的组合
#如 3  ((()))  ()()() (())() ()(()) (()())

#回溯法 解决 
#这个函数的工作原理是:
# 1. 如果左右括号数都达到n,则找到一组匹配的组合,添加到结果中。
# 2. 如果左括号数小于n,则继续在字符串末尾添加‘(’,并递归生成余下的组合。
# 3. 如果右括号数小于左括号数,则继续在字符串末尾添加‘)’,并递归生成余下的组合。
# 4. 重复上述步骤,直到左右括号数都达到n,找到所有匹配的组合。

def generate_brackets(n):
    result = []
    def generate(left, right, s):
        if left == n and right == n:
            result.append(s)
            return 
        if left < n:
            generate(left+1, right, s + '(')
        if right < left: 
            generate(left, right+1, s + ')')
        
    generate(0, 0, '')
    return result
res = generate_brackets(4)
print(res)

     