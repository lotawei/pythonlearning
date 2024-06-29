def mainTest():
    list1 = [1,3,5,6,7,7]
    list2 = [3,5,6,7,7]
    print(list(set(list1) & set(list2)))

mainTest()