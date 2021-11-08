---
slug: singly-linked-linear-list
title: 単方向リストの理解とJavaでの実装
category: programming
date: 2014-05-18 23:24:23
tags: [Java, アルゴリズム, データ構造]
pinned: false
---

線形単方向リスト(Singly-linked linear list)は、最も基本的なデータ構造のひとつです。また色々なデータ構造に対する考え方の基礎を学ぶことができるので良い題材です。 Java の java.util.LinkedList はその実装を見てみれば分かる通り双方向(Doubly)連結リストなので、これを参考にしながら単方向リストについてざっくりと実装をして、理解を深めました。

### データ構造入門：基礎用語と概念の確認

単方向リストについて考える前に、データ構造とアルゴリズム全般の基礎知識を確認しておきましょう。

- データ構造(Data Structure) とは
  - データを効率的に使用できるように組織化する方法。配列、ファイル、連結リスト、スタック、キュー、木、グラフなど
  - 線形データ構造 要素は順番にアクセスされる。データが連続している必要はない。
  - 非線形データ構造 木、グラフなど
- 抽象データ型(ADT, abstract data type) とは
  - 基本データ型は基本演算を暗黙的にサポートしているが、同様にユーザ定義型についても演算を定義する必要がある。 一般にデータ構造とその演算を組み合わせて、抽象データ型と呼ぶ。
- アルゴリズム(algorithm) とは
  - 問題を解決するための段階ごとの指示
- O-表記法(Big-O notation) とは
  - アルゴリズムの厳密な上限を与える。f(n) = O(g(n))と書き十分大きな n では f(n) = g(n)とみなせる。

### 連結リストの要件

連結リストとは、連続した要素がポインタでつながれていて、最後の要素が null であるもの。 実行中にサイズを増減でき、メモリを無駄遣いしないという特徴がある（配列は要素がない状態のときでもメモリを消費している）。

#### 抽象データ型としての連結リスト

- 主要連結リスト演算
  - 挿入
  - 削除
- 補助的連結リスト演算
  - リスト削除
  - リストの要素を返す
  - その他

#### 配列との比較

- 配列の利点
  - 単純で使いやすい
  - 要素に高速アクセス: O(1)
- 配列の欠点
  - 固定サイズ（動的配列で解決）
  - メモリ割当ができないときがある
  - 挿入が大変
- 連結リストの利点
  - 定数時間 O(1)で拡張できる
  - 個々の要素へのアクセスが最悪時 O(n)

### 単方向リストのノード

```
単方向リストのイメージ図
[データ|ポインタ] => [データ|ポインタ] => [データ|null]
```

単方向リストのノード構造は非常にシンプルです。 値と次のノードへのポインタという２つの要素しかありません。 コードで書くと次のような具合。

```java
public class SinglyLinkedList{
    private static class Node<E> {
        E item;
        Node<E> next;

        Node(E element, Node<E> next) {
            this.item = element;
            this.next = next;
        }
    }

    private int size = 0;
    private Node<E> first = null;   // リストの先頭要素を指すポインタ
}
```

サイズを保持しておくと、ノードの追加・削除時に便利です。 またリストの先頭ノードを示すポインタも保持しておかなければなりません。

### リストの横断

リストを横断する処理は単純に各ノードの next を参照することを繰り返せば良いです。 null が出てきた時点でリストの末尾に達したことになります。

まずはあえてリストを横断して要素数を数えるメソッドを定義してみます。 本来は size で保持しているのですが、今回はリストの横断を見るために書いてみます。

```java
    /**
     * 単方向リストを横断して要素数を返す
     * 時間計算量:O(n)
     * 空間計算量:0(1)
     *
     * @param head 横断を始めるノード
     * @return 要素数
     */
    private int length(Node<E> head) {
        Node<E> current = head;
        if (current == null) return 0;

        int count = 1;
        while (current.next != null) {
            count++;
            current = current.next;
        }
        return count;
    }
```

また、指定された位置のノードを取得するメソッドも定義しておきます。

```java
    /**
     * 与えられた整数値がリストのインデックスとして有効か判断する
     *
     * @param index 判定する整数値
     * @return 与えられた整数値が有効であるのか
     */
    private Boolean isPositionIndex(int index) {
        return 0 <= index && index <= size;
    }

    /**
     * 指定された位置のNodeを返す
     *
     * @param index 欲しいNodeの位置を表す整数
     * @return 要求されたNode
     * @throws IndexOutOfBoundsException
     */
    private Node<E> node(int index) {
        if (!isPositionIndex(index)) throw new IndexOutOfBoundsException();

        Node<E> current = first;
        for (int i = 0; i < index; i++)
            current = current.next;

        return current;
    }
```

### リストへの挿入

なんかあまりきれいじゃない気がするけどこんな感じで書きました。

```java
    /***************************************************
     * ノードのlink・unlinkメソッド
     * 前後のnullチェックなどは行わず、
     * 低レベルのlink・unlinkのみを行う。
     ***************************************************/
    /**
     * 指定されたノードに新しい要素のノードをリンクする
     *
     * @param node     リンク元のノード
     * @param nextNode リンクを張りたいノード
     */
    private void link(Node<E> node, Node<E> nextNode) {
        node.next = nextNode;
    }

    /**
     * 与えられたノードが保持する、次のノードとアイテムへのポインタを削除する
     *
     * @param node リンクを断ち切りたいノード
     */
    private void unlink(Node<E> node) {
        node.item = null;
        node.next = null;
    }

    /***************************************************
     * 単一連結リストの挿入
     ***************************************************/
    /**
     * リストの先頭に要素を追加する
     * 時間計算量:O(1)
     * 空間計算量:O(1)
     *
     * @param element 追加したい要素
     * @return 追加後のリスト
     */
    public SinglyLinkedList<E> addFirst(E element) {
        if (first == null)
            first = new Node<E>(element, null); //リストが空だったとき
        else
            this.first = new Node<E>(element, this.first);

        size++;
        return this;
    }

    /**
     * リストの末尾に要素を追加する
     *
     * @param element 追加したい要素
     * @return 追加後のリスト
     */
    public SinglyLinkedList<E> addLast(E element) {
        if (size == 0) return addFirst(element);
        return add(size, element); // sizeのカウントアップはadd(int, E)で行う
    }

    /**
     * リストの指定位置に要素を追加する
     *
     * @param index   要素を追加したい位置
     * @param element 追加したい要素
     * @return 追加後のリスト
     * @throws IndexOutOfBoundsException
     */
    public SinglyLinkedList<E> add(int index, E element) {
        if (!isPositionIndex(index)) throw new IndexOutOfBoundsException();
        if (index == 0) return addFirst(element);

        Node<E> beforeNewNode = node(index - 1);
        link(beforeNewNode, new Node<E>(element, beforeNewNode.next));

        size++;
        return this;
    }
```
