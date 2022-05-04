---
title: ELB の負荷分散の基本的なしくみ
category: programming
date: 2018-04-15 20:59:18
tags: [AWS, ELB]
pinned: false
---

AWS 公式のドキュメントに ELB の簡単な仕組みが載っていたので、自分向けにまとめました。正確な情報はドキュメントを参照してください。基本的には ALB についてのことをまとめていきます。

> 情報ソース: [Elastic Load Balancing の詳細](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html)

- ELB でロードバランサーを作成すると、ターゲットとして指定した AZ へのロードバランサーノードを作成が行われる
- ユーザーからのリクエストはまず DNS ラウンドロビンにより、各ロードバランサーノードに分散される（TTL は 60s）
- 実際に `dig` ってみれば、これがわかる
  - 以下は tokyo-1a, 1c のサブネットに ALB をアタッチしたときの Answer
  - DNS キャッシュなども当然影響してくるので頭の片隅にいれておいたほうがいい

```
$ dig elb-******.ap-northeast-1.elb.amazonaws.com

; <<>> DiG 9.8.3-P1 <<>> elb-******.ap-northeast-1.elb.amazonaws.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14455
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 4, ADDITIONAL: 4

;; QUESTION SECTION:
;elb-******.ap-northeast-1.elb.amazonaws.com. IN A

;; ANSWER SECTION:
elb-******.ap-northeast-1.elb.amazonaws.com. 18 IN A 52.192.165.14
elb-******.ap-northeast-1.elb.amazonaws.com. 18 IN A 54.92.112.188

# 中略

;; Query time: 28 msec
;; SERVER: 10.4.4.10#53(10.4.4.10)
;; WHEN: Sun Apr 15 14:52:44 2018
;; MSG SIZE  rcvd: 297
```

- ユーザーは、ロードバランサーのドメインネームから各 AZ に配置されているロードバランサーノードの IP アドレスへと名前解決し、リクエストを送る
- ロードバランサーノードは各 AZ 内の Healthy な EC2 インスタンスへとリクエストを分散させる

## クロスゾーン負荷分散

> 情報ソース: [クロスゾーン負荷分散](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html#cross-zone-load-balancing)

- クロスゾーン負荷分散が有効になっているとき、各ロードバランサーノードはすべての AZ の有効なインスタンスにリクエストを分散する
  - したがって、万が一ある AZ 内に有効なインスタンスが存在しなくなっても、その AZ のロードバランサーノードは、クロスゾーンの有効なインスタンスへリクエストが転送する
- これによりクライアントの DNS キャッシュが効いていてもバックエンドのインスタンスには適切に負荷分散がかけられる
- また、各 AZ のインスタンス数を均等に保つ必要は薄れる
  - しかし、可用性向上のため、なるべく均等に保ったほうが良い
- Application Load Balancer では常にクロスゾーン負荷分散が有効になっている

## スティッキーセッション

> 情報ソース: [スティッキーセッション](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-target-groups.html#sticky-sessions)

- Classic Load Balancer, Application Load Balancer ともに利用できる
- クッキーを発行してレスポンスを返し、次回以降それをみて ELB は同一インスタンスへリクエストをさばくようにする仕組み
- Application Load Balancer の場合、ターゲットグループの属性から設定可能で、時間ベースのセッション方式しか選択できない
  - `AWSALB` という名前のクッキーが発行される
- Classic Load Balancer の場合は、時間ベースとアプリケーションベースのセッション方式を選択できる

## LB からの切り離し

> 情報ソース: [登録解除の遅延](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-target-groups.html#deregistration-delay)

- 一般の LB にあるような、ある特定のインスタンスをメンテナンスに入れるときに既存のコネクションは切らないが新規のコネクションを流さないようにする機能が ELB にもある
- ALB の場合、Auto Scaling グループのインスタンス一覧から対象インスタンスを選択し、スタンバイに移行させると良い
  - 登録解除への遅延時間（draining）の設定はターゲットグループのほうにあるので注意が必要

## 参考資料

- [Elastic Load Balancing の詳細](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html)
- [elb-configuration-guide](https://dev.classmethod.jp/cloud/elb-configuration-guide-1/)
- [[AWS マイスターシリーズ]Amazon Elastic Load Balancing (ELB)](https://www.slideshare.net/AmazonWebServicesJapan/20130612-aws-meisterregenerateelbpublic)
- [Amazon Elastic Load Balancing (ELB)の内部構造および拡張・障害時の動き](http://blog.takuros.net/entry/20140211/1392112668)
- [AWS Black Belt Online Seminar 2016 Elastic Load Balancing](https://www.slideshare.net/AmazonWebServicesJapan/aws-black-belt-online-seminar-2016-elastic-load-balancing?next_slideshow=1)
