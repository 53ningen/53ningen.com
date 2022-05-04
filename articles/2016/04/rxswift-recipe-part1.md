---
title: RxSwiftライブラリの作り方 〜Observer/Observable編〜
category: programming
date: 2016-04-04 22:16:54
tags: [Swift, RxSwift]
pinned: false
---

RxSwift ライブラリの作り方をご紹介します。一つの記事ですべてを説明するのは非常に厳しいので、まず `Observer` や `Observable` といった基本的なコンポーネントとその周辺について、ひとつずつ作っていく流れで説明します。

### 注意事項

- 以下の内容を理解しなくても RxSwift は十分使えるライブラリです
- まだ Rx 系のライブラリを使ったことがない方は、まずライブラリを使ってみてください
  - Qiita の記事を読むのもよいですが、[公式のドキュメント](https://github.com/ReactiveX/RxSwift/blob/master/Documentation/GettingStarted.md)や[Example](https://github.com/ReactiveX/RxSwift/tree/master/RxExample/RxExample/Examples)が充実しているのでそちらを読みながら、まずはコードを書いてみることを強くお勧めします。意外に簡単に使いどころが理解できるようになると思います。
- 記事の内容的には Rx 系ライブラリの利用経験がなくても分かるように書いたつもりです
- 以下の実装は RxSwift のものであり、他言語の Rx ライブラリとは実装が異なる場合があります

## Observer パターンの復習

以下の問題について考えていきます

- 【問題】 A が更新されたことを、B に通知したい
- 【解決策】 A が B のインスタンスを保持し、B に 変更を伝える

解決策を単純に実装すると、次のような構造になると思います

![](https://qiita-image-store.s3.amazonaws.com/0/56771/c13c3d7e-7525-11b3-f854-98ea4a492b92.png)

シンプルですが、問題をしっかりと解決できています。続いて「通知先が増えそうである」という条件が加わったを場合を考えてみましょう。このままでは、次のような問題が発生しそうです。

- 通知先が増減するたびに A の内部を変更しなければならない
- 通知先の I/F の変更により A の内部を変更しなければならない

この 2 点はともに、通知元が通知先のオブジェクトの詳細を知っていることによって生じている問題です。通知元はどうあがいても、通知先を保持しなければなりませんが、その詳細を知ったまま保持する必要はないはずです。

したがって通知元は、必要のない情報をそぎ落とした状態で通知先のオブジェクトを保持すれば、問題が解決しそうです。つまり、通知先に共通のインターフェース（Swift のプロトコル）を切ればよいということになります。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/6cfb9826-a193-2489-93e6-5de7a262e41f.png)

また、通知元のオブジェクトの種類を増やしたいとすれば、こちらもインターフェースを切っておくと使いまわしが効いて便利です。`Observer` が `Observable` からの通知を受け取り始めるための `attach` というメソッドと、通知の受け取りを解除するための `detach` というメソッドがあれば十分でしょう。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/24f5e3f9-ebfc-e7ea-90c2-d07fc353e915.png)

この形式を pull 型 Observer パターンと呼びます。`Observer` が通知を受けたあとに、`Observable` から値を引っ張ってこなければならないために pull という名前が付いています。以下のように `Observable` が更新時に `Observer` に対して値を投げるような実装も可能です。こちらは push 型とよばれています。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/54b62248-2987-111a-8fb6-4864d862252a.png)

この UML を Swift の実装へ単純に落とし込むことはできません。Swift の protocol は、generic type parameter を持つことができないからです。代わりに関連型 (〜2.2: `typealias`, 2.3+: `associatedtype`) で表現する必要があります。

ここまでくれば Observer パターンの基礎についてはなんとなく理解できるようになっているのではないかと思います。次節では RxSwift ではどのように push 型の Observer パターンに用いられる基本的なコンポーネントを構成しているかを見ていきます。

## Observer, Observable を作る（Rx ライブラリの下ごしらえ）

ここからは実際に RxSwift でどのように Observer と Observable が定義されているかを見ていきましょう。基本的には push 型の Observer パターンをそのまま実装していけば良いだけです。ただし Rx では値を単純に通知するのではなく、成功(Next)、失敗(Error)、完了(Completed)という文脈をつけた **イベント** を通知します。また、`Observer` を `Observable` に登録した際に `Disposable` という I/F を持ったオブジェクトを返し、そのオブジェクトに購読解除の機構を持たせている点も特徴的です。

```swift
public enum Event<Element> {
    case Next(Element)
    case Error(ErrorType)
    case Completed
}
```

