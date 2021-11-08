---
slug: sns-firehose-s3
title: SNS-Kinesis Firehose-S3 連携の CloudFormation テンプレート
category: programming
date: 2021-01-13 20:38:54
tags: [Serverless, SNS]
pinned: false
---

[Amazon SNS トピックに対して Kinesis Firehose ストリームをエンドポイントとするサブスクリプションを作成できるようになった](https://aws.amazon.com/jp/blogs/compute/introducing-message-archiving-and-analytics-for-amazon-sns/)ので手早くこれを構成するための CloudFormation テンプレートをメモしておく。

作成する必要があるリソースは以下の通り

- S3 バケット
- SNS トピック
- Subscription
- Subscription 用のロール
- Kinesis Firehose Delivery Stream
- Delivery Stream 用の IAM ポリシー
- Delivery Stream 用の IAM ロール

```YAML
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  TestBucket:
    Type: AWS::S3::Bucket
    DeletionPolicy: Delete

  TestTopic:
    Type: AWS::SNS::Topic
  TestTopicKinesisSubscription:
    Type: AWS::SNS::Subscription
    Properties:
      TopicArn: !Ref TestTopic
      Endpoint: !GetAtt TestDeliveryStream.Arn
      Protocol: firehose
      RawMessageDelivery: true
      SubscriptionRoleArn: !GetAtt TestTopicKinesisSubscriptionRole.Arn
  TestTopicKinesisSubscriptionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - sns.amazonaws.com
            Action:
              - sts:AssumeRole
      Policies:
        - PolicyName: SNSKinesisFirehoseAccessPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Action:
                  - firehose:DescribeDeliveryStream
                  - firehose:ListDeliveryStreams
                  - firehose:ListTagsForDeliveryStream
                  - firehose:PutRecord
                  - firehose:PutRecordBatch
                Effect: Allow
                Resource:
                  - !GetAtt TestDeliveryStream.Arn

  TestDeliveryStream:
    DependsOn:
      - TestDeliveryPolicy
    Type: AWS::KinesisFirehose::DeliveryStream
    Properties:
      ExtendedS3DestinationConfiguration:
        BucketARN: !Join
          - ''
          - - 'arn:aws:s3:::'
            - !Ref TestBucket
        BufferingHints:
          IntervalInSeconds: 60
          SizeInMBs: 1
        CompressionFormat: UNCOMPRESSED
        Prefix: firehose/
        RoleARN: !GetAtt TestDeliveryRole.Arn
  TestDeliveryRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Sid: ''
            Effect: Allow
            Principal:
              Service: firehose.amazonaws.com
            Action: 'sts:AssumeRole'
            Condition:
              StringEquals:
                'sts:ExternalId': !Ref 'AWS::AccountId'
  TestDeliveryPolicy:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: firehose_delivery_policy
      PolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Action:
              - 's3:AbortMultipartUpload'
              - 's3:GetBucketLocation'
              - 's3:GetObject'
              - 's3:ListBucket'
              - 's3:ListBucketMultipartUploads'
              - 's3:PutObject'
            Resource:
              - !Join
                - ''
                - - 'arn:aws:s3:::'
                  - !Ref TestBucket
              - !Join
                - ''
                - - 'arn:aws:s3:::'
                  - !Ref TestBucket
                  - '*'
      Roles:
        - !Ref TestDeliveryRole
```

そのうち SAM 側でうまく吸収してもうちょっと単純にかけるようになるのではないかなと思います。
