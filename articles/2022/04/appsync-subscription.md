---
slug: appsync-subscription
title: AppSync GraphQL API を用いて手軽に Subscription を試す
category: programming
date: 2022-04-13 23:24:00
tags: [AppSync, GraphQL]
pinned: false
---

AppSync GraphQL API への Mutation, Subscription を通して簡単な メッセージの Pub/Sub を試す手順をメモしておきます。GraphQL API の Subscription をお手軽に試してみたい方や、テスト目的のモック Mutation, Subscription を手軽に作りたいときに便利な手順かと思います。

## スキーマの作成

AppSync GraphQL API を作成したのち、まずはスキーマの作成を行います。今回はできるだけ細かいことを省いて Mutation, Subscription 実験用の GraphQL API を作成したいため以下のように簡単なものとなります。

```graphql
type Message {
  messageId: String!
  message: String!
}

type Mutation {
  sendMessage(message: String!): Message
}

type Subscription {
  addedMessage: Message @aws_subscribe(mutations: ["sendMessage"])
}

schema {
  mutation: Mutation
  subscription: Subscription
}
```

上記のスキーマからおわかりいただけるかと思いますが、Mutation: `sendMessage` にて単純な文字列のメッセージを送信します。messageId, message を含む `Message` が戻り値となります。

また Subscription: `messageAdded` を購読すると `sendMessage` が呼び出された際に `Message` が飛んでくる仕組みとなります。このあたりはスキーマ中の `@aws_subscribe` にあたる箇所にて実現しています。

これは AppSync の [GraphQL スキーマサブスクリプションディレクティブ](https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/aws-appsync-real-time-data.html) というものとなります。

## データソース/リゾルバーの作成と設定

前述のとおりサブスクリプションディレクティブにより `sendMessage` にてメッセージが送信されると、その内容が addedMessage の購読者にリアルタイムに通知される仕組みとなっています。

したがって `sendMessage` は単純に受け取った message に加えて messageId を追加して Message 形の値を返却すればよいこととなります。

また適当な UUID はリゾルバーのマッピングテンプレートユーティリティー: `$util.autoId()` で生成できるため、今回特段 Lambda などのデータソースを設定する必要がなく、NONE タイプのデータソースとリゾルバーマッピングテンプレートにて対応できる形となります。

したがって、残作業は以下の 2 つとなります。

1. NONE タイプのデータソースを作る
2. 作成したデータソースを sendMessage にアタッチし、リクエストマッピングテンプレート、レスポンスマッピングテンプレートをそれぞれ以下のように設定する

```json
// request mapping template
{
    "version": "2017-02-28",
    "payload": {
        "messageId": "$util.autoId()",
        "message": "$context.arguments.message"
    }
}

// response mapping template
$util.toJson($context.result)
```

以上にて AppSync GraphQL にて Mutation, Subscription を利用したメッセージの Pub/Sub の仕組みの準備が完了しました。

## マネジメントコンソールから Pub/Sub を試す

AppSync GraphQL API はマネジメントコンソール上から手軽に動作検証可能なため、作成した API の画面から [クエリ] ページに飛び、該当の URL でウィンドウを 2 つ開きます。

片方のウィンドウにてあらかじめ Subscritpion を行っておきます。その後、もう片方のウィンドウからメッセージを発行する Mutation を行うと購読している側のウィンドウにも送信したメッセージが表示されることがわかる形と思います。

```graphql
# Subscription
subscription MySubscritpion {
  messageAdded {
    messageId
    message
  }
}

# Mutation
mutation {
  sendMessage(message: "Hello") {
    messageId
    message
  }
}
```

## wscat から Pub/Sub を試す

wscat コマンドを利用して WebSocket で GraphQL リアルタイムエンドポイントと直接会話することも可能。

GraphQL リアルタイムエンドポイントの主要なオペレーションはドキュメント: [リアルタイム WebSocket クライアントを構築する](https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/real-time-websocket-client.html#real-time-websocket-operation) に記載されている以下のようなものとなる。

1. 接続の初期化 (connection_init)
2. 接続確認応答 (connection_ack)
3. サブスクリプション登録 (start)
4. サブスクリプション確認応答 (start_ack)
5. サブスクリプションの処理 (data)
6. サブスクリプションの登録解除 (stop)

実際に wscat の導入から GraphQL リアルタイムエンドポイントへの接続・切断までの流れは以下のとおり

```
$ npm install -g wscat
...

$ GRAPHQL_HOST=
$ REALTIME_HOST=
$ API_KEY=
$
$ header=`echo "{\"host\":\"$GRAPHQL_HOST\",\"x-api-key\":\"$API_KEY\"}" | base64`
$ wscat -s graphql-ws -c "wss://$REALTIME_HOST?header=$header&payload=e30="
Connected (press CTRL+C to quit)
> {"type":"connection_init"}
< {"type":"connection_ack","payload":{"connectionTimeoutMs":300000}}
< {"type":"ka"}
> {"id":"1","payload":{"data":"{\"query\":\"subscription {\\n  messageAdded {\\n    message\\n    messageId\\n  }\\n}\\n\",\"variables\":{}}","extensions":{"authorization":{"host":"<GRAPHQL_HOST>","x-api-key":"<API_KEY>"}}},"type":"start"}
< {"id":"1","type":"start_ack"}
< {"type":"ka"}
< {"type":"ka"}
< {"id":"1","type":"data","payload":{"data":{"messageAdded":{"message":"hello","messageId":"69378263-6562-4770-b057-3062e22e0f07"}}}}
< {"type":"ka"}
> {"type":"stop","id":"1"}
< {"id":"1","type":"complete"}
```

## Amplify SDK から Pub/Sub を試す

適当なウェブアプリケーションにて `yarn add aws-amplify` をしたのち、以下を実行すると messageAdded を購読できる。sendMessage するとデベロッパーコンソールにメッセージが出力される

```javascript
import { Amplify, API } from 'aws-amplify'

Amplify.configure({
  aws_project_region: '<REGION>',
  aws_appsync_graphqlEndpoint: '<ENDPOINT>',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: '<API_KEY>',
})

const subscription = API.graphql({
  query: `
    subscription {
      messageAdded {
        message
        messageId
      }
    }
  `,
}).subscribe({
  next: (message) => {
    console.log(JSON.stringify(message?.value?.data?.messageAdded))
  },
  error: (error) => console.warn(error),
})
```
