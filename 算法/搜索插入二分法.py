#给定一个有序数组   给定一个查询值 返回该值在数组中的位置， 如不存在该值返回该值插入该数组的位置

#思路 二分法查询   [1,2,3,5,6,7,8,9]  [5]


from typing import List


def findname(arr:List[int],key: int):
    if  arr is None  or  len(arr) == 0:
        return  0
    else:
        left = 0;
        right = len(arr) - 1
        while(left<right):
            mid = left + int((left + right) /2.0)
            if key == arr[mid] :
                return mid
            elif arr[mid] >  key:
                right = mid
            else:
                left = mid + 1       
        if arr[left] >= key:
            return  left
        else:
            return left + 1;            
print(findname([1,2,3,5,6,7,8,9], 2));