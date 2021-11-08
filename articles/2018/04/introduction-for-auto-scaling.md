---
slug: introduction-for-auto-scaling
title: Auto Scaling に関する各種概念の整理
category: programming
date: 2018-04-08 23:42:46
tags: [AWS,EC2,ELB]
pinned: false
---

## Auto Scaling とは

> 情報ソース: [Amazon EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)

- 負荷に応じて最適な EC2 インスタンスを配置するための仕組み
- Auto Scaling には以下の構成要素がある
  - Auto Scaling グループ: minimum number of instances, maximum number of instances, desired capacity をパラメタとして設定できる
  - 起動設定: AMI ID, インスタンスタイプ、キーペア、セキュリティグループ、ストレージなど Auto Scaling の際に起動する EC2 インスタンスのテンプレート
  - スケーリング: いつどのようにスケールイン・アウトするかを定めるルール設定


## 起動設定とは

> 情報ソース: [起動設定](https://docs.aws.amazon.com/ja_jp/autoscaling/ec2/userguide/LaunchConfiguration.html#LaunchConfiguration)

- Auto Scaling グループが EC2 インスタンスを起動するために使用するテンプレート
- 以下の情報を含む
  - AMI ID
  - instance type
  - key pair
  - security group
  - block device mapping
- **グループを作成したあとに起動設定を変更できない**
  - Auto Scaling グループ作成時には起動設定/起動テンプレート/EC2 インスタンスのいずれか用途にマッチするものを指定する


## 基本的な Auto Scaling の構成

ひとまず基本的な Auto Scaling の設定をしてみる

1. 起動テンプレートを作成する
  - 起動する AMI、セキュリティグループなどを指定する
  - 起動設定はあとから編集できない点に注意
2. Auto Scaling グループを作成する
  - 今回は min=2, desired=2, max=4 で指定
  - グループを作るとインスタンスが 2 つ立ち上がる
3. ALB を作成し、target group を作成
  - target group は一旦、空のままで良い
4. ALB に設定した target group に Auto Scaling グループをアタッチ


### 実験1: desired size の変更による手動スケーリング

- desired size を変更することにより手動でスケーリングできる
- マネジメントコンソールやCLIなどでこの値を変更すると基本的には即座にそれに従い適切にスケーリングが行われる
- 下記は desired size を 1 から 2 に変更した際のログです

```
- 成功
Launching a new EC2 instance: i-.......
2018 April 7 17:11:31 UTC+9
2018 April 7 17:12:04 UTC+9
説明:Launching a new EC2 instance:  i-.......
原因:At 2018-04-07T08:11:29Z an instance was started in response to a difference between desired and actual capacity, increasing the capacity from 1 to 2.
```


### 実験2: Auto Scaling Group に属するインスタンスを停止してみる

- 障害を想定して、Auto Scaling グループに属するインスタンスを停止してみる
  - Auto Scaling の機能により、新たなインスタンスを起動し、ヘルスチェックに失敗したインスタンスを削除する動きとなる
  - デフォルトである EC2 に対するヘルスチェック内容は[このドキュメント](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html)に記載してある
- 下記は desired size が 2 で立ち上がっているインスタンスが 2 つのときに片系を停止したときのログです
  - 片方を殺すと新たに1つ立ち上がって、desired の 2 インスタンスを保とうとする

```
成功
Launching a new EC2 instance: i-..........
2018 April 8 14:53:49 UTC+9
2018 April 8 14:54:23 UTC+9
説明:Launching a new EC2 instance: i-..........
原因:At 2018-04-08T05:53:47Z an instance was started in response to a difference between desired and actual capacity, increasing the capacity from 1 to 2.
```


### 実験3: Auto Scaling Group に属するインスタンスの Apache を停止してみる

- 多くの場合、Auto Scaling Group を Application Load Balancer の Target Group として構成する
- 実験2 で設定した Auto Scaling Group の ヘルスチェックタイプ は EC2 の基本的な稼働状況をチェックするものであり、例えば httpd が落ちていてもヘルスチェックは通る
- ヘルスチェックタイプを ELB と指定することにより ELB のヘルスチェックに落ちたインスタンスを Unhealthy とみなしてくれる
  - ALB に設定したヘルスチェックはWebサーバーであればたいてい 80 や 443 ポートを監視するものなので、アプリケーションの動作ベースでのヘルスチェックができる

> 参考資料: [EC2 vs. ELB Health Check on an Auto Scaling Group](https://kylewbanks.com/blog/ec2-vs-elb-health-check-on-an-auto-scaling-group)


```
- 成功
Terminating EC2 instance: i-........
2018 April 8 14:39:24 UTC+9
2018 April 8 14:45:09 UTC+9
説明:Terminating EC2 instance: i-........
原因:At 2018-04-08T05:39:24Z an instance was taken out of service in response to a ELB system health check failure.

- 成功
Launching a new EC2 instance: i-........
2018 April 8 14:39:58 UTC+9
2018 April 8 14:40:31 UTC+9
説明:Launching a new EC2 instance: i-........
原因:At 2018-04-08T05:39:55Z an instance was started in response to a difference between desired and actual capacity, increasing the capacity from 1 to 2.
```


### 実験4: Load Average 上昇時にスケールアウトさせる

- スケーリングポリシーに CPU 使用率によるスケールアウトルールを追加したのち、インスタンスに負荷をかけてみる
  - `yes >> /dev/null &` で CPU をガシガシ使うとスケールアウトしてくれて楽しい
  - `yes` を `kill` して放置しておくとスケールインしてくれる様子が観察できる。
- スケーリングポリシータイプは以下の三種類 [#](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scale-based-on-demand.html#as-scaling-types)
  - Target tracking scaling
  - Step scaling
  - Simple scaling—Increase or decrease the current capacity of the group based on a single scaling adjustment.

```
- 成功
Launching a new EC2 instance: i-......
2018 April 8 17:38:12 UTC+9
2018 April 8 17:43:45 UTC+9
説明:Launching a new EC2 instance: i-......
原因:At 2018-04-08T08:37:37Z a monitor alarm TargetTracking-autoscaling-tutorial-group-AlarmHigh-284de7cd-eac1-4e75-a633-a2564cbdd6af in state ALARM triggered policy ScaleGroupSize changing the desired capacity from 2 to 3. At 2018-04-08T08:38:10Z an instance was star

- 成功
Launching a new EC2 instance: i-......
2018 April 8 17:46:57 UTC+9
2018 April 8 17:52:29 UTC+9
説明:Launching a new EC2 instance: i-......
原因:At 2018-04-06T08:46:37Z a monitor alarm TargetTracking-autoscaling-tutorial-group-AlarmHigh-284de7cd-eac1-4e75-a633-a2564cbdd6af in state ALARM triggered policy ScaleGroupSize changing the desired capacity from 3 to 4. At 2018-04-08T08:46:55Z an instance was started in response to a difference between desired and actual capacity, increasing the capacity from 3 to 4.

- 成功
Terminating EC2 instance: i-......
2018 April 8 18:05:54 UTC+9
2018 April 8 18:06:58 UTC+9
説明:Terminating EC2 instance: i-......
原因:At 2018-04-08T09:05:25Z a monitor alarm TargetTracking-autoscaling-tutorial-group-AlarmLow-a1ff97f7-3f2e-477f-aae3-f23b558d5c6a in state ALARM triggered policy ScaleGroupSize changing the desired capacity from 4 to 3. At 2018-04-06T09:05:54Z an instance was taken out of service in response to a difference between desired and actual capacity, shrinking the capacity from 4 to 3. At 2018-04-08T09:05:54Z instance i-......... was selected for termination.

- 成功
Terminating EC2 instance: i-......
2018 April 8 18:06:25 UTC+9
2018 April 8 18:07:09 UTC+9
説明:Terminating EC2 instance: i-......
原因:At 2018-04-08T09:06:24Z a monitor alarm TargetTracking-autoscaling-tutorial-group-AlarmLow-58c580d7-6a4b-44c0-805d-1c2b23f0580c in state ALARM triggered policy ScaleGroupSize changing the desired capacity from 3 to 2. At 2018-04-06T09:06:25Z an instance was taken out of service in response to a difference between desired and actual capacity, shrinking the capacity from 3 to 2. At 2018-04-08T09:06:25Z instance i-......... was selected for termination.
```

ちなみに Auto Scaling 設定値の各種上限は以下のような感じ [#](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-account-limits.html)

- Regional Limits
  - Launch configurations per region: 200
  - Auto Scaling groups per region: 200
- Auto Scaling Group Limits
  - Scaling policies per Auto Scaling group: 50
  - Scheduled actions per Auto Scaling group: 125
  - Lifecycle hooks per Auto Scaling group: 50
  - SNS topics per Auto Scaling group: 10
  - Classic Load Balancers per Auto Scaling group: 50
  - Target groups per Auto Scaling group: 50
- Scaling Policy Limits
  - Step adjustments per scaling policy: 20


## ELB + EC2 Auto Scaling のふるまいメモ
### ログへの IP アドレス出力

- ALB を利用しているときの各インスタンス配下の Apache の実際のアクセスログ一例は以下のようなもの
  - IP は ALB のものが出力される
  - リクエストヘッダに RealIP が入っているのでアクセスログを良き感じに調整する必要がある [#](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/x-forwarded-headers.html#x-forwarded-headers)
  - [remote_addrとかx-forwarded-forとかx-real-ipとか](http://christina04.hatenablog.com/entry/2016/10/25/190000)

  ```
  [maintainer@gomi-web01 ~]$ curl checkip.amazonaws.com
  160.16.144.83
  [maintainer@gomi-web01 ~]$ curl elb-autoscaling-example-1773061858.ap-northeast-1.elb.amazonaws.com -I
  HTTP/1.1 200 OK
  Date: Sun, 08 Apr 2018 06:31:13 GMT
  Content-Type: text/html; charset=UTF-8
  Content-Length: 166
  Connection: keep-alive
  Server: Apache/2.2.34 (Amazon)
  Last-Modified: Thu, 05 Apr 2018 02:32:11 GMT
  ETag: "605df-a6-56910bf30abcd"
  Accept-Ranges: bytes

  # 出力されたログ
  172.31.33.34 - - [08/Apr/2018:06:31:13 +0000] "HEAD / HTTP/1.1" 200 - "-" "curl/7.29.0"
  ```

- ALB 自体のアクセスログも出力可能だが、追加で設定は必要 [#](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-access-logs.html#load-balancer-access-logs)
- 時刻は +0000 で出力されている
  - `sudo yum install httpd` で入れてなんの設定もしてない状態
  - お好みに合わせて良き感じにする
- ELB のヘルスチェックログがたくさん出力されるので邪魔だったら適宜フィルタする
