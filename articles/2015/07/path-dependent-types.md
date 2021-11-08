---
slug: path-dependent-types
title: Scalaの経路依存型（path-dependent type）とは？
category: programming
date: 2015-07-27 19:40:14
tags: [Scala]
pinned: false
---

Functional Programming in Scala の Wiki を翻訳している中で path-dependent types という単語が出てきてよくわからなかったので調べました。 調べたら hishidama さんのページが出てきてくれたので良かった(?)です。 詳細はそちらを参照していただければという感じなんですが、以下一応自分なりに噛み砕いてまとめてみました。

## 経路依存型（path-dependent types）

普通に Java で内部クラスを定義したとすると、以下のような感じになると思います。Scala でも同様に書けると思います。

```java
class A {
    class B {
    }
}
```

さてここから先、内部クラスのインスタンスを生成したときの挙動が Java と Scala で変わるそうです。 まずは Java の例を見てみましょう。

Java では class A の異なるインスタンス a1, a2 を用いて、それぞれの内部クラス B のインスタンスを生成したとしても、それらは同じ型です。 つまり以下のようなことができるはずです。

```java
A a1 = new A();
A a2 = new A();

A.B b1 = a1.new B();
A.B b2 = a2.new B();

// b1 と b2 は同じ A.B型 なので、b1 に b2 を代入できる
b1 = b2;
```

しかしながら Scala で同様のことをやってみるとうまくいかないのです（やったことがなかったので気づかなかった！）。

```scala
val a1 = new A()
val a2 = new A()

var b1 = new a1.B() // 再代入するので var にしてある
val b2 = new a2.B()

b1 = b2 //=> 型があわないと怒られる
```

また生成元の class A が同じインスタンスであっても、生成経路が異なると違う型として扱われるらしいです（これは驚きました）。

```scala
val a1 = new A()
val a2 = a1
assert(a1 == a2)    // a2 は a1 と同じインスタンス！

var b1 = new a1.B() // 再代入するので var にしてある
val b2 = new a2.B()

b1 = b2 //=> 型があわないと怒られる
```

したがって同じ経路で生成された内部クラスのインスタンス同士の型でないと同じ型として認識されません。 くどいようですが、コードで示すと以下のような具合になります。

```scala
val a = new A()

var b1 = new a.B() // 再代入するの var にしてある
val b2 = new a.B()

b1 = b2 //=> 代入できる！
```

なるほどなぁ…って感じです。ちなみにパス依存で異った型として扱われている内部クラスを同じクラスとして扱いたかったら、外側のクラス名#内部クラス名にキャストすれば良いようです。勉強になりました…。
