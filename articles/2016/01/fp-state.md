---
slug: fp-state
title: 乱数生成を純粋化する
category: programming
date: 2016-01-11 03:24:33
tags: [Scala, fpinscala]
pinned: false
---

乱数の生成についての簡単な例を見てみよう。`scala.util.Random` が用意されているのでそれを使えば簡単だ。

```
scala> val rng = new scala.util.Random
rng: scala.util.Random = scala.util.Random@5e28ea8b

scala> rng.nextInt
res0: Int = -1998760920

scala> rng.nextInt
res1: Int = 1591304297

scala> rng.nextInt
res2: Int = -321914793
```

`nextInt` メソッドは呼び出しのたびに返ってくる値が異なる。呼び出しのたびに `rng` の状態が遷移していることが想像出来る。たとえば、ランダム性を利用したメソッドのテストを書こうとした場合、テストを再現可能にする必要があるが `scala.util.Random` では難しそうである。仮に乱数ジェネレータを直接扱うとしても、ジェネレータの状態を揃えてあげる必要がある。こういった状態に対処するために、副作用を使用しないという原点に立ち返ろう。

# 純粋関数型の乱数生成

状態を遷移させるのではなく、新しい状態を返すという気持ちでやっていく。乱数ジェネレータの場合は、ジェネレータの `nextInt` を呼び出すと、値と新しいジェネレータを返すという感じになる。もちろん、もとのジェネレータは状態遷移しない。したがって、もとのジェネレータの `nextInt` を何回呼び出しても、同じ値と新しいジェネレータが返ってくる。コードで表現すると次のようになる。

```
trait RandomGenerator {

  def nextInt: (Int, RandomGenerator)

}

case class SimpleRandomGenerator(seed: Long) extends RandomGenerator {

  def nextInt: (Int, RandomGenerator) = {
    val newSeed = (seed * 0x5DEECE66DL + 0xBL) & 0xFFFFFFFFFFFFL
    val nextGenerator = SimpleRandomGenerator(newSeed)
    ((newSeed >>> 16).toInt, nextGenerator)
  }
}
```

こいつは以下のような挙動を示す。

```
scala> val gen = SimpleRandomGenerator(12345)
gen: SimpleRandomGenerator = SimpleRandomGenerator(12345)

scala> gen.nextInt
res0: (Int, RandomGenerator) = (454757875,SimpleRandomGenerator(29803012144720))

scala> gen.nextInt
res1: (Int, RandomGenerator) = (454757875,SimpleRandomGenerator(29803012144720))

scala> res1._2.nextInt
res2: (Int, RandomGenerator) = (-866467965,SimpleRandomGenerator(224690132215835))

scala> res1._2.nextInt
res3: (Int, RandomGenerator) = (-866467965,SimpleRandomGenerator(224690132215835))

scala> gen.nextInt
res4: (Int, RandomGenerator) = (454757875,SimpleRandomGenerator(29803012144720))
```

見ての通り、`nextInt` は純粋な関数になった。

# ステートフルな API と向き合う

乱数生成の例で見たようなことと同じような方法で、すべてのステートフル API は純粋化できる。基本的には状態を遷移させるのではなく、値と新しい状態を返してやるという方針になる。ただし普通にこれをやってみるとボイラープレートが多くて辛い気持ちになるだろう。たとえば `RandomGenerator` に対していろんな便利関数を定義してみる。同じことばっかりやっているように見えないだろうか？

```
object RandomGenerator {

  def nextIntPair(rng: RandomGenerator): ((Int, Int), RandomGenerator) = {
    val (i1, rng1) = rng.nextInt
    val (i2, rng2) = rng1.nextInt
    ((i1, i2), rng2)
  }

  def nonNegativeInt(rng: RandomGenerator): (Int, RandomGenerator) = {
    val (i, r) = rng.nextInt
    val j = if (i < 0) -(i + 1) else i
    (j, r)
  }

  def double(rng: RandomGenerator): (Double, RandomGenerator) = {
    val (i, r) = nonNegativeInt(rng)
    val j = if (i == 0) i else i.toDouble / Int.MaxValue
    (j, r)
  }

  def intDouble(rng: RandomGenerator): ((Int, Double), RandomGenerator) = {
    val (i1, rng1) = rng.nextInt
    val (d1, rng2) = double(rng1)
    ((i1, d1), rng2)
  }

}
```

すべて `RandomGenerator => (A, RandomGenerator)` な関数になっている。「状態を遷移させるのではなく、値と新しい状態を返してやる」という方針が関数に明確に現れてきている。この部分は繰り返し出現するのですこし抽象化しよう。`type` を使って `RandomGenerator => (A, RandomGenerator)` に `Rand[A]` というエイリアスを張り付ける。すると見なれた `map` や `map2` などの高階関数が定義できて、かつそれを用いて上で定義した関数などを実装できるようになる。

```
object RandomGenerator {

  type Rand[+A] = RandomGenerator => (A, RandomGenerator)

  def int: Rand[Int] = _.nextInt

  def unit[A](a: A): Rand[A] = rng => (a, rng)

  def map[A, B](r: Rand[A])(f: A => B): Rand[B] = rng => {
    val (a1, r1) = r(rng)
    (f(a1), r1)
  }

  def map2[A, B, C](ra: Rand[A], rb: Rand[B])(f: (A, B) => C): Rand[C] = rng => {
    val (a, r1) = ra(rng)
    val (b, r2) = rb(r1)
    (f(a, b), r2)
  }

  def both[A, B](ra: Rand[A], rb: Rand[B]): Rand[(A, B)] = map2(ra, rb)((_, _))

  def sequence[A](fs: List[Rand[A]]): Rand[List[A]] =
    fs.foldRight(unit(List[A]()))((f, acc) => map2(f, acc)(_ :: _))

  def flatMap[A, B](r: Rand[A])(f: A => Rand[B]): Rand[B] = rng => {
    val (a1, rng1) = r(rng)
    f(a1)(rng1)
  }

  def nextIntPair: Rand[(Int, Int)] = both(int, int)
  /*
  def nextIntPair(rng: RandomGenerator): ((Int, Int), RandomGenerator) = {
    val (i1, rng1) = rng.nextInt
    val (i2, rng2) = rng1.nextInt
    ((i1, i2), rng2)
  }
  */

  def nonNegativeInt: Rand[Int] = map(int)(i => if (i < 0) -(i + 1) else i)
  /*
  def nonNegativeInt(rng: RandomGenerator): (Int, RandomGenerator) = {
    val (i, r) = rng.nextInt
    val j = if (i < 0) -(i + 1) else i
    (j, r)
  }
  */

  def double: Rand[Double] = map(nonNegativeInt)(i => if (i == 0) i else i.toDouble / Int.MaxValue)
  /*
  def double(rng: RandomGenerator): (Double, RandomGenerator) = {
    val (i, r) = nonNegativeInt(rng)
    val j = if (i == 0) i else i.toDouble / Int.MaxValue
    (j, r)
  }
  */

  def intDouble: Rand[(Int, Double)] = both(int, double)
  /*
  def intDouble(rng: RandomGenerator): ((Int, Double), RandomGenerator) = {
    val (i1, rng1) = rng.nextInt
    val (d1, rng2) = double(rng1)
    ((i1, d1), rng2)
  }
  */

}
```
