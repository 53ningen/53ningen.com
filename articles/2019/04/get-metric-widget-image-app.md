---
slug: get-metric-widget-image-app
title: CloudWatch メトリクスのグラフを SNS トピックに通知するアプリケーションを作った
category: programming
date: 2019-04-22 23:44:32
tags: [Serverless]
pinned: false
---

CloudWatch メトリクスのグラフを単純に SNS トピックに通知するアプリケーションを Serverless Application Repository に登録しました。

- GitHub のリポジトリはこちらです: [53ningen/GetMetricWidgetImage](https://github.com/53ningen/GetMetricWidgetImage)
- 関連記事: [CloudWatch メトリクスのグラフを AWS CLI から取得する](https://53ningen.com/get-metric-widget-image/)

## 1. ユースケース

例えば通知先のトピックのサブスクライバは基本的にメッセージを処理する Lambda 関数を想定しています。利用例としては以下のようなものが思い浮かびます。

- メッセージを処理して E メールを送信する
- Slack に通知する

例えば Billing のグラフを毎日とある Slack チャンネルに送信することにより課金状況をコンソールにログインせず確認できたり、システムの稼働状況（負荷やジョブキューの状況など）を毎時 Slack チャンネルに投稿してくれると便利そうだと思います。

## 2. 利用方法

README に書いてあるとおり Serverless Application Repository を利用する方法と、デプロイスクリプトを利用する方法があります。

### 2.1. Serverless Application Repository を利用する方法

1. [設定ファイル](https://github.com/53ningen/GetMetricWidgetImage/blob/master/config.template.yaml) を入力し、ご自身の S3 バケットにアップロードします
2. 通知先の SNS トピックを作成します
3. [該当アプリケーション](https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:247601741829:applications/GetMetricWidgetImage) にアクセスして、パラメータを入力しデプロイ

### 2.2. デプロイスクリプトを利用する方法

1. `git clone git@github.com:53ningen/GetMetricWidgetImage.git`
2. `.env.template .env` を実行し、`.env` ファイルを更新してください
   3, `cp config.template.yaml config.yaml` を実行し `config.yaml` ファイルを更新してください
   ４. `./scripts/update_config` を実行すると S3 バケットにファイルを転送します
   ５. `./scripts/deploy` を実行するとサーバーレスアプリケーションをデプロイします

### 2.3. お使いの SAM テンプレートにネストして組み込みたい場合

以下の内容を Resource 配下に追加します

```
  GetMetricWidgetImage:
    Type: AWS::Serverless::Application
    Properties:
      Location:
        ApplicationId: arn:aws:serverlessrepo:us-east-1:247601741829:applications/GetMetricWidgetImage
        SemanticVersion: 1.0.0
      Parameters:
        ConfigBucket: YOUR_VALUE
        ConfigKey: YOUR_VALUE
        NotificationTargetTopicArn: YOUR_VALUE
        # RetentionInDays: '7' # Uncomment to override default value
        # Schedule: 'rate(60 minutes)' # Uncomment to override default value
```

## 3. デモ

一番ありがちなパターンっぽい Billing のグラフを取得して Slack に投稿するアプリケーションを簡単にデプロイできるものをつくっておきました。

[GetMetricWidgetImage/demo/GetMetricWidgetImageAndNotifySlack at master · 53ningen/GetMetricWidgetImage](https://github.com/53ningen/GetMetricWidgetImage/tree/master/demo/GetMetricWidgetImageAndNotifySlack)

### 3.1. 動作イメージ

こんな風に Slack に Billing のグラフが投稿されます

<a href="https://static.53ningen.com/wp-content/uploads/2019/04/22233637/a2072ea1d666f9aceb944d7de2d3bd87.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/04/22233637/a2072ea1d666f9aceb944d7de2d3bd87.png" alt="" width="846" height="386" class="alignnone size-full wp-image-4700" /></a>

## 3.2. デプロイ方法

- config.yaml をいい塩梅に編集します
  - デフォルトのテンプレートにはまさに Billing のグラフを取得する設定が記載されています
  - `message_format` の channel には通知したい Slcak チャンネルを指定すると良いと思います
- `config.yaml` の編集が終わったら S3 バケットにアップロードします

```
log_level: INFO
message_format: '{"image":"{hex_image}", "title":"{title}", "initial_comment":"{title}", "channel": "#random"}'
items:
  -
    metrics:
      -
        - AWS/Billing
        - EstimatedCharges
        - Currency
        - USD
        -
          period: 21600
          stat: Maximum
    view: timeSeries
    width: 1200
    height: 400
    stacked: false
    start: 20160 # minutes
    timezone: +0900
    region: us-east-1
    title: AWS/Billing,EstimatedCharges,Currency,USD
```

- つづいて [アプリケーションのページ](https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:247601741829:applications/GetMetricWidgetImageAndNotifySlack) へアクセスし、設定の欄に必要事項を入力します
  - `ConfigBucket`: `config.yaml` をアップロードした S3 バケット名
  - `ConfigKey`: `config.yaml` の S3 オブジェクトキー
  - `IAMUsername`: KMS キーにアクセス可能にしたい IAM ユーザー名
  - `Schedule`: cron 式 or rate 式でグラフの取得を行うスケジュールを指定します
  - `SlackVerificationToken`: Slack Channel 投稿に使う SlackVerificationToken を取得して、この欄に記入します
- `I acknowledge that this app creates custom IAM roles, resource policies and deploys nested applications.` にチェックを入れて、[デプロイ] を選択します
