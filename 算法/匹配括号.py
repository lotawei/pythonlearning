#给定任意的字符串 如 （ ] } 这种 是否满足对应的 左括号必须有对应的右括号对应 左括号必须按顺序
# 我们可以遍历字符串中的每个字符，
#如果是左括号，就将其压入栈中；
#如果是右括号，就将栈顶元素弹出，判断是否与当前右括号匹配。
#如果匹配，则继续遍历；
#如果不匹配，或者栈为空，说明不满足左右括号对应的条件，返回False。
#最后，如果栈为空，说明所有左括号都有对应的右括号，且左括号按顺序出现，返回True；
#否则，返回False。
# 
def is_valid(charecters:str):
    stack = []
    mapping = {'(','{','[',')',']','}'}
    leftmapping = {'(','{','['}
    keymapValue = {')':'(',
                   ']':'[',
                   '}':'{'
                   }
    for char in charecters:
        if  char in mapping :
            if  char in leftmapping:
                stack.append(char)
                print(stack)
            else:
                top_elment = stack.pop()
                if top_elment is None:
                    return False
                else:
                    #这个肯定应该属于右边括号的
                    if keymapValue.get(char) != top_elment :
                        return False
    return  not (len(stack) > 0)
print(is_valid("()"))  # True
print(is_valid("()[]{}"))  # True
print(is_valid("(]"))  # False
print(is_valid("([)]"))  # False
print(is_valid("{[]}"))  # True
                    


        
        

