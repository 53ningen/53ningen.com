---
title: Haskell 基本構文のまとめ
category: programming
date: 2015-05-03 21:55:19
tags: [Haskell]
pinned: false
---

すごい Haskell 楽しく学ぼうの１〜５章の内容をまとめました。

# Haskell とは何か

- 純粋関数型プログラミング言語
  - 副作用を持たない．関数に出来ることは，何か計算をしてその結果を返すことだけ．
  - これにより関数は同じ引数である限り，必ず同じ値を返す`参照透過性`を持つ．
- 遅延評価
  - 関数の結果が与えられた引数にだけ依存しているのでいつ計算するか気にする必要がなくなる．したがって Haskell ではギリギリまで計算を引き延ばす．
- 静的型付け言語
  - コンパイル時におかしいところが分かる
- 型推論
  - a = 5 \* 4 としたとき a は明らかに数．こういったことを Haskell の型システムが判断してくれる．
- エレガントで簡潔
  - 高度な概念をふんだんにつかっているらしい

# 1. Starting Out

## GHC 対話モードで遊んでみる

とりあえず基本演算をやってみる

```
ghci> -- 四則演算
ghci> 1 + ( 2 * 3 ) / 4 - 5
-2.5
ghci> -- ブール代数
ghci> not (True && False || True) == False
True
ghci> True /= True
False
```

す，すげー！！（棒）

## 関数まわり

### 関数呼び出し

- `*`は関数. 特にこの場合`中置関数`．
- ほとんどの関数は前置関数．
  - 例: succ（後者を返す） `succ 8 => 9`
  - 例: mix, max `max 8 9 => 9` `min 8 9 => 8`
- バッククォートで中置関数にできる
  - 例: `` 8 `max` 9 => 9 ``

### 関数定義

- `if`文も使えるが`else`は必須
  - Haskell の if は必ず値を返す．式扱い．

```
ghci> let doubleMe x = x + x
ghci> doubleMe 10
20
ghci> doubleMe 1.5
3.0
ghci> --if文も使える 例：100より大きいときTrue, そうでなければFalseを返す関数
ghci> let isGraterThan100 x = if x > 100 then True else False
ghci> isGraterThan100 100
False
ghci> isGraterThan100 100.1
True
```

## Haskell のリスト

### リストに用いることのできる演算子

- 同じ型の要素を格納できる
- append は`++`演算子
  - 中置演算子
  - 同じ型のリストを引数に取る．
  - 一つ目の引数の最後まで操作する
- prepend は`:`(cons)演算子で行う．
  - 中置演算子
  - 第一引数は第二引数で渡すリストの型の単一要素
  - 第二引数はリスト
- 要素の取得は`!!`演算子
- リストはネストできる
- リスト同士に比較演算子も使える
  - 各要素を辞書順で比較していく

```
ghci> let fibonacciNums1 = [1,1,2,3,5,8,13]
ghci> let fibonacciNums2 = [21,34,55]
ghci> let fibonacciNums = fibonacciNums1 ++ fibonacciNums2
ghci> fibonacciNums
[1,1,2,3,5,8,13,21,34,55]
ghci> 55 : fibonacciNums
[55,1,1,2,3,5,8,13,21,34,55]
ghci> fibonacciNums !! 0
55
```

### リストの持つ関数

すべて前置関数

- 先頭の要素を返す `head`
- 先頭を取り除いた残りのリストを返す `tail`
- 最後の要素を返す `last`
- 最後を取り除いた残りのリストを返す `init`
- 長さを返す `length`
- 空かどうかを返す `null`
- リストを逆順にする `reverse`
- 先頭から指定された数の要素を取り出す `take`
- 先頭から指定された数の要素を取り除いたリストを返す `drop`
- 順序付けされた要素の最大値を返す `maximum`
- 順序付けされた要素の最小値を返す `minimum`
- 和を返す `sum`，積を返す `product`
- 要素とリストを受け取りリストに要素があるかを返す `elem`

```
ghci> tail [1,2,3,4,5]
[2,3,4,5]
ghci> 3 `elem` [1,2,3,4,5]
True
ghci> 6 `elem` [1,2,3,4,5]
False
```

### リストとレンジ

※浮動小数点数を使うとおかしな挙動をするので気をつける

