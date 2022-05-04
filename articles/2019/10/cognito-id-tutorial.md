---
title: Cognito ID プールことはじめ
category: programming
date: 2019-10-22 03:08:34
tags: [AWS]
pinned: false
---

# 基本的な API と機能の理解

Cognito ID プールの各 API に対応する boto3 のインターフェースを直接操作し以下のようなことを実行することにより、Cognito ID プールの利用法を理解してみる

## 未認証ユーザーの認証情報の取得

- GetId, GetCredentialsForIdentity API をたたいていけば OK

```python
import env
import json
import boto3
import base64
from boto3.session import Session
from getpass import getpass

session = Session(profile_name=env.profile)
client = session.client('cognito-identity', 'ap-northeast-1')


print('=== GetId ===')
response = client.get_id(IdentityPoolId=env.identity_pool_id)
identity_id = response['IdentityId']
print(response)

print('=== GetCredentialsForIdentity ===')
response = client.get_credentials_for_identity(IdentityId=identity_id)
print(response)
```

## Cognito ユーザープールとのフェデレーション

- Cognito ユーザープールにて認証したユーザーに対して認証済みロールのクレデンシャルを受け渡す流れ
- GetId, GetCredentialsForIdentity API を叩くときに IdToken を Logins パラメータを通して渡してあげる
- Cognito ユーザープール側にて Facebook や Amazon などの外部の IdP とのフェデレーションを行った場合も、帰ってくる IdToken は Cognito ユーザープールのものであるため、Logins の指定は Cognito ユーザープールを指定する
  - これとは別に ID プール自体が直接外部の IdP とフェデレーションできるので注意（後述）

```python
import env
import json
import boto3
import base64
import requests
from warrant.aws_srp import AWSSRP
from boto3.session import Session
from getpass import getpass

session = Session(profile_name=env.profile)
cognito_userpool = session.client('cognito-idp', 'ap-northeast-1')
cognito_identity = session.client('cognito-identity', 'ap-northeast-1')


print('=== GetId ===')
sign_in_with = input('sign in with (cognito, facebook, amazon): ')
identity_id = None
logins = None
if sign_in_with == 'cognito':
    print('=== Sign in with Cognito User Pool ===')
    email = input('Enter Your Email Address: ')
    password = getpass('Enter Your Password: ')
    srp = AWSSRP(username=email, password=password, pool_id=env.user_pool_id, client_id=env.client_side_id, client=cognito_userpool)
    tokens = srp.authenticate_user()
    id_token = tokens['AuthenticationResult']['IdToken']
    logins = {
        'cognito-idp.' + env.region + '.amazonaws.com/' + env.user_pool_id: id_token
    }
    response = cognito_identity.get_id(
        IdentityPoolId=env.identity_pool_id,
        Logins=logins
    )
    print(response)
    identity_id = response['IdentityId']
elif sign_in_with == 'facebook' or sign_in_with == 'amazon':
    print('===  POST /oauth2/token ===')
    code = input('Enter Code: ')
    url = 'https://' + env.domain + '/oauth2/token'
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    payload = [
        ('grant_type', 'authorization_code'),
        ('client_id', env.client_side_id),
        ('code', code),
        ('redirect_uri', env.redirect_url)
    ]
    response = requests.post(url=url, headers=headers, params=payload)
    tokens = json.loads(response.text)
    id_token = tokens['id_token']
    logins = {
        'cognito-idp.' + env.region + '.amazonaws.com/' + env.user_pool_id: id_token
    }
    response = cognito_identity.get_id(
        IdentityPoolId=env.identity_pool_id,
        Logins=logins
    )
    print(response)
    identity_id = response['IdentityId']
else:
    response = cognito_identity.get_id(IdentityPoolId=env.identity_pool_id)
    print(response)
    identity_id = response['IdentityId']

print('=== GetCredentialsForIdentity ===')
response = cognito_identity.get_credentials_for_identity(
    IdentityId=identity_id,
    Logins=logins
)
print(response)
```

## 外部認証プロバイダとのフェデレーション

- 変わる点といえば、アクセストークンを取得し GetId, GetCredentialsForIdentity API を叩くときに IdToken を Logins パラメータを通して渡してあげるだけ

```python
import env
import json
import boto3
from boto3.session import Session

session = Session(profile_name=env.profile)
cognito_userpool = session.client('cognito-idp', 'ap-northeast-1')
cognito_identity = session.client('cognito-identity', 'ap-northeast-1')

print('=== GetId ===')
token = input('Enter your facebook access token: ')
logins = {
  'graph.facebook.com': token
}
response = cognito_identity.get_id(
  IdentityPoolId=env.identity_pool_id,
  Logins=logins
)
print(response)
identity_id = response['IdentityId']

print('=== GetCredentialsForIdentity ===')
response = cognito_identity.get_credentials_for_identity(
    IdentityId=identity_id,
    Logins=logins
)
print(response)
```
