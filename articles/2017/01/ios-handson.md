---
slug: ios-handson
title: iOSアプリ開発基礎ハンズオン
category: programming
date: 2017-01-29 01:48:56
tags: [Swift]
pinned: false
---

この資料はラビットハウス社内で開催される、iOS アプリ開発未経験者向けのハンズオン会向けに作成されたものです。このハンズオンを一通り行うことにより、iOS 開発において以下のことができるようになります。

- 基本的な UIKit コンポーネントの利用
  - UILabel： テキストの表示
  - UIButton: ボタンの表示
  - UIBarButtonItem: バーボタンの表示
  - UITextField: テキストフィールドの表示
  - UITableView: テーブルの表示
  - UITableViewCell: テーブルセルのカスタマイズ
  - Storyboard と Auto Layout の利用: UI をデザインベースで構成する仕組み
  - プッシュ遷移とモーダル遷移: iOS の大きな 2 つの画面遷移パターンへの理解

# お品書き

```
0. はじめに （0分）
1. 環境構築 （5分）
2. プロジェクトの作成と Hello, world （10分）
3. 2種類の画面遷移(10分)
   --------------休憩--------------
4. TODOアプリを作ろう （60分）
```

# 0. はじめに

iOS アプリ開発自体は技術的にはそれほど難しくないため、他の分野のエンジニアに開発に関わってもらえるようにハンズオン会を開催しました。また、場合によっては、簡単なプログラミングができるアプリディレクターやデザイナーにも理解出来るようになるべく平易な内容とするように心がけました。 `if`, `else` などのキーワードや変数、関数などについてざっくりと理解していて、簡単な関数を実装できれば、この資料を見ながらきっと誰でもアプリ開発ができると思います。

2 時間で TODO アプリを作るところをゴールとして進めていきますが、プログラミングに慣れている方であれば 1 時間で終わってしまう内容かもしれません。しかしながら、iOS アプリ開発のフローは一通り体験でき、Google で検索をしながらアプリ開発を進めていけるレベルには達するのではないかと思います。また、このハンズオンで実装を進めていくアプリのソースコードは https://github.com/53ningen/iOSHandsOn に置いてありますので、困ったときは参照してみると良いかもしれません。

それでは、iOS アプリ開発の世界に飛び込んでいきましょう。

# 1. 環境構築

このハンズオンを進める上で必要な Xcode 8.2 の実行環境を構築します

## 1.1 Xcode 8.2 の導入

Xcode 8.2 を含めた過去のバージョンの Xcode は以下の URL からダウンロードすることができます。ダウンロード、およびインストールにはかなりの時間がかかりますので、時間に余裕のあるときにやることを強くお勧めします。

https://developer.apple.com/download/more/

### 1.2 .gitignore

自分がよくつかってる .gitignore は以下のような感じです

```
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate

Pods/*
Carthage/Checkouts
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots
fastlane/test_output
Manga-iOS.app*

fastlane/.env.test
fastlane/.env.prod

.bundle/
vendor/

.idea/

*.swp
!.gitkeep
.DS_Store
```

# 2. プロジェクトの作成、 Hello, world とその周辺

ここでは実際に開発を進めるためのプロジェクトを作成し、簡単な文字を表示させるところまでを行います。

## 2.1 プロジェクトの作成

Xcode を起動し、 `Create a new Xcode project` を選択してください。

<img alt="xcode" src="https://qiita-image-store.s3.amazonaws.com/0/56771/a60e107c-050f-284a-575e-e229ca456a17.png">

続いて `Single View Application` を選択してください。

<img alt="ChooseATemplateForYourNewProject" src="https://qiita-image-store.s3.amazonaws.com/0/56771/e1e9b02b-7a22-ba78-2d1b-a00cf5d78887.png">

`ProductName` として、とりあえず今回のハンズオンでは `iOSHandsOn` を指定しておきましょう。また、`Organization Name` は適当に、`Organization Id` についてはサービスのドメイン名や、github の id を指定することが多いかもしれません。

このあたりの指定については実際にプロダクトを `AppStore` へリリースするなどの際に重要になってきますが、今回のハンズオンアプリではとりあえずの値を指定しておけば良いでしょう。また、後から変更することも可能ですので、必要であればそのときに直せば良いと思います。

<img alt="ChooseOptionsForYourNewProject" src="https://qiita-image-store.s3.amazonaws.com/0/56771/5b6fd66e-2cde-518d-2a30-db1c5b4dae42.png">

以上をすすめると最後にプロジェクトを保存するパスを指定するダイアログが出てきますので、お好きな場所に保存すると良いでしょう。これでひとまず iOS アプリ開発のためのひな形を作成することができました。この状態で `Command` + `R` （アプリ実行へのショートカットキー） を押すと、iOS シミュレーターが立ち上がり、真っ白な画面が表示されると思います。

