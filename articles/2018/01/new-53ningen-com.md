---
title: 53ningen.com 大改修
category: programming
date: 2018-01-03 07:02:35
tags: [AWS, Route53, nginx]
pinned: false
---

学生時代に適当に構築してツギハギだらけになっていた 53ningen.com が動いているサーバー gomi-old01 を良き形にしつつ gomi-web01 に移転した作業ログです。基本的にただ Wordpress が動いていたサーバーを Ansible 化して、お引越ししたというだけの内容ではあります。やったことは具体的にはつぎのようなものです。

1. DNS サーバーの Route 53 移行
2. ドメインの Route 53 移管
3. 稼働しているサーバーの Ansible 化
4. データベースの引越し
5. Wordpress アプリケーションの引越し
6. 新サーバーへ DNS 切り替え

また次のものは新規で導入しました

- L7 レイヤーでのヘルスチェック導入
- 障害発生時に DNS フェイルオーバーでエラー画面を表示

- サーバーログの S3 への送出
- elasticsearch, kibana
- zabbix による監視, Slack 通知

# 1. DNS サーバーの Route 53 移行

ドメインも Route 53 に移管しますが、その際に元のレジストラ（ムームードメイン）が提供するネームサーバーからドメインが削除されてしまうので、前もって DNS を Route 53 に切り替えておきます。

## 1.1. ホストゾーン(Hosted Zone)の作成

