---
slug: aws-iot-enterprise-button
title: AWS IoT Enterprise Button を買った
category: programming
date: 2018-05-26 16:27:02
tags: [AWS, IoT]
pinned: false
---

いまさらかもしれないですが [AWS IoT Enterprise Button](https://www.amazon.co.jp/dp/B075FPHHGG)を買ってみたので、ちょっといじってみたレポート。

## AWS IoT AWS IoT Enterprise Button の登録

かなり簡単に AWS アカウントと AWS IoT エンタープライズボタンを紐づけられた

1. AppStore から [AWS IoT 1-Click](https://itunes.apple.com/app/id1315204832) というアプリをダウンロード
2. AWS アカウントにログイン
3. バーコードをスキャンしデバイス登録
4. Wifi の設定など

この状態で AWS IoT のマネジメントコンソールをみると以下のように機器が登録された状態になる

<a href="https://static.53ningen.com/wp-content/uploads/2018/05/26014032/screen.png"><img src="https://static.53ningen.com/wp-content/uploads/2018/05/26014032/screen-1024x195.png" alt="" width="640" height="122" class="aligncenter size-large wp-image-2676" /></a>

## AWS IoT 1-Click プロジェクトを作成する

つづいて、マネジメントコンソールから [AWS IoT 1-Click](https://ap-northeast-1.console.aws.amazon.com/iot1click/home?region=ap-northeast-1#/projects) プロジェクトを作成できます。ここでは単純にイベント発生時に Lambda をフックできるようです。 Email や SMS を送る選択肢がでてきますが、これを選ぶと結局のところ用意された Lambda 関数を叩くようなので、まあ基本的に裏側は Lambda とする作りのようです。

<a href="https://static.53ningen.com/wp-content/uploads/2018/05/26160921/57ad7c94ee5ba41b1b7d06bd486fdb86.png"><img src="https://static.53ningen.com/wp-content/uploads/2018/05/26160921/57ad7c94ee5ba41b1b7d06bd486fdb86-931x1024.png" alt="" width="640" height="704" class="aligncenter size-large wp-image-2693" /></a>

## 動作テスト

プロジェクトにデバイスプレイスメントを紐づけると、デバイスからのイベントに応じて各種処理が走ります。ためしに IoT ボタンをクリックしてみましょう。なお、私の手元だときちんと IAM ロール作って Lambda に設定してあげないと SMS が届かなかったので、SMS が届かない方はそのあたりを確認してみてください。ちゃんと設定をやってあげると以下のような感じで SMS が無事到達しました。うさぎを注文しました。

<a href="https://static.53ningen.com/wp-content/uploads/2018/05/26162136/iD2INeAQ.jpg"><img src="https://static.53ningen.com/wp-content/uploads/2018/05/26162136/iD2INeAQ.jpg" alt="" width="750" height="337" class="aligncenter size-full wp-image-2695" /></a>

デバイスのイベントログに以下のような出力がでました。

```
// 2018/5/26 15:37:58 シングルクリック 100%
{
  "device": {
    "type": "button",
    "deviceId": "*********",
    "attributes": {
      "projectRegion": "ap-northeast-1",
      "projectName": "Test",
      "placementName": "MyFirstPlacement",
      "deviceTemplateName": "SendEmail"
    }
  },
  "stdEvent": {
    "clickType": "SINGLE",
    "reportedTime": "2018-05-26T06:37:58.510Z",
    "certificateId": "*********",
    "remainingLife": 99.85000000000001,
    "testMode": false
  }
}

// 2018/5/26 15:42:57 ダブルクリック 100%
{
  "device": {
    "type": "button",
    "deviceId": "*********",
    "attributes": {
      "projectRegion": "ap-northeast-1",
      "projectName": "Test",
      "placementName": "MyFirstPlacement",
      "deviceTemplateName": "SendEmail"
    }
  },
  "stdEvent": {
    "clickType": "DOUBLE",
    "reportedTime": "2018-05-26T06:42:57.296Z",
    "certificateId": "*********",
    "remainingLife": 99.8,
    "testMode": false
  }
}

// 2018/5/26 15:43:47 長押しクリック 100%
{
  "device": {
    "type": "button",
    "deviceId": "*********",
    "attributes": {
      "projectRegion": "ap-northeast-1",
      "projectName": "Test",
      "placementName": "MyFirstPlacement",
      "deviceTemplateName": "SendEmail"
    }
  },
  "stdEvent": {
    "clickType": "LONG",
    "reportedTime": "2018-05-26T06:43:47.595Z",
    "certificateId": "*********",
    "remainingLife": 99.75,
    "testMode": false
  }
}
```

電池（remainingLife）ガンガン減ってくな w という感想を抱きました。シングル/ダブル/長押しの 3 種類のイベントを検知できるようで。これらの組み合わせで例えば、モールス信号をダッシュボタンで打つと、その内容をテキストに起こして S3 に保存したり Slack に通知したりできそうですね。やっている人いそうだなと思って調べてみたら、まあやっぱりいた。

- [AmazonDashButton と LineNotify で気持ちを伝える - Qiita](https://qiita.com/re-fort/items/da82c8f03eb49a6bb8e4)

こちらの記事ではダッシュボタンを 3 つ用意しているようですが、3 種類のイベントを表現できるのでデバイスは 1 個でも実現できそう。ただすぐ電池切れるでしょうね...。

## 生成された python のコード

SMS を送る Lambda のコードをちらっとみておく。

```python
from __future__ import print_function

import boto3
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sns = boto3.client('sns')


def lambda_handler(event, context):
    logger.info('Received event: ' + json.dumps(event))

    attributes = event['placementInfo']['attributes']

    phone_number = attributes['phoneNumber']
    message = attributes['message']

    for key in attributes.keys():
        message = message.replace('{{%s}}' % (key), attributes[key])
    message = message.replace('{{*}}', json.dumps(attributes))

    sns.publish(PhoneNumber=phone_number, Message=message)

    logger.info('SMS has been sent to ' + phone_number)
```

ちな、Lambda に到達する json イベントメッセージはこんなかんじ

```json
{
  "deviceInfo": {
    "deviceId": "******",
    "type": "button",
    "remainingLife": 99.55,
    "attributes": {
      "projectRegion": "ap-northeast-1",
      "projectName": "Test",
      "placementName": "Placement",
      "deviceTemplateName": "OrderRequest"
    }
  },
  "deviceEvent": {
    "buttonClicked": {
      "clickType": "SINGLE",
      "reportedTime": "2018-05-26T07:15:09.131Z"
    }
  },
  "placementInfo": {
    "projectName": "Test",
    "placementName": "Placement",
    "attributes": {
      "phoneNumber": "******",
      "message": "Is the order a rabbit?",
      "room": "amausa"
    },
    "devices": {
      "OrderRequest": "******"
    }
  }
}
```

## 余談

[わずか 300 円で IoT ボタンを作る方法 - Qiita](https://qiita.com/vimyum/items/8b7548ca8cf45383c5b0) という記事が面白かった。IoT エンタープライズボタン、2500 円もしたのだけれど、同じようなことを 300 円で実現している。こちらも試してみたい。

## 参考資料

- [AWS IoT 1-Click – Lambda 関数のトリガーにシンプルなデバイスを使用する | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/aws-iot-1-click-use-simple-devices-to-trigger-lambda-functions/)
- [AWS IoT ボタン (プログラミング可能な Dash Button) | AWS](https://aws.amazon.com/jp/iotbutton/)