## 2.2 Hello, world

続いて簡単なサンプルとして画面に文字を表示させてみましょう。目標とするイメージは下図のようなものです。

<img src="https://qiita-image-store.s3.amazonaws.com/0/56771/f1de0b2d-0a77-1fdf-0cf9-e2ad3925e43f.png">

早速 `Main.storyboard` を選択し、右下にあるパネルからラベル（`UILabel`）を選択して上図のような画面を作ってみてください。ラベルに表示される文字はラベルをダブルクリックすると編集できるようになります。作業が終わったら再びシミュレーターで実行してみてください。きっとストーリーボードに入力した文字どおりの表示が出ているかと思います。しかしながら、このままでは画面回転をするときっとレイアウトが崩れてしまうでしょう。試しに `Command + →` キーを押して画面を回転させてみてください。

画面が回転した場合でも上下中央位置に表示させたい場合には Constraints（制約）を指定してあげる必要があります。ラベルを選択したあと、ストーリーボード編集画面右下のボタンを押し、下図のような設定にチェックを入れ `Add 2 Constraints` ボタンを押してください。それぞれ `Horizontally in Container` は水平方向中央揃え、`Vertically in Container` は上下方向中央揃えの意味となります。最後に右下 5 つアイコンがならんでいる部分の一番左、更新マークのボタンを押すと、追加された制約がストーリーボードに反映されます。

<img src="https://qiita-image-store.s3.amazonaws.com/0/56771/84f454b3-e4a5-989a-09a6-66b6cc3e6b80.png">

この状態で再びシミュレーターを立ち上げ画面を回転させてみてください。きっと画面がどのような方向を向いていてもラベルは画面上下中央位置に表示されたのではないでしょうか。もしストーリーボードを使わずコードで UI を構成する際も同じような形で Constrain を指示してあげないと、画面回転時や異なる縦横比のデバイスでの表示がおかしくなることがありますので、デバッグ時に画面を回転させながらデザインが崩れないかをチェックしてみてください。

> まとめ
>
> - 開発中はこまめに画面回転を試し、制約のつけ忘れなどミスがないかを確認しながらすすめる

## 2.3 ボタンを押したら文字がかわる機能をつける

画面にただ単に `Hello, world` と表示されているだけではつまらないので、ボタンを設置して、押したときの時刻が表示される機能を搭載してみましょう。まずはストーリーボードに対して下図のようにボタンを追加してください。

<img src="https://qiita-image-store.s3.amazonaws.com/0/56771/3faf7d1d-5bd3-c175-c541-ff41161befa2.png">

続いて Xcode の右上にある <img width="111" src="https://qiita-image-store.s3.amazonaws.com/0/56771/bbde4048-86d5-a84c-2e63-611b7cb8fd73.png"> ボタン（真ん中）を押してみてください。ストーリーボードとソースコードの２画面表示になったかと思います。この状態でラベルを選択したのち `control` キーを押しながらソースコードの適当な位置にドラッグすると下図のようなダイアログが出てくるでしょう。

<img width="761" src="https://qiita-image-store.s3.amazonaws.com/0/56771/c8afed8e-5210-be64-c4a5-4fb3d5f769f3.png">

Name に label と入力し Enter を押すと `@IBOutlet weak var label: UILabel!` というコードが追加されると思います。これはストーリーボード上にあるラベルをコードから操作できるようにリンクしてあげたと思っていただければ大体良いと思います。ボタンに関しても同様に操作を行うと `@IBOutlet weak var button: UIButton!` というコードが追加されるでしょう。

続いて、ボタンを押したときのイベント処理を書いてみましょう。 `ViewController.swift` を開いて、次のようなメソッドを追加してください。

```swift
    func buttonOnTapped(sender: UIButton) {
        let now = Date() // 現在時刻を取得
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "ja_JP") // ロケールを指定
        dateFormatter.dateFormat = "yyyy/MM/dd HH:mm:ss" // 時刻表示のフォーマットを指定
        // 指定したフォーマットで現在時刻を取得してラベルに反映させる
        label.text = dateFormatter.string(from: now)
    }
```

最後にボタンのタップイベント発生時にこのメソッドを呼び出すように設定するコードを追加します。

```swift
    override func viewDidLoad() {
        super.viewDidLoad()
        button.addTarget(self, action: #selector(ViewController.buttonOnTapped(sender:)), for: .touchUpInside)
    }
```

これでボタンが `.touchUpInside`、つまりタップして指を離した瞬間に、先ほど定義したメソッドを呼び出すという紐付けができました。早速シミュレーターで動かして試してみてください。おそらく、ボタンを押すと現在時刻が表示されるようになったのではないでしょうか？

