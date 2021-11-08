---
slug: sam-efs-lambda
title: SAM を利用して EFS ファイルシステムをマウントした Lambda 関数を作る
category: programming
date: 2020-06-19 05:54:48
tags: [AWS, Lambda, EFS, SAM]
pinned: false
---

つい先日 [Lambda で EFS のファイルシステムをマウントできるようになった](https://aws.amazon.com/jp/blogs/news/new-a-shared-file-system-for-your-lambda-functions/) らしいです。

SAM 側では [AWS::Serverless::Function リソースが FileSystemConfigs というプロパティを追加してすでにこの機能に対応している](https://github.com/awslabs/serverless-application-model/releases/tag/v1.25.0) らしいです。

また、これに関連して SAM のポリシーテンプレートに [EFSWriteAccessPolicy](https://github.com/awslabs/serverless-application-model/commit/b98e69c4c442c64c4bd40b1e41b4bb0dcb11283b#diff-b459a8d88303da927fe855161bf2f080) なるものも追加されていました。

以下、読んでるだけだとよくわからんのでためしてみた記録。

## SAM テンプレート: template.yaml

長ったらしいけどざっくりと以下のようなものを作ってる

- VPC 関連
  - VPC
  - サブネット
  - セキュリティグループ（EFS アクセスポイント用と Lambda 用）
- EFS 関連
  - ファイルシステム
  - アクセスポイント
  - マウントターゲット
- Lambda 関連
  - Lambda 関数
  - Lambda 関数の CloudWatch ログ

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.192.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
  Subnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.192.1.0/24
      MapPublicIpOnLaunch: false
  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId:
        Ref: VPC
      GroupDescription: Security group for Lambda
  MountTargetSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref VPC
      GroupName: 'security-group'
      GroupDescription: Security group for mount target
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '2049'
          ToPort: '2049'
          CidrIp: 0.0.0.0/0

  FileSystem:
    Type: AWS::EFS::FileSystem
    Properties:
      PerformanceMode: generalPurpose
      ThroughputMode: bursting
  AccessPoint:
    Type: AWS::EFS::AccessPoint
    Properties:
      FileSystemId: !Ref FileSystem
      PosixUser:
        Uid: 1001
        Gid: 1001
      RootDirectory:
        CreationInfo:
          OwnerGid: 1001
          OwnerUid: 1001
          Permissions: 755
        Path: /data
  MountTarget:
    Type: AWS::EFS::MountTarget
    Properties:
      FileSystemId: !Ref FileSystem
      SecurityGroups:
        - !Ref MountTargetSecurityGroup
      SubnetId: !Ref Subnet

  WorkerFunction:
    Type: AWS::Serverless::Function
    Properties:
      Timeout: 10
      Runtime: python3.8
      CodeUri: worker/
      Handler: app.lambda_handler
      ReservedConcurrentExecutions: 1
      Policies:
        - EFSWriteAccessPolicy:
            FileSystem: !Ref FileSystem
            AccessPoint: !Ref AccessPoint
        - VPCAccessPolicy: {}
      VpcConfig:
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
        SubnetIds:
          - !Ref Subnet
      FileSystemConfigs:
        - Arn: !GetAtt AccessPoint.Arn
          LocalMountPath: /mnt/EFS
  WorkerFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub /aws/lambda/${WorkerFunction}
      RetentionInDays: 1
```

## Lambda 関数の実装コード

実験用に適当に...

```python
# -*- coding: utf-8 -*-

import os

file_path = "/mnt/EFS/data.dat"


def lambda_handler(_, __):
    count = 0
    if os.path.exists(file_path):
        with open(file_path, mode='r') as f:
            count = int(f.read()) + 1

    with open(file_path, mode='w') as f:
        f.write(str(count))
        print(count)
        return count
```

これでデプロイして実行すると、数字がカウントアップしていきます

おしまい
