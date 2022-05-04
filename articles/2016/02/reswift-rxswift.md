---
title: ReSwiftのサンプルコードの仕組みをRxSwiftで実現する
category: programming
date: 2016-02-12 07:45:25
tags: [アーキテクチャ, Swift, Redux]
pinned: false
---

[ReSwift](https://github.com/ReSwift/ReSwift)のサンプルコード程度であれば、[RxSwift](https://github.com/ReactiveX/RxSwift)の機能を使って自前で実装ができてしまうのでは、と考えたので実際にやってみました。不必要に依存ライブラリを増やしたくないという気持ちがモチベーションとなっています。まずは ReSwift のサンプルコード的なものを確認するところから始めます。

ちなみにこの記事は `ReSwift` を使い始めて数時間の人間が書いているので、間違っている可能性が大いにあります。嘘を嘘と見抜きながら読んでいただけると幸いです（そして、コメント欄で刺してください）。

# ReSwift とは？

Redux の Swift 実装らしいです。そもそも Redux がよくわからないのですが、そんなものわかってなくても動くコードはかけそうでした。ということで、とりあえずコードを書いて読んでから、小難しい記事を読んで理解してく方針にして、Redux および ReSwift の解説は他の記事に譲ります。

# 簡単な数字のカウントアップ・アプリケーション

まずは ReSwift を用いてどのようにアプリケーションを構成していくか、ごくごく簡単な数字のカウントアップ・アプリケーションの例を用いてみていきましょう（ただし実際にはこんな単純すぎるアプリケーションに小難しいアーキテクチャを採用するメリットはないと思っています、あくまで例示としてのお話です）。まず `CocoaPods` でも `Carthage` でもなんでもいいので適当に `ReSwift` を導入してください。

ReSwift ではアプリケーションの持つ状態を StateType プロトコルを持つ構造体 or クラスにまとめるようです。

```
struct AppState: StateType {
    var counter: Int = 0
}
```

つづいて `Action` の宣言です。今回のアプリケーションに発生しうるアクションとして数字をカウントアップするアクションとカウントダウンするアクションを宣言してみます。

```
struct CountActionIncrease: Action {}
struct CountActionDecrease: Action {}
```

簡単ですね？さて続いては、アクションを解釈して、新しい状態を発行する役割を持つ `Reducer` を実装してみましょう。状態を変化させるのではなく `新しい状態を発行する` という点に注意しながらコードをみてみると良いと思います。

```
struct CounterReducer: Reducer {

    typealias ReducerStateType = AppState

    func handleAction(action: Action, state: ReducerStateType?) -> ReducerStateType {
        switch action {
        case _ as CountActionIncrease: return AppState(counter: state.map { $0.counter + 1 } ?? 0)
        case _ as CountActionDecrease: return AppState(counter: state.map { $0.counter - 1 } ?? 0)
        default: return AppState(counter: 0)
        }
    }

}
```

そんなに難しいものではなく、`action` がもし、`CountActionIncrese` 型だったら、現在の状態の counter をカウントアップしたものを生成して返すというだけです。`Decrease` も同様に考えれば同じようなものですね。

最後に皆さんおなじみの `ViewController` を実装してみましょう。まずは、ストーリーボードに適当にラベルとボタンを配置してください。

<img src="http://53ningen.com/wp-content/uploads/2016/02/6e109d14fa63c55390127b401ca128d3.png" alt="スクリーンショット 2016-02-12 7.12.03" width="432" height="614" class="aligncenter size-full wp-image-327" />

つづいて、`ViewController` に `label` と ボタンのアクションを紐づけて、以下のようなコードを記述します。

```
import UIKit
import ReSwift

class ViewController: UIViewController, StoreSubscriber {

    private let store: Store<AppState> = Store<AppState>(reducer: CounterReducer(), state: AppState(counter: 0))

    @IBOutlet weak var label: UILabel!
    @IBAction func increaseButtonOnClick(sender: UIButton) {
        store.dispatch(CountActionIncrease())
    }
    @IBAction func decreaseButtonOnClick(sender: AnyObject) {
        store.dispatch(CountActionDecrease())
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        store.subscribe(self)
    }

    func newState(state: AppState) {
        label.text = String(state.counter)
    }

}
```

各アクションで文字通り `Action` を発行しているだけで、ラベルのテキストを書き換えたりカウンターの状態（数字）を書き換えたりしていない点が非常に重要なポイントです。アプリケーションの状態の書き換えは、Reducer で行います。そして、ビューの書き換えは `newState` で行います。こうすることにより、状態遷移（実際には新しいステートの発行）の記述と、ビューへの反映を分離しています。

以上のような簡単なアプリケーションだとしても、多分コードみただけじゃ、感覚はつかめないのではないでしょうか？簡単なので Xcode 起動して、ちゃちゃっと実験してみてください。5 分で終わるので絶対自分の手でコードを書いてみてください。

# RxSwift を使って、上述の形式のコードを実現する

細かいことは抜きにして、RxSwift を使って同じ動きをエミュレートしてみましょう。まずは state, action, reducer の定義から。

```
struct AppState {
    var counter: Int = 0
}

protocol Action {}
struct CountActionIncrease: Action {}
struct CountActionDecrease: Action {}

struct CounterReducer {

    typealias ReducerStateType = AppState

    func handleAction(action: Action, state: ReducerStateType?) -> ReducerStateType {
        switch action {
        case _ as CountActionIncrease: return AppState(counter: state.map { $0.counter + 1 } ?? 0)
        case _ as CountActionDecrease: return AppState(counter: state.map { $0.counter - 1 } ?? 0)
        default: return AppState(counter: 0)
        }
    }

}
```

ほとんど変化はないですね？次に `ViewController` は次のような感じ。ちょっと記述は長くなりましたが、だいたい読み替えは可能なのではないでしょうか？

```
import UIKit
import RxSwift

class ViewController: UIViewController {

    private var disposeBag: DisposeBag = DisposeBag()
    private let store: (PublishSubject<Action> ,Variable<AppState>) = (PublishSubject<Action>(), Variable(AppState(counter: 0)))

    @IBOutlet weak var label: UILabel!
    @IBAction func increaseButtonOnClick(sender: UIButton) {
        store.0.onNext(CountActionIncrease())
    }
    @IBAction func decreaseButtonOnClick(sender: AnyObject) {
        store.0.onNext(CountActionDecrease())
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        store.0.subscribeNext { action in
            self.store.1.value = CounterReducer().handleAction(action, state: self.store.1.value)
        }
        .addDisposableTo(disposeBag)
        store.1.asObservable()
            .subscribeNext(newState)
            .addDisposableTo(disposeBag)
    }

    func newState(state: AppState) {
        label.text = String(state.counter)
    }

}
```

もちろん、厳密なお話をするとおなじものにはなっていないのですが、ちゃんとプロトコルと基底となるコードをちょっと書いてあげれば、たちまち同じようなものになるのではないでしょうか？（自分の理解が間違っていたらご指摘をお願いします:ReSwift を触ってまだ 1 日目です）

# おわりに

楽なので、よくやってしまいがちなのは、ViewController に `var` で状態を宣言して、イベント処理時に変化させていくという感じの実装ではないでしょうか？このサンプルレベルの簡単なアプリケーションであれば、その実装は正しいと思います。シンプルでわかりやすいので、別にそれで全然かまわないと思います。

しかし状態の数が増えると、結果としてアプリケーションの取りうる状態の数は、各プロパティの取りうる状態の組み合わせ（高校で習った数学的なお話）になります。状態が 10 個程度を超えてくると、もうアプリケーションコードを読むのが辛くなってきたり、一つの変更が別の箇所に影響してしまい、意図しない動作を引き起こしてしまうなどということがあるのではないでしょうか。

自分もまだ `ReSwift` や `Redux` がどういうものがわかっていませんが、状態の遷移とビューへの反映の混在を分離するところから、まずはじめてみようと思っています。
