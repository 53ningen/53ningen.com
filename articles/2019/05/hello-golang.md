---
title: Golang ことはじめ
category: programming
date: 2019-05-03 06:35:26
tags: [Golang]
pinned: false
---

- 5/2 から Golang を書き始めた
- つまづいて、調べて解決した点をメモっていく
- 言語学習の過程が記録として残る
- 間違っている可能性が大いにあるので、この記事は自分向けです

## REPL 的なものはないの

[gore](https://github.com/motemen/gore) なるものがあるようだ

インストール方法

```
$ go get -u github.com/motemen/gore/cmd/gore
$ go get -u github.com/mdempsky/gocode   # for code completion
$ go get -u github.com/k0kubun/pp        # or github.com/davecgh/go-spew/spew
$
$ gore
```

## 依存モジュール管理ツール

Godeps なるものがあるらしい

```
$ go get github.com/tools/godep
```

## go のバージョン管理システム

[goenv](https://github.com/syndbg/goenv) なるものがあるらしい

```
$ brew install goenv
$ goenv install -l
Available versions:
  1.2.2
  1.3.0
  1.3.1
  1.3.2
  1.3.3
...

$ echo 'eval "$(goenv init -)"' >> ~/.bash_profile
$ echo 'export GOPATH=$HOME/go' >> ~/.bash_profile
$ echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bash_profile
$ source ~/.bash_profile
$
$ goenv install 1.11.4
...
$ goenv rehash
$ goenv global 1.11.4
$ go version
go version go1.11.4 darwin/amd64
```

## string? みたいなのを実現したい

- optional なフィールドをどう表現するのという話
- どうやら以下のようにやっていく模様？

```
type Input struct {
 name string
 age  *int
}

func main() {
 age := 10
 i1 := Input{"John", &age}
 fmt.Println(i1) //=> {John 0xc000083458}
 i2 := Input{"Jack", nil}
 fmt.Println(i2) //=> {Jack <nil>}
}
```

## ISO8601 の日付 string を取得したい

```
func main() {
 now := time.Now().Format(time.RFC3339)
 fmt.Println(now) //=> 2019-05-02T15:42:15Z
}
```

## 時刻の足し算・引き算

```
gore> :import time
gore> now := time.Now()
2019-05-03 01:27:30 Local
gore> now.Add(time.Hour)
2019-05-03 02:27:49 Local
gore> now.Add(24 * time.Hour)
2019-05-04 01:28:42 Local
```

## string2int, int2string

```
gore> strconv.Atoi("1")
1
nil
gore> strconv.Atoi("hoge")
0
&strconv.NumError{
  Func: "Atoi",
  Num:  "hoge",
  Err:  &errors.errorString{
    s: "invalid syntax",
  },
}

gore> strconv.Itoa(2)
"2"
```

## 変数・定数定義のシンタックス

```
gore> var i int = 1
1
gore> var j = 2
2
gore> k := 3
3

# 変数宣言時に値はゼロ初期化されている
gore> var s string
gore> s
""
gore> var i int64
gore> i
0

# 定数
gore> var hoge = 1
1
gore> hoge = 2
2
gore> const fuga = 3
3
gore> fuga = 4
cannot assign to fuga
```

## ポインタと参照まわり

```
a := 1
var pa *int
pa = &a
fmt.Println(pa)  //=> <addr01>
fmt.Println(*pa) //=> 1

ppa := &pa
fmt.Println(**ppa) //=> 1
```

関数に値を渡したときのふるまい

```
package main

import "fmt"

type dog struct {
 name string
}

func main() {
 john := dog{name: "john"}
 fmt.Printf("%p\n", &john) //=> addr01
 michel := rename(john, "michel")
 fmt.Printf("%p\n", &john)   //=> addr01
 fmt.Printf("%p\n", &michel) //=> addr03
}

func rename(d dog, newName string) (ret dog) {
 fmt.Printf("%p\n", &d) //=> addr02 (copied)
 d.name = newName
 return d
}
```

## スコープ

変数・定数・関数に対して統一的に以下のとおり

- キャメルケース: パッケージスコープ
- パスカルケース: パブリック

## 関数の定義

```
gore> func add(x int, y int) int {
.....         return x + y
..... }
gore>
gore> add(1, 2)
3

gore> func calc(x int, y int) (add int, sub int, mul int) {
.....         return x + y, x - y, x * y
..... }
gore> i, j, k := calc(2, 3)
5
-1
6
gore> i
5
gore> j
-1
gore> k
6

// こんな記述もできる
gore> func calc(x int, y int) (hoge int, fuga int, piyo int) {
    hoge = x + y
    fuga = x - y
    piyo = x * y
    return
gore> calc(1, 2)
3
-1
2
```

## Goroutine のさわり

- [Go の並行処理 - Block Rockin’ Codes](http://jxck.hatenablog.com/entry/20130414/1365960707)

```
package main

import (
 "fmt"
 "runtime"
 "time"
)

func heavyProcessA() {
 fmt.Println("A: work hard!!")
 time.Sleep(time.Second)
 fmt.Println("A: finished work!!")
}

func heavyProcessB() {
 fmt.Println("B: work hard!!")
 time.Sleep(500 * time.Millisecond)
 fmt.Println("B: finished work!!")
}

func main() {
 go heavyProcessA()
 go heavyProcessB()
 fmt.Println("task scheduled: A, B")

 for runtime.NumGoroutine() != 1 {
 }
 fmt.Println("Exit 0")
}

/*
task scheduled: A, B
B: work hard!!
A: work hard!!
B: finished work!!
A: finished work!!
Exit 0
*/
```

## channel

- 値がくるまで待つ
- async/await 的なものを Golang で実現する方法

```
package main

import (
 "fmt"
 "time"
)

func calcOnePlusOne(result chan int) {
 fmt.Println("1+1: thinking...")
 time.Sleep(time.Second)
 fmt.Println("1+1=2")
 result <- 1
}

func calcOnePlusTwo(result chan int) {
 fmt.Println("1+2: thinking...")
 time.Sleep(500 * time.Millisecond)
 fmt.Println("1+2=3")
 result <- 3
}

func main() {
 onePlusOne := make(chan int)
 onePlusTwo := make(chan int)
 go calcOnePlusOne(onePlusOne)
 go calcOnePlusTwo(onePlusTwo)
 fmt.Println("task scheduled")

 res := <-onePlusOne + <-onePlusTwo
 fmt.Println(res)
 fmt.Println("finished")
}

/*
task scheduled
1+2: thinking...
1+1: thinking...
1+2=3
1+1=2
4
finished
*/
```

C# に翻訳すると以下のようなものと同じようなふるまいに見える

```
onePlusOne = await CalcOnePlusOne();
onePlusTwo = await CalcOnePlusTwo();
var res = onePlusOne + onePlusTwo
```

## 三項演算子ないの

- ない
- [Ternary operator](https://groups.google.com/forum/#!msg/golang-nuts/w1dPeHFSp9g/cMjgL76B7jIJ)

var str = cond ? "hoge" : null;

```
var s *string
if cond {
    t := "hogefuga"
    s = &t
}
```

## int の最大値

```
gore> math.MaxInt64
9223372036854775807
```

## MD5

```
gore> :import "crypto/md5"
gore> md5.Sum([]byte("hoge"))
[16]uint8{
  0xea, 0x70, 0x3e, 0x7a, 0xa1, 0xef, 0xda, 0x00, 0x64, 0xea, 0xa5, 0x07, 0xd9, 0xe8, 0xab, 0x7e,
}
```

## 構造体にメソッドを定義する

```
type user struct {
 name string
}

func (u user) sayHello() string {
 return "Hello! My name is " + u.name
}

// a-zA-Z0-9
func main() {
 u := user{"john"}
 fmt.Println(u.sayHello())
}
```

## メソッド呼び出しと簡略系

[Go プログラミング言語仕様 - golang.jp](http://golang.jp/go_spec#Calls)

> メソッド呼び出し x.m()は、x(の型)のメソッド群が m を含んでいて、かつ引数リストが m の引数リストに代入可能なときに有効となります。また x がアドレス指定可能であり、&x のメソッド群が m を含んでいるならば、x.m()は、(&x).m()の簡略形として使用可能です。

```
type Animal struct {
 name string
}

func (a *Animal) Greet(yourName string) string {
 return fmt.Sprintf("Hello, {0}. My name is {1}", yourName, (*a).name)
}


a := Animal{name: "John"}
a.Greet("Ken")      //=> (&a).Greet("Ken") とコンパイラが解釈する
(&a).Greet("Ken")   //=> 定義通り呼び出せる
```
