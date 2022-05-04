---
title: DelegatingHandlerを用いた快適なiOSアプリのHTTP通信周辺環境の整備
category: programming
date: 2017-10-21 17:15:00
tags: [Swift, Xamarin, iOS, CSharp]
pinned: false
---

昨今のネイティブクライアントアプリで、 HTTP 通信を行わないものはないと言っても過言ではないくらい、アプリ開発の基本中の基本だと思います。きっと、開発を行う中で HTTP 通信の前後に色々な処理を挟んでみたいという気持ちが湧いてくるのではないでしょうか。たとえば以下のような話です。

1. リクエストの内容をログ出力したい
2. 電波状況が悪いときはリクエストを走らせないようにしたい
3. 通信中はネットワークアクティビティインジケータを走らせたい

そんなときに `System.Net.Http.DelegatingHandler` はとても便利な代物です。公式のドキュメントはこちら: https://msdn.microsoft.com/ja-jp/library/system.net.http.delegatinghandler(v=vs.110).aspx

## 1. HTTP リクエストのログ出力

たとえば、Http リクエストの内容をログ出力したいとすれば、以下のような簡単な `DelegatingHandler` のサブクラスを作ってあげるとよいでしょう。

```
using System.Net.Http;
using System;
using System.Threading.Tasks;

namespace Pawotter.Net.Http
{
    public class HttpNetworkActivityDelegatingHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
        {
            Console.WriteLine(request);
            return base.SendAsync(request, cancellationToken);
        }
    }
}
```

実用的には `Console.WriteLine` をクリティカルセクションに配置したほうが良いかもしれませんが、ひとまずこのような単純なコードでリクエストの手前に処理を挟むことができました。使い方は、単純にこれを `System.Net.Http.HttpClient` のコンストラクタに渡すだけです。これで全てのリクエストの内容がログ出力されます。

```
var httpClient = new HttpClient(new HttpNetworkActivityDelegatingHandler());
var res = await httpClient.GetAsync("http://gochiusa.com");
```

## 2. 圏外時にリクエストを送らない

Reachability を使えば簡単です。

```
using System.Net.Http;
using System;
using System.Threading.Tasks;
using SystemConfiguration;

namespace Pawotter.Net.Http
{
    public class HttpNetworkActivityDelegatingHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
        {
            var reachability = new NetworkReachability(request.RequestUri.AbsoluteUri);
            if (reachability.TryGetFlags(out var flags) && !flags.HasFlag(NetworkReachabilityFlags.Reachable))
            {
                throw new Exception();
            }
            return base.SendAsync(request, cancellationToken);
        }
    }
}
```

## 3. 通信中にネットワークアクティビティインジケータを回す

ネットワークアクティビティインジケータの管理、非常にめんどうですよね。通信が同時に複数走るのはザラなので、そのあたりを考慮する必要があると思います。だいたい皆さん同じような実装をすると思うのですが、今走っている通信の数が正であれば、インジケータを回しっぱなしにして、0 になったら止めるみたいなカウンターを作るのではないかなと思います。ひとまずステップをわけて実装を見ていきます。

### 3.1. NetworkActivityIndicator の抽象化

ネットワークアクティビティマネージャは基本的に ON/OFF のインターフェースさえ持っていれば十分でしょう。それぞれ`Activate()`, `Inactivate()` という名前のメソッドとします。実装クラスは、`UIApplication` インスタンスを外から受け取り、`Activate()`, `Inactivate()` のタイミングで `NetworkActivityIndicatorVisible` の値に `true`, `false` をぶち込んであげれば良いという話になります。

```
namespace Pawotter.NetworkActivityManager
{
    interface IIndicator
    {
        void Activate();
        void Inactivate();
    }

    public sealed class NetworkActivityIndicator : IIndicator
    {
        readonly UIApplication application;

        internal NetworkActivityIndicator(UIApplication application)
        {
            this.application = application;
        }

        void IIndicator.Activate() => application.NetworkActivityIndicatorVisible = true;
        void IIndicator.Inactivate() => application.NetworkActivityIndicatorVisible = false;
    }
}
```

