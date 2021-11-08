---
slug: hello-rust
title: Rust の基本的な文法メモ
category: programming
date: 2021-05-21 03:07:35
tags: [Rust]
pinned: false
---

[Introduction - Rust By Example 日本語版](https://doc.rust-jp.rs/rust-by-example-ja/index.html) を見ながら Rust の基本文法をおさらいする

## 変数

- 変数はデフォルトでイミュータブル
- ミュータブルにしたい場合は `mut` キーワードを用いる
- 宣言と定義を別々に行うことも可能

```
let x = 1;
// x = 2;  => Error

let mut y = 1;
let y = 2;

let z;
z = 123;
```

- 例えば標準入力からデータを受け取る `io::stdin.read_line` は引数に `mut &String` をとる

```
let mut input = String::new();
io::stdin().read_line(&mut input).expect("Error");
println!("Input value: {}", input);
```

## 関数とテスト

- 関数は `fn` キーワードで定義できる
  - 明示的な return は必要なく、最後に評価された式が返却される
- テストは同一のファイルに記述できる

```
pub fn add(a: u64, b: u64) -> u64 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        let value = add(1, 2);
        assert_eq!(value, 3);
    }
}
```

## 配列とタプル

- コンパイル時にサイズが決定される配列がある
- Tuple が標準の言語機能として存在する

```
let xs: [i32; 2] = [1, 2];
println!("{}", xs.len()); //=> 2

let a = (1, 2);
let b: i32 = a.0 + a.1;
let c: i32 = b.pow(2);
```

## 構造体・列挙体・定数

- カスタム型は構造体 `struct` と 列挙型 `enum` として定義できる
- 定数は `const` あるいは `static` というキーワードで定義できる

```
// Unit
struct Nil;
let _nil = Nil;

// Named Tuple
struct Pair(i32, i32);
let pair = Pair(1, 2);

// Classical Struct
struct Point {
    x: f32,
    y: f32,
}
let p = Point { x: 0.1, y: 0.2 };

// Enum
enum Event<T> {
    Next(T),
    Error,
    Complete,
}
impl<T> Event<T> {
    fn echo(&self) {
        match self {
            // Self は Event の type alias
            Self::Next(_) => println!("Next"),
            Self::Error => println!("Error"),
            Self::Complete => println!("Complete"),
        }
    }
}
```

- struct や enum などは実装（メソッド）を持てる
- メソッドのインターフェースを定める `trait` という言語機能もある

```
struct Adder {
    a: u32,
    b: u32,
}

impl Adder {
    fn new(a: u32, b: u32) -> Self {
        Adder { a, b }
    }

    fn calc(&self) -> u32 {
        (*self).a + (*self).b
    }
}

fn main() {
    let x = Adder::new(1, 3);
    println!("1 + 3 = {:?}", x.calc());  //=> 4
}
```

- インスタンスメソッドの引数 `self` には次の 3 つの種類がある
  - `&self`: インスタンスメソッド
  - `&mut self`: 該当のオブジェクトがミュータブルである必要のあるインスタンスメソッド
  - `self`: オブジェクトのリソースを消費するインスタンスメソッド

```
struct Counter {
    value: u32,
}

impl Counter {
    fn new() -> Self {
        Counter { value: 0 }
    }

    fn add(&mut self) {
        self.value += 1;
    }

    fn peek(&self) -> u32 {
        self.value
    }

    fn destory(self) {
        // do nothing
    }
}

fn main() {
    let immutable_counter = Counter::new();
    println!("count: {:?}", immutable_counter.peek());
    // immutable_counter.add(); => ERROR
    // ミューテーションを起こすメソッドをコールするためには変数を let mut で宣言する必要がある
    // ただしオブジェクトの所有権を受け渡すような操作は受け付ける
    immutable_counter.destory();
    // println!("count: {:?}", counter.peek()); => moved out したあとのオブジェクトは操作できない

    let mut counter = Counter::new();
    println!("count: {:?}", counter.peek());
    counter.add();
    println!("count: {:?}", counter.peek());
    counter.add();
    println!("count: {:?}", counter.peek());
    counter.add();
    println!("count: {:?}", counter.peek());
    counter.destory(); //=> `counter` moved due to this method call
    println!("count: {:?}", counter.peek()); //=> Error: this function takes ownership of the receiver `self`, which moves `counter`
}
```

## Box

- Rust はすべての値をデフォルトでスタックに割り当てる
- `Box<T>` を作成することにより値をヒープに割り当てられる
  - これはヒープ上に置いている `T` の値への単なるスマートポインタ
  - スコープを抜けるとデストラクタがコールされてヒープメモリが解放される
  - オペレータ `*`によりデリファレンスできる

```
fn main() {
    let boxed_number: Box<u128> = Box::new(1);
    let number: u128 = *boxed_number;
    println!("size: {:?}", mem::size_of_val(&boxed_number)); //=> size: 8(ポインタのサイズ)
    println!("size: {:?}", mem::size_of_val(&number)); //=> size: 16(128 bit = 8 bit * 16)
}
```

## スコープとシャドーイング

- 変数のシャドーイングも可能

```
fn main() {

    let x = 123;
    {
        let x = 234;
        println!("{:?}", x); //=> 234
    }
    println!("{:?}", x); //=> 123
}
```

## リテラル

- 数値の末尾に `i`, `u`, `f` などを置いて型を指定できる

```
let a = 12i8;
let b = 1234i16;
let c = 1234i32;
let d = 1234i64;
let e = 1234u128;
let f = 1234f32;
```

## クロージャ

```
let f = |x| x + 1;
let res = f(1);
println!("{}", res); //=> 2
```

つづきはここから（作業メモ）
https://doc.rust-jp.rs/rust-by-example-ja/conversion.html
