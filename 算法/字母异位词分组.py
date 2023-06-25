# 给定一个字符串数组将字母异位词组合在一起 指的是字母相同词不同的排列
# 如 [eat,tea,tan,ate,nat,bat] ->
# 输出 ： [ate,tea,eat] [nat,tan] [bat] 哈希值
from typing import List


def wordsGroup(words: List):
    anagram_dict = {}


    for word in words:
    # 获取单词的首字母
        first_letter = word[0]

    # 如果首字母在字典中,将单词添加到对应键的值中
        if first_letter in anagram_dict:
            anagram_dict[first_letter].append(word)
    # 否则创建一个键值对,其中键是首字母,值是列表包含该单词
        else:
            anagram_dict[first_letter] = [word]

# 输出字典中的每个键值对
    for key in anagram_dict:
        print(anagram_dict[key])
    return  anagram_dict

print(wordsGroup(['tea','eat','ate','tan','nat','bat']))
