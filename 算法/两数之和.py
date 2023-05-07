
# 两数之和整理暴力解决
def foundTargetsolution1(arrs,target):
    for i in range(0,len(arrs)):
       for j in range(i+1,len(arrs)):
           if (target == arrs[i] +  arrs[j]):
                return (arrs[i],arrs[j])
            

print(foundTargetsolution1([1,2,5,6,8],8))
#mapdic索引方式思路记录下索引位置 
def foundTargetsolution2(arrs,target):
    mapdic = {}    # 
    result = []
    for i in range(0,len(arrs)):
        mapdic[arrs[i]] = i
    for j in range(0,len(arrs)):
        if (target - arrs[j]  in mapdic.keys()):
            return  (arrs[j],arrs[mapdic[6]])


print(foundTargetsolution2([1,2,5,6,8],8))


        

           
 
