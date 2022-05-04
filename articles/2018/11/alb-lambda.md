---
title: ALB のバックエンドに Lambda を利用する
category: programming
date: 2018-11-30 18:55:34
tags: [Lambda]
pinned: false
---

記事 [Lambda functions as targets for Application Load Balancers | Networking & Content Delivery](https://aws.amazon.com/jp/blogs/networking-and-content-delivery/lambda-functions-as-targets-for-application-load-balancers/) にあるように ALB のターゲットに Lambda 関数を登録できるようになったので試してみました。

## 1. Lambda 関数を作成

event をそのまま出力する関数を作成

```js
exports.handler = async (event) => {
  var res = {
    statusCode: 200,
    statusDescription: '200 OK',
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  }
  res['body'] = JSON.stringify(event)
  return res
}
```

## 2. Lambda のリソースポリシーを追加

ALB が Lambda を Invoke できるようにリソースポリシーを設定します

```json
{
  "Version": "2012-10-17",
  "Id": "default",
  "Statement": [
    {
      "Sid": "?",
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticloadbalancing.amazonaws.com"
      },
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:ap-northeast-1:?:function:?",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": "arn:aws:elasticloadbalancing:ap-northeast-1:?:targetgroup/?/?"
        }
      }
    }
  ]
}
```

## 3. ターゲットグループを作成

ターゲットグループを作成するときに Lambda を選択できるようになっているので選択し、作成した Lambda 関数をターゲットとして登録します

## 4. ALB のリスナールールにターゲットグループへの転送ルールを設定

適当なルールを作って Lambda を呼び出せるようにしましょう

## 5. テスト

ニッコリ

```
$ curl 'https://....../'
{
  "requestContext": {
    "elb": {
      "targetGroupArn": "arn:aws:elasticloadbalancing:ap-northeast-1:?:targetgroup/?/?"
    }
  },
  "httpMethod": "GET",
  "path": "/",
  "queryStringParameters": {

  },
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
    "cookie": "_ga=GA1.2.1627710522.1535328146",
    "host": "......",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
    "x-amzn-trace-id": "Root=1-5c009d73-777f39f4b5723674feb126ec",
    "x-forwarded-for": "?",
    "x-forwarded-port": "443",
    "x-forwarded-proto": "https"
  },
  "body": "",
  "isBase64Encoded": true
}
```

## 感想

ベンリ
