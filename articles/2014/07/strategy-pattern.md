---
title: Strategy Pattern
category: programming
date: 2014-07-01 20:07:33
tags: [Java, デザインパターン]
pinned: false
---

状況・文脈（context）によって動的に振る舞いを変えたいときの定石が Strategy Pattern です．
たとえば各 OS 向けに文字列を出力する`TextPrinter`クラスがあるとします．
ところが各 OS 標準で用いられる改行コードはことなるのでその部分についての振る舞いを OS によって変えなければなりません．
以下はこういう状況のときにありがちなコード例です．

```java
public class TextPrinter {
    private OSType os;
    private String printNewLineChar() {
        if(os == OSType.WINDOWS)
            return //CR+LF
        if(os == OSType.MAC)
            return //CR
        if(os == OSType.UNIX)
            return //LF
        return null;
    }
}
```

往々にして if 文の嵐になります．そこで改行コード出力のふるまいだけを抜き出して，オブジェクトとして扱ってしまおうというのが Strategy Pattern になります（言い過ぎ？）．どの環境下でのふるまいも共通して「改行コードを出力する」という責務を持っているのでインターフェースを決めておくと便利です．今インターフェース Compositor を定義し，その後に各々の環境に応じた実装をしていくと良いです．

```java
interface Compositor {
    pubic String printNewLineChar();
}

public class WindowsCompositor {
    @Override
    public String printNewLineChar() {...};
}

public class MacCompositor {
    @Override
    public String printNewLineChar(){...};
}

public class UnixCompositor {
    @Override
    public String printNewLineChar(){...};
}

public class TextPrinter {
    privte Compositor compositor;
    pubic TextPrinter(Compositor compositor) {
        this.compositor = compositor
    }
    public String printNewLineChar() {
        return compositor.printNewLineChar();
    }
}
```

このようにスッキリしました．今やったことを抽象化した Strategy Pattern のクラス図は以下のようになります．

<img src="http://53ningen.com/wp-content/uploads/2014/07/L-4.png" alt="l-4" width="538" height="280" class="aligncenter size-full wp-image-694" />

> 【参考：GoF 本での定義】アルゴリズムの集合を定義し、各アルゴリズムをカプセル化して、それらを交換可能にする。
> Strategy パターンを利用することで、アルゴリズムを、それを利用するクライアントからは
> 独立に変更することができるようになる。

> アルゴリズム実装のための専用オブジェクトを複数作っておき，その中から使うものだけを動的に選んで実行する。
> ある程度複雑なアルゴリズムになると，ふつうのプログラマであれば，その部分を切り出して集約するだろう。また，他のアルゴリズムに置き変わった時に備えて，互換性も持たせておくだろう。なので，あまり新規性を感じないパターンに思えるかもしれない。とはいえ，アルゴリズムの交換可能性を増すために，共通の基底（または共通のインタフェース）を持たせているという点は注目。（[GoF の 23 のデザインパターンを，Java で活用するための一覧表より](http://d.hatena.ne.jp/language_and_engineering/20120330/p1)）

## Bridge Pattern と Strategy Pattern の違い

よくわからなかったので，GoF 本の適用可能性の欄を参照しました．

> - Bridge Pattern（構造に関するパターン）

    - 抽出されたクラスとその実装を永続的に結合することを避けたい場合．
    - 抽出されたクラスとその実装の両方を，サブクラスの追加により拡張可能にすべき場合
    - 抽出されたクラスの実装における変更が，クライアントに影響を与えるべきではない場合
    - 複数オブジェクトの間で実装を共有したい場合

> - Strategy Pattern（振る舞いに関するパターン）

    - 関連する多くのクラスが振る舞いのみ異なっている場合
    - 複数の異なるアルゴリズムを必要とする場合．
    - アルゴリズムが，クライアントが知るべきではないデータを利用している場合．
    - クラスが多くの振る舞いを定義しており，これらがオペレーション内で複数の条件文として現れている場合．

ここから察するに，Bridge Pattern は継承より委譲を使うことにより，インターフェースとその実装の結合を弱め，「機能」と「実装」を柔軟に拡張できる構造を作りたいときに使うパターン．そして Strategy Pattern は状況に応じ振る舞いが変わるような状況下でその振る舞いの部分を切り出し，クラスの肥大化・複雑化を避けたり，あるいはクラスと振る舞いの結合を弱めるために使われるのではないかと思いました．間違いがあったらご指摘いただけるとありがたいです．

### 参考リンク

- [State パターンと Strategy パターンは何が違うのか考える ](http://lab.tricorn.co.jp/toda/1088)
- [stackoverflow: Strategy vs. Bridge Patterns](http://stackoverflow.com/questions/5863530/strategy-vs-bridge-patterns)
- [【デザインパターン】【GoF】【C#】ストラテージ（Strategy）パターン](http://blogs.yahoo.co.jp/dk521123/24787700.html)
