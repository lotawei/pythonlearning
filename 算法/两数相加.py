# 两个非空链表，标识两个非负的整数，每位数字都是按照逆序方式存储每个节点只能存储一位数字
# 将两个数字相加并以相同形式返回一个表示和的链表，你可以假设除了数字0之外，这两个数都不会以0 开头
# 思路两个链表 2-》3-》4   3-》4-》5    5-》7-》9
# Define a ListNode class to represent each node in the linked list
# 两个非空链表，标识两个非负的整数，每位数字都是按照逆序方式存储每个节点只能存储一位数字
# 将两个数字相加并以相同形式返回一个表示和的链表，你可以假设除了数字0之外，这两个数都不会以0 开头
# 思路两个链表 2-》3-》4   3-》4-》5    5-》7-》9
# Define a ListNode class to represent each node in the linked list
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Define a function to create a linked list from a list of values
def createLinkedList(values):
    # Create a dummy head node
    dummy = ListNode(0)
    # Create a pointer to the dummy node
    curr = dummy
    # Iterate through the list of values
    for val in values:
        # Create a new node with the current value
        node = ListNode(val)
        # Set the current node's next pointer to the new node
        curr.next = node
        # Move the current pointer to the new node
        curr = curr.next
    # Return the linked list, skipping the dummy head node
    return dummy.next

class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        # Initialize variables for the current carry and dummy head node
        carry = 0
        dummy = ListNode(0)
        # Create a pointer to the dummy head node
        curr = dummy
        # Loop through both input linked lists and the current carry value
        while l1 or l2 or carry > 0:
            # Calculate the sum of the current values and the carry
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            total = val1 + val2 + carry
            # Calculate the new carry value
            carry = total // 10
            # Create a new node with the ones digit of the total sum
            node = ListNode(total % 10)
            # Attach the new node to the output linked list and move the pointers
            curr.next = node
            curr = curr.next
            # Move the input linked list pointers if they are not null
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next
            print(dummy.val)
        # Return the output linked list, skipping the dummy head node
        return dummy.next

# Example usage:
# Create a linked list with values [2, 3, 4]
list1 = createLinkedList([2, 3, 4])
# Create a linked list with values [3, 4, 5]
list2 = createLinkedList([3, 4, 5])

# Create a Solution object and call the addTwoNumbers method
s = Solution()
result = s.addTwoNumbers(list1, list2)
# Print the result in the format [5, 7, 9]
while(result.next is not None):
     print(result.val)
