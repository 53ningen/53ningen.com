---
slug: amazon-sns-cli
title: Amazon SNS での様々な CLI 操作
category: programming
date: 2018-12-14 16:40:31
tags: [SNS]
pinned: false
---

Amazon SNS を CLI からいじるときにたまに使うスクリプトをメモっておきます

### あるトピックにサブスクリプションを大量登録

```sh
$ for i in $(seq 1 100);
  do aws sns subscribe --topic-arn [トピックARN] --protocol Email --notification-endpoint "[メアド]+i@example.com";
done;
```

### あるトピックのサブスクリプションをリストアップ

```sh
$ aws sns list-subscriptions | jq -r '.Subscriptions[] | select(.TopicArn | test("[トピックARN]")) | .SubscriptionArn'
```

### トピックのサブスクリプションにフィルタポリシーを設定

```sh
$ for arn in $(aws sns list-subscriptions | jq -r '.Subscriptions[] | select(.TopicArn | test("[トピック名]")) | .SubscriptionArn'); do
  aws sns set-subscription-attributes --subscription-arn "$arn" --attribute-name FilterPolicy --attribute-value "{\"arn\":[\"$arn\"]}";
done;
```