したがって実現したい構造は下図のようなものになります。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/c21b4d12-3cb4-5684-dc3e-9239d80a75e2.png)

### ObserverType, ObservableType の実装

前述したとおり、protocol には generic type parameter を用いることができないので、まず関連型を用いて `ObserverType` と `ObservableType` を以下のように定義します。

```swift
// 通知先
public protocol ObserverType {

    typealias E

    // 通知を受ける口
    func on(event: Event<E>)

}

// 通知元
public protocol ObservableType {

    typealias E

    // 通知先を登録する口
    func subscribe<O: ObserverType where O.E == E>(observer: O) -> Disposable

}


public protocol Disposable {

    func dispose()

}
```

### AnyObserver, Observable の実装

さて、こうして定義した protocol を generic type parameter を用いたクラスに落とし込みます。Swift の言語機能が不足しているので、ここは醜い表現になっていますが、 **本来であればインスタンス化できないように abstract class にするような部分** だと思います。RxSwift 内では、苦し紛れですが `@noreturn` アノテーションを用いて抽象メソッドを表現しています。

```swift
public class AnyObserver<Element>: ObserverType {

    public typealias E = Element
    public typealias EventHandler = Event<E> -> Void
    private let eventHandler: EventHandler

    public init(eventHandler: EventHandler) {
        self.eventHandler = eventHandler
    }

    public init<O: ObserverType where O.E == Element>(observer: O) {
        self.eventHandler = observer.on
    }

    public func on(event: Event<E>) {
        eventHandler(event)
    }

}

public class Observable<Element>: ObservableType {

    public typealias E = Element

    public func subscribe<O : ObserverType where O.E == E>(observer: O) -> Disposable {
        abstractMethod()
    }

}

/// 抽象メソッドを表現するための苦肉の策
@noreturn func abstractMethod() -> Void {
    fatalError("abstract method")
}
```

