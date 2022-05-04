---
title: Scalaの末尾再帰除去を確認する
category: programming
date: 2015-08-04 16:05:54
tags: [Java, Scala]
pinned: false
---

Scala の末尾再帰除去を実際に jad を使って確かめただけの簡単な記録。 jad の導入は以下のとおり。

```bash
brew tap homebrew/binary
brew install jad
```

簡単な階乗関数で確認すればわかりやすい

```
object Math {

  def fact(n: Int): Int =
  if (n < 2) 1
  else n * fact(n - 1)

  def fact2(n: Int): Int = {
    def go(n: Int, acc: Int): Int = {
        if (n < 2) acc
        else go(n -1, n * acc)
    }
    go(n, 1)
  }

}
```

こんなのをコンパイルして jad でどうなっているか確認します。以下その結果。

```
public final class Math$
{

    public int fact(int n)
    {
        return n >= 2 ? n * fact(n - 1) : 1;
    }

    public int fact2(int n)
    {
        return go$1(n, 1);
    }

    private final int go$1(int n, int acc)
    {
        do
        {
            if(n < 2)
                return acc;
            acc = n * acc;
            n = n - 1;
        } while(true);
    }

    private Math$()
    {
    }

    public static final Math$ MODULE$ = this;

    static
    {
        new Math$();
    }
}
```

fact はそのまんま、fact2 はちゃんと末尾再帰除去されている様子が見て取れます

# Java ではどうなのか

Java で同じことをしてみる

```
public class Math {

    public int fact(int n) {
        if (n < 2) return n;
        else return n * fact(n - 1);
    }

    public int fact2(int n) {
        return go(n, 1);
    }

    private int go(int n, int acc) {
        if (n < 2) return acc;
        else return go(n - 1, n * acc);
    }

}
```

こいつは以下のような残念な結果に

```
public class Math
{

    public Math()
    {
    }

    public int fact(int i)
    {
        if(i < 2)
            return i;
        else
            return i * fact(i - 1);
    }

    public int fact2(int i)
    {
        return go(i, 1);
    }

    private int go(int i, int j)
    {
        if(i < 2)
            return j;
        else
            return go(i - 1, i * j);
    }
}
```

こいつをどうするかについては次の URL が詳しい

- [http://backpaper0.github.io/ghosts/optimized_tail_call_recursive_fibonacci_in_java.html](http://backpaper0.github.io/ghosts/optimized_tail_call_recursive_fibonacci_in_java.html)
