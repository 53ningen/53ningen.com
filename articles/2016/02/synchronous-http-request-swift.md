---
title: Swiftで同期HTTP通信を走らせる
category: programming
date: 2016-02-07 09:24:45
tags: [Swift]
pinned: false
---

`NSURLSession` を使って通信を走らせる場合、コールバックやデリゲートなどで後処理を指定する非同期通信となります。基本的に通信処理を非同期で扱うのは正しいと思います。しかし、コールバックやデリゲート、`Future` や `Observable` などに縛られず処理を書きたいとなると、同期通信でないと困ります。

そこで強制的に同期通信にしてしまうコードを書いてみました。これで晴れてコールバックを渡す必要も無く、デリゲートを指定する必要もない。そして `Future` や `Observable` に包む必要のない状態になりました。

```
public class HttpClientImpl {

    private let session: NSURLSession

    public init(config: NSURLSessionConfiguration? = nil) {
        self.session = config.map { NSURLSession(configuration: $0) } ?? NSURLSession.sharedSession()
    }

    public func execute(request: NSURLRequest) -> (NSData?, NSURLResponse?, NSError?) {
        var d: NSData? = nil
        var r: NSURLResponse? = nil
        var e: NSError? = nil
        let semaphore = dispatch_semaphore_create(0)
        session
            .dataTaskWithRequest(request) { (data, response, error) -> Void in
                d = data
                r = response
                e = error
                dispatch_semaphore_signal(semaphore)
            }
            .resume()
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
        return (d, r, e)
    }

}
```

実際に UI 層から呼び出す前に、適当なタイミングで `Future` なり `Observable` なりに `lift` すればよいので、同期である方が柔軟な設計が可能になるのではないかなと思います。`execute` の戻り型が、 `Either<NSError, HttpResponse>` とかになっているとさらに良さそうですね。

純粋な `HttpClient` が `Future` や `Observable` に依存する必然性がないので、このコードが安定したものであれば、使っていきたいと考えています。iOS 開発に詳しい方、このコード実際どうなんですかね？（丸投げ）
