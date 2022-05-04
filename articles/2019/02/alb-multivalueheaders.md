---
title: ALB のターゲットの Lambda 関数から Multi Value Headers を返す
category: programming
date: 2019-02-27 01:20:35
tags: [AWS, Lambda, ELB]
pinned: false
---

複数値を持つ RequestHeader/ResponseHeader がたまにあります。通常こういったリクエストが来た場合でも Event オブジェクトの Headers はただ単純にマップでしかないので、同一キーに対して値は一つです。レスポンスもマップというデータ構造を使っているときには当たり前ですが、同一キーに対して値は一つです。

ALB のターゲットグループに対して lambda.multi_value_headers.enabled 属性を true とすることによりこれに対応できます。このオプションは以下のようなコマンドで変更可能です。

```
aws elbv2 modify-target-group-attributes \
  --target-group-arn <value> \
  --attributes <value>
```

このオプションに変更する際は Lambda 関数の実装自体も変更する必要があります。以下のように multiValueHeaders をキーとして Map<String, List<String>> というような構造となっています。

```json
{
  "multiValueHeaders": {
    "Set-cookie": [
      "cookie-name=cookie-value;Domain=myweb.com;Secure;HttpOnly",
      "cookie-name=cookie-value;Expires=May 8, 2019"
    ],
    "Content-Type": ["application/json"]
  }
}
```

参考: [ターゲットとしての Lambda 関数 - Elastic Load Balancing](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/lambda-functions.html#multi-value-headers-response)

## おまけ

ちなみに API Gateway は 2018 年 11 月に Multi Value Headers に対応している
see: [Support for multi-value parameters in Amazon API Gateway | AWS Compute Blog](https://aws.amazon.com/jp/blogs/compute/support-for-multi-value-parameters-in-amazon-api-gateway/)
