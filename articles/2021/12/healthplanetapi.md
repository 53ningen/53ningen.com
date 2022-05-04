---
title: Health Planet API で遊ぶ
category: programming
date: 2021-12-18 20:25:47
tags: []
pinned: false
---

タニタの体重計と連携したデータは Health Planet API から取得できます。この記事ではドキュメントを見ながら Health Planet API を叩いて体重と体脂肪率のデータを取得する流れをみていきます。

API の仕様書はこちら: [Health Planet API 仕様書 Ver1.0.1](https://www.healthplanet.jp/apis/api.html)

## API を叩くまでの準備

### アクセストークンの取得

ドキュメントによると以下のとおり OAuth 2.0 に準じているそうなのでアクセストークンを取得していきます

> 当 API は OAuth 2.0 に準じて作成されております。
> 各 API において SSL 通信が必須条件となります。

流れは以下のとおり

1. ウェブブラウザ経由で GET /oauth/auth し認可する、リクエストパラメータに code が付与された状態でリダイレクトされる
2. リダイレクトのリクエストを受け取ったウェブサーバーは code を用いて POST /oatuh/token リクエストを行うとアクセストークンやリフレッシュトークンを受け取れる

もう少し具体的なリクエスト内容を書いておくと以下のような雰囲気

```bash
# 1. ブラウザで以下のリクエストを行い認可する
# GET https://www.healthplanet.jp/oauth/auth?client_id=${CLIENT_ID}&redirect_uri=https://www.healthplanet.jp/success.html&scope=innerscan&response_type=code

# 2. リダイレクト先のアプリケーションは以下の curl コマンド相当の内容を実行するとアクセストークンが得られる
$ curl -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=https://www.healthplanet.jp/success.html&code=${CODE}&grant_type=authorization_code" -X POST https://www.healthplanet.jp/oauth/token

{"access_token":"...","expires_in":2592000,"refresh_token":"..."}
```

こうして取得したアクセストークンを用いて API を叩いていきます。

### トークンのリフレッシュ

トークンのリフレッシュ、API ドキュメント上は記載がないのですが[ネットに落ちていた記事](https://qiita.com/daisuky-jp/items/69c571de1640ed010515)にはできると書いてあったので問題がおこるまでひとまずこのリクエストを行う実装を仕込んでおく（ダメだったら追記します）

```bash
$ curl -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=https://www.healthplanet.jp/success.html&grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}" -X POST https://www.healthplanet.jp/oauth/token

{"access_token":"...","expires_in":2592000,"refresh_token":"..."}
```

## 体重の取得

- GET /status/innerscan にて取得可能
- レスポンス形式について XML, JSON のどちらかを選択可能
  - 迷わず JSON をチョイス！
- リクエストレート制限は 60 requests/hour
- key はそのデータが何を表しているかを示します
  - 6021: 体重
  - 6022: 体脂肪率

```json
$ curl https://www.healthplanet.jp/status/innerscan.json?access_token=${ACCESS_TOKEN}&tag=6021,6022&date=1&from=20211201000000&to=20211207000000
{
  "birth_date": "19890927",
  "data": [
    {
      "date": "202112051818",
      "keydata": "63.50",
      "model": "01000122",
      "tag": "6021"
    },
    {
      "date": "202112051818",
      "keydata": "14.90",
      "model": "01000122",
      "tag": "6022"
    },
    {
      "date": "202112041139",
      "keydata": "64.20",
      "model": "01000122",
      "tag": "6021"
    },
    {
      "date": "202112041139",
      "keydata": "16.90",
      "model": "01000122",
      "tag": "6022"
    }
  ],
  "height": "177.5",
  "sex": "male"
}
```

ひまつぶしにこんな感じで取得した私の体重データをインターネットに公開する画期的なサービスを現在作成中なので乞うご期待！
