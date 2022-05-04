---
title: タグ付けできない休日
category: programming
date: 2016-03-07 00:10:55
tags: [Swift, Scala]
pinned: false
---

```
package object tagged {
  type Tagged[A, T] = {type Tag = T; type Self = A}
  type @@[T, Tag] = Tagged[T, Tag]
}

case class Hoge(id: String @@ Hoge)
case class Foo(id: String @@ Foo)

scala> val hogeStr: String @@ Hoge] = "123".asInstanceOf[String @@ Hoge]
scala> val fooStr: String @@ Foo] = "123".asInstanceOf[String @@ Foo]
scala> val hoge1 = Hoge(hogeStr) //=> OK
scala> val hoge2 = Hoge(fooStr)  //=> NG
scala> hogeStr + "456" //=> "123456"
```

これを Swift で書こうとして無理だと悟って休日が終わりました。はぁ...。
はやく protocol 宣言に型変数をかけるようになってほしい。

`Self = A` を表現する言語機能が Swift には足りていないのが原因かなと思います。その部分を妥協するとしたら普通に Phantom Type 的な解決法として以下のような具合になるのかなぁと思います。

```
struct Tagged<A, T> { let value: A }

struct Hoge { let id: Tagged<Int, Hoge> }
struct Foo  { let id: Tagged<Int, Foo> }

let hogeId = Tagged<Int, Hoge>(value: 123)
let fooId = Tagged<Int, Foo>(value: 123)

Hoge(id: hogeId)
// Hoge(id: fooId) => Error
```

もちろん `hogeId + 456` なんてものはできないですね...。残念。
しかも以下のようなことはできない。

```
typealias Id<T> = Tagged<Int, T>
struct Id<T>: Tagged<Int, T> {
    //...
}
```

ため息しかでない。
