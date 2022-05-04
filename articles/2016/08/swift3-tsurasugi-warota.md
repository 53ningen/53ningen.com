---
title: Swift3について色々まとめていくスレ
category: programming
date: 2016-08-12 18:52:13
tags: [Swift]
pinned: false
---

# String を Data に変換する

```
// swift2: let data = "hoge".dataUsingEncoding(NSUTF8StringEncoding)
var data1: Data = "hoge".data(using: String.Encoding.utf8)!
var data2: Data = data1

unsafeAddress(of: data1) // 同じアドレス
unsafeAddress(of: data2) // 同じアドレス

data1.append("hoge".data(using: String.Encoding.utf8)!)

unsafeAddress(of: data1) // 違うアドレス
unsafeAddress(of: data2) // 違うアドレス
```

# 色々実験したスクショ

<img src="http://53ningen.com/wp-content/uploads/2016/08/aa6414b731a2c5e2a2851dfc1532dd63.png" alt="スクリーンショット 2016-08-12 18.50.49" width="642" height="137" class="aligncenter size-full wp-image-532" />
