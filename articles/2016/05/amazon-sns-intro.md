---
title: Amazon Simple Notification Service(SNS)の基本的な仕組み
category: programming
date: 2016-05-06 14:53:23
tags: [AWS]
pinned: false
---

<p>用語や概念が少し分かりづらい部分があるため、最初に基本的な仕組みや用語の説明を自分用にまとめました。</p>

[amazon template=wishlist&asin=4839952337]

<h2>通知を送る方法</h2>

<p>Amazon SNSを用いて、モバイルPUSH通知を実現するためには、 トピックを利用した通知 と デバイスを直接指定した通知（直接アドレス指定） の 2 種類の方法があります。</p>

<h3>トピックを利用した通知</h3>

<ul>
<li>Amazon SNSには 通知を送りたいクライアント（Publisher）と通知を受け取りたいクライアント（Subscriber）の間に入る トピック という概念が存在します。

<ul>
<li>通知を送りたいクライアント（Publisher）は、トピック に対してメッセージを送信します。</li>
<li>通知を受け取りたいクライアント（Subscriber）は、トピック を購読（Subscription）します。</li>
</ul></li>
<li>通知を受け取るクライアントが利用できるプロトロルは、 AWS Lambda / SQS / HTTP/S / Email / SMS と後述する Application のエンドポイントです。</li>
<li>モバイルデバイスのPUSH通知を可能にするためには、Application を作成する必要があります。

<ul>
<li>Application には、APNsのPUSH証明書やGCMの証明書を紐づけます。</li>
<li>Application には、対応するプラットフォームにおける デバイストークン を登録することができます。</li>
</ul></li>
</ul>

<h3>デバイスを直接指定した通知（直接アドレス指定）</h3>

<ul>
<li>モバイルデバイスのPUSH通知を可能にするためには、Application を作成する必要があります。

<ul>
<li>Application には、各プラットフォームのデバイストークンを登録します。登録するとそのデバイストークンに対応する エンドポイント がSNSから発行されます。</li>
<li>Publisher は、この エンドポイント に直接メッセージを送ることができます。これを 直接アドレス指定 とよびます。</li>
<li>これは トピック を経由せずメッセージを送信できる例外的な仕組みです。</li>
<li>通知を送りたいデバイスが明確に決まっている場合にこの手法を使います。</li>
<li>利用するAPI：Amazon SNS>>Actions>>Publish / PHP DOCS</li>
</ul></li>
<li>パラメーター: Message: String, Subject: Option[String], TargetArn: TopicArn | EndpointArn

<ul>
<li>ドキュメント：https://docs.aws.amazon.com/ja_jp/sns/latest/dg/SNSMobilePush.html</li>
</ul></li>
</ul>

<h2>SNSの制限</h2>

<ul>
<li>トピック数上限: 100,000 トピック/アカウント</li>
<li>サブスクリプション数上限: 10,000,000 サブスクリプション/トピック

<ul>
<li>ただし、AWSにお問い合わせフォームから連絡を入れるだけで無料で上限解放してもらえるようです（ソース）</li>
</ul></li>
<li>送信データ：最大 256 KB のテキストデータ（XML、JSON、未フォーマットのテキストなど）</li>
</ul>

<h2>通知状況のモニタリング</h2>

<ul>
<li>発行したメッセージ数、通知に成功した数、通知に失敗した数、発行したデータサイズを、AWS CloudWatch API経由で確認することができる</li>
</ul>

<h2>有効期限切れのトークンに対する処理</h2>

<ul>
<li>自動的に無効化される</li>
<li>無効化された際にサーバー側へ通知を送ることができる</li>
</ul>

<p>[amazon template=wishlist&asin=4797392568]</p>