ついでに、同じ仕組みを異なる方法で実装しておきましょう。一旦ストーリーボードのボタンを `control` キーを押しながらクリックして、`New Referencing Outlet` に紐付いているものを削除し、もう一度 `control` キーを押しながらソースコードへドラッグします。その際に下記のように `Connection` を `Action` に変更します。この場合 `Name` の欄にはボタンの名前ではなく `action` の名前を指定することになるので `buttonOnTouchUpInside` など適当な名前を指定してあげてください。すると今度はメソッド定義が生成されたのではないでしょうか。この手法ではこうして生成されたメソッド内に、ボタンが押されたときの挙動を定義していくことになります。

<img width="297" src="https://qiita-image-store.s3.amazonaws.com/0/56771/b2e3978c-a8d9-36dd-c5e3-66b8a8f55ddc.png">

さきほどと同じ内容を実現しようとすると最終的にコードは次のようになるかと思います。

```swift
class ViewController: UIViewController {

    @IBOutlet weak var label: UILabel!

    @IBAction func buttonOnTouchUpInside(_ sender: Any) {
        let now = Date() // 現在時刻を取得
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "ja_JP") // ロケールを指定
        dateFormatter.dateFormat = "yyyy/MM/dd HH:mm:ss" // 時刻表示のフォーマットを指定
        // 指定したフォーマットで現在時刻を取得してラベルに反映させる
        label.text = dateFormatter.string(from: now)
    }

}
```

実装が終わったらシミュレーターで実行してちゃんと動作するかを確認してください。これで iOS で UI を構成する最も基本的な UI 部品である `UILabel` と `UIButton` の使い方の雰囲気は理解できたのではないでしょうか。

> まとめ
>
> - ボタンのイベント処理には `@IBOutlet` を使う方法と `UIButton.addTarget` を使う方法がある

## 2.4 トラブルシューティング

この先ますます複雑なことをやるとしばしば謎のエラーがでて、うまくシミュレーターで実行できない場合がでてくるかと思います。そんな際は `command` + `shift` + `alt` + `K` キーを押して、ビルドした成果物をディレクトリごと消すということを試してみてください（mvn clean 的なものになります）。また Xcode がおかしな挙動を見せてくることがしばしばありますが、たいてい再起動すれば治るかと思います。

何か問題が生じた場合は無理に頑張ろうとせず、まず上記の 2 点を試してみるということを忘れずに、寛容な心で開発を進める必要があります。

# 3. 2 種類の画面遷移

1 画面だけで構成されるアプリはほとんどなく、プロダクトとして出すものは、ほとんどの場合画面遷移が発生します。iOS の画面遷移には主に次の 2 つのパターンが存在します。

1. モーダル遷移（下からビューが飛び出してくる、閉じるボタンでビューを閉じる）
2. プッシュ遷移（右方向にビューがスタックする、スワイプで戻れる）

[iOS ヒューマンインターフェースガイドライン](https://developer.apple.com/ios/human-interface-guidelines/overview/design-principles/)にこの 2 つの遷移の使い分けの思想について書かれているので、Apple 信者の方々は是非そちらをごらんください。そうでない場合には普段の iOS アプリの利用の仕方に照らし合わせて適切な方を選んでいくと良いでしょう。例えばコンテンツの構造として 「漫画アプリ」 ⊃ 「漫画作品」 ⊃ 「漫画エピソード」 という図式が成り立つのであれば、きっと漫画アプリトップから作品への遷移と作品からエピソードへの遷移はプッシュ遷移が適しているはずです。また、この間の任意の場所でログインさせるというアクションをユーザーにさせたい場合はモーダル遷移でログイン画面をユーザーに提示し、ログインが完了したらその画面を閉じてあげると良いでしょう。

余談になりますが、近年はデバイス自体が大型化してきており、モーダル遷移時の「閉じる」ボタンの位置が左上にあると手の大きさ的に届きにくい位置になるため、モーダルで出すビューの画面デザインをする際にこのあたりのことを気をつけると良いと思います（※ 個人の感想です）。前話が長くなってきたのでこのあたりにして、早速それぞれの遷移を実装してみましょう。

## 3.1 プッシュ遷移の実装

プッシュ遷移をするためには現在の `ViewController` が `UINavigationController` に属している必要があります（正確にいうと `UINavigationController` の `childViewControllers` の要素である必要ということ）。こんなこと言葉で言われてもわからないと思うので、早速作業をしながら理解していきましょう。

ここではボタンを押すとプッシュ遷移をする仕組みを実装していきたいので、その準備段階として `Main.storyboard` でいままで「時刻を表示」となっていた部分を「遷移する」というテキストに変えてみましょう。続いて、ViewController を選択し、右カラムのメニュー `Identity -> Storyboard ID` の部分に `Main` というテキストを入力しましょう。

そして「上部メニュー:Editor」→「Embed in」→「Navigation Controller」を選択してください。すると `Navigation Controller` とかかれたよく分からない画面が出現したと思います。と、同時にさきほどまでのビューの上部にも謎の灰色のスペースが生じてしまいました。とりあえず起動して動作確認してみましょう。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/455f6651-b4c6-b735-8a1a-d92011b81dcf.png)