ここで登場するパターンは、なぜか皆さん大好きな type erasure ですが、これをやらなきゃいけないのは決して褒められたことではないと思います。個人的には普通に Java より劣ってるでしょって感想です（← 炎上しそう）。Swift の protocol が generic type parameter を持てない理由については、[この記事](http://qiita.com/omochimetaru/items/b41e7699ea25a324aefa)によくまとまっているようですが、この点について自分は理解できてはいません。Swift の言語仕様に阻まれ、随分遠回りにはなりましたが、無事 `Observable<Element>` と `Observer<Element>` を定義することができました。

## Observable の具象クラスを作ろう

### Bag, SubscriptionDisposable の実装

先ほど定義した `Observable<Element>` の実装クラスを作成してみましょう。実装が必要なメソッドは `subscribe` です。ここでは受け取った `observer` を保持する必要があります。

`observer` は `O: ObserverType where O.E == E` という制約のもと渡ってきますが、`ObserverType` のコレクションを作ることは残念ながらできません。なぜなら `ObserverType` は abstract type member を持っているからです。ここでは、型制約を利用して `AnyObserver<E>` のコレクションに突っ込んであげればよいでしょう。例が稚拙で申し訳ないのですが、`Observable<String>` であるような `StringObservable` を定義するとして、書き出しは以下のようになると思います（実際のライブラリにはこのようなクラスは存在しません）。

```
public class StringObservable: Observable<String> {

    private var observers: [AnyObserver<String>] = []

    private var _string: String
    private var string: String {
        get {
            return _string
        }
        set(value) {
            self._string = value
            observers.forEach { $0.on(.Next(value)) }
        }
    }

    public init(string: String) {
        self._string = string
    }


    public func subscribe<O : ObserverType where O.E == E>(observer: O) -> Disposable {
        observers.append(AnyObserver(observer: observer))
        // つづく...
    }

}
```

`subscribe` に渡った `observer` は、`observers` に登録され、何かイベントがあったら通知されるようになりました。イベント購読の機能の実装はこれでとりあえず OK としましょう（いろいろ細かい問題はありますがとりあえず置いておく）。

続いてイベント購読解除の仕組みを作る必要があります。これは単に `observers` から購読を解除したい `observer` を削除してあげれば良いだけです。現状は配列に突っ込んでいますが、辞書的なものに突っ込んでキーを指定して削除できた方が、取り回しが良いでしょう。

そこで、要素を追加すると同時に、 id を発行するコレクション `Bag` を作ります。差し当たっての問題は、どのように id を生成するのかということです。ここでは Swift の `unsafeAddressOf` メソッドが暗躍します。クラスのインスタンスはメモリを確保するため、インスタンスそのものがある種の id の役割を持っています。そして、メモリの番地を取得するのが `unsafeAddressOf` メソッドになります。

```swift
import Swift

// クラスとしてメモリを確保することによって、メモリ内でユニークな存在になれる
class Identity {

    var value: Int32 = 0

}

// hash値計算のおまじない的なヤツ
// この記事本質とは関係ないので説明は割愛。まぁ正直に言うとよくわかってない。
func hash(_x: Int) -> Int {
    var x = _x
    x = ((x >> 16) ^ x) &* 0x45d9f3b
    x = ((x >> 16) ^ x) &* 0x45d9f3b
    x = ((x >> 16) ^ x)
    return x;
}

public struct BagKey: Hashable {

    let uniqueIdentity: Identity?
    let key: Int

    public var hashValue: Int {
        get {
            // unsafeAddressOf で メモリ番地を取得している
            return uniqueIdentity
                .map { hash(key) ^ (unsafeAddressOf($0).hashValue) } ?? hash(key)
        }
    }

}

// BagKeyの等値性を比較できるようにする
public func == (lhs: BagKey, rhs: BagKey) -> Bool {
    return lhs.key == rhs.key
        && lhs.uniqueIdentity === rhs.uniqueIdentity
}
```

こうしてコレクションのキーとなる `BagKey` の実装が終わりました。続いてコレクションの本体となる `Bag` について考えましょう。RxSwift の `Bag` の実装は要素数が少ないときに最適化されるような仕組みがのっていますが、本質だけ抜き出すとただの Key-Value store です。

```swift
public struct Bag<T> {

    public typealias KeyType = BagKey
    private typealias ScopeUniqueTokenType = Int
    typealias Entry = (key: BagKey, value: T)

    private var dictionary: [BagKey:T] = [BagKey:T]()

    private var uniqueIdentity: Identity?
    private var nextKey: ScopeUniqueTokenType = 0

    public init() {}

    public mutating func insert(element: T) -> BagKey {
        nextKey = nextKey &+ 1
        if nextKey == 0 {
            uniqueIdentity = Identity()
        }
        let key = BagKey(uniqueIdentity: uniqueIdentity, key: nextKey)
        dictionary[key] = element
        return key
    }

    public var count: Int {
        return dictionary.count
    }

    public mutating func removeAll() {
        dictionary.removeAll(keepCapacity: false)
    }

    public mutating func removeKey(key: BagKey) -> T? {
        return dictionary.removeValueForKey(key)
    }

}
```

準備が整いました。もう一度やることを確認しておきましょう。`Observable#subscribe` では以下のことを行いたいのでした。

1. 受け取った `observer` を `Bag` に突っ込む（通知先を保持する）
2. 受け取った `observer` を `Bag` から一意探せるようなキーと、`Observable` 自身の弱参照を持ち、`dispose` で購読解除ができるような `Disposable` オブジェクトを返す

`2.` のようなことができる `Disposable` の具象クラスとして `SubscriptionDisposable` というものを実装していきましょう。構造はとても単純で、以下のようなものになります。

```swift
struct SubscriptionDisposable<T: SynchronizedUnsubscribeType>: Disposable {

    private let key: T.DisposeKey
    private weak var owner: T?

    init(owner: T, key: T.DisposeKey) {
        self.owner = owner
        self.key = key
    }

    func dispose() {
        owner?.synchronizedUnsubscribe(key)
    }

}

protocol SynchronizedUnsubscribeType: class {

    typealias DisposeKey

    func synchronizedUnsubscribe(disposeKey: DisposeKey)

}
```

`observer` を所有している `owner` にキーを指定して購読解除ができなければならないので、 `owner` 自身は `SynchronizedUnsubscribeType` プロトコルに適合している必要があります。そういった部分も含めて `StringObservable` の実装を修正すると以下のようになります。

```swift
public class StringObservable: Observable<String>, SynchronizedUnsubscribeType {

    typealias DisposeKey = Bag<AnyObserver<String>>.KeyType

    var bag: Bag<AnyObserver<String>> = Bag()

    private var _string: String
    private var string: String {
        get {
            return _string
        }
        set(value) {
            self._string = value
            bag.on(.Next(value))
        }
    }

    public init(string: String) {
        self._string = string
    }


    public func subscribe<O : ObserverType where O.E == E>(observer: O) -> Disposable {
        let key = bag.insert(AnyObserver(observer: observer))
        return SubscriptionDisposable(owner: self, key: key)
    }

    func synchronizedUnsubscribe(disposeKey: DisposeKey) {
        bag.removeKey(disposeKey)
    }

}
```

これがマルチスレッド下で正しく動くかというと、またそれは別の話なのですが、とりあえず、シングルスレッド下で Observer パターンを実現させるための Rx の基本的なコンポーネントは出揃いました。利用側のコードを以下に示します。

```swift
let observable = StringObservable(string: "cocoa")
let disposable = observable.subscribe(AnyObserver<String> {
    switch $0 {
    case .Next(let str): NSLog(str)
    default: break
    }
})

observable.value = "chino"  //=> NSLog("chino") も実行される
observable.value = "maya"  //=> NSLog("maya") も実行される
observable.value = "megu"  //=> NSLog("megu") も実行される

disposable.dispose()
observable.value = "tippy"   //=> なにもおこらない
```

ここまできたらもう `BehavoirSubject` や `Variable` の実装を読むことができるようになっていると思います。マルチスレッド対応のためのロック処理なども完結にまとまっているので勉強になるコードです。次節ではその実装をみていきます。

## BehaviorSubject, Variable の実装

### BehaviorSubject

前節では、String 値を状態として持つ `Observable` の具象クラスを実装しましたが、これを一般化して任意の型の値を状態として持つような `Observable` があれば便利そうです。また、こうしたオブジェクトは通知元になりうると同時に、通知先になることもできそうです。この性質を `SubjectType` プロトコルにまとめます。普段は通知元として振る舞いますが、必要な時に通知先のインターフェースへの変換メソッドを呼び出せれば十分なので以下のように `asObserver()` を持っていれば大丈夫そうです。

```swift
// 通知元にも通知先にもなりうるオブジェクトを表す
public protocol SubjectType: ObservableType { // 普段は Observable としてふるまう

    typealias SubjectObserverType: ObserverType

    func asObserver() -> SubjectObserverType // 必要なときに SubjectObserverType に変換できる

}
```

また、`BehavoirSubject` をスレッドセーフに実装するために [`NSRecursiveLock`](https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSRecursiveLock_Class/) が使われています。これは `lock` している場合に同一スレッド以外からのアクセスを、`unlock` されるまで待たせることができるものです。使い方は、以下のように直感的なものです。

```swift
func setNumber(number: Int) {
    lock.lock()
    self.number = number
    lock.unlock()
}
```

スコープから抜けるときに必ず `unlock` が実行されるという点を強調するためなのか、RxSwift では `defer` を使った次のような書き方がちらほら見受けられます（とはいえ統一されているわけではない）。

```swift
func setNumber(number: Int) {
    lock.lock(); defer { lock.unlock() }
    self.number = number
}
```

これらを踏まえた上で `BehaviorSubject` の実装をしていきましょう。基本的には前節で実装した `StringObservable` に対して、`SubjectType`, `Disposable` の実装と排他制御を追加しただけの構造になっています。

```swift
public final class BehaviorSubject<Element>
    : Observable<Element>
    , SubjectType
    , ObserverType
    , SynchronizedUnsubscribeType
    , Disposable {

    public typealias SubjectObserverType = BehaviorSubject<Element>
    typealias DisposeKey = Bag<AnyObserver<Element>>.KeyType

    private let lock = NSRecursiveLock()

    // BehaviorSubject が持つ状態
    private var value: Element   // 保持している値そのもの
    private var disposed = false // dispose済みかどうかを保持するだけ
    private var observers = Bag<AnyObserver<Element>>() // 通知先を保持している
    private var stoppedEvent: Event<Element>?           // ストリームが閉じたとき、その終端を保持するフィールド

    public init(value: Element) {
        self.value = value
    }

    public func on(event: Event<E>) {
        lock.lock(); defer { lock.unlock() }
        guard stoppedEvent == nil && !disposed else { return } // すでにストリームが閉じているときは何もしない
        switch event {
        case .Next(let value): self.value = value
        case .Error, .Completed: self.stoppedEvent = event
        }
        observers.forEach { $0.on(event) } // observer各位に通知
    }

    public override func subscribe<O : ObserverType where O.E == Element>(observer: O) -> Disposable {
        lock.lock(); defer { lock.unlock() }
        if disposed {
            // すでに dispose されているので、購読できない旨のエラー値を返す
            observer.on(.Error(NSError(domain: "RxErrorDomain", code: 0, userInfo: ["message":"already disposed"])))
            // 購読に至っていないので何もしない Disposable を返す（下部に実装があります）
            return NopDisposable.instance
        } else if let stoppedEvent = stoppedEvent {
            // ストリームがエラーか完了イベントによって閉じているので、最終イベントを返す
            observer.on(stoppedEvent)
            // 購読に至っていないので何もしない Disposable を返す（下部に実装があります）
            return NopDisposable.instance
        } else {
            // 通常通り、通知先リストにぶち込み、SubcriptionDisposableを返す
            let key = observers.insert(AnyObserver(observer: observer))
            observer.on(.Next(value))
            return SubscriptionDisposable(owner: self, key: key)
        }
    }

    func synchronizedUnsubscribe(disposeKey: DisposeKey) {
        lock.lock(); defer { lock.unlock() }
        if !disposed {
            observers.removeKey(disposeKey)
        }
    }

    public func asObserver() -> BehaviorSubject<Element> {
        return self
    }

    public func dispose() {
        lock.lock(); defer { lock.unlock() }
        disposed = true
        observers.removeAll()
        stoppedEvent = nil
    }

}

public class NopDisposable: Disposable {

    private init() {}
    public static let instance = NopDisposable()

    public func dispose() {}

}
```

クライアント側のコードは前節とほぼ同じ形となります。

```swift
let observable = BehaviorSubject(value: "cocoa")
let disposable = observable.subscribe(AnyObserver<String> {
    switch $0 {
    case .Next(let str): NSLog(str)
    default: break
    }
})
observable.on(.Next("chino")) //=> NSLog("chino") される

disposable.dispose()
observable.on(.Next("megu"))  //=> AnyObserverの購読を解除しているので、NSLogされない
```

### Variable

`BehavoirSubject` は `on` で `.Error` や `.Completed` を渡すことにより閉じることができてしまいますが、ただの値を `Observable` にしたいだけならそんな機能は要らないはずです。そこで、そういったインターフェースを隠蔽し、もっと変数ライクに扱えるようにしたのが `Variable` です。基本的に実装は、ただの変数ラッパー + `asObservable` のために保持している`BehavoirSubject` ですが、不要な API の隠蔽と、変数として扱うのに便利な computed property を生やす役割を担っていると言ってよいと思います。

```swift
public class Variable<Element> {

    public typealias E = Element

    private let subject: BehaviorSubject<Element>
    private var lock = NSRecursiveLock()
    private var _value: E

    public var value: E {
        get {
            lock.lock(); defer { lock.unlock() }
            return _value
        }
        set(newValue) {
            lock.lock()
            _value = newValue
            lock.unlock()
            subject.on(.Next(newValue))
        }
    }

    public init(_ value: Element) {
        _value = value
        subject = BehaviorSubject(value: value)
    }

    public func asObservable() -> Observable<E> {
        return subject
    }

    deinit {
        subject.on(.Completed)
    }

}
```

こうして取り回しのきく `Variable` を作ることができました。RxSwift には他に `PublishSubject` や `ReplaySubject` というような `Subject` （通知元にも通知先にもなりうるオブジェクト）が存在しますので、また機会があれば別の記事でご紹介したいと思います。また、ここまで記事の内容を理解しながら読み進めている方であれば、ソースコードを読みさえすれば何をしているか大体わかるのではないでしょうか。

## まとめ

歴史的経緯はともあれ、Rx の基本的なインターフェースである `Observable`, `Observer` については以下のように説明できると思います（自分は歴史的経緯は知らないので実際の流れは違うかもしれません）

- push 型 Observer パターンが基本的な出発点
- 値に next, error, completed という文脈をつけたものが push の対象物になっているのが特徴的
- 購読解除の仕組みを `Disposable` に分離しているのが特徴的
- 以上を踏まえると `Observable`, `Observer` といったインターフェースを自然に導き出すことができる

また、Observable の実装クラスのうちのひとつである `BehaviorSubject` や `Variable` などについては次のようなことが  言えます。

- ある型のインスタンスを観測可能な状態（Observable）に簡単にリフトアップさせることのできる役割を持つ
- 同時に、観測者側（Observer）にも変換できる状態にする役割を持つ
- 中身は、単純に push 型 Observer パターンの Observable がやらなければならないことをスレッドセーフに実装しているだけ

最後にもう一度書いておきますが、この記事の内容がわからなくても、`RxSwift` は使えますので、利用を迷っている方は、巷に飛び交う記事に惑わされず、是非公式の Example や Playground を真似して使ってみてください。

# Appendix

## ライセンス表記

RxSwift は MIT ライセンスで公開されています。記事内のコードはライセンスに基づき、そのまま掲載している箇所や改変して掲載している箇所があります。

The MIT License Copyright © 2015 Krunoslav Zaher All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
