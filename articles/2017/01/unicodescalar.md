---
slug: unicodescalar
title: UnicodeScalar とは?
category: programming
date: 2017-01-04 20:47:57
tags: [Swift]
pinned: false
---

docs: https://developer.apple.com/reference/swift/unicodescalar

The UnicodeScalar type, representing a single Unicode scalar value, is the element type of a string’s unicodeScalars collection.

`UnicodeScalar` は Unicode スカラ値を表す値

# UnicodeScalar から String への変換

```
let unicodeScalars: [Int] = [0x3054, 0x6CE8, 0x6587, 0x306F, 0x3046, 0x3055, 0x304E, 0x3067, 0x3059, 0x304B, 0xFF1F]
let chars = unicodeScalars
    .flatMap(UnicodeScalar.init)
    .map(Character.init)
String(chars)
```
