---
slug: secrets-manager-introduction
title: Secrets Manager を使ってみる
category: programming
date: 2021-01-18 20:09:56
tags: [Serverless, Lambda, SAM, CDK]
pinned: false
---

## Secrets Manager への値の格納と取得

チュートリアルに書いてある内容をためしてみる。CLI からまずはシークレットの作成を行う

```
$ aws secretsmanager create-secret --name tutorials/MyFirstSecret --description "Basic Create Secret" --secret-string S3@tt13R0cks
```

続いて格納したシークレットのメタデータ、およびシークレットそのものを取得する

```
$ aws secretsmanager describe-secret --secret-id tutorials/MyFirstSecret
{
    "ARN": "...",
    "Name": "tutorials/MyFirstSecret",
    "Description": "Basic Create Secret",
    "LastChangedDate": ...,
    "LastAccessedDate": ...,
    "VersionIdsToStages": {
        "...": [
            "AWSCURRENT"
        ]
    }
}

$ aws secretsmanager get-secret-value --secret-id tutorials/MyFirstSecret --version-stage AWSCURRENT
{
    "ARN": "...",
    "Name": "tutorials/MyFirstSecret",
    "VersionId": "...",
    "SecretString": "S3@tt13R0cks",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": ...
}
```

## Secrets Manager に格納した値を Lambda から取得する

Lambda 関数の実装を以下のように行う

```python
# -*- coding: utf-8 -*-
import os
import json
import boto3

SecretId = os.environ["SecretId"]
secrets = boto3.client(service_name='secretsmanager')


def lambda_handler(event, _):
    res = secrets.get_secret_value(SecretId=SecretId)

    # 注: 動作確認のため出力しているが、
    # CWLogs に記録されるので実際のプロダクトでは絶対にこのようなコードは書かない
    print(res)
    return json.loads(res['SecretString'])
```

SAM テンプレートは以下のような感じ

```
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    Runtime: python3.8
    Environment:
      Variables:
        SecretId: !Ref TestSecret
Resources:
  TestSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Description: 'Secrets Test'
      GenerateSecretString:
        SecretStringTemplate: '{"username": "admin"}'
        GenerateStringKey: 'password'
        PasswordLength: 16
        ExcludeCharacters: '"@/\'
  WorkerFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: worker/
      Handler: app.lambda_handler
      Policies:
        - AWSSecretsManagerGetSecretValuePolicy:
            SecretArn: !Ref TestSecret
  WorkerFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub /aws/lambda/${WorkerFunction}
      RetentionInDays: 1
```

## CDK で Secret を管理する

TypeScript で Lambda を次のように実装

```
const AWS = require('aws-sdk')

const secretsmanager = new AWS.SecretsManager({apiVersion: '2017-10-17'})
const env = process.env

const handler = async function (event: any) {
  const { SecretString } = await secretsmanager.getSecretValue({ SecretId: env.SecretId }).promise()

  # 注: 動作確認のため出力しているが、
  # CWLogs に記録されるので実際のプロダクトでは絶対にこのようなコードは書かない
  console.log(SecretString)
  return {}
};

export { handler };
```

CDK は次のような具合

```
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as cdk from "@aws-cdk/core";

export class TsLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const secret = new secretsmanager.Secret(this, 'Secret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'user' }),
        generateStringKey: 'password',
      },
    });

    const helloFunction = new lambda.Function(this, "HelloFunction", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
      environment: {
        SecretId: secret.secretFullArn!
      }
    });
    secret.grantRead(helloFunction)

    const _ = new logs.LogGroup(this, "HelloFunctionLogGroup", {
      logGroupName: "/aws/lambda/" + helloFunction.functionName,
      retention: logs.RetentionDays.ONE_DAY,
    });


  }
}
```

### SAM テンプレートから Secret を取得してみる

以下のようにして Secrets Manager の SecureString の取得が可能

```
Parameters:
  Test:
    Type: String
    Default: '{{resolve:secretsmanager:test:SecretString:test}}'
```

## 番外編: Parameter Store を使ってみる

- Systems Manager に Parameter Store という機能があります
- String, StringList, Secure-String の 3 つの値を CloudFormation テンプレートから参照できます

### String 値の取得

```
Parameters:
  FuncName:
    Type: String
    Default: '{{resolve:ssm:FunctionName:2}}'

Resources:
  WorkerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Ref FuncName
      CodeUri: worker/
      Handler: app.lambda_handler
```

### Secure-String 値の取得

以下のような形式で取得できるが、[リスト](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/dynamic-references.html#dynamic-references-ssm-secure-strings)にあるリソース-パラメータにしか使えない

```
'{{resolve:ssm-secure:Himitsu:}}'
```
