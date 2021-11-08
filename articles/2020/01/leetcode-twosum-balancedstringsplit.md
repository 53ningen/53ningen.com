---
slug: leetcode-twosum-balancedstringsplit
title: 'LeetCode: TwoSum, BalancedStringSplit'
category: programming
date: 2020-01-05 01:57:05
tags: [python, LeetCode]
pinned: false
---

## TwoSum

[https://leetcode.com/problems/two-sum/](https://leetcode.com/problems/two-sum/)

> Given nums = [2, 7, 11, 15], target = 9,
> Because nums[0] + nums[1] = 2 + 7 = 9,
> return [0, 1].

- 与えられた nums から数を二つ選んだ和 target の値に一致するような index を配列で返す
- 2 つの数の和を表にすると以下のような感じ
  - つまり Pfor i in range(len(nums)); for j in range(i+1, range(len(nums)));` のループを回してあげればよさそう

```
|    | 11 | 7  | 2  | 15 |
|:--:|:--:|:--:|:--:|:--:|
| 11 | x  | 18  | 13 | 26 |
| 7  | -  | x   | 9  | 22 |
| 2  | -  | -   | x  | 17 |
| 15 | -  | -   | -  | x  |
```

- 上記の和の表的な考え方をコードに落とし込むと以下のようになる
  - が n \* (n -1) ~ `O(n^2)` の計算量となる

```
# 5340 ms
# 14.8 MB

from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []
```

戦略を変えて一回の走査で解けるような方法を考える。

たとえば `n_i = [11, 2, 9, 7 , 15]` という配列から和が target = 9 となる組み合わせを見つけたいときを考える

- i = 0: 11 との和が 9 になるのは -2
- i = 1: 2 との和が 9 になるのは 7
- i = 2: 9 との和が 9 になるのは 0
- i = 3: 7 は以前 i = 1 にちょうど欲しかった数
  - この欲しかった数とインデックスをハッシュテーブルに突っ込んでおけば、インデックスへ `O(1)` でアクセスでき、(1, 3) という回答を導き出せる

この方法を使えば、`O(n)` で問題が解ける。コードに落とし込むと以下のような形となる。

```python
# 44 ms
# 14.2 MB

from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        d = {}
        for j in range(len(nums)):
            i = d.get(nums[j], None)
            if i is not None:
                return [i, j]
            d[target - nums[j]] = j
```

## BalancedStringSplit

[Split a String in Balanced Strings - LeetCode](https://leetcode.com/problems/split-a-string-in-balanced-strings/)

> Balanced strings are those who have equal quantity of 'L' and 'R' characters.
> Given a balanced string s split it in the maximum amount of balanced strings.
> Return the maximum amount of splitted balanced strings.

- 問題の名前が解法のネタバレっぽい
- L と R がバランスしたら、カウントアップ
- カウンタとバランスカウンタは必要に思える

```
class Solution:
    def balancedStringSplit(self, s: str) -> int:
        balance, total = 0, 0
        for x in s:
            balance = balance + 1 if x == 'L' else balance - 1
            if balance == 0:
                total += 1
        return total
```
