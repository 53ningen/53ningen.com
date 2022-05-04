---
title: System.Net.Httpのリクエストやレスポンスをロギングする
category: programming
date: 2017-08-23 03:22:21
tags: [.NET, CSharp]
pinned: false
---

Swift の URLSession 使って自前で HttpClient 書いてたときは、リクエストパラメタとかいろいろをデバッグ時にログ出力してくれる便利なやつを自作していたんですが、.NET の HttpClient まあそのまま使うので、ロギングどうしようと思ってたらちゃんと用意してくれている。とても良い。

- .NET のロギング事情よくわからないので、ILogger がロガーのインターフェースだとして次のように書ける。ベンリ。
- DelegatingHandler を使う → [https://msdn.microsoft.com/ja-jp/library/system.net.http.delegatinghandler(v=vs.118).aspx](<https://msdn.microsoft.com/ja-jp/library/system.net.http.delegatinghandler(v=vs.118).aspx>)
- 冷静に考えると DelegatingHandler って名前漠然としすぎてて命名はもっと考えて作って欲しかった

```
using System.Net.Http;

namespace Your.Name.Space
{
    public class HttpDelegatingHandler : DelegatingHandler
    {
        readonly ILogger logger;

        public HttpDelegatingHandler(HttpClientHandler innerHandler, ILogger logger) : base(innerHandler)
        {
            this.logger = logger;
        }

        protected async override System.Threading.Tasks.Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
        {
            logger.Debug(request);
            return await base.SendAsync(request, cancellationToken);
        }
    }
}
```

これを使ってリクエストを送ると例えば以下のようなログ出力が得られる

```
[DEBUG] Method: GET, RequestUri: 'https://example.com', Version: 1.1, Content: <null>, Headers: { Accept: application/json } (HttpDelegatingHandler.cs:16)
```

便利
