---
title: Swift1系脳で出来ないと思い込んでいたことができるようになっていた件
category: programming
date: 2016-07-15 02:53:12
tags: [Swift]
pinned: false
---

# 再帰的構造を持つ enum

Swift 1 系では、再帰的構造を持つ enum を定義することはできませんでした。たとえば、

```swift
// swift 1, 2 ともに動かないコード
enum List<T> {
    case Nil
    case Cons(x: T, xs: List<T>)
}
```

というコードを書くと、Swift の処理系は受け付けてくれません。しかしながら、Swift2 はとても素晴らしい `indirect` という修飾子を導入することにより、再帰的構造を持つ enum を定義できるようになりました。

```swift
// swift 2 系では動く
indirect enum List<T> {
    case Nil
    case Cons(x: T, xs: List<T>)
}
```

また、挙動的に面白いのが、再帰的構造を持つが即座に評価されないようになっている場合、たとえば以下のような遅延ストリームについては、`indirect` 修飾子がなくても動くのです。これは Swift 1 系のときに挙動を試してないので、どうだったかわかりませんが、Xcode ダウンロードするのめちゃめちゃ時間掛かるし重いのでだれか試して欲しい。

```swift
// indirect 修飾子はいらない
enum Stream<T> {
    case Nil
    case Cons(x: T, xs: () -> Stream<T>)
}
```

にゃ〜ん...って感じですね？

# 関数内に定義した関数の再帰呼び出し

まあコードみればわかると思うけど、以下のようなコードが Swift 1 系では動かなかった（記憶がある...）。間違っていたらごめんなさい。でも関数内に定義した関数なんて、再帰呼び出しにくらいしか使わなくないですか？と半ギレした記憶があるので多分ほんとに動かなかったと思う。Swift2 でやっと動くようになりました。

```swift
func fact(n: Int) -> Int {
    func loop(i: Int, acc: Int) -> Int {
        return i < 1 ? acc : loop(i - 1, acc: i * acc)
    }
    return loop(n, acc: 1)
}
```

Swift 最高！！！！！！（大嘘）
