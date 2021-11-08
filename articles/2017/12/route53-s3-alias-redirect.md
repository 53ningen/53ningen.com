---
slug: route53-s3-alias-redirect
title: Route53 で S3 バケットへ alias レコードを作った際のリダイレクトのふるまい
category: programming
date: 2017-12-02 03:24:05
tags: [AWS, Route53, S3]
pinned: false
---

Amazon S3 は、全てのリクエストをリダイレクトや、パスに応じたリダイレクトを設定できる機能を持っています。これは `Static Web Hosting` という設定を入れることにより実現可能です。実際の技術詳細については以下の公式ドキュメントを参照してください。

- 公式ドキュメント: https://docs.aws.amazon.com/AmazonS3/latest/dev/how-to-page-redirect.html

## リダイレクト設定

`gochiusa.53ningen.com` に対して `gochiusa.com` へのリダイレクト設定作業は以下の 3 STEP です

1. S3 バケットを `gochiusa.53ningen.com` という名前で作成する
2. `Static Web Hosting` 機能を有効にして、すべてのリクエストを `gochiusa.com` にリダイレクトする設定を入れる
3. Route 53 に `gochiusa.53ningen.com` に対して先ほど作ったバケットへのエイリアスを張る A レコードを作成する

## 動作確認

作業後、設定を dig で確認します

```
% dig gochiusa.53ningen.com @ns-771.awsdns-32.net.

; <<>> DiG 9.8.3-P1 <<>> gochiusa.53ningen.com @ns-771.awsdns-32.net.
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23376
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 4, ADDITIONAL: 0
;; WARNING: recursion requested but not available

;; QUESTION SECTION:
;gochiusa.53ningen.com. IN A

;; ANSWER SECTION:
gochiusa.53ningen.com. 5 IN A 52.219.68.26

;; AUTHORITY SECTION:
53ningen.com. 172800 IN NS ns-1431.awsdns-50.org.
53ningen.com. 172800 IN NS ns-2010.awsdns-59.co.uk.
53ningen.com. 172800 IN NS ns-393.awsdns-49.com.
53ningen.com. 172800 IN NS ns-771.awsdns-32.net.

;; Query time: 59 msec
;; SERVER: 205.251.195.3#53(205.251.195.3)
;; WHEN: Sat Dec  2 02:45:43 2017
;; MSG SIZE  rcvd: 192
```

解決される `52.219.68.26` は S3 の静的配信サーバーの IP の模様で、振る舞い的には `Host` ヘッダと同じ名前を持つ S3 バケットへリダイレクトをかけるという形のようです。それを確認するために次のようなリクエストを送ってみます。

```
% curl -I 52.219.68.26
HTTP/1.1 301 Moved Permanently
x-amz-error-code: WebsiteRedirect
x-amz-error-message: Request does not contain a bucket name.
x-amz-request-id: C6B9BBFE84DAC0E0
x-amz-id-2: L0Hv8iRFv2kIRyLUUlhre6cqJpGKfdPo+LYF4EfjgcIaA3W4L+TOzVhs+U+H5W/J3NRp4Jfnn2A=
Location: https://aws.amazon.com/s3/
Transfer-Encoding: chunked
Date: Fri, 01 Dec 2017 17:50:44 GMT
Server: AmazonS3
```

`x-amz-error-message: Request does not contain a bucket name.` というメッセージからわかるようにバケットネームの指定がないというエラーで AWS S3 のトップページに飛ばされます。次に Host ヘッダをつけるとどうなるか試してみましょう。

```
% curl -I -H "Host: gochiusa.com" 52.219.68.26
HTTP/1.1 404 Not Found
x-amz-error-code: NoSuchBucket
x-amz-error-message: The specified bucket does not exist
x-amz-error-detail-BucketName: gochiusa.com
x-amz-request-id: DF0A27572D2A69C2
x-amz-id-2: 6PAUKw9BxMEQjZ7ELLQELCOfXdCAMYpQEuH9fN8pdvK3HVCHwUTU3DIZTAaC+vJTevpEsi+jo4I=
Transfer-Encoding: chunked
Date: Fri, 01 Dec 2017 17:53:07 GMT
Server: AmazonS3
```

`The specified bucket does not exist` というエラーメッセージに変わりました。ではそろそろ真面目に先ほど作った `gochiusa.53ningen.com` という値を Host ヘッダにつけて叩いてみましょう。

```
% curl -I 52.219.68.26 -H "Host: gochiusa.53ningen.com"
HTTP/1.1 301 Moved Permanently
x-amz-id-2: JIFBN5bduooIXFt6ps6DKsGca1jEWKmojrNJqTx+7MPXEBeHUK3A/BMehFQlsjyYRvzgPcZ2U4w=
x-amz-request-id: 53093E7405B86943
Date: Fri, 01 Dec 2017 17:54:49 GMT
Location: http://gochiusa.com/
Content-Length: 0
Server: AmazonS3
```

正常に 301 で `http://gochiusa.com/` にリダイレクトされていることが確認できました。

## 実験からわかること

1. S3 バケットへの alias レコードセットの制約の理由が推測できる

- Route53 で S3 static web hosting しているバケットに alias を張る際は、公式ドキュメントに記載されているように Record Set の Name と S3 バケット名が一致している必要がある
- これは `Host` ヘッダをみて、対象の S3 静的配信コンテンツへのリダイレクトを行なっている仕組みから生まれる制約だろうということが、上記の実験から分かる

2. S3 バケットへの alias を張っているドメインを指す CNAME を張ると正常に動作しない

- 実際に `gochiusa2.53ningen.com` に対して `gochiusa.53ningen.com` を指すような CNAME レコードセットを作ると以下のような実験結果になる

```
% dig gochiusa2.53ningen.com @ns-771.awsdns-32.net.

; <<>> DiG 9.8.3-P1 <<>> gochiusa2.53ningen.com @ns-771.awsdns-32.net.
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 2232
;; flags: qr aa rd; QUERY: 1, ANSWER: 2, AUTHORITY: 4, ADDITIONAL: 0
;; WARNING: recursion requested but not available

;; QUESTION SECTION:
;gochiusa2.53ningen.com. IN A

;; ANSWER SECTION:
gochiusa2.53ningen.com. 300 IN CNAME gochiusa.53ningen.com.
gochiusa.53ningen.com. 5 IN A 52.219.0.26

;; AUTHORITY SECTION:
53ningen.com. 172800 IN NS ns-1431.awsdns-50.org.
53ningen.com. 172800 IN NS ns-2010.awsdns-59.co.uk.
53ningen.com. 172800 IN NS ns-393.awsdns-49.com.
53ningen.com. 172800 IN NS ns-771.awsdns-32.net.

;; Query time: 120 msec
;; SERVER: 2600:9000:5303:300::1#53(2600:9000:5303:300::1)
;; WHEN: Sat Dec  2 03:10:55 2017
;; MSG SIZE  rcvd: 216

% curl -I 52.219.68.26 -H "Host: gochiusa2.53ningen.com"
HTTP/1.1 404 Not Found
x-amz-error-code: NoSuchBucket
x-amz-error-message: The specified bucket does not exist
x-amz-error-detail-BucketName: gochiusa2.53ningen.com
x-amz-request-id: 294AEC84E239A2AC
x-amz-id-2: VAWMR0xq0Gw1cJOdipIgJBRsx6RMYaaP679GD/hKomU3yOFJ6m7/n62h9wraTQoirBYKofnO2WM=
Transfer-Encoding: chunked
Date: Fri, 01 Dec 2017 18:04:22 GMT
Server: AmazonS3
```
