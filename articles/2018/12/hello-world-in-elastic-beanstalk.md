---
title: Hello, World! in Elastic Beanstalk
category: programming
date: 2018-12-12 02:41:47
tags: [ElasticBeanstalk]
pinned: false
---

検証などでサクッと環境を立ち上げたいときに Elastic Beanstalk を使って Hello, World! を表示するウェブアプリケーションをデプロイするまでのスムーズな流れを書いておきます。

## 1. 基本的な操作

### ⬇️ EB CLI のインストール

参考: [macOS で EB CLI をインストールします。 - AWS Elastic Beanstalk](https://docs.aws.amazon.com/ja_jp/elasticbeanstalk/latest/dg/eb-cli3-install-osx.html)

for macOS, RHEL

```
$ pip3 install awsebcli --upgrade --user
$ eb --version
EB CLI 3.14.7 (Python 3.7.0)
$ eb init --region ap-northeast-1
Do you wish to continue with CodeCommit? (y/N) (default is n): n
```

### ?デプロイする内容を準備

`eb init` コマンドでお手軽に準備できます。
申し訳程度の PHP 要素を含んだ index.html ファイルを作成し、動作検証までやっておきます。

```
$ mkdir HelloWorld
$ cd HelloWorld/
$ eb init -p PHP
Application HelloWorld has been created.
$ echo "Hello, <?php echo 'W' ?>orld!" > index.php
$ php index.php
Hello, World!
$ git init
$ git add . && git commit -m "initial commit"
```

### ?リソース作成とデプロイ

初回は環境を作成する必要があります

```
$ eb create hello-dev01 --vpc
Creating application version archive "app-?".
...
2018-XX-XX XX:XX:XX    INFO    Successfully launched environment: hello-dev01

$ eb use hello-dev01
$ eb open
```

ファイルを更新してデプロイするときは

```
$ echo "Hello, <?php echo 'W' ?>orld!!" > index.php
$ php index.php
Hello, World!!
$ git add . && git commit -m "update index.php"
$ eb deploy
```

### ?リソースのクローン

以下のコマンドで簡単に複製できます

```
$ eb clone -n hello-dev02
...
```

### ?破壊

ワンコマンドで破壊できます?

```
$ eb terminate hello-dev02
The environment "hello-dev02" and all associated instances will be terminated.
To confirm, type the environment name: hello-dev02
...
```

## 2. CLB ではなく ALB を使う

これまでの手順にしたがうと EC2 の前段に CLB が設置されます。ALB を利用するよう変更し、ついでに ACM で発行した証明書を利用して HTTPS リクエストのみを受け付けるように設定しておきます。

参考: [Application Load Balancer を設定する](https://docs.aws.amazon.com/ja_jp/elasticbeanstalk/latest/dg/environments-cfg-alb.html#environments-cfg-alb-namespaces)

### ? コマンドラインオプションを使う方法

`--elb-type application` オプションで ALB が指定できます。非常に便利です。

```
$ eb create hello-dev01 --vpc --elb-type application
```

### ? .ebextensions に記述する方法

きちっとリポジトリ内で LB の構成も管理すると思うので現実的には .ebextensions を使います。

```
$ mkdir .ebextensions
$ vi .ebextensions/application-load-balancer.config
...

$ cat .ebextensions/application-load-balancer.config
option_settings:
  aws:elasticbeanstalk:environment:
    LoadBalancerType: application

$ git add . && git commit -m "Use ALB"
$ eb create hello-dev03
```

## 3. ALB と証明書の設定

2. の段階だと HTTP 80 ポートのリスナーでリクエストを受け付ける形になります。HTTP 443 リスナーを作成するためには以下のように .ebextensions/application-load-balancer.config を変更すれば OK。

```
$ cat .ebextensions/alb-secure-listener.config
option_settings:
  aws:elbv2:listener:443:
    Protocol: HTTPS
    SSLCertificateArns: arn:aws:acm:us-east-1:?:certificate/?
```
