---
title: 連結リストのバリエーション
category: programming
date: 2014-06-10 19:35:57
tags: [アルゴリズム, データ構造]
pinned: false
---

連結リストには単方向リストだけでなく様々なバリエーションがある。たとえば Java の LinkedList は双方向リストとして実装されている。その他にも単方向・双方向な循環連結リスト、メモリ効率二重連結リストなどがある。

### 双方向連結リスト(Doubly-linked list)

単方向リストは次のノードへの参照：next しかもたなかったが、双方向連結リストは前のノード：prev への参照も持つ。

![](https://static.53ningen.com/wp-content/uploads/2018/02/17153745/doubly_linked_list.png)

### 循環連結リスト(Circular linked list)

↓ こんなやつ

![]()

### メモリ効率二重連結リスト(XOR linked list)

![](https://static.53ningen.com/wp-content/uploads/2018/02/17153925/singly-1.png)

☆ 次の性質を利用して双方向リストを実現している。

X⊕X=0
X⊕0=X
X⊕Y=Y⊕X
(X⊕Y)⊕Z=X⊕(Y⊕Z)
