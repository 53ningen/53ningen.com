---
title: SNS から FCM の iOS デバイスにメッセージを送信する
category: programming
date: 2019-03-01 03:55:05
tags: [SNS, FCM]
pinned: false
---

FCM(Firebase Cloud Messaging) を利用している iOS アプリは普通 FCM から通知を行いますが、Amazon SNS の GCM プラットフォームアプリケーションを FCM の Server Key を登録して作成し、その GCM プラットフォームアプリケーションに FCM の Remote Instance ID token をエンドポイントとして登録し、SNS から FCM を経由して iOS にプッシュ通知を送信するという芸当が可能です。

何を言っているのか意味不明だと思うので図説すると次のような構造です（図にすると単純）

```
Amazon SNS(GCM Platform Application) -> FCM -> iOS
```

## FCM プロジェクトの作成と iOS アプリ側の実装を進めます

FCM の公式ドキュメント: [iOS に Firebase Cloud Messaging クライアント アプリを設定する](https://firebase.google.com/docs/cloud-messaging/ios/client?hl=ja) を眺めながら FCM プロジェクトの作成

## SNS の GCM プラットフォームアプリケーションを作成する

アプリケーションの作成で GCM を選択しつつ FCM の Server Key を認証情報として使う

## エンドポイントの登録

iOS アプリをデバイスにインストールし、Remote Instance ID token をぶっこぬき、GCM プラットフォームアプリケーションのエンドポイントとして登録する

## プッシュ通知の送信

以下のような内容のペイロードを対象エンドポイントに送信すると通知が飛ぶ（デバイスのプッシュ通知を許可しておく必要がある）

```json
{
  "GCM": "{\"notification\":{\"body\":\"Hello, World!\"}}"
}
```