上図のような状態になっているのではないでしょうか。さて、ここからプッシュ遷移を実装をしていきます。新しい画面を作るのは一旦後回しにして、まずは同じ画面に遷移するコードを書き足してみましょう。そのためにボタンのタップイベント処理のメソッド内を次のように書き換えます。

```swift
    @IBAction func buttonOnTouchUpInside(_ sender: Any) {
        let vc = UIStoryboard(name: "Main", bundle: Bundle.main)
            .instantiateViewController(withIdentifier: "Main") as! ViewController
        navigationController?.pushViewController(vc, animated: true)
    }
```

この状態でシミュレーターで実行すると、ボタンを押したときにきちんとプッシュ遷移できるようになっているのではないでしょうか？ またスワイプや左上の `<` ボタンで前の画面に戻れるようになっていると思います。

> まとめ
>
> - プッシュ遷移には `navigationController?.pushViewController` を使う

### 3.1.1 （プログラマ向けトピック） UINavigationController のふるまい

UINavigationController の振る舞いについてちょっとだけ見ておきましょう。冒頭で `UINavigationController` は UIViewController をスタックしていくことが役割だと言いました。その様子を実際に見るためにページ遷移が終わった瞬間（viewDidAppear）に `navigationController` の `childViewControllers` をログ出力するコードを `ViewController` に仕込みます。

```swift
    // 画面が表示された直後に呼ばれる
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        NSLog("\(navigationController?.childViewControllers)")
    }
```

この状態でシミュレーター実行をし、遷移をしたり戻りながら、ログ出力を観察してみましょう。

```
# 起動直後
iOSHandsOn[43460:5142923] Optional([<iOSHandsOn.ViewController: 0x7fc5836077d0>])
# 一回プッシュ遷移
iOSHandsOn[43460:5142923] Optional([<iOSHandsOn.ViewController: 0x7fc5836077d0>, <iOSHandsOn.ViewController: 0x7fc583618ca0>])
# 戻る
iOSHandsOn[43460:5142923] Optional([<iOSHandsOn.ViewController: 0x7fc5836077d0>])
```

きちんとスタック構造になっていることがわかるかと思います。

### 3.1.2 （プログラマ向けトピック） Storyboard と 型

静的型付け言語になれたプログラマであれば、`ViewController` を取得するときのコードについて文字列で指定しているあたりに恐怖心を覚える方もいるのではないでしょうか？ 実際この部分の指定を間違えると、静的チェックが走らず実行時にアプリがクラッシュします。

この部分に対する対応策は各自で取らざるを得ないのが現状で、例えば次のようなやり方をしている人が多いです。

1. 動作確認を徹底することによる対応（筋肉系）
2. `ViewController` を生成するファクトリを作り、そのファクトリのすべてのメソッドについてテストを書き、確実にインスタンスが得られることを保証する
3. `ViewController` と `Storyboard ID`（または Storyboard のファイル名） の命名規則を定める、`ViewController` の型を受け取り、そのインスタンスを生成するファクトリメソッドを用意し、アプリ内ではそれを通してインスタンスを得る

`3.` については具体的には、`MainViewController` に対する Storyboard の名前は必ず `MainViewController` にするという規則を設け、次のように ViewController の型名を取得して上記のようなことを実現するという手法になります。命名をミスれば安全でもなんでもない手法ですが、Storyboard や ViewController の名前を変更することはまれであるため、手軽な方法ではないかと考えています。

```swift
extension NSObject {
    // 型から型名を取得するユーティリティ関数
    static func getClassName() -> String {
        return NSStringFromClass(self)
            .components(separatedBy: ".").last! as String
    }
}

extension UIViewController {
    static func of<T: UIViewController>(_ cls: T.Type) -> T {
        return UIStoryboard(name: cls.getClassName(), bundle: Bundle.main).instantiateViewController(withIdentifier: cls.getClassName()) as! T
    }
}
```

### 3.1.3 （プログラマ向けトピック） Storyboard ID を使わず Storyboard に紐づく ViewController を取得する

以下のようなコードで可能です。口頭で説明いたします。

