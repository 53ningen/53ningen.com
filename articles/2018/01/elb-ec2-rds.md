---
title: ELB + EC2 + RDS でふつうのアプリケーションを構成する
category: programming
date: 2018-01-10 00:06:46
tags: [AWS, EC2, ELB, RDS]
pinned: false
---

- VPC とサブネットを切り、その上に ELB, EC2, RDS を配置する、いたって普通のアプリケーションを構成する手順を自分向けにまとめておく
- だいたいざっくりとはわかってるけどたまにやるとアレっとなったりする

## 構成するものの全体像

- public subnet に ELB、private subnet に EC2, RDS を配置する
- EC2, RDS ともに Multi AZ 配置として、耐障害性、可用性を高める

## VPC の構成

- 10.1.0.0/16 を AWS 用のアドレス帯として確保していると仮定して VPC を用意する
  - DNS ホスト名を有効する [#](https://docs.aws.amazon.com/ja_jp/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-support)
- サブネットはひとまず以下のように切る
  - あくまでざっくりと流れを説明するために適当に切ってるので、用途に合わせ適当にサイズを変える

|     role      | subnet  |       AZ        | Visibility |
| :-----------: | :-----: | :-------------: | :--------: |
|  10.1.1.0/24  |   EC2   | ap-northeast-1a |  private   |
|  10.1.2.0/24  |   EC2   | ap-northeast-1c |  private   |
|  10.1.8.0/25  |   ELB   | ap-northeast-1a |   public   |
| 10.1.8.128/25 |   ELB   | ap-northeast-1c |   public   |
| 10.1.10.0/25  |   NAT   | ap-northeast-1a |   public   |
| 10.1.11.0/25  | Bastion | ap-northeast-1c |   public   |
| 10.1.16.0/24  |   RDS   | ap-northeast-1a |  private   |
| 10.1.17.0/24  |   RDS   | ap-northeast-1c |  private   |

### NAT ゲートウェイと踏み台サーバーの作成

- 上記で作成した NAT 用サブネットに、NAT ゲートウェイを作成する
- 同じく踏み台サーバーも作っておく

### ルートテーブルの作成と関連付け

- internet gateway を作成し、VPC にアタッチしておく
- private subnet, public subnet それぞれに向けたものをつくる
  - public subnet 向けルートテーブルには宛先 0.0.0.0/0 パケットを igw に送るルールを追加しておく
  - private subnet 向けルートテーブルには宛先 0.0.0.0/0 パケットを NAT インスタンスに送るルールを追加しておく
- private subnet 向けのものをメインテーブルに設定しておくと事故りにくい
  - 明示的な関連付けをしていないサブネットはメインテーブルが関連付けられるため
- ルートテーブルは上記の表に対応するようにサブネットへ明示的に紐付けをしておく

## ELB と EC2 の配置

- Application Load Balancer を作成
- キーペアの登録をしておく
- AMI や起動設定を作成しておき、Auto Scaling グループを作成する
  - 上記の表どおりのサブネットを選択する
  - Auto Scaling グループのヘルスチェックタイプは ELB にしておく
- ELB のターゲットグループに Auto Scaling グループを指定

## RDS の配置

- DB Subnet Group を作成する
  - VPC は今回作ったものを指定し、Subnet として上記の表どおり、`10.1.16.0/24` と `10.1.17.0/24` を追加する
- セキュリティグループの作成
  - RDS 向けに VPC 内から inbound TCP 3306 を allow するものをつくる
- インスタンスの起動
  - Multi-AZ を指定
  - これまで同様の VPC と先ほど作った Subnet Group を指定する