- Haskell では自然数のリストを簡単に作れる
  - 例えば，1 から 20 までの数であれば`[1..20]`と書けばよい．
- ステップの指定も出来る
  - 例えば，3 の倍数は`[3,6..99]`と書ける
- 上限を指定しないことにより無限リストを作れる
  - Haskell は遅延評価なので無限リスト全体をすぐには評価しない
  - すぐに評価したい場合は`cycle [2,4..]`と書く．
- 一つの要素が無限に繰り返されるリストを作る `repeat`がある
- 一つの要素を指定回数繰り返すリストを作る `replicate`がある

```
ghci> [1..8]
[1,2,3,4,5,6,7,8]
ghci> [3,6..33]
[3,6,9,12,15,18,21,24,27,30,33]
ghci> take 10 (cycle[2,4..])
[2,4,6,8,10,12,14,16,18,20]
ghci> replicate 4 5
[5,5,5,5]
```

### リスト内包表記

- 数学っぽくリストを書けちゃう仕組み
- 例えば `{∀2*x , x ∈ N, x ≦ 5}`は`[2*x | x <- [1,2,3,4,5]]`と書ける
- 内包表記の条件（述語）は複数指定できる．これを`フィルタする`という．
- フィルタに便利な`even`, `odd`関数がある．それぞれ偶数か，奇数かを判断する
- リスト内包表記はネストできる

```hs
ghci> [x + 2*y| x<-[1,2,3] , y <-[1,2,3] , x + 4*y < 10]
[3,5,4,5]
```

重複をなくしたいときは次のようにする．対話モードだと List モジュールが読み込めない...

```
import List
nub [x + 2*y| x<-[1,2,3] , y <-[1,2,3] , x + 4*y < 10]
```

## タプル

- 複数の違う型の要素を格納して，一つの値として扱える
  - 複数の違う型を格納できることを`ヘテロ`であるという
- 括弧で囲み，要素をカンマで区切る 例：`(1,"string", 'c',3.14)`
- 要素数の違うタプルは，違う型として扱われる．
  - これはリストとの大きな違いになる．
- タプルは固定長

### ペアに対する関数

- ペアの 1 つ目の要素を返す `fst`がある
- ペアの 2 つ目の要素を返す `snd`がある
- 二つのリストを受け取り，ペアのリストを生成する `zip`がある

```
ghci> fst (1, 5)
1
ghci> snd (1, 5)
5
ghci> zip [1,2,3,4,5] [2,4,6,8,10]
[(1,2),(2,4),(3,6),(4,8),(5,10)]
ghci> zip [1..10][100,200..1000]
[(1,100),(2,200),(3,300),(4,400),(5,500),(6,600),(7,700),(8,800),(9,900),(10,1000)]
```

## GHCi について

- `:set +m` で複数行の式が書けるようになる
- `:{` と `:}` で囲むと複数行の式が書けるようになる
- `:quit` で GHCi を終了できる
- `:t <expr>` で式の型を得られる

# 2. Types and Typeclasses

## 一般的な Haskell の型

`:t <expr>` で式の型を得られる

- `Int` 整数型．有界．64 ビット CPU では Mix:-2^63 Max:2^63-1．
- `Integer` 整数型．非有界であるが`Int`の方が効率的．
- `Float` 単精度浮動小数点数
- `Double` 倍精度浮動小数点数
- `Bool` 真理値型
- `Char` Unicode 文字．文字のリストは文字列になる．

## 型変数

- head 関数ははあらゆる型のリストに対して機能する．
- こういった関数は型変数を用いて実装できる．型変数は適当な英小文字．
  - たとえば`a`とか`b`とか．詳細は下記コード例を参照．
- 型変数を用いた関数を`多相的関数`とよぶ．
- 他言語のジェネリクスにちょっと似ている．

```
ghci> -- headはあらゆる型のリストに対して機能する
ghci> head [1,2,3,4]
1
ghci> head ["abc","def","ghi"]
"abc"
ghci>
ghci> -- headを自分で実装するときは以下のような具合
ghci> let myHead :: [a] -> a; myHead x = x !! 0
ghci> myHead [3,6,7,9]
3
ghci>
ghci> -- fstを自分で実装するときは以下のような具合
ghci> let myFst :: (a,b) -> a; myFst (x, y) = x
ghci> myFst (10,55)
10
```

