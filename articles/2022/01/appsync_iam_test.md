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
