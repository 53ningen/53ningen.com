---
title: Cognito CLI メモ
category: programming
date: 2019-01-17 23:15:31
tags: [Cognito]
pinned: false
---

Cognito の CLI でアレコレするメモ

## 管理者権限でユーザープールにユーザーを作成

```
aws cognito-idp admin-create-user \
  --user-pool-id <value>
  --username <value>
  --user-attributes \
    Name=email,Value=<value>
```

## サインアップ

- --secret-hash が必要
- 計算方法は以下の通り

```
// Base64 ( HMAC_SHA256 ( "Client Secret Key", "Username" + "Client Id" ) )

CLIENT_SECRET_KEY=<value>
USER_NAME=<value>
CLIENT_ID=<value>
$SECRET_HASH=$(echo -n "$USER_NAME$CLIENT_ID" | openssl dgst -sha256 -hmac $CLIENT_SECRET_KEY | base64)
```

```
aws cognito-idp  sign-up \
  --client-id <value>
  [--secret-hash <value>]
  --username <value>
  --password <value>
```
