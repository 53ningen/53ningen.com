---
title: Step Functions Local を使う
category: programming
date: 2020-12-27 13:06:23
tags: [Serverless, StepFunctions]
pinned: false
---

# これはなに

- Step Functions Local の使い方と利用のイメージのメモ

# 導入方法

ドキュメントに書かれているとおりに実行します: [Step Functions (ダウンロード可能バージョン) と Docker - AWS Step Functions](https://docs.aws.amazon.com/ja_jp/step-functions/latest/dg/sfn-local-docker.html)

`docker pull` コマンドでサクッと導入できます

```
$ docker pull amazon/aws-stepfunctions-local
```

`docker run` コマンドで Step Functions Local を立ち上げます

```
$ docker run -p 8083:8083 amazon/aws-stepfunctions-local
```

## Lambda 関数のローカル実行

Step Functions Local のステートマシン実行前に Lambda 関数をローカルで動かしておきます。

Lambda 関数の実装はこんな感じ

```python
$ cat ./functions/hello/app.py

# -*- coding: utf-8 -*-

def lambda_handler(_, __):
    return {
        'result': 'hello'
    }
```

SAM テンプレートはこんな感じ

```
$ cat ./template.yaml

AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: >
  hello-world python 3.8

Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      Timeout: 10
      Runtime: python3.8
      CodeUri: functions/hello/
      Handler: app.lambda_handler
  HelloFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub /aws/lambda/${HelloFunction}
      RetentionInDays: 1
```

Lambda 関数をローカルで実行します

```
$ sam local start-lambda

$ aws lambda invoke --function-name "HelloFunction" --endpoint-url "http://127.0.0.1:3001" --no-verify-ssl /tmp/out.txt
{
    "StatusCode": 200
}

$ cat /tmp/out.txt
{"result":"hello"}
```

以上のようにローカルでの Lambda 関数の稼働が確認できました

## Lambda 関数実行タスクを含むステートマシンのローカル実行

いよいよ Lambda 関数実行タスクを含むステートマシンをローカルで動かします

Step Functions Local 側から Lambda Local 側への通信ができるようにまずは[環境変数](https://docs.aws.amazon.com/ja_jp/step-functions/latest/dg/sfn-local-config-options.html)を以下のように設定

```
$ cat environment.txt
LAMBDA_ENDPOINT=http://host.docker.internal:3001
```

そして該当の環境変数を用いて Step Functions Local を起動します

```
$ docker run -p 8083:8083 --env-file environment.txt amazon/aws-stepfunctions-local
```

ステートマシンの定義は以下のような感じにしておきます

```
$ cat ./statemachine/hello_world.asl.json
{
    "Comment": "A state machine that does mock stock trading.",
    "StartAt": "InvokeHello",
    "States": {
        "InvokeHello": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:HelloFunction",
            "Next": "InvokeWorld"
        },
        "InvokeWorld": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:WorldFunction",
            "End": true
        }
    }
}
```

このような状況のもと、ステートマシンをローカル上に作成します

```
$ aws stepfunctions --endpoint http://localhost:8083 create-state-machine --name "HelloWorld" --role-arn "arn:aws:iam::012345678901:role/DummyRole" --definition file://./statemachine/hello_world.local.asl.json
{
    "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:HelloWorld",
    "creationDate": 1608790957.674
}
```

最後にローカルでステートマシンを実行するコマンドを叩きます

```
$ aws stepfunctions --endpoint http://localhost:8083 start-execution --state-machine arn:aws:states:us-east-1:123456789012:stateMachine:HelloWorld --name test
{
    "executionArn": "arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test",
    "startDate": 1608791078.365
}
```

すると Step Functions Local 側のコンソールに以下のようにステートマシンの実行結果が出力されます

```
2020-12-XX XX:XX:10.485: StartExecution => {"requestClientOptions":{"readLimit":131073,"skipAppendUriPath":false},"requestMetricCollector":null,"customRequestHeaders":null,"customQueryParameters":null,"cloneSource":null,"sdkRequestTimeout":null,"sdkClientExecutionTimeout":null,"stateMachineArn":"arn:aws:states:us-east-1:123456789012:stateMachine:HelloWorld","name":"test2","input":null,"traceHeader":null,"requestCredentials":null,"requestCredentialsProvider":null,"generalProgressListener":{"syncCallSafe":true},"readLimit":131073,"cloneRoot":null}
2020-12-XX XX:XX:10.525: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"ExecutionStarted","PreviousEventId":0,"ExecutionStartedEventDetails":{"Input":"{}","RoleArn":"arn:aws:iam::123456789012:role/DummyRole"}}
2020-12-XX XX:XX:10.527: [200] StartExecution <= {"sdkResponseMetadata":null,"sdkHttpMetadata":null,"executionArn":"arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2","startDate":1608792910520}
2020-12-XX XX:XX:10.528: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"TaskStateEntered","PreviousEventId":0,"StateEnteredEventDetails":{"Name":"InvokeHello","Input":"{}"}}
2020-12-XX XX:XX:10.530: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"LambdaFunctionScheduled","PreviousEventId":2,"LambdaFunctionScheduledEventDetails":{"Resource":"arn:aws:lambda:us-east-1:123456789012:function:HelloFunction","Input":"{}"}}
2020-12-XX XX:XX:10.569: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"LambdaFunctionStarted","PreviousEventId":3}
2020-12-XX XX:XX:16.394: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"LambdaFunctionSucceeded","PreviousEventId":4,"LambdaFunctionSucceededEventDetails":{"Output":"{\"result\":\"hello\"}"}}
2020-12-XX XX:XX:16.395: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"TaskStateExited","PreviousEventId":5,"StateExitedEventDetails":{"Name":"InvokeHello","Output":"{\"result\":\"hello\"}"}}
2020-12-XX XX:XX:16.396: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"TaskStateEntered","PreviousEventId":6,"StateEnteredEventDetails":{"Name":"InvokeWorld","Input":"{\"result\":\"hello\"}"}}
2020-12-XX XX:XX:16.396: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"LambdaFunctionScheduled","PreviousEventId":7,"LambdaFunctionScheduledEventDetails":{"Resource":"arn:aws:lambda:us-east-1:123456789012:function:WorldFunction","Input":"{\"result\":\"hello\"}"}}
2020-12-XX XX:XX:16.397: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"LambdaFunctionStarted","PreviousEventId":8}
2020-12-XX XX:XX:22.222: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"LambdaFunctionSucceeded","PreviousEventId":9,"LambdaFunctionSucceededEventDetails":{"Output":"{\"result\":\"helloworld\"}"}}
2020-12-XX XX:XX:22.222: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"TaskStateExited","PreviousEventId":10,"StateExitedEventDetails":{"Name":"InvokeWorld","Output":"{\"result\":\"helloworld\"}"}}
2020-12-XX XX:XX:22.223: arn:aws:states:us-east-1:123456789012:execution:HelloWorld:test2 : {"Type":"ExecutionSucceeded","PreviousEventId":11,"ExecutionSucceededEventDetails":{"Output":"{\"result\":\"helloworld\"}"}}
```

ステートマシン実行の結果、最終的に `{"result":"helloworld"}` が得られました
