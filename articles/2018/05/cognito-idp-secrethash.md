---
title: Cognito ユーザープール API の SecretHash の計算
category: programming
date: 2018-05-25 04:27:32
tags: [Cognito]
pinned: false
---

[ユーザーアカウントのサインアップと確認](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash) に書かれているように以下のような値を計算する必要がある

```
Base64 ( HMAC_SHA256 ( "Client Secret Key", "Username" + "Client Id" ) )
```

bash と Python での実装例をメモ

## bash

```
USERNAME=
CLIENT_ID=
SECRET=
echo -n "${USERNAME}${CLIENT_ID}" | openssl dgst -sha256 -binary -hmac "${SECRET}" | base64
```

## Python 3.x

```
username = ''
client_id = ''
secret_key = ''

digest = hmac.new(secret_key.encode(), msg=(username + client_id).encode(), digestmod=hashlib.sha256).digest()
signature = base64.b64encode(digest).decode()
print(signature)
```
