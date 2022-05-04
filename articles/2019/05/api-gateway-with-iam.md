---
title: API Gateway + IAM 認証を試す
category: programming
date: 2019-05-25 04:30:01
tags: [APIGateway]
pinned: false
---

10 分あれば試せる

1. 対象メソッドに IAM 認証を設定し、デプロイする
2. API Gateway リソースの CORS を有効にする

- see: [API Gateway リソースの CORS を有効にする - Amazon API Gateway](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/how-to-cors.html)

3. JavaScript SDK をダウンロードする
4. 以下のような簡単なコードを実行する

JavaScript

```js
var apigClient = apigClientFactory.newClient()

// IAM 認証なし
apigClient
  .petsPetIdGet({ petId: '1' }, {}, {})
  .then((res) => console.log(res))
  .catch((e) => console.log(e))

// IAM 認証あり => 403 が返る
apigClient
  .petsGet({ type: null, page: 0 }, {}, {})
  .then((res) => console.log(res))
  .catch((e) => console.log(e))
```

HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <script
      type="text/javascript"
      src="javascripts/lib/axios/dist/axios.standalone.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/CryptoJS/rollups/hmac-sha256.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/CryptoJS/rollups/sha256.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/CryptoJS/components/hmac.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/CryptoJS/components/enc-base64.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/url-template/url-template.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/apiGatewayCore/sigV4Client.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/apiGatewayCore/apiGatewayClient.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/apiGatewayCore/simpleHttpClient.js"
    ></script>
    <script
      type="text/javascript"
      src="javascripts/lib/apiGatewayCore/utils.js"
    ></script>
    <script type="text/javascript" src="javascripts/apigClient.js"></script>
    <script type="text/javascript" src="javascripts/app.js"></script>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
```

適切な権限を設定したクレデンシャルを用いて、単純に以下のように apigClient のインスタンスを取得するとリクエストに成功する

```js
var apigClient = apigClientFactory.newClient({
  accessKey: '?',
  secretKey: '?',
})
```
