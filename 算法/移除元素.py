# 给定一个数组num  和 val 需要原地移除所有和val相等的值，并返回新的长度
# [1, 2, 2, 4,5]  2  [1,4,5] 返回新的数组长度 3
#  空间存储o1

#思路简易版本： 如果有额外空间那么很简单 只要不是这个val放到新的数组非常简单
#考察：双指针 思路 l 指针往右扫找不一样的值 r 指针往左扫找等于val的值 然后交换

from ast import List


def removedepubVal(nums:List, value:int) :
     if nums is None or  len(nums) == 0:
        return 0
     l = 0;
     r = len(nums) - 1;
     while(l<r):
        while(l<r and nums[l] != value):
            l+=1;
        while(l<r and nums[r] == value):
            r -= 1
        nums[r],nums[l] = nums[l],nums[r]
     if nums[l] == value:
        return l;
     else:
        return l+ 1
    
print(removedepubVal(nums=[1,2,2,4,5,7],value=2))


# removedepubVal(nums=[1,2,,2,4,5],2);