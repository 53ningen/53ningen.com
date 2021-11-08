---
slug: xamarin-ios-introduction
title: '[WIP] Xamarin.iOS アプリ開発の全体像'
category: programming
date: 2018-05-23 19:20:27
tags: [Swift, C++, Xamarin.iOS, iOS]
pinned: false
---

> この記事は[ 「初心者歓迎 Xamarin の LT 会！Xamarin 入門者の集い #4」](https://jxug.connpass.com/event/74628/)の発表補足資料です。

私のググる能力が低いだけかもしれませんが Xamarin.Forms での記事や事例報告、スライドに比べて、Xamarin.iOS を使ったという日本語レポートがとても少ない気がするので、特に Swift 　や Objective-C で iOS や macOS アプリを書かれている方に向けて、初めての一歩からリリースまでのざっくりとした全体の雰囲気についてお伝えします。

- あわせて読みたい:
  - [iOS アプリ開発の全体像 - Qiita](https://qiita.com/gomi_ningen/items/b8c9c5c11aee91be820e)
  - [Xamarin.iOS によるプロダクトアプリ開発の実践 - ニコナレ](https://niconare.nicovideo.jp/watch/kn2793)
  - [読書メーター iOS アプリにおける Xamarin.iOS 導入事例のご紹介 - Qiita](https://qiita.com/gomi_ningen/items/ce20176d86276fce71e3)

## 0. 取り巻く環境を選定しよう

iOS アプリを作ることになった場合、開発者に経験がなければ Swift, Objective-C で開発することが一番堅実な選択肢だと思います。iOS アプリに限った話ではないですが、得てしてフロントエンドというものはデバイス依存の問題、OS の問題、要因のよくわからない問題など、開発する上で様々な問題が生じます。一番情報量が多いという点と、オフィシャルであるという点で、やはり経験のない方は Swift, Objective-C を選ぶと良いでしょう。

すでに経験をお持ちの方には、個人的には Xamarin.iOS も選択肢のひとつとしてお勧めできると考えています。また、スタートアップなどでは ReactNative も実際に製品で利用されているケースを頻繁に目にします。また、クロスプラットフォーム開発という点においては　 Xamarin.Forms も有力な選択肢かと思います。

このような選択肢のなかからどれを選ぶべきか。答えは決して一つではないと思いますが、私の考えではその開発において、アプリユーザーに一番価値を提供できる環境を選ぶのが妥当ではないかなともっともらしいことを言っておきます。

小さいアプリでそれほど複雑なことをやらず Android と iOS を素早く作ってリリースしたいと言った場合、どの環境を選んでも、特段差し支えない程度にどれも一長一短あります。JavaScript が得意な方であれば、実はクイックさという点では ReactNative という選択肢もかなり有力なのではないかと思いますが、私自身は ReactNative でのストアアプリリリース経験は残念ながらないため、断言はできません。

ライブラリも含めてコードの枯らして安定した稼働を狙いたい場合や、機能追加に多くの時間をさきたいと言った場合、意外にも Objective-C や、言語として枯れている　 C# を利用する Xamarin.iOS を選択するのも一つの選択肢になるのではないでしょうか。

あるいは王道を行き冒険せずに素直に作る場合や、既存の資産を生かしたい場合は Swift で開発するのが妥当でしょう。まあ普通に考えれば Swift を使うのが一番無難です。

以上のようなことを鑑みて、どれを使うのがよいか皆様の価値観の軸を基準に選定してみてください。

## 1. Xamarin.iOS(C#) と Swift: 言語の違い

> 注: この節は現在書きかけです。雑な記述となっている点ご容赦いただければと思います。

環境の選定をする上で、それぞれの違いをそれなりに知っている必要があると思います。ここではまず、Swift と C# の言語という側面から、実際の開発に影響してくる違いをご説明します。

### 1.1. エディタ

個人の感想をあまり書きすぎるのはフェアじゃないのですが、この項目はどうしても個人の感想によってしまいますね。Visual Studio は快適です。

- C# では Visual Studio for Mac という強力な IDE が利用可能
  - 個人的にはかなり快適にプログラミングできる良い統合開発環境だと思います
  - C#, Java は冗長という点で叩かれやすい言語ですが、実際そんなに文字数打たない（無駄に長いコードは読み手のコストを削るので、冗長なのはその点ではよくないとは思いますが、書くのが大変という意見にはクエスチョンマークが付く気がします）
  - 会社で業務つかうときにはライセンス契約が必要です
- Swift では Xcode
  - 徐々に改善はしている（一時は変数のリネームとかできない状況でした）
  - AppCode を使うという手もあるが最近の Swift への対応状況追えていない（有識者〜）

### 1.2. 依存ライブラリの利用

基本的には C# のライブラリを利用することになります。 `nuget` という `CocoaPods` に相当するライブラリ管理システムがあり、Visual Studio に統合されているため、 GUI で簡単にライブラリの追加やアップデートが可能です。

Swift や Objective-C のライブラリを利用したい場合はネイティブバインディングを行うコードを記述しなければいけない点が面倒ではあります。要件的にこれらのライブラリを多く用いるような案件には向いていないことは確かです。ネイティブバインディングについての詳細は **[公式ドキュメント](https://developer.xamarin.com/guides/ios/advanced_topics/binding_objective-c/)** をご覧ください。

### 1.3. Optional(Swift), Nullable(C#)

- Swift では　 class/struct 問わず `Optional` が利用できます
- C# 7.0 まででは値型（struct） にしか `Optional` は利用できません
  - C# 8.0 からは参照型の `Optional` が利用できます [#](https://msdn.microsoft.com/ja-jp/magazine/mt829270.aspx)

現状は Swift の Optional のほうが扱いやすいというのが私の意見です。

### 1.4. 例外

- Swift ２ より例外が導入された
- C# はおおよそ Java などと同じ感覚で例外をハンドリング可能

### 1.5. 名前空間(C#)

- C# には扱いやすい名前空間が存在している
- Swift ではプロジェクト分割により似たようなことが可能だが、現実的には namespace より柔軟さに欠ける

現実的によほど大きな iOS アプリでない限り、細かく名前空間をコントロールする必要性はそこまで生じません。しかし、設計の観点から不要なものにはアクセスできないようにしておくことは、コードがどこから参照されて欲しいのかという意志を表現できたり、機能追加時に他の開発者がおかしな依存関係を作ってしまうことを防げたりできて、良いことだと思います。

### 1.6. アクセスコントロール(Swift), アクセシビリティ(C#)

- Swift: [The Swift Programming Language (Swift 4.1): Access Control](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/AccessControl.html)
- C#: [アクセス修飾子 (C# プログラミング ガイド) | Microsoft Docs](https://docs.microsoft.com/ja-jp/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers)

### 1.7. async/await

- C# では async/await を用いて、非同期処理の同期的な記述が可能
- Swift でも近い将来のアップデートで言語にフィットする形で導入される予定 [#](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20170814/038892.html)
  - 安定化とライブラリ側の対応を考えると現実的には少し先の将来となるかとは思います

### 1.8. 定数と変数、型推論

- Swift の let のほうが便利だと感じる
  - C# で対応するものは const, readonly あたりだが let とは本質的に異なる機能もあり単純な対応関係ではない
- 感覚的で申し訳ないですが、C# のほうが型推論に対して安定感を感じます（エディタの振る舞いのせいかも）

### 1.9. クロージャ(Swift), ラムダ式(C#)

ここも好みの問題ですが、C# のラムダ式のほうが一般的な記法で馴染みがあるという感覚程度の感想でしかない

### 1.10. abstract class(C#)

- C# にはインスタンス化をさせない抽象クラスのマークとして abstract キーワードが利用できる
  - ちょっと規模が大きくて複雑な設計をする際に、どうしても使いたくなるケースはあると思うが、基本的には継承を避ける方向で最大限対応したい

### 1.11. （余談） protocol と interface

- C# では interface が型パラメータを持てる
  - これについては、どちらかというとライブラリ層を書く人に影響が大きいかなと思う違い
  - アプリ開発のレイヤーで差はあまりでないと考えてよい
  - アプリ開発する上で、この点が大きく効いてくるとしたら設計ミスの可能性も大きそう

## 2. Xamarin.iOS(C#) と Swift: 同じ点

Xamarin.iOS にしろ Swift にしろ、あまり開発する上でかわらない点のうち、個人的には大きなポイントだなという部分をいくつかご紹介します。

### 2.1. UIKit の取り扱い

- Swift の API がそのまま C# の命名規則に移植されただけと考えて差し支えないレベルで、ほぼ１対１対応している
- 実際にコードの一例を見るとわかりやすい

Swift のコード

```swift
import UIKit
import CoreGraphics

class MainViewController: UIViewController {

    let button: UIButton = UIButton()

    override func viewDidLoad() {
        super.viewDidLoad()
        button.setTitle("gochiusa", for: .normal)
        view.addSubview(button)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        button.frame = CGRect(x: 0, y: 0, width: 100, height: 100)
    }
}
```

C＃ のコード

```csharp
using UIKit;
using CoreGraphics;

namespace Your.Name.Space
{
    class MainViewController : UIViewController
    {
        readonly UIButton button = new UIButton(UIButtonType.Custom);

        public override void ViewDidLoad()
        {
            base.ViewDidLoad();
            button.SetTitle("gochiusa", UIControlState.Normal);
            View.AddSubview(button);
        }

        public override void ViewDidLayoutSubviews()
        {
            base.ViewDidLayoutSubviews();
            button.Frame = new CGRect(0, 0, 100, 100);
        }
    }
}
```

### 2.2. Storyboard/Xib の取り扱い

Xamarin.iOS を使った場合でも Swift/Xcode での開発同様、ストーリーボードや Xib を用いることができます。Visual Studio for mac 上で直接編集することができるほか、物自体は同じなので Xcode で編集することもできます。詳しくは [公式ドキュメント](https://docs.microsoft.com/ja-jp/xamarin/ios/user-interface/storyboards/) をご覧ください。

<a href="https://static.53ningen.com/wp-content/uploads/2018/05/22225350/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e616d617a6f6e6177732e636f6d2f302f35363737312f62636533323633652d393465652d373764322d346234372d6439363465333931663032652e706e67.png"><img src="https://static.53ningen.com/wp-content/uploads/2018/05/22225350/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e616d617a6f6e6177732e636f6d2f302f35363737312f62636533323633652d393465652d373764322d346234372d6439363465333931663032652e706e67-1024x585.png" alt="" width="640" height="366" class="aligncenter size-large wp-image-2658" /></a>

### 2.3. Assets Catalog の利用

画像の取り扱いも基本的には Xcode で開発していたときと同様に Assets Catalog を利用することができます。詳しくは **[公式ドキュメント](https://developer.xamarin.com/guides/ios/application_fundamentals/working_with_images/displaying-an-image/#adding-assets)** をご覧ください。

<img width="1192" src="https://qiita-image-store.s3.amazonaws.com/0/56771/8c6501af-e6e3-1024-54f5-21d22ddafaee.png">

### 2.4. plist の利用

plist に関しても Xcode で開発していたときと同様に使うことができます。Info.plist については Visual Studio 上にも GUI で編集ができるので、感覚としては全く変わらずに開発できると思います。**[公式ドキュメント](https://developer.xamarin.com/guides/ios/application_fundamentals/working_with_property_lists/)** はこちらです。

<img width="1195" src="https://qiita-image-store.s3.amazonaws.com/0/56771/c16e5c69-dba9-9f68-e3e5-7389b7027511.png">

### 2.5. 多言語化対応

iOS 開発者にはおなじみの Localization の仕組みがそのまま使えます。詳細は **[公式ドキュメント](https://developer.xamarin.com/guides/ios/advanced_topics/localization_and_internationalization/)** をご覧ください。

## 3. Xamarin.iOS 開発を取り巻く環境

### 3.1. CI/CD

NUnit を利用したユニットテストの実行は Bitrise を用いると簡単に実現できます。基本的にウィザードに従い、GitHub リポジトリとの連携をかけるだけで、テストやアーカイブ、ベータ配信などを自動化できます。

たとえば、純粋な .NET のプロジェクトとそれに依存する Xamarin.iOS プロジェクトを持つようなソリューションの CI の実現例として [Xamarin.iOS.NonStoryboard](https://github.com/pawotter/Xamarin.iOS.NonStoryboard) を作りましたので、フォークなどをしてお試しいただければと思います。

<img width="1245" src="https://qiita-image-store.s3.amazonaws.com/0/56771/71aa40a6-bd0e-af23-f845-06b0751943f7.png">

### 3.2. GoogleAnalytics を用いたアクセス解析

GoogleAnalytics は、一般的な iOS アプリ開発同様、簡単に導入することができます。 nuget から `Xamarin.Google.iOS.Analytics` パッケージをインストールして、以下のような記述を追加すれば連携がおしまいです。

```csharp
Gai.SharedInstance.GetTracker(/* TrackingName */, /* TrackingId */);
Gai.SharedInstance.TrackUncaughtExceptions = true;
Gai.SharedInstance.Logger.SetLogLevel(LogLevel.None);
Gai.SharedInstance.DispatchInterval = 5;
```

### 3.3. クラッシュレポートの取得

Xamarin.iOS でのアプリ開発においても、アプリ開発者にはおなじみの Fabric/Crashlytics を利用することができますが、ここでは HockeyApp というサービスをご紹介します。HockeyApp を使うとクラッシュ時に C# のスタックトレースをサーバーサイドへ送出してくれます。導入ステップは以下のとおり。

1. HockeyApp 上でアプリを登録して App Id を発行する
2. HockeySDK.Xamarin を nuget でインストール
3. AppDelegate に以下のコードを貼り付ける
4. わざとどこかでクラッシュさせてクラッシュレポートが飛ぶかを確認する

なお、iOS10 系のシミュレータでは動作確認が上手くいかない不具合があるようで、実機の iOS10 系を用いました。

```csharp
        public override bool FinishedLaunching(UIApplication application, NSDictionary launchOptions)
        {
            // ...
            var manager = BITHockeyManager.SharedHockeyManager;
            manager.Configure("<!-- AppId をここにはる -->");
            manager.CrashManager.CrashManagerStatus = BITCrashManagerStatus.AutoSend;
            manager.StartManager();
            manager.Authenticator.AuthenticateInstallation();

            // ...
            return true;
        }
```

無事以下のようなクラッシュレポートを受け取ることができます

![](https://qiita-image-store.s3.amazonaws.com/0/56771/04a1bc74-776f-3b1f-818b-95ab0b21c63f.png)

他にもベータ版配信の仕組みやアプリのアナリティクス機能も備えています。

## 4. まとめ

- どの環境を使うか、きちんと選定しましょう
  - プロダクト開発の際は Xamarin.iOS を使うかを含めてしっかり検討しましょう
  - Xamarin.iOS(C#) にフィットする設計を検討しよう
  - クロスプラットフォームや環境の安定性において Xamarin.iOS には優位性があると考えています
- iOS Native 経験があればほぼ躓くことなく開発可能
  - iOS Native 経験者はトライしてみよう
  - UIKit/Storyboard, Auto Layout の知識は活かせます
