---
title: Lambda のイベントソースとして SQS を設定する
category: programming
date: 2018-07-03 20:40:16
tags: [AWS, Node.js, Lambda, JavaScript, SQS]
pinned: false
---

2018/06/28 の記事 [AWS Lambda Adds Amazon Simple Queue Service to Supported Event Sources | AWS News Blog](https://aws.amazon.com/jp/blogs/aws/aws-lambda-adds-amazon-simple-queue-service-to-supported-event-sources/) にて AWS Lambda が Amazon SQS をイベントソースとしてサポートしたという話を見かけたので試してみました。

SQS にジョブを突っ込んでラムダをワーカーとして動かすというのはわりとありがちかなと思っていたんですが、いままでは SQS をポーリングして Lambda を Invoke する役割の子を自前で実装しなければならず、やや面倒ではありましたが、これでよりお手軽になりました。早速試してみましょう。

以下、特に明記しない限り東京リージョンでの検証になります。

## SQS キューの作成

ジョブを突っ込むための SQS キューをいつもどおり作成します。公式ドキュメントでいうと以下のあたりを参照。

- [チュートリアル: Amazon SQS キューの作成 - Amazon Simple Queue Service](https://docs.aws.amazon.com/ja_jp/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-create-queue.html)

## Lambda 関数の作成

SQS へポーリングするために作成する Lambda 関数には、SQS への適切なアクセス権限を付与したロールをアタッチする必要があります。

その点にだけ注意すれば通常どおり Lambda 関数を作る形で問題なさそうです。今回は以下のようなロールをアタッチしました。管理ポリシー + インラインポリシーで雑に作成。

```
{
  "roleName": "SQSLambdaTest",
  "policies": [
    {
      "document": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "sqs:GetQueueAttributes",
            "Resource": "*"
          }
        ]
      },
      "name": "GetQueueAttributes",
      "type": "inline"
    },
    {
      "document": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "sqs:DeleteMessage",
              "sqs:ReceiveMessage"
            ],
            "Resource": "arn:aws:sqs:*"
          },
          {
            "Effect": "Allow",
            "Action": [
              "lambda:InvokeFunction"
            ],
            "Resource": "arn:aws:lambda:ap-northeast-1:XXXXXXXXXXXX:function:SQSLambdaTest*"
          }
        ]
      },
      "name": "AWSLambdaSQSPollerExecutionRole-496aaa64-43f8-4570-b85e-684aebba1f76",
      "id": "ANPAIC77RIBZ2V5CVBLZE",
      "type": "managed",
      "arn": "arn:aws:iam::XXXXXXXXXXXX:policy/service-role/AWSLambdaSQSPollerExecutionRole-496aaa64-43f8-4570-b85e-684aebba1f76"
    },
    {
      "document": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "arn:aws:logs:ap-northeast-1:XXXXXXXXXXXX:*"
          },
          {
            "Effect": "Allow",
            "Action": [
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ],
            "Resource": [
              "arn:aws:logs:ap-northeast-1:XXXXXXXXXXXX:log-group:/aws/lambda/SQSLambdaTest:*"
            ]
          }
        ]
      },
      "name": "AWSLambdaBasicExecutionRole-6c3816ca-99e5-423e-a5b0-066e5f8dba0b",
      "id": "ANPAIRWUDXNA3AHTVUG3C",
      "type": "managed",
      "arn": "arn:aws:iam::XXXXXXXXXXXX:policy/service-role/AWSLambdaBasicExecutionRole-6c3816ca-99e5-423e-a5b0-066e5f8dba0b"
    }
  ]
}
```

Lambda 関数の内容は、特段凝ったことをせずに、受け取ったイベントをログに吐き出すような単純な以下のコードになります。

```
exports.handler = async (event) => {
    console.log(event);
    return 'Hello from Lambda!'
};
```

Lambda 関数作成後、イベントソースの設定にて先ほど作成した SQS キューを指定します。

また同時にバッチサイズの指定もここで行えます。バッチサイズとはキューから一度に読み取るレコードの最大数とのことで、マネジメントコンソール上からは現状 1 〜 10 までの値を指定できました。

## 稼働させてみる

SQS に次のような JSON を投入してみます。

```
{
  "from": "SQS",
  "key2": "value2",
  "key1": "value1"
}
```

すると以下のように CloudWatch Logs で上記のジョブが処理されたであろう記録を確認できました。また当該 SQS より先ほど投入した JSON はデキューされていました。

```
START RequestId: 3a1b6e79-7146-564b-94df-3dcc11b9f161 Version: $LATEST
2018-07-03T11:32:26.667Z 3a1b6e79-7146-564b-94df-3dcc11b9f161 { Records:
[ { messageId: 'b3188cf8-aa59-4d07-8865-9e69f1b21b62',
receiptHandle: 'AQEBFS4+GEg+j0zCrI5UTjLt8l60Qjv4oYzhE6R/Y/wHRCSZuaPx6Z88kzF+Elq+oWOXlIly347TmV/gT3hBYmMGolIklS8AD1VCVyafVpmGcAxi1QHzGiN+6d9w9B80UNk/7fDLZUg3B6bV6Eto/JuESw6on+eqwsxkeMvJEPdvvpz6tDXyjR0fbT5KEB3z3j8lg2wz8w8gnc9nmTuLh/Eb998z9+w5//dRn5QCryqcBMbfw7QZJLtyQhE30SulKU63XjrXNA69+Ut3qWds/NqAFNAtj9eFKZO0uMJht/7osq8tH0cPNQRY9RhYOO3tcN3FpZeylhtctTv7gffQWkGJSInhm3FGIylbbjiNVr+RiKP7GA5n5r/QOG3XQbs9fpzc4LugmXmZSaL1xpz1TuVZ+w==',
body: '{\n "from": "SQS",\n "key2": "value2",\n "key1": "value1"\n}',
attributes: [Object],
messageAttributes: {},
md5OfBody: '20ccad28ff6748494f5c7e44a4689688',
eventSource: 'aws:sqs',
eventSourceARN: 'arn:aws:sqs:ap-northeast-1:XXXXXXXXXXXX:SQSLambdaTest',
awsRegion: 'ap-northeast-1' } ] }
END RequestId: 3a1b6e79-7146-564b-94df-3dcc11b9f161
REPORT RequestId: 3a1b6e79-7146-564b-94df-3dcc11b9f161 Duration: 3.00 ms Billed Duration: 100 ms Memory Size: 128 MB Max Memory Used: 46 MB
```

## 気になったこと

### Lambda 関数がエラーを返した場合の SQS メッセージ

Lambda 関数がエラーを返した場合 SQS メッセージはどうなるのでしょうか。下記のようなコードで実験をしてみます。

```
exports.handler = async (event) => {
    throw "Error";
};
```

結果、メッセージは SQS キューから削除されず、可視性タイムアウトが過ぎたのちに再度処理が行われる挙動となっていました。期待しているとおりの結果ではありますが、無限ループが発生しうるので必ずデッドレターキューの設定をしておいたほうが無難です。

### FIFO キューは Lambda 関数のイベントソースとして利用できるのか

us-east-1 リージョンで試したところ、現状 Lambda の設定より SQS をイベントソースとして選択したときに、選択可能な SQS キューの一覧に FIFO キューは表示されずコンソールから設定することは不可能でした。

そもそも Lambda をワーカーにして同時実行する場合、FIFO である必要なくなるのであまり困るようなシチュエーションはなさそうですが、気になったので確認してみました。

[News Blog](https://aws.amazon.com/jp/blogs/aws/aws-lambda-adds-amazon-simple-queue-service-to-supported-event-sources/) にも以下のように書かれている。

> At the moment the Lambda triggers only work with standard queues and not FIFO queues.
