---
title: Amazon WorkDocs とは
category: programming
date: 2018-01-07 11:07:27
tags: [AWS]
pinned: false
---

> 情報ソース: [Amazon WorkDocs ドキュメント](https://aws.amazon.com/jp/documentation/workdocs/)

- フルマネージドなエンタープライズ向けストレージおよびファイル共有サービス
- Amazon WorkSpace のユーザーは追加料金なしで WorkDocs へのアクセス権限が付与される

## 課金体系の概要

> 情報ソース: [Amazon WorkDocs 料金](https://aws.amazon.com/jp/workdocs/pricing/)

ざっくりといえば、アクティブなユーザーアカウントとストレージの料金が課金対象

- Amazon WorkDocs ユーザー/月: 5〜8 USD
  - Workspace のユーザーは最初の 50 GB まで料金に含まれる
  - そうでないユーザーは最初の 1TB まで月 2〜3 USD
  - それ以降の料金に関しては S3 の料金に従う [#](https://aws.amazon.com/jp/s3/pricing/#Storage_Pricing)
  - ファイル管理の実体は Amazon Directory Service で、WorkDocs サイト作成時にこちらにリソースが作られる
- 管理者は主に次のようなことができる
  - Active Directory との統合
  - Amazon Workspace との統合
  - CloudTrail, SNS との統合
  - アクティビティの追跡
  - ユーザーを招待、削除できる
  - 可視性をコントロールできる
  - ユーザーのストレージサイズを制限できる
- ストレージとして次のような機能がある
  - プレビュー
  - ローカルとの同期
  - ファイルのロック
  - Windows エクスプローラーからのアクセス
  - バージョン管理
  - コメント
  - 可視性の設定