```swift
    @IBAction func buttonOnTouchUpInside(_ sender: Any) {
        // Main.storyboard を取得
        // Main.storyboard の InitialViewController は
        // UINavigationController なので as! 以後はそれを指定
        let nvc = UIStoryboard(name: "Main", bundle: Bundle.main)
            .instantiateInitialViewController() as! UINavigationController

        // 遷移先としたいの ViewController は
        // childViewControllers の 1つ目の要素なので
        let vc = nvc.childViewControllers[0] as! ViewController
        navigationController?.pushViewController(vc, animated: true)
    }
```

### 3.1.4 プッシュ遷移画面から戻るボタンの実装

プッシュ遷移をしたあとにスワイプで前の画面に戻れますが、ある条件のときに強制的に前の画面に戻したいことがあるかと思います。ここでは、ボタンを押すと前の画面に戻る機能を実装してみましょう。まずはおなじみ `Main.storyboard` を次のような状態に改変しましょう。またトラブル防止のため、各 UIButton を `control` + クリックし Outlet を一旦クリアにしましょう。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/ebc49a93-8c79-7e09-3382-d26018e60d3b.png)

続いて、ストーリーボード上のボタンとコードを結びつける作業をもう一度やりましょう。その作業が終わったら、まず「プッシュ遷移する」ボタンについて以前やったとおりに `addTarget` を利用してプッシュ遷移の実装を行ってください。これがおわるとコードは以下のような状態になっているかと思います。

```swift
class ViewController: UIViewController {

    @IBOutlet weak var label: UILabel!
    @IBOutlet weak var pushButton: UIButton!
    @IBOutlet weak var popButton: UIButton!

    override func viewDidLoad() {
        super.viewDidLoad()
        pushButton.addTarget(self, action: #selector(ViewController.pushButtonTapped(_:)), for: .touchUpInside)
    }

    func pushButtonTapped(_ sender: Any) {
        let nvc = UIStoryboard(name: "Main", bundle: Bundle.main)
            .instantiateInitialViewController() as! UINavigationController
        let vc = nvc.childViewControllers[0] as! ViewController
        navigationController?.pushViewController(vc, animated: true)
    }

}
```

つづいてポップボタンについてですが、こちらについては最初の画面では戻り先が存在しないのでボタンを無効化しておくのが親切だと思います。そのためにビューが読み込みされた時点（`viewDidLoad`）で `navigationController!.childViewControllers.count` （スタックされている ViewController の数） が 1 より大きかったら有効にしてあげる処理を記述します。

また、プッシュ遷移から戻る処理は `navigationController?.popViewController(animated: true)` という命令を呼び出してあげれば実現できるため、この処理とボタンのタップイベントを `addTarget` で紐付けましょう。

```swift
    override func viewDidLoad() {
        super.viewDidLoad()
        pushButton.addTarget(self, action: #selector(ViewController.pushButtonTapped(_:)), for: .touchUpInside)

        // 戻り先の画面が存在するときだけ、ボタンを有効にする
        popButton.isEnabled = navigationController!.childViewControllers.count > 1
        popButton.addTarget(self, action: #selector(ViewController.popButtonTapped(_:)), for: .touchUpInside)
    }

    func popButtonTapped(_ sender: Any) {
        _ = navigationController?.popViewController(animated: true)
    }
```

シミュレーターで実行すれば期待したとおりの動作になっているのではないでしょうか。

> まとめ
>
> - プッシュ遷移からもどるときには `navigationController?.popViewController` を使う

## 3.2 モーダル遷移

同様のノリでモーダル遷移についても実装していきましょう。モーダル遷移については `UINavigationController` うんぬんは一切関係なく、どのビューからもこの遷移が使えます。いつもどおり `Main.storyboard` に「モーダル遷移する」ボタンを、これまでの流れと同じ手順で一つ増やし、右上にモーダル画面を閉じるボタンを設置しましょう。イメージは下図のとおりです。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/6d3db2e1-dce0-c569-f77f-bd13addc316c.png)

例によって最初の画面では戻り先の画面が存在しないので、右上の × ボタンを無効化したくなります。モーダル遷移からの戻り先があるかどうかの判定には `presentingViewController` が使えます。これの中身が空っぽだった場合、戻り先がないということになります。諸々の実装は以下の通りになります。

