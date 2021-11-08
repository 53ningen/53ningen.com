---
slug: non-short-circuit-evaluation
title: Javaの短絡評価されない論理演算子
category: programming
date: 2015-11-08 21:52:32
tags: [Java]
pinned: false
---

Javaで論理演算を行うとき、もっぱら `&&` と `||` を利用すると思います。`if (isHoge() && isFoo()) { ... }` 的な感じで。

これらは短絡評価されるので、たとえば `false && true` という式があったとして、前者を評価した時点でこの式全体は `false` が返ることは明らかなので、後者の `true` は評価されません。

こんなコードは読みたくないのですが、もし `boolean` を返すメソッドが副作用を持っていて、短絡評価された場合当たり前ですが、動作に影響がでます。たとえば以下のような最悪な感じのメソッドを考えてみましょう。

```
private static boolean isTrueWithSideEffect() {
    System.out.println("hoge");
    return true;
}

private static boolean isFalseWithSideEffect() {
    System.out.println("foo");
    return false;
}
```

これらを `isTrueWithSideEffect() && isFalseWithSideEffect()` と呼び出したときは、`hoge` と `foo` が出力されます。しかし `isFalseWithSideEffect() && isTrueWithSideEffect()` と呼び出したときは `foo` としか出力されません。

そもそも参照透過にしろよという話ではありますが、Javaにも短絡評価をしない論理演算子が存在することを初めて知った（そもそも、そんな演算子使おうと考えたことがなかった）ので記事にしています。

短絡評価されない論理演算子は `&` と `|` です。これビット演算子だとずっと思っていたので `boolean` に対して使おうという気持ちが一切湧いてこなかった。


これらを用いるとたとえば、 `isTrueWithSideEffect() & isFalseWithSideEffect()` と呼び出したときも、 `isFalseWithSideEffect() & isTrueWithSideEffect()` と呼び出したときも、`hoge` と `foo` が出力されます。

こんなこと知っても全然うれしくないので、副作用を伴う `boolean` を返すメソッドを書くのをまずやめましょう。

