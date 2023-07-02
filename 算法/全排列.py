#找出特定序列的全排列
#如  1 , 2, 3 返回  123  ， 132 ， 213,231，  321 ， 312 
#回溯 递归
def permute(nums):
    result = [] 
    backtrack(nums, [], result)
    return result

def backtrack(nums, temp, result):
    if not nums:
        result.append(temp[:])
        return 
      
    for i in range(len(nums)):
        temp.append(nums[i])
        backtrack(nums[:i]+nums[i+1:], temp, result)
        temp.pop()
nums = [1, 2, 3]
print(permute(nums))