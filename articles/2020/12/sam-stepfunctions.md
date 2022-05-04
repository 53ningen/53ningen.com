---
title: SAM で Step Functions リソースを定義する
category: programming
date: 2020-12-20 04:05:01
tags: [Serverless, Lambda, StepFunctions]
pinned: false
---

# これはなに

- [2020/5/27 に SAM が Step Functions リソースをサポートした](https://aws.amazon.com/jp/about-aws/whats-new/2020/05/aws-sam-adds-support-for-aws-step-functions/)ので、リソース定義の流れを確認しておくメモ
- シンプルな機能を持つ Lambda 関数を数珠つなぎにして、大きなアプリケーションを構成するときに Lambda から Lambda、あるいは Lambda, から SNS, SQS などを通して Lambda を起動するよりも、Step Functions を用いたほうがワークフローが明確で、処理の流れがコードを見ずに理解できる
- ステートマシンから直接 DynamoDB テーブルの読み書きも可能なのでそのあたりのコード書かなくてすむのでやっぱりサーバーレスアプリケーションを構成するときにはかなり有用

# Lambda 関数の作成

チュートリアルとして、ある関数 A が "Hello" と返し、関数 B は "World" と event.result の値を結合するといった簡単な関数の協調動作を実現したいとします。

そのとき関数 A は以下のように定義します。

```python
def lambda_handler(_, __):
    return {
        'result': 'hello'
    }
```

関数 B は以下のように定義します。

```python
def lambda_handler(e, _):
    result = e['result'] + 'world'
    return {
        'result': result
    }
```

## Step Functions State Machine の定義

関数 A → 関数 B という順番で単純に実行する State Machine は以下のように定義できます。

```json
{
  "Comment": "A state machine that does mock stock trading.",
  "StartAt": "InvokeHello",
  "States": {
    "InvokeHello": {
      "Type": "Task",
      "Resource": "${HelloFunction}",
      "Next": "InvokeWorld"
    },
    "InvokeWorld": {
      "Type": "Task",
      "Resource": "${WorldFunction}",
      "End": true
    }
  }
}
```

# SAM テンプレートの定義

最後に、Lambda, Step Functions リソースを SAM テンプレートに定義してデプロイすればおしまいです。

```yaml
AWSTemplateFormatVersion: '2010-09-09'
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

  WorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      Timeout: 10
      Runtime: python3.8
      CodeUri: functions/world/
      Handler: app.lambda_handler
  WorldFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub /aws/lambda/${WorldFunction}
      RetentionInDays: 1

  HelloWorldStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      Name: HelloWorldStateMachine
      DefinitionUri: statemachine/hello_world.asl.json
      DefinitionSubstitutions:
        HelloFunction: !GetAtt HelloFunction.Arn
        WorldFunction: !GetAtt WorldFunction.Arn
      Policies:
        - LambdaInvokePolicy:
            FunctionName: !Ref HelloFunction
        - LambdaInvokePolicy:
            FunctionName: !Ref WorldFunction
```