```swift
class ViewController: UIViewController {

    @IBOutlet weak var label: UILabel!
    @IBOutlet weak var pushButton: UIButton!
    @IBOutlet weak var popButton: UIButton!
    @IBOutlet weak var modalButton: UIButton!
    @IBOutlet weak var dismissButton: UIBarButtonItem!

    override func viewDidLoad() {
        super.viewDidLoad()
        pushButton.addTarget(self, action: #selector(ViewController.pushButtonTapped(_:)), for: .touchUpInside)

        // プッシュの戻り先の画面が存在するときだけ、ボタンを有効にする
        popButton.isEnabled = navigationController!.childViewControllers.count > 1
        popButton.addTarget(self, action: #selector(ViewController.popButtonTapped(_:)), for: .touchUpInside)

        modalButton.addTarget(self, action: #selector(ViewController.modalButtonTapped(_:)), for: .touchUpInside)

        // モーダルの戻り先が存在するときだけボタンを有効にする
        dismissButton.isEnabled = presentingViewController != nil

        // UIBarButtonItem のイベント処理指定は UIButton と少し異なる
        dismissButton.target = self
        dismissButton.action = #selector(ViewController.dismissButtonTapped(_:))
    }

    // 画面が表示された直後に呼ばれる
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        NSLog("presentingVC: \(presentingViewController)")
        NSLog("nvc: \(navigationController!.childViewControllers)")
    }

    func pushButtonTapped(_ sender: Any) {
        let nvc = UIStoryboard(name: "Main", bundle: Bundle.main)
            .instantiateInitialViewController() as! UINavigationController
        let vc = nvc.childViewControllers[0] as! ViewController
        navigationController?.pushViewController(vc, animated: true)
    }

    func popButtonTapped(_ sender: Any) {
        _ = navigationController?.popViewController(animated: true)
    }

    func modalButtonTapped(_ sender: Any) {
        // モーダル遷移
        let nvc = UIStoryboard(name: "Main", bundle: Bundle.main)
            .instantiateInitialViewController() as! UINavigationController
        present(nvc, animated: true, completion: nil)
    }

    func dismissButtonTapped(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }

}
```

> まとめ
>
> - モーダル遷移には `present` を使う
> - モーダル遷移後の画面から元の画面に戻るには `dismiss` を使う
> - モーダル遷移の戻り先の VC は presentingViewController に格納されている

# 4 TODO 管理アプリの作成

UITableView（テーブルビュー）は iOS アプリでしばしば見かける UI コンポーネントのひとつです。たとえば標準のメールアプリや設定画面などに使われています。さて、ここからは簡単な TODO リスト管理アプリを作っていきましょう。TODO リストの表示にはテーブルビューが適していると思いますので、さっそく実装方法を見ていきましょう。

## 4.1 新しい画面の作成

Storyboard に新たな ViewController を追加するほうほうもありますが、ここでは新しいストーリーボードと新しい ViewController ファイルを追加しましょう。`TODOMainViewController.storyboard` と `TODOMainViewController.swift` を作成して以下のように画面を構成して、遷移できる状態まで持って行ってください。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/05e5b6e4-c577-0e64-fc71-c5a15069881a.png)

