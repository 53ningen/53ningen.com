---
slug: appsync_iam_test
title: IAM 認証付きの AppSync GraphQL API を CLI から叩く
category: programming
date: 2022-01-12 03:28:00
tags: [AppSync, IAM, AWS]
pinned: false
---

AppSync GraphQL API をテストする際には API キーを用いるのが便利ですが、本番運用の際に API キーを用いるケースはそう多くなく一般には AWS_IAM をデフォルトの認証モードとすることが多いかと思います。

そうすると開発環境の AppSync GraphQL API も必然的に AWS_IAM をデフォルトの認証モードとしたくなります。

その状況下で手元環境から CLI 経由で手軽に API を叩きたい場合、毎回コマンドの組み立て方を忘れるのでメモ。

結論としては `awscurl` を用いて以下のようにリクエストすれば OK。例に漏れず region と service の指定を忘れずに。

```bash
$ ENDPOINT_URL=...
$ awscurl -X POST \
  -d '{ "query": "query MyQuery { listAppSyncTests { items { title } } }" }' \
  --profile <PROFILE> \
  --region ap-northeast-1 \
  --service appsync \
  $ENDPOINT_URL
{"data":{"listAppSyncTests":{"items":[{"title":"test"}]}}}
```

また AWS_IAM 認証を設定している際に Cognito Identity Pool の Unauth Role（非認証ユーザーのロール）を被った状態でのリクエストを試したいということがあると思います。こちらは以下のような流れにて実現可能です。

```bash
$ IDENTITY_POOL_ID=...
$
$ IDENTITY_ID=$(aws cognito-identity get-id --identity-pool-id $IDENTITY_POOL_ID | jq  -r ".IdentityId")
$ CREDENTIALS=$(aws cognito-identity get-credentials-for-identity --identity-id $IDENTITY_ID | jq ".Credentials")
$ export AWS_ACCESS_KEY_ID=$(echo $CREDENTIALS | jq -r '.AccessKeyId')
$ export AWS_SECRET_ACCESS_KEY=$(echo $CREDENTIALS | jq -r '.SecretKey')
$ export AWS_SECURITY_TOKEN=$(echo $CREDENTIALS | jq -r '.SessionToken')
```

あとは先ほどと同じように `awscurl` コマンドで AppSync API を叩くだけ。

```bash
$ ENDPOINT_URL=...
$ awscurl -X POST \
  -d '{ "query": "query MyQuery { listAppSyncTests { items { title } } }" }' \
  --region ap-northeast-1 \
  --service appsync \
  $ENDPOINT_URL
{"data":{"listAppSyncTests":{"items":[{"title":"test"}]}}}
```

クエリだけを許可したいとしたらたとえば下記のようなポリシーを Unauth Role に設定しておけばよい。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": "appsync:GraphQL",
      "Resource": [
        "arn:aws:appsync:ap-northeast-1:<ACCOUNT_ID>:apis/<API_ID>/types/Query/fields/*"
      ]
    }
  ]
}
```

## AppSync/Amplify に関するメモ

### globalAuthRule とはなにか

下記 Amplify ドキュメントに記載があるとおり、開発時用にすべてのデータモデルへの create, read, update, delete を許可するためのディレクティブ

```
input AMPLIFY { globalAuthRule: AuthRule = { allow: public } }
```

> **Global authorization rule (only for getting started)**
> To help you get started, there's a global authorization rule defined when you create a new GraphQL schema. For production environments, remove the global authorization rule and apply rules on each model instead.
> The global authorization rule (in this case { allow: public } - allows anyone to create, read, update, and delete) is applied to every data model in the GraphQL schema.
> [Authorization rules](https://docs.amplify.aws/cli/graphql/authorization-rules/#global-authorization-rule-only-for-getting-started)

### @key ディレクティブを使用したスキーマに更新し amplify api update したらエラーが出力された

`@key` ディレクティブは GraphQL Transformer v1 のものであり、v2 では `@primaryKey` もしくは `@index` を利用する

> 🛑 Your GraphQL Schema is using "@key" directive from an older version of the GraphQL Transformer. Visit https://docs.amplify.aws/cli/migration/transformer-migration/ to learn how to migrate your GraphQL schema.

`@primaryKey` と `@index` の違いは以下のとおり

- `@primaryKey`: テーブルのプライマリーキーに相当するものにマークする
- `@index`: DynamoDB グローバルセカンダリインデックスのパーティションキーに相当するものにマークする

> - The @key directive is being replaced by two new directives.
> - Customers can now specify @primaryKey on a field to define it as the primary key of a table. Customers can also specify sort key fields via a directive argument.
> - Customers can now specify @index on a field to use it as the partition key for a DynamoDB Global Secondary Index. Customers can optionally also specify a queryField or sort key fields by passing additional parameters.
>   [GraphQL Transformer v1 to v2 migration](https://docs.amplify.aws/cli/migration/transformer-migration/)

## @model ディレクティブで指定できる内容はどのようなものであるか

- [ドキュメント](https://docs.amplify.aws/cli-legacy/graphql-transformer/model/) に記載があるとおり

```graphql
directive @model(
  queries: ModelQueryMap
  mutations: ModelMutationMap
  subscriptions: ModelSubscriptionMap
  timestamps: TimestampConfiguration
) on OBJECT
input ModelMutationMap {
  create: String
  update: String
  delete: String
}
input ModelQueryMap {
  get: String
  list: String
}
input ModelSubscriptionMap {
  onCreate: [String]
  onUpdate: [String]
  onDelete: [String]
  level: ModelSubscriptionLevel
}
enum ModelSubscriptionLevel {
  off
  public
  on
}
input TimestampConfiguration {
  createdAt: String
  updatedAt: String
}
```
