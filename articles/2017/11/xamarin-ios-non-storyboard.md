---
title: Xamarin.iOSでのストーリーボードを使わない開発
category: programming
date: 2017-11-17 05:29:25
tags: [Xamarin, Xamarin.iOS, iOS, CSharp]
pinned: false
---

Visual Studio で Xamarin.iOS のプロジェクトを作成すると、ストーリーボードなどという忌まわしいものがデフォルトで作成されてしまい非常に厳しい気持ちになります。この記事では、それらを削除して、コードで UI を構成していくためのステップを説明します。3 分ほど作業をすれば邪魔なものが消えてなくなってくれます。

## 1. `Main.storyboard` を削除

<img width="490" src="https://qiita-image-store.s3.amazonaws.com/0/56771/45a901e8-92f0-bbc1-da55-bf0996d730ec.png">

## 2. `ViewController.designer.cs` を削除

<img width="531" src="https://qiita-image-store.s3.amazonaws.com/0/56771/79380b0f-99a8-fe0b-5738-59dd17d507b9.png">

## 3. ViewController の余計なコードを削除する

`ViewController` が partial class である必要がなくなったので、partial キーワードを消します。合わせて `IntPtr` を引数にとるコンストラクタも不要になりました。

```
using System;

using UIKit;

namespace Pawotter.iOS
{
-   public partial class ViewController : UIViewController
+   public class ViewController : UIViewController
    {
-       protected ViewController(IntPtr handle) : base(handle)
-       {
-           // Note: this .ctor should not contain any initialization logic.
-       }

        public override void ViewDidLoad()
        {
            base.ViewDidLoad();
            // Perform any additional setup after loading the view, typically from a nib.
        }

        public override void DidReceiveMemoryWarning()
        {
            base.DidReceiveMemoryWarning();
            // Release any cached data, images, etc that aren't in use.
        }
    }
}
```

## 4. `Info.plist` の Main Interface を削除

<img width="593" src="https://qiita-image-store.s3.amazonaws.com/0/56771/2feef945-ff66-1a7a-80bd-9422d1cc349d.png">

## 5. AppDelegate に ViewController を表示するコードを追加

```
using Foundation;
using UIKit;

namespace Pawotter.iOS
{
    [Register("AppDelegate")]
    public class AppDelegate : UIApplicationDelegate
    {
        public override UIWindow Window { get; set; }

        public override bool FinishedLaunching(UIApplication application, NSDictionary launchOptions)
        {
+           Window = new UIWindow(UIScreen.MainScreen.Bounds);
+           var vc = new UIViewController();
+           vc.View.BackgroundColor = UIColor.Orange;
+           Window.RootViewController = vc;
+           Window.MakeKeyAndVisible();
            return true;
        }
    }
}
```

## 6. 動くサンプル

GitHub で公開しているので適当にどうぞ: https://github.com/pawotter/Xamarin.iOS.NonStoryboard
