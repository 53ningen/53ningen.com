---
title: AWS SDK for PHP を用いた Amazon SNS の操作
category: programming
date: 2016-05-05 21:54:33
tags: [AWS, PHP]
pinned: false
---

AWS Lambda, SQS, HTTP/S, Email, SMS, モバイルデバイスなどに対して PUSH 通知を送ることができる Amazon SNS を PHP の SDK から操作する方法についてざっくりと見ていきます。

## SNS クライアントのインスタンス化

Amazon SNS の操作をするためのクライアントクラスは、以下のように直感的にインスタンス化できます。

```php
require_once('./vendor/autoload.php');
use Aws\Sns\SnsClient;

$client = new SnsClient([
    'version' => 'latest',
    'region' => 'us-east-1', # 各自の利用しているregionを指定
    'profile' => 'default',  # ~/.aws/credentials 下に credential を置く
]);
```

## デバイストークンの登録

APNS や GCM などから発行されたデバイストークンは [`SnsClient#createPlatformEndpoint`](http://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sns-2010-03-31.html#createplatformendpoint) を用いて対応するアプリケーションへエンドポイント登録ができます。戻り値の `'EndpointArn'` にデバイスに紐づく EndpointArn が格納されているので、個別のデバイスへの通知が必要な場合は、これを永続化する必要があります。

```php
try {
    $platformApplicationArn = '<applicationのarn>';
    $token = '<デバイスから受け取ったデバイストークン>'
    $params = [
        'PlatformApplicationArn' => $platformApplicationArn,
        'Token' => $token,
    ];
    $result = $client->createPlatformEndpoint($params);

    $endpointArn = $result['EndpointArn'];  // 必要に応じて永続化
} catch (Aws\Sns\Exception\SnsException $e) {
    // 例外処理
}
```

なお、すでに登録されているデバイストークンを何度登録しても、正常に動作します（べき等性がある）。ただし、すでに登録されているデバイストークンが、異なる attribute（具体的には User Data）を持っている場合は例外が発生するので注意が必要です。こういったことは、AWS コンソールとコード両方からデバッグテストなどをしているときに発生しやすいと思います。

また、エンドポイントの Enabled が false になっていることをチェックしたければ、以下のように Attributes を指定してあげれば例外のほうに流れてくれます。

```php
$params = [
    'PlatformApplicationArn' => $platformApplicationArn,
    'Token' => $token,
    'Attributes' => ['Enabled' => 'true'],
];
try {
    $result = $client->createPlatformEndpoint($params);

    $endpointArn = $result['EndpointArn'];  // 必要に応じて永続化
} catch (SnsException $e) {
    // トークンが登録済みで Enabled が false のときに例外に流れるようになる
}
```

## トピックの作成・購読

デバイストークンをアプリケーションに登録するとエンドポイントが発行されます。エンドポイントへ個別に通知を送るのも良いですが、一斉におなじ内容の通知を送りたいこともあると思います。そんなときにはトピックというものが便利です。トピックにエンドポイントを紐付けておけば、トピック宛に通知を送るだけで、紐付いているエンドポイントに一斉にメッセージを送ることができます。トピックを作る場合は `SnsClient#createTopic` を使います。

```php
$params = ['Name' => '<Topic名>'];
$result = $client->createTopic($params);

$topicArn = $result['TopicArn'];
```

続いてエンドポイントが `TopicArn` を購読するように処理を走らせます。

```php
$params = [
   'Endpoint' => $endpointArn,
    'Protocol' => 'Application',
    'TopicArn' => $topicArn,
];

$result = $client->subscribe($params);
$subscriptionArn = $result['SubscriptionArn'];
```

このようにして、エンドポイントにトピックを購読させることができます。すでに無効になっているエンドポイントについても購読処理は正常に行うことができます。

## プッシュ通知の送信

Amazon SNS を利用すれば、トピック、アプリケーション、各デバイスなど様々な粒度で PUSH 通知を送ることができます。通知には [`SnsClient#publish`](http://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sns-2010-03-31.html#publish) を使います。

```php
$msg = [
    'Message' => 'hogehoge',
    'TargetArn' => '<TopicArn | EndpointArn>',
];
```

無効なエンドポイントに通知を行った場合、例外が発生します。ただし、トピックへ送った場合で、サブスクライバーの中に無効なエンドポイントがあっても正常に処理が行われます。JSON でメッセージを送る際には `MessageStructure => 'json'` をパラメタに追加してください。

```php
// json で Message を送る際には default が必須
$msg = array(
    'MessageStructure' => 'json',
    'TargetArn' => $topicArn,
    'Message' => json_encode(array(
        'default' => '<string>...',
        'APNS_SANDBOX' => json_encode(array(
            'aps' => array(
                'key' => 'value'
            )
        ))
    ))
);
```

## エンドポイントの整理

デバイストークンは一定条件を満たすと失効します。失効したデバイストークンに対応するエンドポイントは `Enabled = false` となりますが、自動で消えてくれるわけではありません。Amazon SNS にはエンドポイントの状態変化を通知してくれる機能がありますので、それを利用して無効になったエンドポイントを削除する処理を走らせます。

まずは、エンドポイントの状態変化を通知するためのトピックを作成しましょう。そして、AWS コンソール SNS 内の `Applications` で今回の処理を追加したい対象のアプリケーションを選択し、Actions -> Configure events へと進みます。そして「Endpoint updated」内に先ほど作成したトピックの ARN を入力します。これで Endpoint の状態が変化したときに通知が飛ぶようになりました。データは JSON で飛んできますので、コンソールからよしなに処理先への購読処理を行ってください。

通知が来たら、エンドポイントの状態確認を行い、`Enable = false` だったらエンドポイントの削除処理を行います。

```php
$client->deleteEndpoint([
    'EndpointArn' => '<endpoint arn>'
]);
```