![](https://qiita-image-store.s3.amazonaws.com/0/56771/801635f7-fdd7-104e-3442-ca77b612ed60.png)

![](https://qiita-image-store.s3.amazonaws.com/0/56771/5562f5d1-2d3d-28da-8694-a96023a4515b.png)

`TODOMainViewController.swift` のソースコードは以下のような状態になっていると良いかと思います。

```swift
import UIKit
import Foundation

class TODOMainViewController: UIViewController {

    @IBOutlet weak var dismissButton: UIBarButtonItem!

    override func viewDidLoad() {
        super.viewDidLoad()
        dismissButton.target = self
        dismissButton.action = #selector(TODOMainViewController.dismissButtonTapped(_:))
    }

    func dismissButtonTapped(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }

}
```

これで TODO 機能を実装する下地が整いました。

## 4.2 テーブルビューを組み込んでみる

テーブルビューを組み込んでみましょう。`TODOMainViewController.storyboard` に `TableView`を追加して適切な constrain を設定しましょう。左・右・下方向への制約は `constrain to margins` のチェックボックスを外す必要がある点に注意してください。また ViewController 自体について `Under Top Bars` のチェックボックスをオフにしてください。TableView の Style は `Grouped` を選択します。

つづいて TableView をコードに紐付ける作業を行ったあと、以下のようにコードを記述してください。`tableView.dataSource` はテーブルのデータを供給するための設定でここには、`UITableViewDataSource` プロトコルを満たす全てのインスタンスを指定することができます。また、`tableView.delegate` はテーブルのふるまいを指定するための設定でここには `UITableViewDelegate` プロトコルを満たす全てのインスタンスを指定することができます。

```swift
class TODOMainViewController: UIViewController {

    @IBOutlet weak var dismissButton: UIBarButtonItem!
    @IBOutlet weak var tableView: UITableView!

    override func viewDidLoad() {
        super.viewDidLoad()
        dismissButton.target = self
        dismissButton.action = #selector(TODOMainViewController.dismissButtonTapped(_:))

        tableView.delegate = self
        tableView.dataSource = self
    }

    func dismissButtonTapped(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }

}

extension TODOMainViewController: UITableViewDataSource {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 10
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        return UITableViewCell()
    }

}

extension TODOMainViewController: UITableViewDelegate {

    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return 1
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        NSLog("selected row at: \(indexPath.item)")
    }

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 30
    }

}
```

ここで罠になるのが `tableView(_ tableView: UITableView, heightForHeaderInSection section: Int)` です。ここに `0` を指定するとなぜかテーブルビュー上部に大きな余白ができます。なので、雑に対応したければ、`0.1`などの小さな値を指定するとよいでしょう。厳密にやりたければここに任意の数字を指定して、tableView 自体を上方向にその任意の数字分ずらしてあげれば良いと思います（ホントか）。

## 4.3 テーブルビューのセルをスワイプできるアレ

テーブルビューのセルをスワイプできるアレを実現したいときには以下のようなコードを `extension TODOMainViewController: UITableViewDelegate` に追加します。

```swift
    func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
        return true
    }

    func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
        let action = UITableViewRowAction(style: .destructive, title: "Delete") { _,_ in
            NSLog("DeleteButton tapped: row at \(indexPath.item)")
        }
        return [action]
    }
```

## 4.4 テーブルビューセルの表示を作る

画面を構成する部品を作るには Storyboard ではなく、 xib というファイルを作ったほうが良いことが多いです（※あまりこだわりはないし、宗教的な問題だと思うので思想の強い方はブコメとかで暴れていただければ）。さっそくタスク名を表示するだけのセルを作ってみましょう。iOSHandsOn 直下に `TODOMainViewTableCell.xib` と `TODOMainViewTableCell.swift` というファイルを作り、xib に View を紐付けてください。このあとの作業はストーリーボードでやったときと一緒なので、同じノリでやって下図のような状態にしてみてください（だんだん説明が雑になってきた）。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/0c1e0aaf-9999-1592-8f43-265fbe809f6f.png)

## 4.5 「タスクを追加するテキストフィールド」を上部に適当に作る

もうだいたい絵を見れば実装する方法わかってきましたよね？ `TODOMainViewController.storyboard` を以下の状態に変更して、コードベースとの紐付けもよしなにやってください（雑）。

![](https://qiita-image-store.s3.amazonaws.com/0/56771/fe50fdec-9a8f-9cfd-9d79-ba93fdbada55.png)

## 4.6 TODO データの入力・保存・削除の仕組みをひと通り実装する

TODO データを保存する仕組みとしてとりあえず、文字列のリスト（`[String]`, `Array<String>`） を使いましょう。注意して欲しいのは、この実装では TODO 管理機能のモーダルを `dismiss` するとすべてのデータが水の泡になるという点です。ちゃんとデータを保持するためのほうほうは後ほどご紹介しますが、基本的にはここで完成させたものに少し手をいれて、iOS デバイス内のファイルに保存するという形になりますので大筋の流れは同じです。というわけで、まず `TODOMainViewController` に以下のコードを追加しましょう。

```swift
    fileprivate var tasks: [String] = ["go to school", "go back home"]
```

また、表示させるセルの数はタスクの数と同じにしたいので `tableView(_ tableView: UITableView, numberOfRowsInSection section: Int)` を変更する必要があります。セルにはタスク名を表示させたいので `tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath)` にも手を入れます

```swift
extension TODOMainViewController: UITableViewDataSource {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return tasks.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if let cell = tableView.dequeueReusableCell(withIdentifier: "TODOMainViewTableCell") as? TODOMainViewTableCell {
            cell.taskLabelText = tasks[indexPath.item]
            return cell
        } else {
            return UITableViewCell()
        }
    }

}
```

### 4.6.1 タスクの削除

削除については対象のセルのインデックスと変数 `tasks` のインデックスが一致しているので、変数からタスクを削除してテーブルの再描画命令を呼び出してあげればよいので簡単です。削除はセルをスワイプすると出てくるボタンで実現するので、`tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath)` に手を入れます。

```swift
    func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
        let action = UITableViewRowAction(style: .destructive, title: "Delete") { [weak self] _,_ in
            self?.tasks.remove(at: indexPath.item)
            tableView.reloadData()
        }
        return [action]
    }
```

シミュレータで実行すると、もうタスク削除機能がうまく動作していることがわかるのではないでしょうか？

### 4.6.2 タスクの追加

テキストフィールドに文字を入力して、エンターを押した瞬間にタスクが追加されるという仕様を実装に落とし込みましょう。テキストフィールドの振る舞いは `UITextFieldDelegate` プロトコルを実装したクラスのインスタンスを指定することができます。

```swift
        // viewDidLoad に追記
        addTaskTextField.delegate = self
```

```swift
extension TODOMainViewController: UITextFieldDelegate {

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        if let task = textField.text, task != "" {
            tasks.append(task)
            textField.text = ""
            tableView.reloadData()
        }
        return true
    }

}
```

また普通のアプリだとキーボードで文字入力中にテキストフィールド以外の適当な部分をタップすると、キーボードを閉じて入力を中断することができます。その振る舞いを実装するには次のようなコードを追記すればよいと思います。

```swift
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        addTaskTextField.resignFirstResponder()
    }
```

まあこのままじゃテーブルビュー領域をタップした時にキーボードを閉じないんですけどね...。

### 4.6.3 ローカルへのデータ保存

あとで書く

## 4.7 テーブルビューのよくある実装

テーブルビューを実装するときによく使われるのが「引っ張って更新」と「セルの逐次読み込み」なので、それぞれどのように実装されているのかを軽くおさらいしておきます。

### 4.7.1 引っ張って更新の実装

説明あとで書く

```swift
    private let refreshControl: UIRefreshControl = UIRefreshControl()
```

```swift
        refreshControl.addTarget(self, action: #selector(TODOMainViewController.onRefresh(_:)), for: .valueChanged)
```

```swift
    func onRefresh(_ sender: Any) {
        // refresh に2秒かかる処理と仮定した擬似コード
        DispatchQueue.global().async {
            sleep(2)
            DispatchQueue.main.async { [weak self] _ in
                self?.refreshControl.endRefreshing()
            }
        }
    }
```

さりげなく非同期処理の導入をしてしまった

### 4.7.2 ページネーションの実装

あとで書く

# 5. CocoaPods の導入

iOS 開発にはしばしば依存ライブラリ管理ツールとして `CocoaPods` が利用されています。これは node における `npm` や Java における `maven` などのようなものです。`CocoaPods` は Ruby で作られていて、Mac には標準で Ruby の実行環境が入っていますが `CocoaPods` の最新バージョンは古い Mac に標準で入っている Ruby では動作しない可能性があります。

そこでまず Ruby のバージョン管理ツール `rbenv` を導入しましょう。続いて Ruby のライブラリ管理ツールである `bundler` を導入し、それを利用して `CocoaPods` を導入します。よく分からないと思った方は、とりあえずおまじないだと思って以下のコマンドを実行していってみてください。余談ですがチーム開発においては、手元の環境で `CocoaPods` が正常に動くとしても新しいメンバーが開発に加わりやすいように `rbenv` を導入しておくと何かとスムーズで良いと思います。[^1]

[^1]: rbenv を利用した開発フローに載せてくださった @koki_cheese さん、ありがとうございます

### 5.1 rbenv を使った Ruby 2.3.3 の導入

[rbenv](https://github.com/rbenv/rbenv) とは、複数の Ruby バージョンを切り替えることができるツールになります。マシンによっては OS X 標準で入っている Ruby のバージョンが古く、iOS アプリ開発によく使われる Ruby のライブラリ（gem）がうまく利用できない場合があるため、rbenv を利用して特定環境かにおけるつまづきどころをなくす意図があります。

```sh
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
rbenv install 2.3.3
```

### 5.2 bundler と CocoaPods の導入

```
# bundler の導入
rbenv exec gem install bundler
rbenv rehash
```

プロジェクトルートに Gemfile を以下のように追加して `rbenv exec bundle install` を実行してください

```
source 'https://rubygems.org'

gem 'cocoapods', '~> 1.1.1'
```

続いて `rbenv exec bundle exec pod init` で `Podfile` が生成されるので、いい感じに依存を指定して、 `rbenv exec bundle exec pod install` すれば良いと思います。

# 6. 追加課題

- データ構造の定義（リスト/遅延リスト/スタック/キュー）
  - ユニットテストを書く
- 電卓アプリの作成
  - その 1: ボタンベースの iOS 標準の電卓を目標に進める
  - その 2: テキストフィールドベースでユーザーに数式を入力させ、計算結果を表示するアプリ
- 本格的な TODO アプリを作成してください
  - タスクをどういった形で持てば拡張性を維持できる？
  - タスクがマイルストンやタグといったものに紐づくときにはどうすればよい？
  - データやロジックと UI がなるべくひっつかないようにするためにはどうしたらよい？
- 株価/天気アプリの作成

時間が余ったら

- URLSession を使った HTTP 通信
- DispatchQueue を使った非同期処理
- RxSwift を用いた非同期処理

などを試してみてください。
