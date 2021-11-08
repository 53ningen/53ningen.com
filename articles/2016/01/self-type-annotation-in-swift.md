---
slug: self-type-annotation-in-swift
title: self-type annotation in swift
category: programming
date: 2016-01-09 23:55:18
tags: [Swift, Scala]
pinned: false
---

Scala の `self-type annotation` に対応することを Swift で書きたいとしたらどうすればいいか考えた。まあ、それ以前に Swift じゃなくて Scala 書きたい気持ちがあるけどしょうがない。とりあえず以下のようなコードを Swift に移植しないと人生が終わると仮定したときにどうすればよいだろうか。

```
trait A { def a = "a" }
trait B { this: A => def b = a + "b" }
trait C { this: B => def c = b + "c" }
```

ため息をつきながら Swift における `self-type annotation` 的なものがないかを Google で検索すると Swift のドキュメントが引っかかるはず。

- [Protocol Associated Type Declaration](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Declarations.html#//apple_ref/doc/uid/TP40014097-CH34-ID374)

どうやら Swift の `Self` はプロトコルを満たしたときの最終的な型を参照するようです。これをつかってとりあえずそれっぽい感じで移植してみる。

```
protocol A {}
extension A {
    func a() -> String { return "a" }
}


protocol B { func b() -> String }
extension B where Self:A {
    func b() -> String { return a() + "b" }
}

protocol C {}
extension C where Self:B {
    func c() -> String { return b() + "c" }
}
```

`protocol` にデフォルト実装を直接かけないのはわりと面倒臭い。
