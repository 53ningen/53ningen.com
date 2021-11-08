---
slug: scala-stream
title: Scalaでストリームを実装する
category: programming
date: 2015-05-08 06:54:46
tags: [Scala]
pinned: false
---

scala では基本的に式は正格評価されます。 評価を遅らせたい場合は、サンク(thunk)と呼ばれる関数にしてあげることになります。 単純な例から見てみてみましょう。

```
scala> 1
res4: Int = 1

scala> def one = () => 1
one: () => Int

scala> one()
res6: Int = 1
```

このようにある A 型の値をサンクにしたい場合は () => A 型の関数にしてあげればよいです。 評価したくなったタイミングで関数にユニット () を渡してあげる形になります。

特に関数定義の際に引数の評価を遅らせたいことがあると思います。 以下のように数字を 2 倍する関数を定義できます。

```
scala> def twice(x: () => Int) = 2 * x()
twice: (x: () => Int)Int

scala> twice(() => 2)
res: Int = 4
```

この場合、呼び出し側と実装部分で () を付けるのが面倒なのですが、 x とだけ書けば良いように、便利な構文が用意されています 以下は上記の twice と同じ関数です。

```
scala> def twice(x: => Int): Int = 2 * x
twice: (x: => Int)Int

scala> twice(2)
res: Int = 4
```

非常に便利ですね？

そんなこんなでストリームを実装してみます。 簡単に以下のような感じになります。

```
trait Stream[+A] {

  def toList: List[A] = {
    def go(s: Stream[A], l: List[A]): List[A] = s match {
      case Cons(x, xs) => go(xs(), x() :: l)
      case _ => l
    }
    go(this, List()).reverse
  }

}
case object Empty extends Stream[Nothing]
case class Cons[+A](x: () => A, xs: () => Stream[A]) extends Stream[A]

object Stream {
  def cons[A](x: => A, xs: => Stream[A]): Stream[A] = {
    lazy val head = x
    lazy val tail = xs
    Cons(() => head, () => tail)
  }

  def int(n: Int): Stream[Int] = Stream.cons(n, int(n + 1))
}
```

Stream(1, 2) は以下のように作れます。toList でリスト化できます。

```
scala> Stream.cons(1, Stream.cons(2, Empty))
res: Stream[Int] = Cons(<function0>,<function0>)

scala> Stream.cons(1, Stream.cons(2, Empty)).toList
res: List[Int] = List(1, 2)
```

Stream は非正格評価なので、無限に続く数列なんかもつくれちゃいます。 ただし無限列を評価しようとして toList をすると当然ながらスタックオーバーフローが発生します。

```
scala> def int(n: Int): Stream[Int] = Stream.cons(n, int(n + 1))
int: (n: Int)Stream[Int]

scala> int(0).toList
// stack overflow
```
