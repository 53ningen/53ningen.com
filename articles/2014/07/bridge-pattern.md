---
title: Bridge Pattern
category: programming
date: 2014-07-02 20:01:46
tags: [Java, デザインパターン]
pinned: false
---

## 参考リンク

- [GoF の 23 のデザインパターンを，Java で活用するための一覧表　（パターンごとの要約コメント付き）](http://d.hatena.ne.jp/language_and_engineering/20120330/p1)
- [9. Bridge パターン](http://www.techscore.com/tech/DesignPattern/Bridge.html/)
- [Java8 のインタフェース実装から多重継承と Mixin を考える](http://equj65.net/tech/java8mixin/)
- [Java8 で最もインパクトのある構文拡張、デフォルトメソッド](http://d.hatena.ne.jp/nowokay/20130610)

## 機能と実装の違い

ある数列[1,3,2,5,4]をソートしたいとします．このときソートの方法は何通りかあります．このとき「ソートをする」ということが機能にあたります．そして「ソートをする方法」，たとえばクイックソートやマージソートなどが実装にあたります．クラスを拡張しようとするときには，具体的には「機能の拡張」と「実装の拡張」のいずれかであることが多いです．

## Bridge Pattern が必要になる状況例

[TECSCORE](http://www.techscore.com/tech/DesignPattern/Bridge.html/)にわかりやすい例が載っていたので，それに添って Bridge パターンが必要になるシチュエーションを見てみます．ソート機能を持つ抽象クラス`Soter`に対して，実装クラス`QuickSorter`と`BubbleSorter`を以下のように作成したとします．機能は`Soter`，実装は`QuickSorter`, `BubbleSorter`に分離されていることに注意します．

```java
public abstract class Sorter {
    public abstract void sort(Object obj[]);
}

public class QuickSorter extends Sorter {
    public void sort(Object obj[]){
        // クイックソートで obj[] をソートする
    }
}

public class BubbleSorter extends Sorter {
    public void sort(Object obj[]){
        // バブルソートで obj[] をソートする
    }
}
```

現状のコードに新しい「実装」を増やすことは容易いです．単に`Soter`を extends した実装クラスを書けば良いだけだからです．しかしながら新しい「機能」を増やすためにはどうしたら良いでしょうか．ためしにソートに加え，それにかかった時間を表示する機能を追加したい場合を考えてみます．するとコードは以下のようになります．

```java
public abstract class TimerSorter extends Sorter {
    public void timerSorter(Object obj[]){
        long start = System.currentTimeMillis();
        sort(obj);
        long end = System.currentTimeMillis();
        System.out.println("time:"+(end - start));
    }
}
```

ソートの実装自体は先ほど実装してある`QucickSort`, `BubbleSort`クラスを使いたいとします．しかしながらよくよく考えてみると`TimeSorter`にそれらの実装を与えることができません(Java1.7 以下での話？)．そこで残念ながらそれらの`TimeSorter`に対応した実装クラス`QuickTimeSorter`と`BubbleTimeSorter`を書かなければなりません．図で表すと以下のような具合になります．

<img src="http://53ningen.com/wp-content/uploads/2014/07/L-1.png" alt="l-1" width="538" height="560" class="aligncenter size-full wp-image-686" />

このような状況に上手く対処するために Bridge Pattern が用いられます．

## Bridge Pattern

Bridge Pattern では実装の部分を別の階層に切り離すことによって，これまでに見てきた例のような問題を解決します．まずはコード例を見てみます．

```java
public class Sorter {
    private SortImpl sortImpl;
    public Sorter(SortImpl sortImpl) {
        this.sortImpl = sortImpl;
    }
    public void sort(Object obj[]) {
        sortImpl.sort(obj);
    }
}

public abstract class SortImpl {
    public abstract void sort(Object obj[]);
}

public class QuickSortImpl extends SortImpl {
    public void sort(Object obj[]) {
        // クイックソートで obj[] をソートする
    }
}

public class BubbleSortImpl extends SortImpl {
    public void sort(Object obj[]) {
        // バブルソートで obj[] をソートする
    }
}
```

このように機能を実現するための方法が`SortImpl`に`委譲`されているため，実装の追加はもちろん，機能の追加は容易になります．まとめとして Bridge Pattern のクラス図を示しておきます．

<img src="http://53ningen.com/wp-content/uploads/2014/07/L-2.png" alt="l-2" width="428" height="304" class="aligncenter size-full wp-image-687" />

> 時間経過に伴って機能が拡張されていくバージョンアップの過程と，実装タイプのバリエーションを豊富に広げる品揃えの充実具合を，別個に分けて，整理して管理できる([GoF の 23 のデザインパターンを，Java で活用するための一覧表より](http://d.hatena.ne.jp/language_and_engineering/20120330/p1))

## Java8 での機能と実装の追加について考えてみた．

この部分については個人的に思いついた内容なので，実際に良い方法なのか微妙なところですが，とりあえず書いておきます．Java8 ではインターフェースがデフォルト実装を持てるようになったため，先の例ででてきた`Sorter`を抽象クラスではなくインターフェースとして定義しておけば，「実装の拡張」はもちろん，「機能の拡張」もすっきりおこなえるかなと思いました．ソートにかかる時間を表示する timeSort 機能を追加したあとのクラス的にはこんな具合になると思います．

<img src="http://53ningen.com/wp-content/uploads/2014/07/L-3.png" alt="l-3" width="538" height="290" class="aligncenter size-full wp-image-688" />

現時点でこの方法が抱えている問題は，`Sorter`が抽象クラスではなくインターフェースになったので状態（プロパティ）を持てなくなってしまったという点だと考えていますが，どうでしょうか．