## 型クラス（入門編）

- 型クラスはある振る舞いをする関数の集まりを定める抽象的なインターフェース
- 型クラスのインスタンスが型となる
- 1 つの型はいくつもの型クラスのインスタンスになることができる

### Eq 型クラス

```
ghci> :t (==)
(==) :: (Eq a) => a -> a -> Bool
```

- 等値性をテストできる型に用いられる
- Eq のインスタンスが実装すべき関数は`==`と`/=`
- 同じ型の任意の 2 つの引数をとり，Bool を返す

### Ord 型クラス

```
Prelude> :t (>)
(>) :: Ord a => a -> a -> Bool
```

- 順序付けできる型のための型クラス
- 大小比較関数`>`, `<`, `>=`, `<=`をサポートする
- 同じ型の任意の 2 つの引数をとり，Bool を返す
- Ord のインスタンス型は必ず Eq のメンバーでなければならない

### Show 型クラス

```
Prelude> :t show
show :: Show a => a -> String
```

- 型が Show 型クラスのインスタンスになっているときに値を文字列として表現できる
- 任意の型の引数を 1 つ取り，String を返す
- この型クラスのインスタンスへの操作でよく`show`が使われる

### Read 型クラス

```
Prelude> :t read
read :: Read a => String -> a
Prelude> read "True" || False
True
Prelude> read "3" + 1
4
```

- 文字列を受け取り Read 型クラスのインスタンスの値を返す

### Enum 型クラス

```
Prelude> :t [1 .. 10]
[1 .. 10] :: (Enum t, Num t) => [t]
```

- Enum のインスタンスは要素の値を順番に列挙できる型
- `succ`, `pred`を実装している
- Enum 型クラスのインスタンスとして`()`, `Bool`, `Char`, `Ordering`, `Int`, `Integer`, `Float`, `Double`などがある

### Bounded 型クラス

```
Prelude> :t minBound
minBound :: Bounded a => a
Prelude> minBound :: Bool
False
Prelude> maxBound :: Bool
True
```

- Bounded 型クラスのインスタンスは上限と下限を持つ
- `minBound`と`maxBound`で調べられる．
- 型クラス制約を見てみると`Bounded a => a`となっているが，このような引数を取らない関数を`多相定数`という
- タプルの構成要素が全て Bounded のインスタンスのとき，タプル自身も Bounded になる

### Num 型クラス

```
Prelude> :t 20
20 :: Num a => a
Prelude> 20 :: Int
20
Prelude> 20 :: Double
20.0
Prelude> 20 :: Float
20.0
```

- 数の型クラス
- このインスタンスは数のように振る舞う
- Num も多相定数のひとつ
- ある型を Num のインスタンスにするためには`Show`と`Eq`のインスタンスになっている必要がある

### Floating 型クラス

- 浮動小数点に使う

### Integral 型クラス

```
Prelude> :t read
read :: Read a => String -> a
```

- インスタンスには整数全体が含まれる
- インスタンスとして Int と Integer がある

# 3. Syntax in Functions

## パターンマッチ

- 関数定義の際にパターンマッチを用いて，関数の本体を場合分けできる
- 例えば以下のように階乗関数を定義できる
- これにより if/else の連鎖を避け，シンプルにコードを書くことが出来る
- パターンが網羅的でないとエラーが出てしまうので気をつける

```
Prelude> :{
Prelude| let { fact :: Int -> Int
Prelude|      ;fact 0 = 1
Prelude|      ;fact n = n * fact(n-1)
Prelude| }
Prelude| :}
Prelude> fact 3 -- fact 3 = 3! = 3 * 2 * 1 = 6
6
```

- タプルにもパターンマッチを用いることができる

```
Prelude> :{ -- 2次元ベクトルの足し算（タプルのパターンマッチ）
Prelude| let { addVectors :: (Double, Double) -> (Double, Double) -> (Double, Double)
Prelude|      ;addVectors (x1, y1) (x2, y2) = (x1 + x2, y1 + y2)
Prelude| }
Prelude| :}
Prelude> addVectors(1.5, 3.0)(2.5, 2.0)
(4.0,5.0)
Prelude>
Prelude>
```

