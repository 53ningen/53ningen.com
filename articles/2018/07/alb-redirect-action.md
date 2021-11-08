---
slug: alb-redirect-action
title: Redirect HTTP to HTTPS を ALB で実現する
category: programming
date: 2018-07-30 22:43:47
tags: [AWS, ELB]
pinned: false
---

先日(2018/07/25)、ALB に、リダイレクト/固定レスポンスという 2 つのアクションが追加されたので早速試してみた。

> 情報ソース
> [Elastic Load Balancing で Application Load Balancer のリダイレクトおよび固定レスポンスのサポートを発表](https://aws.amazon.com/jp/about-aws/whats-new/2018/07/elastic-load-balancing-announces-support-for-redirects-and-fixed-responses-for-application-load-balancer/)

## リダイレクトアクション

ALB リスナーのルール設定のアクションにおいて、転送先のターゲットグループを設定する以外に「リダイレクト先...」および「固定レスポンスを返す...」という項目が選択可能になっていた。

「リダイレクト」を選択すると以下の項目が設定可能だった。

- プロトコル
- ポート
- ホスト/パス/クエリ
- HTTP ステータスコード（301/302）

ホスト、パス、クエリを維持したまま、HTTPS エンドポイントにリダイレクトしたり、あるいは HTTP リクエストは問答無用でパス、クエリを破棄し、対象ホストの HTTPS エンドポイントにリダイレクトをしたり、ニーズにより複雑なカスタマイズが可能となっていた。

### 試してみる

ALB の HTTP80 リスナーに対して ホスト: \*.53ningen.com への HTTP リクエストを、ホスト・パス・クエリを維持したまま HTTPS エンドポイントにリダイレクトする設定をいれてみました。結果は以下の通りです。

```
$ curl "http://*********.********.elb.amazonaws.com/path/to/res?key=value&hoge=fuga" -H 'Host: test.53ningen.com' -I
HTTP/1.1 301 Moved Permanently
Server: awselb/2.0
Date: Mon, 30 Jul 2018 13:35:01 GMT
Content-Type: text/html
Content-Length: 150
Connection: keep-alive
Location: https://test.53ningen.com:443/path/to/res?key=value&hoge=fuga
```

また、クエリ、パスを破棄するように設定すると次のような挙動となりました。

```
$ curl "http://*********.********.ap-northeast-1.elb.amazonaws.com/path/to/res?key=value&hoge=fuga" -H 'Host: test.53ningen.com' -I
HTTP/1.1 301 Moved Permanently
Server: awselb/2.0
Date: Mon, 30 Jul 2018 13:35:46 GMT
Content-Type: text/html
Content-Length: 150
Connection: keep-alive
Location: https://test.53ningen.com:443/
```

リダイレクトの nginx/apache 設定書く手間が省けます。非常に便利ですね。

## 固定レスポンス

つづいて固定レスポンスを試してみます。

ALB の HTTP80 リスナーに対してホスト: 404.53ningen.com へのリクエストに ResponseCode: 404, Content-Type: text/html, Body: `<body><h1>Not Found</h1></body>` と返す設定をして動作を確認します。

```
$ curl "http://*******.*******.elb.amazonaws.com/path/to/res?key=value&hoge=fuga" -H 'Host: 404.53ningen.com'
<body><h1>Not Found</h1></body>
```
