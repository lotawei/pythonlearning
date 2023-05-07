#  两个非空链表，标识两个非负的整数，每位数字都是按照逆序方式存储每个节点只能存储一位数字
# 将两个数字相加并以相同形式返回一个表示和的链表，你可以假设除了数字0之外，这两个数都不会以0 开头
# 思路两个链表 995 994   8901
# 修改了函数的注释描述
# 时间复杂度 O(n) n 位链表长度

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def createLinkedList(values):
    dummy = ListNode(0)
    curr = dummy

    for val in values:
        node = ListNode(val)
        curr.next = node
        curr = curr.next

    return dummy.next


class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        carry = 0
        dummy = ListNode(0)
        curr = dummy

        while l1 or l2 or carry:
            # 这里加入了对进位的处理
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            total = val1 + val2 + carry
            carry = total // 10  # 这里修改为对进位的处理
            node = ListNode(total % 10)
            curr.next = node
            curr = curr.next
            
            l1 = l1.next if l1 else None  # 如果l1不为空就遍历链表指针
            l2 = l2.next if l2 else None  # 如果l2不为空就遍历链表指针
            
        return dummy.next


# Example usage:
list1 = createLinkedList([9, 9, 4])
list2 = createLinkedList([9, 4, 5])  # 结果应该为 8 4 0 1 才正确

s = Solution()
result = s.addTwoNumbers(list1, list2)
# 遍历输出链表
node = result
while node:
    print(node.val)
    node = node.next
    