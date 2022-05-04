---
title: 'LeetCode: AddTwoNumbers, Reverse Integer'
category: programming
date: 2020-01-05 21:31:18
tags: [LeetCode, Pytho]
pinned: false
---

## AddTwoNumbers

> You are given two non-empty linked lists representing two non-negative integers.
> The digits are stored in reverse order and each of their nodes contain a single digit.
> Add the two numbers and return it as a linked list.
>
> You may assume the two numbers do not contain any leading zero, except the number 0 itself.
> [https://leetcode.com/problems/add-two-numbers](https://leetcode.com/problems/add-two-numbers)

- 問題をたいして読まずすすめて大事故が発生した
- ListNode をラップした Singly Linked List クラスにバグを仕込んで反省
- 教訓: 問題はちゃんとよめ、モジュールはユニットテストをかけ

```python
from typing import Optional


class ListNode(object):
    def __init__(self, x):
        self.val = x
        self.next = None

    def __eq__(self, other):
        return self.val == other.val and self.next == other.next

    def __repr__(self):
        return str(self.val) + str(self.next) if self.next is not None \
            else str(self.val)


class List(object):
    def __init__(self):
        self.head: Optional[ListNode] = None
        self.tail: Optional[ListNode] = None

    def append(self, item):
        if self.head is None:
            n = ListNode(item)
            self.head, self.tail = n, n
        else:
            self.tail.next = ListNode(item)
            self.tail = self.tail.next


class Solution(object):

    ZERO_NODE = ListNode(0)

    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        ans = List()
        carry_digit = 0
        while True:
            subtotal = l1.val + l2.val + carry_digit
            carry_digit = 1 if subtotal > 9 else 0
            ans.append(int(subtotal % 10))
            if l1.next is None and l2.next is None:
                if carry_digit != 0:
                    ans.append(carry_digit)
                break
            else:
                l1 = l1.next if l1.next is not None else Solution.ZERO_NODE
                l2 = l2.next if l2.next is not None else Solution.ZERO_NODE
        return ans.head


# Runtime: 76 ms, faster than 17.85% of Python3 online submissions for Add Two Numbers.
# Memory Usage: 12.7 MB, less than 100.00% of Python3 online submissions for Add Two Numbers.
```

空間計算量はバチクソに良いけど、時間計算量はかなり遅いらしい

というわけで再考。どこがボトルネックなのだろうか？ max(len(l1), len(l2)) に比例する時間で実行が終わってるのはずなので、細かな演算や条件を削る方法を考えるしかなさそう？

- `carry_digit = 1 if subtotal > 9 else 0` を `carry_digit = subtotal // 10` へ
- `ZERO_NODE` 使ってる影響で `while True` が遊んでいるのでこのあたりを直す

```python
class Solution(object):
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        ans = List()
        carry_digit = 0
        while l1 or l2 or carry_digit:
            if l1:
                carry_digit += l1.val
                l1 = l1.next
            if l2:
                carry_digit += l2.val
                l2 = l2.next
            ans.append(carry_digit % 10)
            carry_digit = carry_digit // 10
        return ans.head

# Runtime: 64 ms, faster than 79.51% of Python3 online submissions for Add Two Numbers.
# Memory Usage: 12.9 MB, less than 100.00% of Python3 online submissions for Add Two Numbers.
```

というわけで、根本的なアルゴリズムというよりはマジで細かいところ直してくみたいなゲームとなってしまったので、これ以上はあんまり面白くなさそう

おしまい

## ReverseInteger

> Given a 32-bit signed integer, reverse digits of an integer.
> Assume we are dealing with an environment which could only store integers within the 32-bit signed integer range: [−231, 231 − 1]. For the purpose of this problem, assume that your function returns 0 when the reversed integer overflows.
> [https://leetcode.com/problems/reverse-integer/](https://leetcode.com/problems/reverse-integer/)

- 整数の位を逆順に入れ替える
- まずは脳死コード
  - 当然遅い

```python
# Given a 32-bit signed integer, reverse digits of an integer.
class Solution:
    def reverse(self, x: int) -> int:
        s = ''.join(list(reversed(str(abs(x)))))
        res = int(s) if x >= 0 else int('-' + s)
        if -2147483648 < res and res < 2147483647:
            return res
        else:
            return 0
# Runtime: 44 ms, faster than 7.26% of Python3 online submissions for Reverse Integer.
# Memory Usage: 12.8 MB, less than 100.00% of Python3 online submissions for Reverse Integer.
```

少しやる気を出して自前で書いてみる

```
    def reverse_(self, x: int) -> int:
        s = str(abs(x))
        r = ''
        for a in s:
            r = a + r
        res = int(r) if x >= 0 else int('-' + r)
        if res < -2147483648:
            return 0
        elif res > 2147483647:
            return 0
        else:
            return res

# Runtime: 24 ms, faster than 93.34% of Python3 online submissions for Reverse Integer.
# Memory Usage: 12.8 MB, less than 100.00% of Python3 online submissions for Reverse Integer.
```

93.34%... これでいいの...？ つまらんのでちょっと計算を使った方法を考えてみる

- ある数の絶対 `n = abs(t)` は `digits = int(log10(t))` ケタあるので、ケタ数分のループで原理上逆順にできるはず
- `n // digits` で各桁を取り出せるのでこれを利用して、逆順にする

```
class Solution:
    def reverse(self, x: int) -> int:
        if x == 0:
            return 0
        n, ans = abs(x), 0
        digits = int(log10(n))
        for i in range(0, digits + 1):
            p = 10 ** (digits - i)
            d = n // p
            ans += d * (10 ** i)
            n -= d * p
        if -2147483648 < ans and ans < 2147483647:
            return ans if x >= 0 else -1 * ans
        else:
            return 0

# Runtime: 28 ms, faster than 76.62% of Python3 online submissions for Reverse Integer.
# Memory Usage: 12.8 MB, less than 100.00% of Python3 online submissions for Reverse Integer.
```