### 3.2. 走っているリクエストをカウントするクラスの作成

同時に走っているリクエストが 1 つ以上ある場合に `IIndicator` の `Activate()` を呼び出し、通信が走っていない状態になるとき `Inactivate()` を呼び出す簡単なカウンタークラスを作りましょう。

このカウンタークラスは、通信開始時には `Attach()`、 終了時には `Detach()` を呼ぶ簡単なインターフェースを持つことになるでしょう。それぞれインターフェースと実装コードは以下のようになると思います。

```
using System;
using System.Threading;

namespace Pawotter.NetworkActivityManager
{
    public interface IActivityManager
    {
        void Attach();
        void Detach();
    }

    /// <summary>
    /// このクラスは、アクティビティが存在する（正の値をとる）ときに Indicator を Activate します。
    /// また、アクティビティが存在しない（0をとる）ときに Indicator を Inactivate します。
    /// </summary>
    sealed class AnyActivityIndicatorManager : IActivityManager
    {
        /// <summary>
        /// 同時に実行されているアクティビティの数
        /// </summary>
        int count;

        readonly IIndicator indicator;
        readonly Object thisObject = new Object();

        internal AnyActivityIndicatorManager(IIndicator indicator)
        {
            this.indicator = indicator;
        }

        /// <summary>
        /// アクティビティカウントが0から1へと変化するときに indicator を Activate します
        /// </summary>
        void IActivityManager.Attach()
        {
            lock (thisObject)
            {
                if (count == 0) indicator.Activate();
                Interlocked.Increment(ref count);
            }
        }

        /// <summary>
        /// アクティビティカウントが1から0へと変化するときに indicator を Inactivate します
        /// </summary>
        void IActivityManager.Detach()
        {
            lock (thisObject)
            {
                if (count == 1) indicator.Inactivate();
                if (count > 0) Interlocked.Decrement(ref count);
            }
        }
    }
}
```

### 3.3. DelegatingHandler の実装

準備ができたので、今まで作ったものを利用してネットワークアクティビティインジケータを通信が走っているときにクルクルまわす `DelegatingHandler` を実装しましょう。以下のようになります。

```
using System.Net.Http;

namespace Pawotter.NetworkActivityManager
{
    public class HttpNetworkActivityDelegatingHandler : DelegatingHandler
    {
        protected async override System.Threading.Tasks.Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
        {
            NetworkActivityManager.Instance.Attach();
            try
            {
                return await base.SendAsync(request, cancellationToken);
            }
            finally
            {
                NetworkActivityManager.Instance.Detach();
            }
        }
    }
}
```

コード全体を GitHub で公開しているので使いたい方はどうぞ。MIT ライセンスです。 Xamarin.iOS に依存するパッケージの nuget への放流方法イマイチよくわからんので有識者の方、教えていただけると嬉しいです

- Repository: https://github.com/pawotter/NetworkActivityManager

### 3.4. Swift での実現方法

URLSession ラップして、自分で HttpClient 作ればできるよ。実装はだいたい同じ。実装的にもパフォーマンス的にも改善の余地があるコードですが、わかりやすく伝えるとするならば以下のような実装コードになる気がします。

```
public final class ActivityIndicatorManager {

    private var count: UInt32
    private let application: UIApplication
    private let lock: NSRecursiveLock = NSRecursiveLock()

    public init(application: UIApplication) {
        self.application = application
        count = 0
    }

    public func activate() {
        lock.lock(); defer { lock.unlock() }
        if (count == 0) {
            application.isNetworkActivityIndicatorVisible = true
        }
        count = count + 1
    }

    public func inactivate() {
        lock.lock(); defer { lock.unlock() }
        if (count == 1) {
            application.isNetworkActivityIndicatorVisible = false
        }
        count = count - 1
    }
}
```

## 5. おわりに

DelegatingHandler ベンリすぎワロタ。あとこれを使うとリトライ処理とかも挟めてとってもベンリ&ベンリです。良いですね〜。
