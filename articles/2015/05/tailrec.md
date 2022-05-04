---
title: '@tailrec で末尾再帰チェック'
category: programming
date: 2015-05-05 19:29:42
tags: [Scala]
pinned: false
---

末尾再帰を意図した関数には `@scala.annotaition.tailrec` を付けるとコンパイル時にチェックがかかるようになることを知りました。 またこのアノテーションによって IntelliJ IDEA も末尾再帰になっていないときに警告を出してくれます。

たとえば階乗を計算する関数は次のように書いてあげればよさそうです。

```
def factorial(n: Int): Int = {
  @annotation.tailrec
  def go(n: Int, acc: Int): Int =
    if (n <= 0) acc
    else go(n-1, n*acc)

  go(n, 1)
}
```

もし末尾再帰になっていないときは次のような挙動になります。

```
scala> @tailrec
     | def f() = "hoge"
<console>:9: error: @tailrec annotated method contains no recursive calls
       def f() = "hoge"
```

末尾再帰なコードはコンパイル後に while ループに置き換えられるためにコールスタックを消費せずにすみます。 普段 Scala のコードを書くとき、全く意識していなかったので気を付けたいと思います。

なお、2015 年 5 月現在の情報では Java のコードは末尾再帰にしてもしなくてもコンパイラが吐くバイトコードは変わらないそうです。 Stream API でがんばりましょう。そのうち対応してくれるんじゃないでしょうか（遠い目）。
