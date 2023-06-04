#给定一个链表两两交换相邻的两个节点
#如  1  2 3 4 5 7 8    返回   21 43 75 8
#思路 迭代法或者递归法
#  两组 放一次 并交换一次
#  指针迭代修改
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


def swapNodes(node:ListNode):
    newNode = ListNode()
    newvalues = []
    p = node
    i = 0
    lastValue = 0
    while(p is not None):
        newvalues.append(p.val)
        if  (i+1)% 2 != 0:
            lastValue = p.val
            print("不交换只记录 ",lastValue)
        else:
            print("交换")
            temp = p.val
            newvalues[i] =  newvalues[i-1]
            newvalues[i-1] = temp

        p = p.next
        i = i + 1
     
    print(newvalues)
    return  createLinkedList(newvalues)

testNode = createLinkedList([1,2,3,4,5,7,8])
# swapNodes(testNode)
# loggerList(testNode)
# loggerList(swapNodes(testNode))


def swapNode(head:ListNode):
    if  head is None or  head.next is None:
        return head
    res = ListNode()
    res.next = head
    cur = res
    while cur.next != None and cur.next.next != None:
        nxt = head.next
        temp = nxt.next
        cur.next = nxt
        nxt.next = head
        head.next = temp
        cur = head
        head = head.next
    return res.next

loggerList(swapNode(testNode))
    
