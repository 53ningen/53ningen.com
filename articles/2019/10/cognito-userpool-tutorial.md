---
slug: cognito-userpool-tutorial
title: Cognito ユーザープールことはじめ
category: programming
date: 2019-10-21 02:53:47
tags: [AWS, Cognito]
pinned: false
---

# 基本的な API と機能の理解

Cognito ユーザープールの低レベル API に対応する boto3 のインターフェースを直接操作し以下のようなことを実行することにより、Cognito ユーザープールにおける認証の流れや利用法を理解してみる

- サインアップ
  - MFA ありのサインアップについては後ほど扱う
- サインイン
  - 基本的なフローについてそれぞれ確認
  - オプションや連携のバリエーション: MFA/Facebook, Google ソーシャルサインイン/Login with Amazon/Sign in with Apple/SAML IdP/OIDC プロバイダー経由のサインインについては後ほど扱う
- ユーザー/ユーザー属性の取得・変更
- パスワード変更
- パスワード再設定
- トークンの更新

## サインアップの基本的な流れ

- 基本的に SignUp API を叩いてアカウントを登録し、ConfirmSignUp API にてサインアップの確認を行う
- AdminCreateUser API でユーザーを作成した場合、AdminConfirmSignUp API もしくは初回ログイン時のパスワードの変更後に Confirmed 状態に遷移する
- また電話番号や Email アドレスの検証が必要な場合があるので、その場合は VerifyUserAttributes API を叩く

```python
import env
import boto3
from boto3.session import Session
from getpass import getpass

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== SIGN UP ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')
response = client.sign_up(
    ClientId=env.client_id,
    Username=email,
    Password=password,
    UserAttributes=[
        {
            'Name': 'email',
            'Value': email
        },
    ]
)
print('=== SIGN UP RESULT ===')
print(response)


print('=== CONFIRM SIGN UP ===')
code = input('Enter the Verification Code: ')
response = client.confirm_sign_up(
    ClientId=env.client_id,
    Username=email,
    ConfirmationCode=code,
)
print('=== CONFIRM SIGN UP RESULT ===')
print(response)
```

## サインインの基本的な流れ

基本的には各フローに共通して以下のようなやりとりを行う

1. クライアント => ユーザープール: Call [InitiateAuth API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html)
2. クライアント <= ユーザープール: Return Challenge
3. クライアント => ユーザープール: Call [RespondToAuthChallenge API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html)
4. クライアント <= ユーザープール: Return Cognito Tokens

認証に成功すると IDToken, AccessToken, RefreshToken が返却される

- IDToken
  - `name`, `email` など認証されたユーザーの ID に関するクレームが含まれる
  - JWT(JSON Web Token) の形式
  - アプリケーションにおけるユーザーの識別に利用できる
  - 有効期限は 1 時間
- AccessToken
  - ユーザー属性の追加、変更、削除などユーザープールのユーザーのコンテキストでの API オペレーションの許可や、任意のウェブ API におけるアクセスコントロールに用いる
  - JWT(JSON Web Token) の形式
  - 有効期限は 1 時間
- RefreshToken
  - 新しい IDToken, AcessToken の取得に必要なトークン
  - 有効期限は 1〜3650 日の範囲に設定でき、デフォルトは 30 日
  - AdminInitiateAuth または InitiateAuth API で REFRESH_TOKEN_AUTH フローを進めることにより新しい IDToken, AccessToken を取得できる

上記のような Cognito トークンに関連して、以下のような関連事項がある

- API Gateway: Cognito オーソライザを設定している場合、Authorization ヘッダーに IdToken か AccessToken を指定して API へのアクセス制御を行える
- AppSync: AMAZON_COGNITO_USER_POOLS 認証を設定している場合、Cognito ユーザープールによって提供される OIDC トークンを使用することによりユーザーの所属グループに応じたアクセスコントロールが可能
- GlobalSignOut または AdminGlobalSignOut API を叩くとすべてのトークンを無効化でき、以下のようなことができなくなる
  - トークンのリフレッシュ
  - アクセストークンを利用したユーザープール API の呼び出し
  - [JWT の検証手順](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-verifying-a-jwt) はざっくりと以下のような流れとなっている
    1. JWT の構造を確認する
    2. JWT 署名を検証する
    3. クレームを検証する

