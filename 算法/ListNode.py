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