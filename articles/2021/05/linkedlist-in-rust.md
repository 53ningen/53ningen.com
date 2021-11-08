---
slug: linkedlist-in-rust
title: Rust で単方向 LinkedList を実装する
category: programming
date: 2021-05-05 02:48:16
tags: [データ構造, Rust]
pinned: false
---

個人的に新しい言語を触るときは Hello, World! を終えたら、だいたい単方向 LinkedList などの簡単なデータ構造を実装して、感触をつかんでいくことが多いです（みなさんはいかがですか）。

最近 [WEB+DB PRESS Vol.122](https://amzn.to/3nNgmN0) にミニ RDBMS を実装する記事がでていて、GW はそれをすすめていたのですが、案の定脇道にそれて使用言語である Rust に興味が湧いてしまったので LinkedList を実装してみました。

Rust は公式のドキュメントに LinkedList の実装例が載っていたり、LinkedList を通して言語機能を学べる記事なんかもでていました。

この記事は基本的に [Introduction - Learning Rust With Entirely Too Many Linked Lists](https://rust-unofficial.github.io/too-many-lists/index.html) を参考に概要をメモったり、ちょっと見通しが悪いなと感じた部分を自分なりに整理した適当な文字列です。内容の正確性は保証しませんのでよろしくお願いします。

## LinkedList のデータ構造の定義

再帰的な構造を持つ `enum`, `struct` はそのサイズがコンパイル時に定まらず、エラーとなる

```
pub enum List {
    Empty,
    Elem(i32, List),
}
```

`Box<T>` はヒープ上に置かれた `T` の値へのスマートポインタを表すため、これを用いるとコンパイル時にその構造体や列挙型のサイズは定まる（なぜなら参照先のデータに依存せず、そのポインタのサイズは固定長であるから）

```
#[derive(Debug)]
pub enum List {
    Cons(i32, Box<List>),
    Nil,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        println!("{:?}", List::Nil);  //=> Nil
        println!("{:?}", List::Cons(1, Box::new(List::Nil)));  //=> Cons(1, Nil)
    }
}
```

この構造の問題点は以下の 2 つだが、一見すると 1 と 2 でプラマイゼロのように見える

1. 末尾を表すだけのノード `Nil` にヒープを割り当てている
2. 先頭のノードだけスタックに積まれている

この構造は一見問題なさそうに見えるが、下記のようにリストを分割・結合する際に B の next を null に書き換えたのち、C をスタックにコピーしなくてはならないず、無駄が生じる（なるほど）

```
[] = Stack
() = Heap

[Elem A, ptr] -> (Elem B, ptr) -> (Elem C, ptr) -> (Empty *junk*)

split off C:
[Elem A, ptr] -> (Elem B, ptr) -> (Empty *junk*)
[Elem C, ptr] -> (Empty *junk*)
```

単純に Node が必ずヒープに配置されるような構造に書き換えた場合、以下のように B の next を null 書き換え、新しいポインタが C を指すように変更すれば済む（なるほど！）

```
[ptr] -> (Elem A, ptr) -> (Elem B, ptr) -> (Elem C, *null*)

split off C:
[ptr] -> (Elem A, ptr) -> (Elem B, *null*)
[ptr] -> (Elem C, *null*)
```

とはいえ、空のリストはそもそもヒープを確保する必要がないのだから、根本的にリストは「空のリスト」か「要素を持つリスト」に分類できる。

「空のリスト」はノードを持たない、「要素を持つリスト」は値と後続のリストというデータからあるノードを持つ。

```
List:
[Empty]
[More(&Node)] -> Node(Elem A, List)
```

このような構造をコードに落とすと以下のように表現できる。また、このときの `List` 列挙体は後述の null pointer optimization という仕組みにより型のサイズがコンパクトになる（便利！）。

```
#[derive(Debug)]
pub struct Node {
    elem: i32,
    next: List,
}

#[derive(Debug)]
pub enum List {
    Empty,
    More(Box<Node>),
}
```

ところで通常のリストの実装においては `Node` は外部に公開したくない。そこで `pub` を消し去るという安直な手がすぐに思い浮かぶと思う。

しかしながら `List` は `pub` な列挙体であり、かつ列挙体はその性質上、アイテムのインターフェースを外部に公開しなければならないため、要素のひとつである `More(Box<Node>)` と整合しなくなり、コンパイラからの警告が発生する（確かに！）。

```
warning: private type `Node` in public interface (error E0446)
  --> src/first.rs:10:10
   |
10 |     More(Box<Node>),
   |          ^^^^^^^^^
   |
   = note: `#[warn(private_in_public)]` on by default
   = warning: this was previously accepted by the compiler but is being phased out; it will become a hard error in a future release!
   = note: for more information, see issue #34537 <https://github.com/rust-lang/rust/issues/34537>
```

その一方で、構造体であればマークしない限りフィールドは外部に公開されないため、`LIst` を構造体にして、これまで定義していた列挙体ごと隠蔽してあげる形をとれば無事解決となる。

```
#[derive(Debug)]
struct Node {
    elem: i32,
    next: List,
}

#[derive(Debug)]
enum Link {
    Empty,
    More(Box<Node>),
}

#[derive(Debug)]
pub struct List {
    head: Link,
}
```

また、このとき List はひとつのフィールドしか持たず、この構造体のサイズはフィールドである head、つまり Link 列挙体と同じサイズになるらしい（便利！）。これはゼロコスト抽象化の一例らしい。

```
let xs = List { head: Link::Empty };
let ys = List {
    head: Link::More(Box::new(Node {
        elem: 1,
        next: List { head: Link::Empty },
    })),
};

println!("{:?}", xs);  //=> List { head: Empty }
println!("{:?}", ys);  //=> List { head: More(Node { elem: 1, next: List { head: Empty } }) }
```

## 列挙体がどのようにメモリ上に配置されるか

以下のような `enum` を定義したとき、どのタグ（D1〜Dn）であるかというフラグと、各タグにおけるデータ（T1〜Tn のうち最も大きいサイズ）を格納する領域が必要となる。また、それに加えて alignment の要件を満たす必要がある。

```rust
enum Hoge {
    D1(T1)
    ...
    Dn(Tn)
}
```

このあたりの細かい解説は [repr(Rust)](https://doc.rust-jp.rs/rust-nomicon-ja/repr-rust.html) にとても丁寧に記載されている。

ところで、次のような enum があったとする。

```
enum Option<&T> {
    None,
    Some(&T),
}
```

この場合、最低限タグとポインタを格納する領域が必要となる。しかし、`&T` はポインタであり決してゼロにならない。すると 0 埋めされているときに `None`、それ以外のときに `Some` であると解釈することも可能であり、このときタグを明示的に記憶しておく必要がない。

Rust ではこのようなケースにきちんと最適化を行ってくれるらしい。そのあたりの詳細は以下のページに詳しく書かれていてとても参考になる。今度、手元環境でもちゃんと検証してみたい。

- [Option 型と Null Pointer Optimization - yohhoy の日記](https://yohhoy.hatenadiary.jp/entry/20160908/p1)
- [Optimized enum sizes in Rust | Anthony’s blog](https://adeschamps.github.io/enum-size)
- [Rust のゼロコスト抽象化の効果をアセンブラで確認](https://blog.rust-jp.rs/tatsuya6502/posts/2019-12-zero-cost-abstraction/)

## 簡単なメソッドの実装

- `List` を作成する便利メソッド: `new`, `from` を生やす
- `[T]` の head は `first() -> Some(T)`、tail は `[1..]` で取れる
  - 配列が空の場合も `[1..]` は `[]` を返してくれる親切設計

```
impl List {
    pub fn new() -> Self {
        List { head: Link::Empty }
    }

    pub fn of(head: i32, tail: List) -> List {
        List {
            head: Link::More(Box::new(Node {
                elem: head,
                next: tail,
            })),
        }
    }

    pub fn from(xs: &[i32]) -> Self {
        match xs.first() {
            Some(head) => List::of(*head, List::from(&xs[1..])),
            None => List::new(),
        }
    }
}
```

- `is_empty`, `len` を生やす
  \*\* `is_empty` は `std::matches` という[ベンリマクロ](https://doc.rust-lang.org/std/macro.matches.html)を使うと簡単に書ける
- Rust において self は `self`, `&mut self`, `&self` の 3 種類があり、独特なため訓練が必要
  \*\* `len()` の場合は `&self` が適切

```
impl Link {
    pub fn len(&self) -> u32 {
        match self {
            Link::Empty => 0,
            Link::More(node) => 1 + node.next.len(),
        }
    }
}

impl List {
    pub fn is_empty(&self) -> bool {
        matches!(self.head, Link::Empty)
    }

    pub fn len(&self) -> u32 {
        self.head.len()
    }
}
```

上記のメソッドについての簡単なテストは以下のような感じ

```
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_len() {
        assert_eq!(List::new().len(), 0);
        assert_eq!(List::from(&[0]).len(), 1);
        assert_eq!(List::from(&[0, 1]).len(), 2);
        assert_eq!(List::from(&[0, 1, 2]).len(), 3);
        assert_eq!(List::from(&[0, 1, 2, 3]).len(), 4);
        assert_eq!(List::from(&[0, 1, 2, 3, 4]).len(), 5);
        assert_eq!(List::from(&[0, 1, 2, 3, 4, 5]).len(), 6);
    }

    #[test]
    fn test_is_empty() {
        assert_eq!(List::new().is_empty(), true);
        assert_eq!(List::from(&[0]).is_empty(), false);
        assert_eq!(List::from(&[0, 1]).is_empty(), false);
        assert_eq!(List::from(&[0, 1, 2]).is_empty(), false);
    }
}
```
