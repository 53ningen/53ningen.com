---
title: 遅延リストを作る
category: programming
date: 2016-01-10 04:18:33
tags: [Scala, fpinscala]
pinned: false
---

FP in Scala 第 5 章読書会の予習。Stream の作成については、半年前くらいに[記事](http://53ningen.com/scala-stream/)にまとめた。

# リストの操作と無駄な中間リスト

リストへの map や filter 操作の評価は、模式的には以下のような感じで行われる。

```
List(1,2,3,4).map(_ + 10).fliter(_ % 2 == 0).map(_ * 3)
List(11,12,13,14).fliter(_ % 2 == 0).map(_ * 3)
List(12,14).map(_ * 3)
List(36,42)
```

中間リストが無駄に生成されているので、map や filter といった高階関数をつかって合成性をおとさずに、つまり while ループに頼らずなんとかしたい。そんなときに非正格性(non-strictness)を使うとよい。ということで「ワンランク上のリストの構築のしかた」を探っていく。

# 正格関数と非正格関数

「ワンランク上のリスト構築」をする前に正格性について確認を行っておく。
正格性とは関数の特性である。非正格関数では、引数の１つ以上を評価しないという選択が可能で、正格関数では引数が常に評価される。

Scala の if 制御構造は非正格の一例。array.isEmpty の状態に応じて、then または else のステートメントが評価されない。

```
val result = if (array.isEmpty) getHoge() else getFoo()
```

正確には、条件パラメータについては常に正格であり、各条件分岐後のステートメントは非正格である。Scala で非正格関数を記述するためには、引数の一部を評価されない状態で受け取ればよい。具体的には以下のようにできる。

```
def if2[A](cond: Boolean, onTrue: () => A, onFalse: () => A): A
  = if (cond) onTrue() else onFalse()
```

評価されない式をサンクとよぶ。これを評価するためには、空の引数リストを渡せばよい。`() => A` は実際には `Function0[A]` 型のシンタックスシュガーになっている。上の `if2` 関数はさらに簡単に以下のように書ける。

```
def if2[A](cond: Boolean, onTrue: => A, onFalse: => A): A
  = if (cond) onTrue else onFalse
```

どちらの構文においても、評価されずに渡される引数は、関数の本体ないで参照されている場所ごとに毎回評価される。これを避けるためには、`lazy` キーワードを使って値を明示的にキャッシュすればよい。

```
/// i は各呼び出しごとに評価が行われる
scala> def twice(i: => Int): Int = i + i
twice: (i: => Int)Int

scala> twice{ println("hoge"); 1 }
hoge
hoge
res2: Int = 2

/// 呼び出しごとの評価を避けるためには明示的にキャッシュしてあげることが必要
scala> :paste
// Entering paste mode (ctrl-D to finish)

def twice(i: => Int): Int = {
  lazy val j = i
  j + j
}

// Exiting paste mode, now interpreting.

twice: (i: => Int)Int

scala> twice{ println("hoge"); 1 }
hoge
res3: Int = 2
```

# 遅延リストを作る

非正格にする方法はわかっているので、あとはリストでやったことに手を加えてやれば良い。
データ構造の定義は以下のとおり。

```
sealed trait Stream[+A] {

  def headOption: Option[A] = this match {
    case Empty => None
    case Cons(h, _) => Some(h())
  }

}
case object Empty extends Stream[Nothing]
case class Cons[+A](h: () => A, t: () => Stream[A]) extends Stream[A]
```

これを用いて、冒頭で示したリストへの操作の効率化を図っていくことを考える。

# コンストラクタに潜む非効率性

Cons データコンストラクタを直接呼び出した場合、評価が無駄に走ることがある。

```
scala> val seq = Cons(() => { println("hoge"); 12}, () => Stream.empty)
res3: Cons[Int] = Cons(<function0>,<function0>)

scala> seq.headOption
hoge
res4: Option[Int] = Some(12)

scala> seq.headOption
hoge
res5: Option[Int] = Some(12)
```

無駄な処理を減らすためにはキャッシュをさせてやればよい。以下のようにスマートコンストラクタを定義する。

```
object Stream {

  def cons[A](h: => A, t: => Stream[A]): Stream[A] = {
    lazy val head = h
    lazy val tail = t
    Cons(() => head, () => tail)
  }

  def empty[A]: Stream[A] = Empty

  def apply[A](as: A*): Stream[A] =
    if (as.isEmpty) empty
    else cons(as.head, apply(as.tail: _*))

  def headOption[A]: Option[A] = {
    case Empty => None
    case Cons(h, _) => h()

  }

}
```

`Empty` のスマートコンストラクタには型推論を助ける狙いもある。これらを用いると以下のようにできる。

```
scala> val seq = Stream.cons({ println("hoge"); 12}, Stream.empty)
seq: Stream[Int] = Cons(<function0>,<function0>)

scala> seq.headOption
hoge
res8: Option[Int] = Some(12)

scala> seq.headOption
res9: Option[Int] = Some(12)
```

# 各種関数の定義

`foldRight` や `map`, `flatMap` などを定義する

```
sealed trait Stream[+A] {

  def foldRight[B](z: => B)(f: (A, => B) => B): B = this match {
    case Cons(h, t) => f(h(), t().foldRight(z)(f))
    case _ => z
  }

  def forAll(p: A => Boolean): Boolean =
    foldRight(true)((a, acc) => p(a) && acc)

  def takeWhile(p: A => Boolean): Stream[A] =
    foldRight(empty[A])((a, acc) => if (p(a)) cons(a, acc) else acc)

  def headOption: Option[A] = foldRight(None: Option[A])((a, _) => Some(a))

  def map[B](f: A => B): Stream[B] =
    foldRight(empty[B])((a, acc) => cons(f(a), acc))

  def filter(p: A => Boolean): Stream[A] =
    foldRight(empty[A])((a, acc) => if (p(a)) cons(a, acc) else acc)

  def append[B >: A](s: => Stream[B]): Stream[B] =
    foldRight(s)((b, acc) => cons(b, acc))

  def flatMap[B](f: A => Stream[B]): Stream[B] =
    foldRight(empty[B])((a, acc) => f(a).append(acc))

}
```

# 評価のされ方

以上のようにして定義した `Stream` の評価がどうされるかを最後に確認しておく。

```
Stream(1,2,3,4).map(_ + 10).filter(_ % 2 == 0).map(_ * 3)
cons(1, Stream(2,3,4)).map(_ + 10).filter(_ % 2 == 0).map(_ * 3)
cons(11, (Stream(2,3,4).map(_ + 10)).filter(_ % 2 == 0).map(_ * 3)
Stream(2,3,4).map(_ + 10).filter(_ % 2 == 0).map(_ * 3)
cons(2, Stream(3,4)).map(_ + 10).filter(_ % 2 == 0).map(_ * 3)
cons(12, Stream(3,4).map(_ + 10)).filter(_ % 2 == 0).map(_ * 3)
cons(12, Stream(3,4).map(_ + 10).filter(_ % 2 == 0)).map(_ * 3)
cons(36, Stream(3,4).map(_ + 10).filter(_ % 2 == 0).map(_ * 3))
...
```