- リスト内包表記にもパターンマッチを用いることができる
- 失敗したら単に次の要素に進む
- 失敗した要素は結果には含まれない

```
Prelude> let xs = [(1,3), (4,3), (2,4), (5,3), (5,6), (3,1)]
Prelude> [ x*2 | (x,3) <- xs ]
[2,8,10]
```

### リストの先頭を返す`head関数`

空のリストの先頭は取れないため例外を投げていますが，
Haskell ではエラーを引き起こす可能性のある関数は，
Maybe などの失敗を安全に扱える方法で実装するのが流儀のようです．

```
Prelude> :{
Prelude| let { head' :: [a] -> a
Prelude|      ;head' [] = error "can't call head on an empty list"
Prelude|      ;head' (x:_) = x
Prelude| }
Prelude| :}
Prelude> head' [1,2,3]
1
Prelude> head' ["hoge", "foo", "hage"]
"hoge"
```

### as パターン

- パターンマッチで分解してしまった値とともに，もとの値も参照したいときに利用する
- たとえばリストの頭とそれ以外に分解しつつ，もとのリスト全体も欲しいときに使う

```
Prelude> :{
Prelude| let { firstLetter :: String -> String
Prelude|      ;firstLetter "" = "empty"
Prelude|      ;firstLetter all@(x:xs) = "The first letter of " ++ all ++ "is " ++ [x]
Prelude| }
Prelude| :}
Prelude> firstLetter "toushitsuseigen"
"The first letter of toushitsuseigenis t"
```

## ガード

- 引数の値が満たす性質で場合分けをする場合に用いる
- ガードにはパイプ文字`|`とそれに続く真理値式，その式が真と評価されたときの関数の本体を記述する
- たいてい一番最後はすべてをキャッチする`otherwise`を置く
- ガードでは複数の変数をキャッチすることもできる

```
Prelude> -- BMIに対していちゃもんをつける関数
Prelude> :{
Prelude| let { evalBmi :: Double -> String
Prelude|      ;evalBmi bmi
Prelude|      | bmi <= 18.5 = "underweight"
Prelude|      | bmi <= 25.0 = "normal"
Prelude|      | bmi <= 30.0 = "fat"
Prelude|      | otherwise = "whale"
Prelude| }
Prelude| :}
Prelude> evalBmi 10
"underweight"
Prelude> evalBmi 19.0
"normal"
Prelude> evalBmi 50.0
"whale"
Prelude>
Prelude> -- 独自定義のmax関数
Prelude> :{
Prelude| let { max' :: (Ord a) => a -> a -> a
Prelude|      ;max' a b
Prelude|      | a <= b = b
Prelude|      | otherwise = a
Prelude| }
Prelude| :}
Prelude> max' 10 100
100
Prelude> max' 100 10
100
```

- 計算式を`where句`を用いて変数に格納することができる
- スコープは関数内のみ

```
Prelude> :{ -- BMIにいちゃもんをつける関数の改良型
Prelude| let { evalBmi :: Double -> Double -> String
Prelude|      ;evalBmi weight height
Prelude|      | bmi <= 18.5 = "underweight"
Prelude|      | bmi <= 25.0 = "normal"
Prelude|      | bmi <= 30.0 = "fat"
Prelude|      | otherwise = "whale"
Prelude|      where bmi = weight / height ^ 2
Prelude| }
Prelude| :}
Prelude> evalBmi 64 177
"underweight"
Prelude>
Prelude> -- where内でもパターンマッチを用いることができる
Prelude> -- イニシャルを返す関数
Prelude> :{
Prelude| let { initials :: String -> String -> String
Prelude|      ;initials firstname lastname = [f] ++ ". " ++ [l] ++ "."
Prelude|           where (f:_) = firstname
Prelude|                 (l:_) = lastname
Prelude| }
Prelude| :}
Prelude> initials "Yoshika" "Miyafuji"
"Y. M."
```

## let 式

- where は関数の終わりで変数を束縛する
- let はどの位置でも変数を束縛でき，let 自身も式になる
- `let (bindings) in (expression)`という形式をとる
- 例として半径と高さをパラメタとして円柱の表面積を求める関数を次のように定義した