公式ドキュメント: [既存ドメインの DNS サービスを Amazon Route 53 に移行する](http://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/MigratingDNS.html)

ホストゾーンとはドメインに紐づくリソースレコードのセットです。おおよそゾーンファイルと対応していると考えて良いと思います。実際にゾーンファイルを取り込むこともできるようです（公式ドキュメント: [ゾーンファイルをインポートしてリソースレコードセットを作成する](http://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/resource-record-sets-creating-import.html)）。

ホストゾーンには、パブリックなものと VPC 向けのプライベートなものがあります。マネジメントコンソールからドメイン名を入力すれば作成が完了しますが、今回はこのリソースを `terraform` で管理します。

```
resource "aws_route53_zone" "main" {
   name = "53ningen.com"
}
```

`terraform plan` は以下のとおり

```
An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  + aws_route53_zone.main
      id:             <computed>
      comment:        "Managed by Terraform"
      force_destroy:  "false"
      name:           "53ningen.com"
      name_servers.#: <computed>
      vpc_region:     <computed>
      zone_id:        <computed>


Plan: 1 to add, 0 to change, 0 to destroy.
```

`terraform apply` してホストゾーンを作成すると `SOA レコード` と `NS レコード` も自動的に作成されます。今回はドメイン名と IP アドレスを紐づけるために `A レコード` の追加が必要になります。そのため、その記述を追加します。メールサーバーの移行が必要であれば `MX レコード`、サブドメインなどの運用をやっているのであれば `CNAME レコード` など適当な感じに必要なものも移行しておきましょう。ひとまず今回は `A レコード` のみを作ります（Route 53 が対応している DNS リソースは [サポートされる DNS リソースレコードタイプ](http://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/ResourceRecordTypes.html) を参照）。`terraform apply` を実行するとレコードが作成されます。

```
An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  + aws_route53_record.www
      id:                 <computed>
      fqdn:               <computed>
      name:               "53ningen.com"
      records.#:          "1"
      records.2910563735: "******************"
      ttl:                "300"
      type:               "A"
      zone_id:            "******************"
```

## 1.2. DNS の変更

マネジメントコンソールの NS レコード欄の DNS サーバーを、ムームードメインのコントロールパネルで指定します。反映が有効になるまで少し(TTL 分)時間がかかるため、少し待って `dig` で確認すると良いとおもいます。

```
% dig 53ningen.com +trace

; <<>> DiG 9.8.3-P1 <<>> 53ningen.com +trace
;; global options: +cmd
. 171428 IN NS b.root-servers.net.
. 171428 IN NS c.root-servers.net.
. 171428 IN NS d.root-servers.net.
. 171428 IN NS e.root-servers.net.
. 171428 IN NS f.root-servers.net.
. 171428 IN NS g.root-servers.net.
. 171428 IN NS h.root-servers.net.
. 171428 IN NS i.root-servers.net.
. 171428 IN NS j.root-servers.net.
. 171428 IN NS k.root-servers.net.
. 171428 IN NS l.root-servers.net.
. 171428 IN NS m.root-servers.net.
. 171428 IN NS a.root-servers.net.
;; Received 508 bytes from 192.168.1.1#53(192.168.1.1) in 75 ms

com. 172800 IN NS d.gtld-servers.net.
com. 172800 IN NS l.gtld-servers.net.
com. 172800 IN NS a.gtld-servers.net.
com. 172800 IN NS g.gtld-servers.net.
com. 172800 IN NS b.gtld-servers.net.
com. 172800 IN NS f.gtld-servers.net.
com. 172800 IN NS c.gtld-servers.net.
com. 172800 IN NS h.gtld-servers.net.
com. 172800 IN NS j.gtld-servers.net.
com. 172800 IN NS e.gtld-servers.net.
com. 172800 IN NS i.gtld-servers.net.
com. 172800 IN NS k.gtld-servers.net.
com. 172800 IN NS m.gtld-servers.net.
;; Received 506 bytes from 2001:500:2::c#53(2001:500:2::c) in 179 ms

53ningen.com. 172800 IN NS ns-1431.awsdns-50.org.
53ningen.com. 172800 IN NS ns-771.awsdns-32.net.
53ningen.com. 172800 IN NS ns-2010.awsdns-59.co.uk.
53ningen.com. 172800 IN NS ns-393.awsdns-49.com.
;; Received 199 bytes from 192.43.172.30#53(192.43.172.30) in 258 ms

53ningen.com. 300 IN A 153.126.136.244
53ningen.com. 172800 IN NS ns-1431.awsdns-50.org.
53ningen.com. 172800 IN NS ns-2010.awsdns-59.co.uk.
53ningen.com. 172800 IN NS ns-393.awsdns-49.com.
53ningen.com. 172800 IN NS ns-771.awsdns-32.net.
;; Received 183 bytes from 2600:9000:5301:8900::1#53(2600:9000:5301:8900::1) in 112 ms
```

## 1.3. コストの計算

公式ドキュメント: [料金](https://aws.amazon.com/jp/route53/pricing/)

お仕事ならこの計算作業する前にやるべきですが、個人のお遊びサーバーなので作業後に計算しました。

- ホストゾーン
- 0.50 USD（ホストゾーンごと）/月 – 最初の 25 のホストゾーン
- 0.10 USD（ホストゾーンごと）/月 – それ以上のホストゾーン
- 標準的クエリ
- 0.400 USD（100 万クエリごと） – 最初の 10 億クエリ/月
- 0.200 USD（100 万クエリごと） – 10 億クエリ以上/月

おおよそ 1 ホストゾーン + 最初の 10 億クエリ = 0.50 + 0.40 = 0.90 USD

## 1.4. ヘルスチェックの設定 （Optional）

公式ドキュメント: [Amazon Route 53 ヘルスチェックの作成と DNS フェイルオーバーの設定](http://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/dns-failover.html)

ヘルスチェック（L7）と DNS フェイルオーバーが利用できます。ヘルスチェックで障害を検知した場合に Cloudwatch Alarm と連携をさせたり、DNS フェイルオーバーを利用して待機系に参照を向けたりすることが可能です。

ひとまずベーシックなウェブサーバーのヘルスチェックは以下のように設定できます。その他諸々 terraform を利用する際にオプション記述については terraform 公式ドキュメント: [aws_route53_health_check](https://www.terraform.io/docs/providers/aws/r/route53_health_check.html) を参照してください。

```
resource "aws_route53_health_check" "www" {
  reference_name    = "www"
  ip_address        = "153.126.136.244"
  port              = 80
  type              = "HTTP"
  resource_path     = "/"
  failure_threshold = "3"
  request_interval  = "30"
  measure_latency   = true

  tags = {
    Name = "www"
  }
}
```

ヘルスチェックに関しては、

- AWS エンドポイント
  - ヘルスチェック 1 件につき 0.50 USD\*/月
  - オプション機能 1 件につき 1.00 USD/月
- AWS 以外のエンドポイント:
  - ヘルスチェック 1 件につき 0.75 USD\*/月
  - オプション機能 1 件につき 2.00 USD/月
- 任意のヘルスチェック機能は以下の通りです。
  - HTTPS
  - 文字列マッチング
  - 短インターバル
  - レイテンシー計測

となっています。

> 「AWS エンドポイント」とは、AWS の中で稼働するリソース（たとえば Amazon EC2 インスタンス）のうち、ヘルスチェックと同じ AWS アカウントの中でプロビジョニングされるか、ヘルスチェックと同じアカウントが請求先となっているものを指します。計算済みヘルスチェックとメトリクスベースのヘルスチェックは AWS エンドポイントのヘルスチェックとして請求されます。Elastic Load Balancing のリソースまたは Amazon S3 ウェブサイトバケットがエンドポイントであるヘルスチェックについては、お客様への請求は発生しません。Elastic Load Balancing のリソースおよび Amazon S3 ウェブサイトバケットをエンドポイントとするヘルスチェックについては、AWS によって自動的にプロビジョニングされ、Amazon Route 53 の一部として追加料金なしでご利用いただけます。

## 1.5 DNS フェイルオーバーの設定 （Optional）

公式ドキュメント: [DNS フェイルオーバーの設定](http://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/dns-failover-configuring.html)
terraform 公式ドキュメント: [aws_route53_record](https://www.terraform.io/docs/providers/aws/r/route53_record.html)

ヘルスチェックを入れたついでに、障害発生時に S3 の静的ホスティング機能 + Cloudfront によるメンテナンスページのほうへ参照を向けるような DNS フェイルオーバー設定を入れてみます。DNS フェイルオーバー設定については無料で利用することができます。最終的な構成図は以下のような形になります。

<img src="http://53ningen.com/wp-content/uploads/2017/10/84152405-7027-da1c-baba-5555cb558439-1024x916.png" alt="" width="640" height="573" class="aligncenter size-large wp-image-1069" />
　
　ディザスタリカバリを想定した構成として、ap-northeast-1 リージョンで稼働させるアプリケーションサーバーに対して、メンテナンスページを静的ホスティングする際の S3 リージョンは地理・物理的に違う系統の適当なリージョンを選択します。今回は us-east-1 を選択しました。

S3 の前段に置いた Cloudfront は主に S3 からの配信をキャッシュする役割と、メンテナンスを表すステータスコード 503 でリソースを返す役割を持っています。S3 バケットの作成とファイルの配置、静的ホスティング機能の有効化および Cloudfront の設定は以下のように terraform で記述することができます。

terraform 公式ドキュメント: [aws_s3_bucket](https://www.terraform.io/docs/providers/aws/r/s3_bucket.html)
terraform 公式ドキュメント: [aws_cloudfront_distribution](https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html)

```
provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

resource "aws_s3_bucket" "error" {
  provider = "aws.us-east-1"
  bucket   = "error.53ningen.com"
  acl      = "public-read"
  policy   = "${file("./policies/error.53ningen.com_s3_policy.json")}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_bucket_object" "error_html" {
  provider     = "aws.us-east-1"
  bucket       = "${aws_s3_bucket.error.bucket}"
  content_type = "text/html"
  key          = "error.html"
  source       = "./resources/error.html"
  etag         = "${md5(file("./resources/error.html"))}"
}

resource "aws_cloudfront_distribution" "error_s3_distribution" {
  origin {
    domain_name = "${aws_s3_bucket.error.bucket_domain_name}"
    origin_id   = "S3-error.53ningen.com"
  }

  custom_error_response {
    error_code            = "404"
    response_code         = "503"
    response_page_path    = "/error.html"
    error_caching_min_ttl = "300"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-error.53ningen.com"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags {
    Environment = "production"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

`resources/error` には、適当なメンテナンス表示 html ファイルを、 `policies/maintenance.53ningen.com_s3_policy.json` には以下のようにバケットのファイルの読み取りを許可するポリシーを配置します。

```
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"PublicReadForGetBucketObjects",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::error.53ningen.com/*"]
    }
  ]
}
```

つづいて Route 53 ホストゾーンにフェイルオーバーの設定をします。通常時は既存の A レコードが有効になるようにしつつ、ヘルスチェックに失敗した場合にメンテナンスページを静的にホスティングしている S3 のほうに参照を向けるような設定を入れます。また ttl を最初の設定より短く 60 秒に変更します。 terraform を用いて次のように記述できます。

```
resource "aws_route53_record" "www" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "53ningen.com"
  type    = "A"
  ttl     = "60"
  records = ["153.126.136.244"]

  health_check_id = "${aws_route53_health_check.www.id}"
  set_identifier  = "www"

  failover_routing_policy {
    type = "PRIMARY"
  }
}

resource "aws_route53_record" "www-error" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "53ningen.com"
  type    = "A"

  alias = {
    name = "${aws_cloudfront_distribution.error_s3_distribution.domain_name}"

    # cloudfront hosted_zone_id
    zone_id                = "Z2FDTNDATAQYW2"
    evaluate_target_health = false
  }

  set_identifier = "www-secondary"

  failover_routing_policy {
    type = "SECONDARY"
  }
}
```

最後に動作確認として、動いているウェブサーバーを停止し、きちんとメンテナンス表示に切り替わるか確認します。またウェブサーバーを起動したときに、ヘルスチェックが通るようになり、きちんとアプリケーションサーバーに参照が戻るかも合わせてチェックしておきましょう。

# 2. ドメインの Route 53 移管

公式ドキュメント: [ドメインの移管](http://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/domain-transfer.html)

ムームードメインで購入した 53ningen.com ドメインを Route 53 に移管します。ステップとしては以下のとおりです。

1. WHOIS 情報としてレジストラの情報を代理公開している場合は、ムームードメインのコントロールパネルから自分のものに変更する
2. 確認のメールが飛んでくるので踏む
3. AUTH_CODE をメモ
4. Route 53 の `Domain registration` から `Transfer Domain to Route 53` に進みドメイン名を入力
5. AUTH_CODE を入力
6. 移管後の DNS として先ほど作った Route 53 の Hosted Zone を指定する
7. AWS から移管確認のメールが飛んでくるので踏む
8. そのうち移管が完了する

> Waiting for the current registrar to complete the transfer (step 7 of 14)
> ドメインが移管の要件を満たしているか現在のレジストラが確認しています。このステップは、ドメインの TLD に応じて最大 10 日かかる場合があります。

結構待ったりいろんな確認メールのリンクを踏んだりする必要がありますが、あまりテクニカルな手順はないはず...。

# 3. 稼働しているサーバーの Ansible 化

地道に頑張るしかない。

# 4. データベースの引越し

まずは新サーバーで動いている MariaDB へのデータ移行と参照の切り替えを行うことにより、データベースサーバーのみを引っ越しします。手順は大まかに次のとおりです。

1. 現行 DB の dump を取り、新 DB にインポートする
2. アプリケーションから参照する MariaDB ユーザーに現行サーバーからの接続許可を与える
3. TCP 3306 ポートを開ける
4. 現行アプリケーション設定を書き換えて新 DB に向ける
5. 動作確認

まずは現行 DB からのデータ移転作業は以下のような感じになります。

```
## local から
ssh gomi-old01 "mysqldump -uroot -p --all-databases --single-transaction --order-by-primary" > /tmp/dump.sql
scp /tmp/mysqldump.sql gomi-web01:/tmp/

# gomi-web01
mysql -uroot -p < /tmp/dump.sql
```

続いて、アプリケーションが接続する mysql のユーザーの作成と設定をします。現行アプリケーションサーバーからの接続を許可する設定を入れる必要があります。ansible で次のようなものを実行します。

```
- name: create gomi user
  mysql_user:
    name: gomi
    password: "{{ db_app_password }}"
    priv: 'wordpress.*:ALL'
    state: present
    host: gomi-old01
```

またリモートからの接続をするために firewalld を設定して 3306 ポートを開けます。

```
- name: open 3306 port
  become: yes
  firewalld:
    service: mysql
    immediate: yes
    permanent: true
    state: enabled
```

最終的に現行アプリケーション設定 `wp-config.php` を書き換えて新 DB に向き先を切り替えます。

```
$ vi wp-config.php

#=> 以下を編集
/** MySQL データベースのユーザー名 */
define('DB_USER', '*****');

/** MySQL データベースのパスワード */
define('DB_PASSWORD', '*****');

/** MySQL のホスト名 */
define('DB_HOST', 'gomi-web01');
```

最後に動作確認をひと通りして、問題なさそうであればデータベースの引っ越しは完了となります。

# 5. Wordpress アプリケーションの引越し

おおまかな手順は以下の通りです。

1. 現行 Wordpress の配置ディレクトリごと tar で固める
2. 新サーバーに固めたものを展開して、適切なパスに配置する
3. `wp-config.php` をの `DB_HOST` を `localhost` に戻す
4. nginx の設定を更新し、外から Wordpress の動作を確認できるようにする
5. /etc/hosts を書き換え、新サーバー上の Wordpress が正しく動いているか動作確認

Wordpress アプリケーションの圧縮と展開は次のようなコマンドで簡単に行えます。。

```
# 圧縮
wordpress_path="...wordpressアプリケーション配置パス..."
tar cvzfp wp-app.tar $wordpress_path

# 展開
tar xvzfp wp-app.tar
```

次に、直前の DB 参照切り替えで Wordpress の設定を変えているので、新サーバー内に配置した Wordpress の `wp-config.php` の `DB_HOST` 設定は `localhost` に向けなおします。これが終わったら、`nginx.conf` を更新して外部から動作確認できる状態にします。ざっくりと例えば次のように記述すれば OK です（その他各位適切な設定をいい感じにしてください）。

```
server {
    listen       80;
    server_name  53ningen.com;
    return 301 https://$host$request_uri;
}

server {
    listen       443 ssl;
    server_name  53ningen.com;

    index  index.php index.html index.htm;
    root   /path/to/wordpress;

    ssl_certificate /path/to/53ningen.com/fullchain.pem;
    ssl_certificate_key /path/to/53ningen.com/privkey.pem;

    location ~* /wp-config.php {
         deny all;
    }

    try_files $uri $uri/ /index.php?q=$uri&$args;

    location ~ \.php$ {
      fastcgi_pass   127.0.0.1:9000;
      fastcgi_index  index.php;
      fastcgi_param  SCRIPT_FILENAME $document_root/$fastcgi_script_name;
      include        fastcgi_params;
    }
}
```

最後に、手元 `/etc/hosts` に以下を追記してひととおりアプリケーションの動作を確認します。

```
新IP   53ningen.com
```

動作確認して問題がなければ Wordpress の移行も完了になります。

# 6. DNS 切り替え

Route53 に登録している A レコードの向き先を変更して、新サーバーに完全移行します。移行して動作に問題がなさそうであれば、MariaDB の gomi-old01 から接続できるユーザーを削除し、firewalld で 3306 ポートを閉じておきます。
