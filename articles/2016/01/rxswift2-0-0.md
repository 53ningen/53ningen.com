---
slug: rxswift2-0-0
title: RxSwift2.0.0がリリースされた
category: programming
date: 2016-01-02 20:04:05
tags: [Swift]
pinned: false
---

<div class="alert alert-info text-center">この記事は <a href="http://qiita.com/advent-calendar/2015/rxswift">「RxSwift Advent Calendar 2015」</a>1日目の記事です。</div>

長らく開発の続いていた RxSwift の 2 系がついにリリースされたようです。

```twitter
683089909540847616
```

今回もまあまあ変わっている部分があるようなので、`beta4`, `2.0.0-rc0`, `2.0.0` あたりでの特に気になった変更点をまとめます。2.0.0 もリリースされことですし、そろそろインターフェースも落ち着いてくることを期待しています。

# Observable 生成メソッド関連の変更

グローバルに定義されていた `just` や `failWith` などが削除され、Observable の static ファクトリメソッドになっています。。また後者については、`error(ErrorType)` に変更されています。おもな変更を一応コードで書いておくと以下のような具合です。

### just の変更点

```swift
// before
just(value)
//after
Observable.just(value)
```

find replace all `just(` to `Observable.just(`

### failWith の変更

```swift
// before
failWith(/* ErrorType */)
//after
Observable.error(/* ErrorType */)
```

find replace all `failWith(` to `Observable.error(`

### 同様な変更

`of(sequenceOfに変更)`, `empty`, `create`, `zip`, `debounce`, `range`, `generate`, `interval` など詳しくは **[この辺り](https://github.com/ReactiveX/RxSwift/releases/tag/2.0.0-rc.0)** をみると色々のってます。あとソースコードの `diff` も見ましょう。

# Variable の変更

以前 `Variable` は `Obseravble` のインターフェースを持っていましたが、現在は `asObservable()` をかましてあげる必要がああります。`Variable` に対して、Observable の高階関数が直接使えなくなっているので注意が必要です。

```swift
var variable = Variable<Int> = Variable(1)
// variable.filter(function) => これはできなくなっている
variable.asObservable().filter(function)
```

# `MainScheduler.sharedInstance` がいなくなった

`MainScheduler.instance` に変更

# rx_controlEvents が rx_controlEvent に変更された

`RxCocoa` のほうの変更。find replace All で頑張ろう

# その他

テスト向けの便利なライブラリ `RxTests` が増えたらしい。これについてはまた後ほど。あと `VirtualTimeScheduler` というものと `HistoricalScheduler` というものが増えたらしい。今後調べます。

# おわりに

今年も RxSwift を積極的に用いて、できればライブラリの開発にも Contribute できれば良いかなぁと思っています。みなさんも便利で快適なライブラリ、RxSwift を使って、胸がらんらん歌う開発を enjoy しましょう。