```
Prelude> :{
Prelude| let { cylinder :: Double -> Double -> Double
Prelude|      ;cylinder r h =
Prelude|       let sideArea = 2 * pi * r * h
Prelude|           topArea = pi * r ^ 2
Prelude|       in  sideArea + 2 * topArea
Prelude| }
Prelude| :}
Prelude>
```

## case 式

- 変数の指定した値に対するコードブロックを評価できる
- パターンマッチは case 式の糖衣構文
- head'関数を case 式を用いて書くと以下のようになる

```
Prelude> :{
Prelude| let { head' :: [a] -> a
Prelude|      ;head' xs = case xs of [] -> error "empty list"
Prelude|                             (x:_) -> x
Prelude| }
Prelude| :}
Prelude> head ["cocoa", "chino", "rize", "chiya", "syaro"]
"cocoa"
```

# 4. Recursion

## Haskell では再帰が重要

- 関数のなかでその関数自身を呼び出すことを再帰という
- 例えばフィボナッチ数列は`n=0, 1`を基底部として`F(n) = F(n-1) + F(n-2)`という形に再帰的に定義される
- 再帰を用いた基本の実装例は次のようなものになる

```
Prelude> :{ -- リストをうけとるmax関数
Prelude| let { max' :: (Ord a) => [a] -> a
Prelude|      ;max' [] = error "empty list"
Prelude|      ;max' [x] = x
Prelude|      ;max' (x:xs) = max x (max' xs)
Prelude| }
Prelude| :}
Prelude> max' [1,2,3,4,5,6,10,2]
10
Prelude>
Prelude> :{ -- リストを逆順にする関数
Prelude| let { reverse' :: [a] -> [a]
Prelude|      ;reverse' [] = []
Prelude|      ;reverse' (x:xs) = reverse' xs ++ [x]
Prelude| }
Prelude| :}
Prelude> reverse' "hanayamata"
"atamayanah"

```

## クイックソートの実装

- 選択した要素より小さい要素を左に置くことを逐次的に繰り返していくことによりソートを実現するアルゴリズムをクイックソートという
- 例：[3,4,1,2,0] -> [1,2,0] ++ [3] ++ [4] -> [0] ++ [1,2] ++ [3] ++ [4]
- 実装は以下のような具合

```
Prelude> :{
Prelude| let { quicksort :: (Ord a) => [a] -> [a]
Prelude|      ;quicksort [] = []
Prelude|      ;quicksort (x:xs) =
Prelude|           let smallerOrEqual = [a | a <- xs, a <= x]
Prelude|               larger = [a | a <- xs, a > x]
Prelude|           in  quicksort smallerOrEqual ++ [x] ++ quicksort larger
Prelude| }
Prelude| :}
Prelude> quicksort [1,4,2,5,7,2,4,1,5,8,3,2,7,1]
[1,1,1,2,2,2,3,4,4,5,5,7,7,8]
Prelude> quicksort "Is the order a rabbit?"
"    ?Iaabbdeehiorrrstt"
```

# 5. Higher order functions

## Haskell の関数は引数をひとつだけとる

- Haskell のすべての関数は引数をひとつだけとることになっている
- 例えば`max:: Int -> Int -> Int`は実際は「`Int`を引数に取り，`Int -> Int`である関数」を返す関数
- 見た目上複数の引数を取るようにみえるのはシンタックスシュガー
- 「複数の引数をもつ関数」を，「単一の引数を持ち，関数を返す」関数にすることをカリー化という

### カリー化の定義

```
関数 f: X * Y -> Z, 関数 g: X -> Y -> Z, について
gは fのカリー化された関数である ⇔ ∀x∈X, ∀y∈Y, g(x)(y) = f(x,y)
```

