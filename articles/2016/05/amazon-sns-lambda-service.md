---
title: 無効になったSNSのエンドポイントを削除してくれる AWS Lambda コードを書いた
category: programming
date: 2016-05-09 05:15:43
tags: [Scala, AWS]
pinned: false
---

無効になった SNS のエンドポイント、別に放っておいてもよいのですが、定期的にお掃除したほうがよさそうだったので、お掃除用の AWS Lambda コードを書きました。Amazon SNS は、アプリケーション（SNS のデバイストークンが登録できるやつ）に紐付いているエンドポイントの状態が変化したときに通知してくれる機能があります。その状態変化通知を受け取るトピックを適当に作っておいて、AWS Lambda コードがそいつを購読するようにしてあげればよいことになります。

# ソースコード

- こちら → [https://github.com/53ningen/AmazonSNS-LambdaService](https://github.com/53ningen/AmazonSNS-LambdaService)
- 適当に clone して、設定ファイル作って、sbt assembly すれば jar ができますので、あとはそいつを AWS Lambda へ...
