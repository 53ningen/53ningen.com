---
slug: protocol-class
title: class縛り
category: programming
date: 2016-03-08 03:32:36
tags: [Swift]
pinned: false
---

```
protocol Fuga: class {}
// struct Aho: Fuga {} => Error
class Aho: Fuga {}

```

という感じで class で縛れる。struct では縛れない。