- JavaScript で関数をカリー化する様子を見るのが直感的にわかりやすい
- 以下は，max 関数をカリー化している（[出典](http://qiita.com/KDKTN/items/6a27c0e8efa66b1f7799)）
- コードを見ながらカリー化の定義を見てみよう
- 確かに任意の x,y に対して，max(x,y) = max(x)(y)となっていることがわかるだろう

```
// max(x,y)
function max(x, y) {
  return x > y ? x : y;
}

// max(x)(y)
function max(x) {
  return function(y){
    return x > y ? x : y;
  }
}

max(1)(2) //=> 2
max(2)(1) //=> 2
```

### 部分適用とは

- カリー化されている関数`max(x)(y)`に対して，`max(5)(y)`とすれば，５より 5 よりも大きければその値を，そうでなければ 5 を返すような関数を得ることができる
- このように関数を本来より少ない引数で呼び出し，関数を得ることを`部分適用`とよぶ
- JavaScript のコードで表現すると，次のようにカリー化された`max(x)(y)`に対して，`x=5`として`max(5)(y)`という関数を得ることといえる

```
// max(x)(y)
function max(x) {
  return function(y){
    return x > y ? x : y;
  }
}

var max5 = max(5) // 部分適用をして関数(max(5))(y)を得た
max5(1)  //=> 5
max5(10) //=> 10
```

## 中置関数に対する部分適用

- 中置関数への部分適用は片側だけに値を置いて括弧で囲むだけでよい
- たとえば中置換数`/`について次のように部分適用できる

```
Prelude> let devideByTen = (/10)
Prelude> devideByTen 100
10.0
```

## ラムダ式

- 1 回だけ必要な関数を作るときに使う無名関数をラムダ式という
- 通常，高階関数に渡す関数を作るためだけに使われる
- Haskell では `\ [args] -> [body of a function]`という書式で書ける
- 例えば数字を二倍するだけのラムダ式は`\x -> 2 * x`と書ける
- ラムダ式は式なので，関数に直接渡すことができる
- ラムダ式でもパターンマッチを用いることができるが，複数のパターン定義はできない
- 次の`addThree`と`addThree'`は等価になる（関数はデフォルトでカリー化されている点に注意）

```
addThree :: Int -> Int -> Int -> Int
addThree x y z = x + y + z

addThree':: Int -> Int -> Int -> Int
addThree':: \x -> \y -> \z -> x + y + z
```

## 関数型プログラミングによく使う関数の実装

- zipWith: 関数と２つのリストを引数に取り，各要素に関数を適用することにより，１つのリストに結合する

```
zipWith' :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith' _ [] = []
zipWith' _ _ [] = []
zipWith' f (x:xs) (y:ys) = f x y : zipWith' f xs ys

zipWith' max [1,5,1,5] [3,1,3,1]
-- => [3,5,3,5]
```

- flip: ２変数関数を受け取り２つの引数が入れ替わった関数を返す

```
flip' :: (a -> b -> c) -> (b -> a -> c)
flip' f = g
  where g x y  = f y x
```

- map: 関数とリストを受け取り，その関数を各要素に適用して新しいリストを作る

```
map' :: (a -> b) -> [a] -> [b]
map' _ [] = []
map' f (x:xs) = f x : map' f xs

map' (\x -> 2 * x) [1,2,3,4,5]
-- => [2,4,6,8,10]
```

- filter: 述語とリストを受け取りその述語を満たすもののリストを返す

```
filter' :: (a -> Bool) -> [a] -> [a]
filter' _ [] = []
filter' p (x:xs)
    | p x = x : fileter p xs
    | otherwise = filter p xs

filter' (>10) [1,5,11,21,1,30,100]
-- => [11,21,30,100]
filter' (==10) [1,5,11,21,1,30,100]
-- => []
```

## 畳み込み

- 畳み込みを使うとリストを単一の値にまとめられる
- 畳み込み関数は，２引数関数と畳み込みの初期値（アキュムレータ），リストを受け取り値を返す
- リストは右からでも左からでも畳み込める
- リストを左から畳み込むときは`foldl`を用いる
- リストを右から畳み込むときは`foldr`を用いる

```
Prelude> foldl (++) "z" ["a","b","c"]
"zabc"

-- foldl (++) "z" ["a","b","c"] =
-- foldl (++) ("z" ++ "a") ["b", "c"] =
-- foldl (++) (("z" ++ "a") ++ "b") ["c"] =
-- foldl (++) ((("z" ++ "a") ++ "b") ++ "c") [] =
-- ((("z" ++ "a") ++ "b") ++ "c")

Prelude> foldr (++) "z" ["a","b","c"]
"abcz"

-- foldr (++) "z" ["a", "b", "c"] =
-- "a" ++ (foldr (++) "z" ["b", "c"]) =
-- "a" ++ ("b" ++ (foldr (++) "z" ["c"])) =
-- "a" ++ ("b" ++ ("c" ++ (foldr (++) "z" []))) =
-- "a" ++ ("b" ++ ("c" ++ "z"))
-- このとき ++関数より:関数のほうが処理が早い
```

- 右畳み込みは無限リストに対しても動作する
- アキュムレータを明示的に与える必要のない`foldl1`, `foldr1`関数がある
- これは最初の要素をアキュムレータとして動作するためリストに要素がないと実行時エラーとなる
- 関数 f，初期アキュムレータ z，リスト[1,2,3,4]に対する左・右畳み込みは本質的には次のように一連の関数適用としてとらえることができる

```
// 左畳み込み
f (f (f (f z 1) 2) 3) 4

// 右畳み込み
f 1 (f 2 (f 3 (f 4 z)))
```

## 無限リストの畳み込み

- and 関数を実装することにより無限リストへの右畳み込みが成立する理由を考える
- and 関数とは Bool 値のリストを引数に取り，どれか一つが False なら False を返す関数
- 実装は次のようになる

```
and' :: [Bool] -> Bool
and' xs = foldr (&&) True xs

Prelude> and' [True, False, True]  -- True && (False && (True && True))
False
```

- Haskell は遅延評価により本当に必要な部分だけ計算される
- &&関数は両方の引数が True だった場合にだけ True を返す
- 従って最初の引数が False であれば，2 つ目の引数を評価せずに False を返す
- このため無限リストに対しても動作する
- これより`foldr`関数は，２番目の引数を常に評価するとは限らない 2 引数関数が与えられた場合に，無限リストに対して動作する

```
(&&) :: Bool -> Bool -> Bool
True && x = x
False && _ = False

Prelude> and' (repeat False) -- False && (False && (False && (...
False
```

## スキャン

- アキュムレータの中間状態すべてをリストとして返すのが`scanl`, `scanr`関数

```
Prelude> scanl (+) 1 [1,2,3,4]
[1,2,4,7,11]
Prelude> scanr (+) 1 [1,2,3,4]
[11,10,8,5,1]
```

## $を使った関数適用

- 関数適用演算子`$`は右結合な関数適用を行う関数
- Haskell では通常，左結合になっている．これを使うと括弧を減らせる

```
($) :: (a -> b) -> a -> b
f $ x = f x

Prelude> sum (map sqrt [1,2,3]) -- これをsum map sqrt [1,2,3]とは書けない
4.146264369941973
Prelude> sum $ map sqrt [1,2,3]
4.146264369941973
```

## 関数合成

- 数学における関数合成のように，Haskell でも`.`関数で関数合成が出来る

```
(.) :: (b -> c) -> (a -> b) -> a -> c
f . g = \x -> f (g x)

Prelude> :{
Prelude| let { f :: Int -> Int
Prelude|      ;f x = x * x      -- f(x) = x^2
Prelude|
Prelude|      ;g :: Int -> Int
Prelude|      ;g x = x + 1      -- g(x) = x + 1
Prelude| }
Prelude| :}
Prelude>
Prelude> (f.g) 1 -- f(g(2)) = ((2 + 1))^2
9
Prelude>
Prelude>
Prelude> -- 数のリストをすべて負にする処理
Prelude> -- 全ての数の絶対値をとって符号反転する
Prelude> map (\x -> negate (abs x)) [1,-3,5,-7,9]
[-1,-3,-5,-7,-9]
Prelude>
Prelude> -- 関数合成を使うともっとスマートに書ける
Prelude> map (negate . abs) [1,-3,5,-7,9]
[-1,-3,-5,-7,-9]
```

## ポイントフリースタイル

- 関数はカリー化されているので 1 引数関数の定義に一時変数をおく必要がない
- 例えば，`f(x) = (+) 1 x`のような関数は `f = (+) 1`とすれば良い

```
plusOne :: Int -> Int
plusOne x = 1 + x

-- ポイントフリースタイルで書くと以下のようになる
plusOne' :: Int -> Int
plusOne' = (+) 1

Prelude> plusOne' 1
2
```
