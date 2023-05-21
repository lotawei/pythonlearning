#递归法 迭代法或
#两个升序链表合并成一个升序链表
# 1 4 6 8   2 7 8 9   1 2 3 6 7 8 8 9 
# 思路 ： p  q   分别指向两个链表  r 为空链表 依次迭代 更改每次迭代的next指针 随机找小的指针并赋值
#  复杂度 o(n) 时间复杂度o(n)
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
def loggerList(node:ListNode):
    p = node
    while(p is not None):
        print(p.val)
        p = p.next
    
    
list1 = createLinkedList([1,4,6,8,9])
# loggerList(list1)
list2 = createLinkedList([2,6,7,8,9,11])
# loggerList(list2)
def mergenewlist(node1:ListNode,node2:ListNode):
    cursor = ListNode(0)
    p = node1
    q = node2
    listvalues = []
    while p is not None or  q is not None:
        if (p is not None and q is not None):
            if (p.val <= q.val):
                cursor = p
                node = ListNode(cursor.val)
                p = p.next
                # print('---%s' %cursor.val)
                listvalues.append(cursor.val)
            else:
                cursor = q
                node = ListNode(cursor.val)
                q = q.next
                # print('---%s' %cursor.val)
                listvalues.append(cursor.val)
        if(p is None and q is not None):
            cursor = q
            q = q.next
            # print('---%s' %cursor.val)
            listvalues.append(cursor.val)
        if (q is None and p is not None):
            cursor = p
            p = p.next
            # print('---%s' %cursor.val)
            listvalues.append(cursor.val)
    return createLinkedList(listvalues)

result = mergenewlist(list1,list2)
loggerList(result)