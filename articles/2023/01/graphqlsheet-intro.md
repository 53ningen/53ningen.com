---
title: GraphQLsheet はじめの一歩
category: programming
date: 2023-01-10 16:12:00
tags: [GraphQL]
pinned: false
---

かねてより Google Spreadsheet をデータベース代わりにしつつ、そのデータを GraphQL API として利用できれば便利だなと思っていました。

今回はそれを手軽に実現できそうなサービスとして "GraphQLsheet" というものがありましたので、とりあえず使ってみた記録です。

## GraphQL API のセットアップ

Google Spreadsheet と連携した GraphQLsheet が提供する GraphQL API のセットアップは次のようなステップで手軽に実施できます。

1. [GraphQLsheet](https://graphqlsheet.com/) と Google アカウントの紐付けをひとまず Free プランで行う
1. 対象の Spreadsheet を用意する（検証用に [GraphQLsheet 側が用意したサンプル](https://docs.google.com/spreadsheets/d/1U9PRElcdO64tiiPgCBxMUs74Yyu8pvmq4QZsEhFoiEI/edit#gid=0)も利用できる）
1. [GraphQL API 作成ページ](https://graphqlsheet.com/create) に Spreadsheet の ID を入力する（Spreadsheet URL は https://docs.google.com/spreadsheets/[ID]/edit という構造になっている）

なお、用意する Spreadsheet の先頭行は alphabet 始まりのデータ名にする必要があります。

## GraphQLsheet が提供する GraphQL API を操作する

### GraphiQL を利用したリクエスト

GraphQLsheet は GraphiQL もホストしてくれています。[Dashboard ページ](https://graphqlsheet.com/dashboard/) から対象の Spreadsheet の [API] を選択すると対応する GrapiQL にアクセスできます。あとはそれを利用してリクエストを行うのみです。

例として [GraphQLsheet 側が用意したサンプル](https://docs.google.com/spreadsheets/d/1U9PRElcdO64tiiPgCBxMUs74Yyu8pvmq4QZsEhFoiEI/edit#gid=0) に対応する GraphQL API へリクエストを行った例は下記のようになります。

```graphql
// Query
query MyQuery {
  get(limit: 10){
    Name,
    Age,
    Member
  }
}

// Response
{
  "data": {
    "get": [
      {
        "Name": "Achilleas",
        "Age": 12,
        "Member": true
      },
      {
        "Name": "Ioanna",
        "Age": 14,
        "Member": false
      }
    ]
  }
}
```

### curl を利用したリクエスト

curl を利用するサンプルコマンドも [Dashboard ページ](https://graphqlsheet.com/dashboard/) から手軽に参照可能です。基本的に一般的な GraphQL API と同様、単純にトークンをリクエストヘッダに仕込む形になります。

```
$ URL="<ENDPOINT_URL>"
$ TOKEN="<ACCESS_TOKEN>"
$ curl $ENDPOINT_URL \
-X POST \
-H "Content-Type: application/json" \
-H "token: $TOKEN" \
--data '{ "query": "{ get (limit: 20) { Name, Age, Member } }" }'

{"data":{"get":[{"Name":"Achilleas","Age":12,"Member":true},{"Name":"Ioanna","Age":14,"Member":false}]}}
```

### JavaScript を利用したリクエスト

curl コマンドの例と同様、JavaScirpt, PHP, Python での GraphQL API 呼び出し例もコピー&ペーストで利用できる形になっており、とてもとっつきやすいです。

以下は JavaScript を利用したリクエスト例です。Chrome の Developer コンソールに貼り付けて実行すれば動作を確認できます。

```js
const queryData = async () => {
  const token = '<ACCESS_TOKEN>'
  const spreadsheetId = '<SPREADSHEET_ID>'
  const response = await fetch(
    `https://api.graphqlsheet.com/api/${spreadsheetId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: JSON.stringify({
        query: `
        {
          get (limit: 20) {
            Name,
            Age,
            Member
          }
        }
      `,
      }),
    }
  )
  const responseJSON = await response.json()
  console.log(responseJSON)
}

queryData()

// response:
{
    "data": {
        "get": [
            {
                "Name": "Achilleas",
                "Age": 12,
                "Member": true
            },
            {
                "Name": "Ioanna",
                "Age": 14,
                "Member": false
            }
        ]
    }
}
```

## サービスのプラン

_注: 以下は 2023/1/10 現在の情報です_

Free プランだと 500 requests/month までの利用となっているため、データ量にもよりますが Spreadsheet をもとに 0.5〜1 日に一回 ISR でページ生成するといった用途であれば、このまま使えるかと思います。

もっとも Plus プランは $9 で 10,000 request/month まで利用できるため、この程度の金額であれば手が出しやすく、立ち上がりのタイミングで Spreadsheet のデータを用いてリアルタイム性があまり求められない SSG, ISR なページを作りたい場合はとても便利だと感じます。

最上位の Pro プランは $79 で 1,000,000 request/month となりますが、ガッツリ利用する場合、これではちょっと足りないかも...？ と感じたり。
