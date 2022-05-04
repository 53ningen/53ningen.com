---
title: Chrome のアドレスバーを利用して手軽に AWS マネジメントコンソールにアクセスする
category: programming
date: 2018-04-29 00:02:39
tags: [AWS, Route53, S3, CloudFront, Chrome]
pinned: false
---

AWS のいろいろなリソースを触っているときに、マネジメントコンソールのトップページから各ページに潜っていくのはかなり面倒です。個人的には Chrome のアドレスバーに ec2 と入力したら、EC2 の画面へ飛んだり、sg と入力したらセキュリティグループのページに飛んでくれると便利だなと思ってたりする今日この頃ですが、みなさんいかがでしょうか（もしかして自分が無知なだけでみんな良いソリューションを知っていたり...？ 知ってたらコメ欄とかブコメで教えてください、一度アクセスすれば、アドレスバーの履歴には残るんですが、利用状況によって表示順が違ったりしてだるいので、この手順で入力したらそのページに飛べる！みたいなヤツが欲しいという需要です）。

この記事は、Amazon S3 の静的サイトホスティングのリダイレクトルールという機能と Chrome の検索エンジン設定を使って、良い感じにこれを実現してみた記録です。やり方など、どうでも良いのでその機能使わせろという方は以下に 1 分で終わる手順を用意してありますので、ご利用ください。

設定がおわると、たとえば EC2 のマネジメントコンソールに飛びたいときは、アドレスバーに aws + [tab] + ec2 + [Enter] と入力すれば、飛べるようになります。まぁ！便利...(?)

## 検索窓便利化のための Chrome カスタム検索エンジン追加設定

- 以下の手順は大体 1 分で終わります
- **注意**
  - **AWS マネジメントコンソール側のパス等が変われば当然使えなくなります**
  - **利用上何か問題が生じても一切の責任を負いかねます**

(1) Chrome のアドレスバー上で右クリック、「検索エンジンの編集」をクリック

![](https://static.53ningen.com/wp-content/uploads/2018/04/29000041/red01.png)

(2) その他の検索エンジンの右側にある「追加」をクリック

![](https://static.53ningen.com/wp-content/uploads/2018/04/29000044/red02.png)

(3) 検索エンジンの追加で以下のような感じで入力

![](https://static.53ningen.com/wp-content/uploads/2018/04/29000047/red03.png)

```
キーワード: aws
URL: https://redirect.53ningen.com/aws/%s
```

(4) `aws` + [tab] + `ec2` + エンターで EC2 マネジメントコンソールに飛べます

![](https://static.53ningen.com/wp-content/uploads/2018/04/29000049/red04.png)

## S3 でリダイレクタを作成する

さてさて、裏側がどうなっているかだけ軽く説明しておきます。基本的には S3 の Static Web Hosting 機能のリダイレクトルールを利用しています。

1. `redirect.53ningen.com` という名前で S3 バケットを作成します

- Static Web Hosting をオンにします

2. Static Web Hosting のリダイレクトルールに下記のような XML を突っ込みます

- いろんなサービスのエイリアス設定するとめっちゃ長いので、ひとまず EC2 トップとセキュリティグループと AMI 画面へのリダイレクト設定を入れてます
- 記事の最後にそこそこの量の設定を置いておきます

3. Static Web Hosting しているエンドポイントにアクセスして動作確認します

- http://redirect.53ningen.com.s3-website-ap-southeast-1.amazonaws.com/aws/elb などにアクセスして、マネジメントコンソール ELB 画面にちゃんとリダイレクトされるかを確認する

```xml
<RoutingRules>
    <!-- EC2 -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/ec2</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/sg</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#SecurityGroups:sort=groupId</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/ami</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#Images:sort=name</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/elb</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#LoadBalancers:sort=loadBalancerName</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- 以下、一旦略（めっちゃ長いので文末に設定してあるものを載せてあります） -->
</RoutingRules>
```

## Chrome の検索エンジン設定と連携させる

以下の設定をやれば、例えば Chrome のアドレスバーに `aws` + [tab] + `ec2` + [Enter] などと打つと EC2 マネジメントコンソールに飛んでくれるようになります

- Chrome の [設定] - [検索エンジンの管理] より追加をクリック
- キーワードに `aws`、URL に `https://redirect.53ningen.com/aws/%s` を指定し追加をする
  - aws と打つのが面倒であれば、キーワードを `a` などにすると `a` + [tab] + `ec2` + [Enter] の 6 タイプの入力で対象の画面に飛べます

## 実際に入れた設定

- 実際に手元では `redirect.53ningen.com` というドメインで動かしています
- このドメインには HSTS と preload の設定を入れてしまっているため、HTTPS 必須です
- ACM で発行した証明書を CloudFront に設定し、HTTPS 化します
  - CloudFront の設定をする際に、対応するバケットを選択するのではなく、Static Web Hosting をしている FQDN を指定しないと、うまくリダイレクトルールが機能しない天に注意してください
- Route 53 に redirect.53ningen.com が CloudFront を向くようにレコードを追加します
- 最終的に redirect.53ningen.com に入れているリダイレクトルール設定は以下のようなものです
  - AWS のサービスがめちゃめちゃ多いので、漏れているものが死ぬほどある
  - [随時追加していきます（YAML から自動生成してる）](https://github.com/53ningen/aws-redirect-rules-gen)
    - 現在 EC2/VPC/S3/RDS/CloudFront/IAM/Route 53 あたりをいれてる

```xml
<RoutingRules>
    <!-- EC2 -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/ec2</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/sg</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#SecurityGroups:sort=groupId</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/ami</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#Images:sort=name</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/eip</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#Addresses:sort=PublicIp</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/elb</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ec2/v2/home#LoadBalancers:sort=loadBalancerName</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- VPC -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/vpc</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>vpc/home#vpcs:</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/subnet</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>vpc/home#subnets:</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/routet</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>vpc/home#routetables:?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/igw</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>vpc/home#igws:</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- S3 -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/s3</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>s3/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- CloudFront -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/cf</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>cloudfront/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- RDS -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/rds</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>rds/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- IAM -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/iam</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>iam/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- SNS -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/sns</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>sns/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- SQS -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/sqs</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>sqs/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- SES -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/ses</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ses/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- Lambda -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/lambda</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>lambda/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- ElastiCache -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/elasti</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>elasticache/home?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- DynamoDB -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/dynamo</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>dynamodb/home?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- API Gateway -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/api</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>apigateway/home?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- ElasticSearch Service -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/es</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>es/home?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- ECS -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/ecs</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>ecs/home?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- Elastic Beanstalk -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/eb</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>elasticbeanstalk/home?</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>

    <!-- Route 53 -->
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals>aws/r53</KeyPrefixEquals>
        </Condition>
        <Redirect>
          <HostName>console.aws.amazon.com</HostName>
          <ReplaceKeyPrefixWith>route53/home</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
</RoutingRules>
```

[amazon template=wishlist&asin=4797392568]
