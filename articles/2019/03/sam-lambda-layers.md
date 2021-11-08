---
slug: sam-lambda-layers
title: SAM(Serverless Application Model) と Lambda Layers
category: programming
date: 2019-03-30 03:40:30
tags: [Lambda, SAM]
pinned: false
---

以下のような内容を実現しようとしてみたメモ

- Lambda の Layer も含めて同一の SAM file で管理したい
- ステージごとに Layer も分離したい
  - 本番環境と開発環境の Layer は真面目に運用するなら分離したいところ
  - バージョンで分けるというのもあるけど、個人的にはそもそもリソースを分離したい

## Directory 構造

以下のように Lambda 関数とレイヤを同一のリポジトリ、および SAM ファイルで管理します

```
.
├── config.dev
├── config.prod
├── config.template
├── deploy
├── src
│   └── python36
│       ├── hello_world
│       │   ├── __init__.py
│       │   ├── app.py
│       │   └── requirements.txt
│       └── layers
│           └── requests
│               ├── __init__.py
│               ├── python
│               └── requirements.txt
├── template.yaml
└── test
    └── ...(略)...
```

## 関数の実装コード

今回は単純に依存ライブラリ requests に依存する簡単な Lambda 関数を考えます

```python
# -*- coding: utf-8 -*-

import requests


def lambda_handler(event, context):
    url = 'https://checkip.amazonaws.com'
    res = requests.get(url)
    return {
        'status_code': res.status_code,
        'ip_addr': res.text.strip(),
    }
```

## Layer とデプロイ

当然 requests への依存解決が必要です。SAM を用いると requirements.txt に反応して依存ライブラリを解決してデプロイパッケージを作成してくれます。しかしながらこれをレイヤーに分離したい場合どのようにすればよいでしょうか。

基本的に SAM は LayerVersion に関しても CodeUri で指定したディレクトリ配下のものを単純に zip で固めてデプロイします。したがって以下のようなデプロイ用の簡単なシェルスクリプトがあると便利です。

```
S3Bucket=     # deploy target s3 bucket
S3KeyPrefix=  # deploy target key prefix

layers=("requests")
for layer in $layers; do
  pushd src/python36/layers/$layer/
  docker run --rm -v "$PWD":/var/task -w /var/task lambci/lambda:build-python3.6 pip install -r requirements.txt -t python
  popd
done

sam build
sam package --output-template-file packaged.yaml --s3-bucket $S3Bucket --s3-prefix "$S3KeyPrefix"
sam deploy --template-file packaged.yaml --stack-name ${Stage}SamLambdaLayer --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    "STAGE=$stage"
```

もちろん依存ライブラリ自体は SCM の対象から外したいので、以下のような .gitignore を書いておけばよいでしょう。

```
.aws-sam

src/*/layers/*/*

!src/*/layers/*/requirements.txt
!src/*/layers/*/__init__.py
```

## SAM ファイル

SAM ファイルは以下のようになります

```
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
    sam-lambda-layers

Globals:
  Function:
    Timeout: 10
    Runtime: python3.6
    MemorySize: 128

Resources:
  # IAM Role for Lambda Function
  LambdaFunctionRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub LambdaFunctionRole
      AssumeRolePolicyDocument:
        Statement:
        - Action:
          - sts:AssumeRole
          Effect: Allow
          Principal:
            Service:
            - lambda.amazonaws.com
        Version: '2012-10-17'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

  # Function Layers
  RequestsLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: !Sub Requests
      Description: Requests(python 3.x)
      ContentUri: src/python36/layers/requests
      RetentionPolicy: Retain
      CompatibleRuntimes:
        - python3.6
        - python3.7


  # Lambda Functions and Log Groups
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: HelloWorld
      CodeUri: src/python36/hello_world
      Handler: app.lambda_handler
      Role: !GetAtt LambdaFunctionRole.Arn
      Layers:
        - !Ref RequestsLayer
  HelloWorldLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /aws/lambda/HelloWorld
      RetentionInDays: 7

```

## ステージ管理

本番、開発環境を分離するためには以上の内容について関数名に Prod/Dev などといったプレフィックスをつければ OK。これに伴いデプロイスクリプトを少し変更する必要があります。

いい感じに動くサンプルを [53ningen/sam-lambda-layers](https://github.com/53ningen/sam-lambda-layers) にあげておきましたので必要な方はどうぞ。