続いて各認証フローの流れを boto3 (AWS SDK for Python) を使って確認していく

### USER_SRP_AUTH: クライアント側認証フロー

- セキュアリモートパスワード（SRP）プロトコルを利用した認証フロー
  - [SRP: Industry-Standard Strong Password Security](http://srp.stanford.edu/) 内の [SRP JavaScript Demo](http://srp.stanford.edu/demo/demo.html) にて SRP の生成を試せる
- ざっくりとした流れは以下のとおり
  - InitiateAuth API へ AuthFlow = USER_SRP_AUTH, AuthParameters = USERNAME, SRP_A を指定してリクエスト
  - RespondToAuthChallenge API へ各種パラメータを渡す（[このあたり](https://github.com/capless/warrant/blob/master/warrant/aws_srp.py#L175-L198)の実装を見るとよさそう）
  - MFA やカスタム認証がある場合は、さらに次の ChallengeName が返されるので以後繰り返し

```python
import env
from boto3.session import Session
from getpass import getpass
from warrant.aws_srp import AWSSRP

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== SIGN IN ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')

srp = AWSSRP(username=email, password=password, pool_id=env.user_pool_id, client_id=env.client_side_id, client=client)
srp_a = srp.get_auth_params()['SRP_A']
response = client.initiate_auth(
    AuthFlow='USER_SRP_AUTH',
    AuthParameters={
        'USERNAME': email,
        'SRP_A': srp_a,
    },
    ClientId=env.client_side_id,
)
print(response)

assert(response['ChallengeName'] == 'PASSWORD_VERIFIER')
challenge_response = srp.process_challenge(response['ChallengeParameters'])
response = client.respond_to_auth_challenge(
    ClientId=env.client_side_id,
    ChallengeName='PASSWORD_VERIFIER',
    ChallengeResponses=challenge_response
)
print('=== SIGN IN RESULT ===')
print(response)
```

### ADMIN_USER_PASSWORD_AUTH: 管理 API によるユーザー名パスワードベース認証

- 利用する API とアプリクライアントの設定
  - AdminInitiateAuth API + AdminRespondToAuthChallenge API（署名必須）
  - シークレットキーのないアプリクライアント ID を指定する
  - ALLOW_ADMIN_USER_PASSWORD_AUTH: Enabled

```python
import env
import json
from boto3.session import Session
from getpass import getpass

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== SIGN IN ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')
response = client.admin_initiate_auth(
    UserPoolId=env.user_pool_id,
    ClientId=env.client_side_id,
    AuthFlow='ADMIN_USER_PASSWORD_AUTH',
    AuthParameters={
        'USERNAME': email,
        'PASSWORD': password,
    },
)
print(json.dumps(response, ensure_ascii=False))
```

### USER_PASSWORD_AUTH: ユーザー名パスワードベース認証

- 利用する API とアプリクライアントの設定
  - InitiateAuth API + RespondToAuthChallenge API
  - シークレットキーのないアプリクライアント ID を指定する
  - ALLOW_USER_PASSWORD_AUTH: Enabled
- 認証時に暗号化された SSL 接続経由でユーザーのパスワードがサービスに送信される
- 主にユーザー移行時に使い、以降が完了したらセキュアリモートパスワード（SRP）プロトコルに切り替える

```python
import env
import json
import boto3
import base64
from boto3.session import Session
from getpass import getpass

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== InitiateAuth ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')
response = client.initiate_auth(
    AuthFlow='USER_PASSWORD_AUTH',
    AuthParameters={
        'USERNAME': email,
        'PASSWORD': password,
    },
    ClientId=env.client_side_id,
)
print(json.dumps(response, ensure_ascii=False))

jwt = response['AuthenticationResult']['IdToken']
tmp = jwt.split('.')
tmp[0] += "=" * ((4 - len(tmp[0]) % 4) % 4)
tmp[1] += "=" * ((4 - len(tmp[1]) % 4) % 4)
header = json.loads(base64.b64decode(tmp[0]).decode())
payload = json.loads(base64.b64decode(tmp[1]).decode())
print('IDToken Header:')
print(header)
print('IDToken Payload')
print(payload)

# IDToken Header:
# {'kid': '5zQK+U...=', 'alg': 'RS256'}
# IDToken Payload
# {'sub': '18021af4-...', 'cognito:groups': ['admin'], 'email_verified': True, 'cognito:preferred_role': 'arn:aws:iam::...:role/CmdCognitoIdPEC2ReadOnlyRole', 'iss': 'https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_....', 'cognito:username': '....', 'custom:oshi': 'Yoshino Aoyama', 'cognito:roles': ['arn:aws:iam::...:role/CmdCognitoIdPEC2ReadOnlyRole'], 'aud': '50t17eat...', 'event_id': '93f6e6ce-...', 'token_use': 'id', 'auth_time': 1579300572, 'exp': 1579304172, 'iat': 1579300572, 'email': '...'}
```

- 前述のコード中にて JWT で返却された IdToken の内容を確認している
- JWT は 3 つのパートに分かれており、`111111.22222.33333` といった形で `.` で区切られている
- 1〜3 はそれぞれ以下のようなパートとなっており、それぞれの内容は Base64Url エンコーディングされている
  1. ヘッダー
  2. ペイロード
  3. 署名
- JTW の検証方法
  1. JWT が前述のような形式を満たしているか（`.` で区切られる 3 つのパートから構成されているか）を確認
  2. ヘッダーの kid が URL: https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json の kid と一致するか確認
  3. JWT ライブラリを使用して署名を検証する
  4. トークンの有効期限が切れていないことを確認する
  5. aud クレームがアプリクライアント ID と一致するか確認する
  6. iss クレームがユーザープールと一致することを確認する
  7. token_use クレームを確認する: IDToken, AccessToken どちらかあるいは双方を受け入れているかなどアプリケーションのポリシーに応じて確認

## ユーザー属性の取得と変更

- 認証後 Cognito から提供される AccessToken を用いることにより、そのユーザー自身の属性を取得・変更可能
- 取得・変更可能な属性はアプリクライアントごとに許可設定を変更できる
- カスタム属性の取得・変更はあらかじめユーザープールの設定にて、該当のカスタム属性を作成し、アプリクライアントの設定にて適切なアクセス許可を与える必要がある

ユーザー情報の取得は以下のような流れで可能

```python
import env
from boto3.session import Session
from getpass import getpass
from warrant.aws_srp import AWSSRP

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== SIGN IN ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')

srp = AWSSRP(username=email, password=password, pool_id=env.user_pool_id, client_id=env.client_side_id, client=client)
tokens = srp.authenticate_user()
access_token = tokens['AuthenticationResult']['AccessToken']

response = client.get_user(
    AccessToken=access_token
)
print(response)

# return {'Username': '...', 'UserAttributes': [{'Name': 'sub', 'Value': '18021af4-...'}, {'Name': 'email_verified', 'Value': 'true'}, {'Name': 'email', 'Value': '...'}], 'ResponseMetadata': {'RequestId': 'a30618d7-...', 'HTTPStatusCode': 200, 'HTTPHeaders': {'date': 'Fri, 17 Jan 2020 21:25:40 GMT', 'content-type': 'application/x-amz-json-1.1', 'content-length': '209', 'connection': 'keep-alive', 'x-amzn-requestid': 'a30618d7-...'}, 'RetryAttempts': 0}}
```

同じくユーザー属性の変更は以下のような流れで可能

```python
import env
from boto3.session import Session
from getpass import getpass
from warrant.aws_srp import AWSSRP

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== Update User Attributes ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')

srp = AWSSRP(username=email, password=password, pool_id=env.user_pool_id, client_id=env.client_side_id, client=client)
tokens = srp.authenticate_user()
access_token = tokens['AuthenticationResult']['AccessToken']

name = input('Enter User Attribute Name: ')
value = input('Enter User Attribute Value: ')
response = client.update_user_attributes(
    UserAttributes=[
        {
            'Name': name,
            'Value': value
        },
    ],
    AccessToken=access_token
)
print(response)

# === Update User Attributes ===
# Enter Your Email Address: ...
# Enter Your Password:
# Enter User Attribute Name: custom:oshi
# Enter User Attribute Value: Yoshino Aoyama
# {'ResponseMetadata': {'RequestId': '8be55a25-...', 'HTTPStatusCode': 200, 'HTTPHeaders': {'date': 'Fri, 17 Jan 2020 21:33:33 GMT', 'content-type': 'application/x-amz-json-1.1', 'content-length': '2', 'connection': 'keep-alive', 'x-amzn-requestid': '8be55a25-...'}, 'RetryAttempts': 0}}
```

## パスワードの変更

- 単純に ChangePassword API を叩く

```python
import env
from boto3.session import Session
from getpass import getpass
from warrant.aws_srp import AWSSRP

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== Update User Attributes ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')

srp = AWSSRP(username=email, password=password, pool_id=env.user_pool_id, client_id=env.client_side_id, client=client)
tokens = srp.authenticate_user()
access_token = tokens['AuthenticationResult']['AccessToken']

proposed_password = getpass('Enter New Passrod: ')
response = client.change_password(
    PreviousPassword=password,
    ProposedPassword=proposed_password,
    AccessToken=access_token
)
print(response)
```

## パスワードの再設定

- ForgotPassword API を叩いたのち、該当ユーザーのメールアドレスに到達する確認コードと新しいパスワードをパラメタとして ConfirmForgotPassword API を叩くことにより、パスワードの再設定が可能

```python
import env
from boto3.session import Session
from getpass import getpass
from warrant.aws_srp import AWSSRP

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== Forgot Password ===')
email = input('Enter Your Email Address: ')
response = client.forgot_password(
    ClientId=env.client_side_id,
    Username=email,
)

confirmation_code = input('Enter Confrimation Code: ')
password = getpass('Enter New Password: ')
response = client.confirm_forgot_password(
    ClientId=env.client_side_id,
    Username=email,
    ConfirmationCode=confirmation_code,
    Password=password,
)
print(response)
```

## トークンの更新　

- Amplify なんかを使うとこのあたりの更新はうまいこと隠蔽してくれているのであまり意識する必要はない
- 基本的には InitiateAuth API を REFRESH_TOKEN_AUTH の Auth Flow にて実行すれば OK
  - デバイスを記憶している場合、[パラメタとして DeviceKey の指定が必要な点に注意](https://aws.amazon.com/jp/blogs/mobile/tracking-and-remembering-devices-using-amazon-cognito-your-user-pools/)
- REFRESH_TOKEN_AUTH フローの際には IdToken と AccessToken のみが返却され、RefreshToken は返却されない

```python
import env
from time import sleep
from boto3.session import Session
from getpass import getpass
from warrant.aws_srp import AWSSRP

session = Session(profile_name=env.profile)
client = session.client('cognito-idp', region_name=env.region)

print('=== Refresh Token Flow ===')
email = input('Enter Your Email Address: ')
password = getpass('Enter Your Password: ')
srp = AWSSRP(username=email, password=password, pool_id=env.user_pool_id, client_id=env.client_side_id, client=client)
tokens = srp.authenticate_user()
refresh_token = tokens['AuthenticationResult']['RefreshToken']
print('got a refresh token: ' + refresh_token)
sleep(2)

response = client.initiate_auth(
    AuthFlow='REFRESH_TOKEN_AUTH',
    AuthParameters={
        'REFRESH_TOKEN': refresh_token
    },
    ClientId=env.client_side_id,
)
print(response)
```

# MFA 必須時のサインアップ・サインイン

- 多要素認証として SMS メッセージ MFA と TOTP ソフトウェアトークン MFA に対応している
-

# ソーシャル IdP を介したサインイン

- [ユーザープールへのソーシャル ID プロバイダーの追加 - Amazon Cognito](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/cognito-user-pools-social-idp.html) に詳細が記載されている
- ユーザープールのドメインを設定すると Cognito が認可サーバーをホストする
  - ホストされた認可サーバー通じてサインアップ、サインインが可能
  - Android, iOS, JavaScript 向けの Auth SDK も提供されている
- エンドポイントは次の 5 つ
  - 認可エンドポイント(GET /oauth2/authorize): 通常ブラウザ経由で踏み、ユーザーをサインインさせる
  - トークンエンドポイント(POST /oauth2/token): ユーザーのトークンを取得する
  - USERINFO エンドポイント(GET /oauth/userInfo): OpenID Connect (OIDC) 仕様の UserInfo エンドポイント
  - ログインエンドポイント(GET /login): ユーザーをサインインさせるエンドポイント
  - ログアウトエンドポイント(GET /logout): ユーザーをサインアウトさせる

## Login with Amazon (LWA)

1. https://developer.amazon.com/login-with-amazon にて開発者アカウント登録をおこない 、セキュリティプロファイルを作成する
   - 許可されたオリジン: ユーザープールのドメイン
   - 許可された返信 URL: ユーザープールのドメイン/oauth2/idresponse
2. Cognito ユーザープールにて Login with Amazon のクライアント ID とクライアントシークレットを設定する
3. アプリの統合: ドメイン名を設定する
4. アプリクライアントの設定の有効な ID プロバイダとして、Login with Amazon を有効にする
5. フェデレーションの属性マッピングにて必要な属性のマッピングを設定する
6. OAuth 2.0 の Authorization code grant を許可する
7. `https://<domain>.auth.ap-northeast-1.amazoncognito.com/login?client_id=<client_id>&response_type=code&scope=openid+profile&redirect_uri=<redirect_url>` へアクセスし、Login with Amazon にて認証をすすめる
8. URL: `<redirect_url>?code=<code>` にリダイレクトされるので、code を利用してユーザープール Auth API のトークンエンドポイントを叩き、Cognito トークンを取得する

```python
import env
import json
import requests

# ブラウザで以下の URL にアクセスしてログインする
# 'https://' + env.domain + /login?client_id=' + env.client_side_id + '&response_type=code&scope=openid+profile&redirect_uri=' + env.redirect_url
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
print(response.text)
# ===  GET /oauth2/token ===
# return {"id_token":"eyJ...","access_token":"eyJ...","refresh_token":"eyJ...","expires_in":3600,"token_type":"Bearer"}

tokens = json.loads(response.text)
print(tokens)
access_token = tokens['access_token']

print('===  GET /oauth2/userInfo ===')
url = 'https://' + env.domain + '/oauth2/userInfo'
headers = {'Authorization': 'Bearer ' + access_token }
response = requests.get(url=url, headers=headers)
print(response.text)

# ===  GET /oauth2/userInfo ===
# {"sub":"f9969dec-...","email":"...","username":"Facebook_296..."}
```

## Facebook ログイン

1. [Facebook for developers](https://developers.facebook.com/docs/facebook-login) から新しいアプリを作成し、良い塩梅に設定する（Sign in with Amazon とおんなじ感じ）
2. `https://<domain>.auth.ap-northeast-1.amazoncognito.com/login?client_id=<client_id>&response_type=code&scope=openid+profile&redirect_uri=<redirect_url>` へアクセスし、Facebook にて認証をすすめる
3. URL: `<redirect_url>?code=<code>` にリダイレクトされるので、code を利用してユーザープール Auth API のトークンエンドポイントを叩き、Cognito トークンを取得する

## Google サインイン

1. [Google 開発者ページ](https://developers.google.com/identity)で色々設定する
2. `https://<domain>.auth.ap-northeast-1.amazoncognito.com/login?client_id=<client_id>&response_type=code&scope=openid+profile&redirect_uri=<redirect_url>` へアクセスし、Google にて認証をすすめる
3. URL: `<redirect_url>?code=<code>` にリダイレクトされるので、code を利用してユーザープール Auth API のトークンエンドポイントを叩き、Cognito トークンを取得する

## Sign in with Apple

1. 未登録の場合は AppID を作成し、Sign in with Apple の Capabilities を付与
2. Services ID を作成し、Sign in with Apple を有効にし、AppID と関連づける
   - Web Domain は Cognito ユーザープールのホストされているドメイン
   - RedirectURL はホストされているドメインの /oauth/idpresponse パス
3. Sign in with Apple に使う Key を作成し、.p8 ファイルを取得
4. Cognito ユーザープールに良い塩梅に各種設定を行い、あとは他の IdP と同じ流れ

# OIDC ID Provider の追加

TODO

# SAML ID Provider の追加

TODO
