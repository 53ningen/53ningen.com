---
title: データ構造：スタックの理解とJavaでの実装
category: programming
date: 2014-06-10 23:40:39
tags: [Java, アルゴリズム, データ構造]
pinned: false
---

スタックは基本的で重要なデータ構造のひとつ。先頭に対してデータの挿入・削除が行われる順序付きのリストのことを指す。洗い終わった皿を順に上に積み重ねられ、皿が必要なときは一番上から取られていくというようなことを想像していただければそれが、そのままスタックの好例になっている。スタックは後入れ先出し(LIFO:Last In, First Out)や、先入れ後出し(FILO: First In, Last Out)とよばれることもある。

したがってスタックに対しての演算として、次に示す図のように、先頭にデータを挿入するプッシュという操作と、先頭からデータを取り除くポップという操作を定義する必要がある。

![](https://static.53ningen.com/wp-content/uploads/2018/02/17154127/stack.png)

この構造を見てみればわかるかもしれませんが、スタックの実装は連結リストの最上位ノード以外を見ることができない状態にしたものと同じになります。また他にもいくつか実装の方法があります。

### スタックはどのように使われるのか

２つの例を取り上げます。

#### テキストエディタ等のアンドゥ系列

テキストエディタでアンドゥ動作を実現するためには、最後にした編集操作を積み重ねていき、取り出すときには直前にした編集操作がわかる必要があります。

#### 逆ポーランド式（後置式）の評価

[Wikipedia](http://ja.wikipedia.org/wiki/逆ポーランド記法)を見てください。

### スタック ADT

スタックの基本演算として次のようなものが考えられる

- 主要スタック演算
  - push(TYPE data): data をスタックに挿入する
  - TYPE pop(): スタックのトップにある要素を取り出す
- 補助的スタック演算
  - TYPE top(): スタックのトップにある要素を取り出さずに返す
  - int size(): スタックに格納されている要素数を返す
  - boolean isEmptyStack(): スタックが空であるかを返す
  - boolean isFullStack(): スタックが満杯であるかを返す

### スタックの実装方法：連結リスト実装

スタックには主に、連結リストを用いた実装、配列を用いた実装、動的配列を用いた実装の３つがある。ここでは連結リストを用いた実装をまず見てみることにする。なお連結リストについては、「単方向リストの理解と Java での実装」という記事も書いている。基本的はその連結リストとほぼ同様に実装ができる。Java でのコードを次に示す。

```java
/**
 * Stack implementation
 * @param <E> type
 */
public class ListStack<E> {
    private Node<E> top;
    private int size = 0;

    /**
     * dataをスタックに挿入する
     * @param data 挿入したいデータ
     */
    public void push(E data) {
        Node<E> n = new Node<E>(data, top);
        top = n;
        size++;
    }

    /**
     * スタックのトップにある要素を取り出す
     * @return スタックのトップにあったデータ
     */
    public E pop() {
        if(top == null)
            return null;

        E item = top.item;
        top = top.next;
        size--;
        return item;
    }

    /**
     * Stackのノード
     * @param <E> type
     */
    class Node<E>{
        E item;
        Node<E> next;
        public Node(E item, Node<E> next) {
            this.item = item;
            this.next = next;
        }
    }
}
```

連結リストを用いたスタックにおける push(),pop()操作は次の図のようなイメージになる。

![](https://static.53ningen.com/wp-content/uploads/2018/02/17154127/stack.png)

### スタックの実装方法：単純配列実装

```java
package DataStructure;

/**
 * Stack implementation
 * @param <E> type
 */
public class ArrayStack<E> {
    private int top = -1;
    private int size = 0;

    private Object[] array;
    private int stackMaxSize;

    public ArrayStack(int stackMaxSize) {
        this.stackMaxSize = stackMaxSize;
        array = new Object[stackMaxSize];
    }

    /**
     * dataをスタックに挿入する
     * @param data 挿入したいデータ
     */
    public void push(E data) {
        if(size >= stackMaxSize)
            throw new StackOverflowError();

        array[++top] = data;
        size++;
    }

    /**
     * スタックのトップにある要素を取り出す
     * @return スタックのトップにあったデータ
     */
    @SuppressWarnings("unchecked")
    public E pop() {
        if(size < 1)
            return null;

        size--;
        return (E)array[top--];
    }
}
```

配列を用いたスタックにおける push(),pop()操作は次の図のようなイメージになる。

![](https://static.53ningen.com/wp-content/uploads/2018/02/17154127/stack.png)

### 参考になるページなど

- http://www.nishilab.sys.es.osaka-u.ac.jp/people/hijikata/class/comp120.pdf
- http://lecture.ecc.u-tokyo.ac.jp/~yamaguch/prog-cons/2009/adt.html
