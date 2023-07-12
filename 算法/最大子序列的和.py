#给定一个nums 返回最大的连续序列 并返回最大值
#如 [1,2,-1,5,3,-4,2,1,-4]
#最大 [1,2,-1,5,3]  10
#思路 使用动态规划的方式实现
# 1. 使用cur_sum存储当前子数组的和,max_sum存储最大子数组的和
# 2. 当cur_sum小于0时,不再累加,从下一个元素开始
# 3. 不断更新max_sum和对应的最大子数组区间
# 时间复杂度为O(n),空间复杂度为O(1)。
def maxSubArray(nums):
    # 存储最大子数组的和
    max_sum = float("-inf")  
    # 存储当前子数组的和
    cur_sum = 0
    # 最大子数组的开始位置
    max_begin = 0  
    # 最大子数组的结束位置
    max_end = 0
    
    for i in range(len(nums)):
        cur_sum += nums[i]
        # 当cur_sum小于0时,不再累加
        if cur_sum < 0:
            cur_sum = 0
            max_begin = i+1
        # 更新最大子数组的信息    
        if cur_sum > max_sum:
            max_sum = cur_sum
            max_end = i
            
    return max_sum, nums[max_begin:max_end+1]

nums = [1,2,-1,5,3,-4,2,1,-4] 
max_sum, max_subarray = maxSubArray(nums)
print(max_sum) # 10
print(max_subarray) # [1, 2, -1, 5, 3]

#分治法
def maxSubArray2(nums, left, right):
    # 递归终止条件
    if left == right: 
        return nums[left]

    mid = (left + right) // 2

    # 返回左右两边最大子数组的最大值
    left_max = maxSubArray2(nums, left, mid)
    right_max = maxSubArray2(nums, mid+1, right)

    # 计算中间包含左右最大子数组的最大值
    left_sum = float('-inf')
    cur_sum = 0
    for i in range(mid, left-1, -1):
        cur_sum += nums[i]
        left_sum = max(left_sum, cur_sum)

    right_sum = float('-inf') 
    cur_sum = 0
    for i in range(mid+1, right+1):
        cur_sum += nums[i]
        right_sum = max(right_sum, cur_sum)
        
    mid_max = left_sum + right_sum

    # 返回三者最大值
    return max(left_max, right_max, mid_max)
# maxs, mass = maxSubArray2(nums,3,6)
# print(maxs) # 10
# print(mass) # [1, 2, -1, 5, 3]
#暴力法
def maxSubArray3(nums):
    n = len(nums)
    max_sum = float('-inf')
    for i in range(n):
        for j in range(i, n):
            cur_sum = 0
            for k in range(i, j+1):
                cur_sum += nums[k]
            max_sum = max(max_sum, cur_sum)

    return max_sum 
maxs = maxSubArray3(nums)
print(maxs)