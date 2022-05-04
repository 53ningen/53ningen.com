---
title: AWSの基礎知識
category: programming
date: 2018-04-02 12:15:00
tags: [AWS]
pinned: false
---

- 自分向けに AWS 各サービスの基礎的な情報などをまとめたメモです
- 機能追加とか変更は頻繁に行われているので、最終的にはドキュメントをみてあってるか都度確認する

## AWS のストレージ関連サービス

> 情報ソース: [AWS が提供するクラウドストレージ](https://aws.amazon.com/jp/products/storage/)

AWS が提供するストレージ関連のサービスには以下のようなものがある

- Amazon EBS(Elastic Block Storage)
  - 実行中のインスタンスに EBS ボリュームをアタッチできる
  - 複数の EBS ボリュームをインスタンスにアタッチできる
  - 頻繁に書き換えるデータの格納場所に向いている
    - たとえばインスタンス上で MySQL を稼働させる際、データは EBS に格納するなどという用途に向いている
  - インスタンスの運用とは独立した永続性を持つ
  - 未加工、未フォーマットの外部ブロックデバイスとして振る舞い、物理ハードドライブと同じように使用できる
  - 種類に応じて IOPS が異なる
  - SSD は汎用の gp2, プロビジョニング可能な io1 がある
  - HDD はシーケンシャルシークに強い st1, アクセス頻度が低いデータ向けの sc1, 旧世代のマグネティックがある
- Amazon EC2 インスタンスストア
  - インスタンスのタイプにより使用の可否、使用できるインスタンスストアのサイズ、ハードウェアの種類が決まる
  - インスタンスを停止、終了するとボリュームのすべてのデータが失われる
  - 動的生成されたサムネイルのキャッシュなど、永続化の必要がないものを置くのに向いている
  - インスタンスの起動後にインスタンスストアボリュームを使用する設定はできない [#](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/add-instance-store-volumes.html)
  - インスタンスの使用量に含まれている
- Amazon S3(Simple Storage Service)
  - 高可用性と高耐久性を持つオブジェクトストレージ
- Amazon EFS(Elastic File System)
  - NFS v4.1 をサポートするファイルストレージサービス
  - 複数の EC2 からマウント可能
  - EBS に対してマルチ AZ、オートスケーリングなどの特徴がある
- Storage Gateway
  - NFS, iSCSI などのプロトコルを利用して S3 と連携できるサービス
  - オンプレ環境のデータをアップロードする際などに使う

## Elastic Block Store について

### Amazon EBS ボリュームの種類

> 情報ソース: [Amazon EBS ボリュームの種類 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/EBSVolumeTypes.html)

2018/05 時点で以下のラインナップ

- gp2
  - 汎用 SSD・価格-パフォーマンスバランス型
  - ほぼ全てのワークロードに適している
  - 1GiB〜16TiB
  - 最大 IOPS: 10,000/Vol, 80,000/Instance
  - 最大スループット: 160 MiB/Vol-s, 1,750/Instance-s
- io1
  - provisioned IOPS SSD
  - 低レイテンシー/高スループットが求められるワークロード向きで、IOPS をプロビジョニングできる
  - 4GiB〜16TiB
  - 最大 IOPS: 32,000/Vol, 80,000/Instance
  - 最大スループット: 500 MiB/Vol-s, 1,750/Instance-s
- st1
  - HDD
  - 低コストで安定した高速スループット
  - 500GiB〜16TiB
  - 最大 IOPS: 500/Vol, 80,000/Instance
  - 最大スループット: 500 MiB/Vol-s, 1,750/Instance-s
- sc1
  - HDD
  - アクセス頻度の低いデータ向け
  - 500GiB〜16TiB
  - 最大 IOPS: 250/Vol, 80,000/Instance
  - 最大スループット: 250 MiB/Vol-s, 1,750/Instance-s

HDD 系ボリュームタイプはブートボリュームデバイスにできない

### gp2

> 情報ソース: [Amazon EBS ボリュームの種類 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/EBSVolumeTypes.html#EBSVolumeTypes_gp2)

- IOPS について
  - ベースラインパフォーマンスはボリュームサイズとともに変化する
  - ベースラインパフォーマンスを超える IOPS が発生するとその差分が、I/O クレジットから差し引かれる。
  - I/O クレジットが枯渇すると、IO がベースラインパフォーマンス水準まで律速される
- スループットについて
  - (Volume size in GiB) × (IOPS per GiB) × (I/O size in KiB) = Throughput in MiB/s

### io1

> 情報ソース: [Amazon EBS ボリュームの種類 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/EBSVolumeTypes.html#EBSVolumeTypes_piops)

- IOPS について
  - gp2 とは違い IOPS をプロビジョニングできる
  - ボリュームサイズに応じてプロビジョニングできる IOPS がかわる（Vol-GiB:IOPS = 50:1）
- スループットについて
  - 256 KiB/s-Provisioned IOPS, Max: 500 MiB/s

### st1, sc1

- gp2 と同様のモデルのスループットクレジットの考え方
- シーケンシャル I/O 用に最適化され、高スループットのワークロードに適している
  - サイズの小さなランダム I/O のワークロードには向いていない
  - 1 MiB 未満の I/O リクエストは、1 MiB の I/O クレジットとしてカウントされる
  - ただし、I/O がシーケンシャルであれば、1 MiB の I/O ブロックにマージされ、1 MiB の I/O クレジットとしてのみカウントされる

たとえば、1 MiB 未満の I/O リクエストは、1 MiB の I/O クレジットとしてカウントされます。ただし、I/O がシーケンシャルであれば、1 MiB の I/O ブロックにマージされ、1 MiB の I/O クレジットとしてのみカウントされます。

## Amazon Virtual Private Cloud(VPC) の基本的な情報まとめ

> 情報ソース: [Amazon VPC とは?](https://docs.aws.amazon.com/ja_jp/AmazonVPC/latest/UserGuide/VPC_Introduction.html)

- AWS アカウント専用の仮想ネットワーク、論理的に独立している
- VPC の IP アドレス範囲を区切ってサブネットを構成できる [#](https://docs.aws.amazon.com/ja_jp/AmazonVPC/latest/UserGuide/VPC_Subnets.html#vpc-subnet-basics)
  - サブネット単位で、セキュリティグループ、ネットワーク ACL などを設定できる [#](https://docs.aws.amazon.com/ja_jp/AmazonVPC/latest/UserGuide/VPC_Security.html)
- VPC 内に起動された EC2 インスタンスは次のような特徴を持つ
  - 開始から停止までの間に維持される静的プライベート IPv4 アドレスが割り当てられる
  - IPv6 CIDR ブロックが VPC に割り当てられている場合は、IPv6 アドレスも割り当てられる
  - ネットワークインターフェース を割り当て可能
  - インバウンドトラフィック、アウトバウンドトラフィックを制御できる（ingress/egress フィルタリング）
- 単一テナントハードウェアでインスタンスを実行できる [#](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/dedicated-instance.html)

## Amazon Route 53 のルーティングポリシー

> 情報ソース: [ルーティングポリシーの選択](https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/routing-policy.html)

- シンプルルーティング: 単一のレコードの場合
- フェイルオーバールーティング: アクティブ/パッシブフェイルオーバー
- 位置情報ルーティング: ユーザーの位置情報に基づいてトラフィックをルーティング
- 地理的近接性ルーティング: リソースの場所に基づき、必要に応じてトラフィックをある場所のリソースから別の場所に移動するときに利用する
- レイテンシールーティング: レイテンシの最も小さいリソースにルーティング
- 複数値回答ルーティング: アトランダムに選ばれた最大 8 つの正常なレコードを持つ DNS クエリに Route 53 を応答させる場合に使う
- 加重ルーティング: 指定した比率で複数のリソースにトラフィックをルーティングする場合
  - 新系統への段階的切り替え時とかに使う

### Route 53 がユーザーの場所を推定する方法

> 情報ソース: [Amazon Route 53 がユーザーの場所を推定する方法 (位置情報と地理的近接性のルーティング)](https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-edns0)

- 地理的場所は大陸別、国別、米国州別に指定可能
  - 重なり合う地域については最も小さい地域が優先される
- 位置情報は、IP アドレスに場所をマッピングすることによって動作する
  - 一部の IP アドレスは地理的場所にマッピングされず、このときにデフォルトリソースレコードが設定されていないと "応答なし" という返答を行う
- 位置情報・地理的近接性によるルーティング精度向上のために、EDNS0 の edns-client-subnet 拡張をサポートしている
- ブラウザなどが edns-client-subnet をサポートする DNS リゾルバを使用している場合、ユーザーの IP アドレスを切り捨てたアドレスを Route 53 に送信し、これをもとにユーザーの場所を決定する
- この点についてのより詳細な情報は [Client Subnet in DNS Queries draft-ietf-dnsop-edns-client-subnet-08](https://tools.ietf.org/html/draft-ietf-dnsop-edns-client-subnet-08) に掲載されている

### 複数値回答ルーティングとは

- DNS クエリへの応答として複数の値を返すように設定する仕組み
- リソースが正常かどうかも確認され、正常なリソースレコードのみを返す
  - ロードバランシング用途に使える

## Amazon WorkDocs とは

> 情報ソース: [Amazon WorkDocs ドキュメント](https://aws.amazon.com/jp/documentation/workdocs/)

- フルマネージドなエンタープライズ向けストレージおよびファイル共有サービス
- Amazon WorkSpace のユーザーは追加料金なしで WorkDocs へのアクセス権限が付与される

### 課金体系の概要

> 情報ソース: [Amazon WorkDocs 料金](https://aws.amazon.com/jp/workdocs/pricing/)

ざっくりといえば、アクティブなユーザーアカウントとストレージの料金が課金対象

- Amazon WorkDocs ユーザー/月: 5〜8 USD
  - Workspace のユーザーは最初の 50 GB まで料金に含まれる
  - そうでないユーザーは最初の 1TB まで月 2〜3 USD
  - それ以降の料金に関しては S3 の料金に従う [#](https://aws.amazon.com/jp/s3/pricing/#Storage_Pricing)
  - ファイル管理の実体は Amazon Directory Service で、WorkDocs サイト作成時にこちらにリソースが作られる
- 管理者は主に次のようなことができる
  - Active Directory との統合
  - Amazon Workspace との統合
  - CloudTrail, SNS との統合
  - アクティビティの追跡
  - ユーザーを招待、削除できる
  - 可視性をコントロールできる
  - ユーザーのストレージサイズを制限できる
- ストレージとして次のような機能がある
  - プレビュー
  - ローカルとの同期
  - ファイルのロック
  - Windows エクスプローラーからのアクセス
  - バージョン管理
  - コメント
  - 可視性の設定

## AWS Client VPN とは

公式ドキュメント: [AWS Client VPN とは - AWS Client VPN](https://docs.aws.amazon.com/ja_jp/vpn/latest/clientvpn-admin/what-is.html)

- AWS リソースやオンプレミスのリソースに安全にアクセスできるようにするマネージド VPN サービス
- OpenVPN ベースの VPN クライアントを用いてリソースアクセスが可能

### セットアップ

公式ドキュメント: [クライアント VPN の使用開始 - AWS Client VPN](https://docs.aws.amazon.com/ja_jp/vpn/latest/clientvpn-admin/cvpn-getting-started.html)

1. サーバーおよびクライアント証明書とキーの生成

```
$ git clone https://github.com/OpenVPN/easy-rsa.git
$ cd easy-rsa/easyrsa3
$ ./easyrsa init-pki
$ ./easyrsa build-ca nopass
$ ./easyrsa build-server-full server nopass
$ ./easyrsa build-client-full client1.domain.tld nopass

$ cp pki/**/*.crt ~/WorkDocs/easyrsa/
$ cp pki/**/*.key ~/WorkDocs/easyrsa/

$ cd ~/WorkDocs/easyrsa
$ aws acm import-certificate --certificate file://server.crt --private-key file://server.key --certificate-chain file://ca.crt --region ap-northeast-1
$ aws acm import-certificate --certificate file://client1.domain.tld.crt --private-key file://client1.domain.tld.key --certificate-chain file://ca.crt --region ap-northeast-1
```

2. クライアント VPN エンドポイントを作成し、アクセス許可とルートテーブルの設定を行う
3. 接続する

### クライアントからの接続

- ovpn ファイルの末尾にクライアント証明書とキーの情報を追記するのを忘れないように
- iOS 接続ではこれにハマりがち: [Troubleshooting Client VPN - AWS Client VPN](https://docs.aws.amazon.com/ja_jp/vpn/latest/clientvpn-admin/troubleshooting.html#resolve-host-name)

## Amazon DynamoDB とは

情報ソース: [Amazon DynamoDB とは - Amazon DynamoDB](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/Introduction.html)

### 特徴

- フルマネージド型 NoSQL
- シームレスなスケーラビリティ
- 保管時の暗号化を提供
- 任意の量のデータを保存できる
- ノーダウンタイムでスループット変更可能
- オンデマンドバックアップ機能
- ポイントインタイムリカバリ
- すべてのデータは SSD に保存され、自動的に 1 リージョン内の複数の AZ にレプリケートされる
- マルチリージョン間の継続した同期を実現するグローバルテーブルなる機能もある

### 基本的な仕組み

- コアコンポーネント
  - テーブル: 項目のコレクション
  - 項目: 属性のコレクション、各項目は 1 つ以上の属性で構成される
  - 属性: それ以上分割する必要のないデータ要素
- 最大深さ 32 レベルの入れ子属性をサポートしている
- プライマリキーを利用して項目を一意に識別する
  - パーティションキー: 1 つの属性で構成されたシンプルなプライマリキーをハッシュ関数の入力として DynamoDB 内部の物理ストレージが決定する
  - 複合プライマリキー: パーティションキーをハッシュ関数の入力として DynamoDB 内部の物理ストレージが決定したのち、同一のパーティションキーの項目が複数ある場合にソートキーでソートされた状態で DyanmoDB 内部の物理ストレージに保存される
- プライマリキーは単一、または複数の属性を組み合わせたものを指定できる
- セカンダリインデックスを使用してクエリの柔軟性を高められる
  - グローバルセカンダリインデックス: テーブルと異なるパーティションキーとソートキーを持つインデックス（制限: テーブルあたり 20）
  - ローカルセカンダリインデックス: テーブルと同じパーティションキーと、異なるソートキーを持つインデックス（制限: テーブルあたり 5）
- DynamoDB ストリームを使うとデータの変更をキャプチャできる

### DynamoDB にあわせた NoSQL 設計

- RDBMS では柔軟なクエリが可能だが、クエリはコストが高く、高トラフィックに対するスケーリングがうまくいかないことがある
- 基本的に DynamoDB では限られた方法に対して効率的にクエリできるが、その範囲外では高コストで低速

DynamoDB テーブルの設計方針

- もっとも一般的で重要なクエリをできるだけ早く安価に行うためのスキーマ設計を行う
- ユースケースの特定の要件にあわせてデータ構造を定める
- RDBMS では正規化されたデータモデルを作成できるが、DynamoDB を利用する場合は、ユースケースを断定するまでスキーマの設計はできない
- テーブルをできるだけすくなく保つ

アプリケーションのアクセスパターンの 3 つの基本的特性

- データサイズ: リクエストのデータ量を把握する
- データシェイプ: クエリ処理時にデータを再形成するのではなく、データベースの形状がクエリ結果と一致するようにテーブルを設計する
- データ速度: パーティションを適切に設定する

パフォーマンス管理の一般的な原則

- 関連するデータをまとめる
- ソート順を使用する
- クエリを分散する
- グローバルセカンダリインデックスを使用する

### DynamoDB とオペレーション

> 情報ソース: [クエリの操作 - Amazon DynamoDB](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/Query.html)

できる読み取り操作

- GetItem: テーブルに対してプライマリキーを指定して、単一項目を読み取る
- Query: 同じパーティションキーを持つ複数の項目を読み取る、返されるすべての項目は単一の読み込みオペレーションとして扱われる

クエリ操作

- キー条件式: パーティションキーの名前と値を指定し、かつソートキーに条件式を指定できる
- クエリフィルタ式: クエリ式の結果を条件式でフィルタできる
- limit: よくある limit
- scannedCount: フィルタ式が適用される前に条件式に一致する項目
- count: フィルタ式が適用されたあとに残っている項目数

スキャン操作

- テーブルまたはセカンダリインデックスのすべての項目を読み込む
- フィルタ式を使用できる
- limit を指定できる
- ページネーションの単位を指定できる
- scannedCount: フィルタ式が適用される前に条件式に一致する項目
- count: フィルタ式が適用されたあとに残っている項目数
- 並列スキャン

書き込み操作

- デフォルトでは無条件で書き込みオペレーションを実行できる
- 条件付きの書き込み: 項目の属性が 1 つ以上の想定条件を満たす場合のみ成功する
  - たとえば同じプライマリキーを持つ既存の項目がない場合など
  - また現在取得している値が変化していないことを前提に処理を行う条件式を指定することにより排他処理も使える

## Amazon Pinpoint とは

- Email, SMS, 音声, モバイルエンドポイントなどに向けて、高度なセグメンテーションのもとメッセージ送信が行えるサービス
- メッセージの効果測定も行える

### 各種概念

#### チャンネル

メッセージ送信先のプラットフォームで、以下のようなものに対応している

- プッシュ通知: FCM, APNs, Baidu Cloud Push, Amazon Device Messaging
- E メール: 一般的なメールアドレス
- SMS: SMS 受信可能な電話番号
- 音声: テキストスクリプトから音声メッセージを作成し、電話にて配信する

#### メッセージ

以下の 2 通りの送信方法がある

- セグメントを指定したキャンペーン
- 最大 15 人の個別の受取人を指定したテストメッセージ
  - どのチャンネルにも対応している
  - 配信をスケジュールすることはできない
  - オープン率、クリック率、バウンス率などのメッセージメトリクスは生成されない
  - 毎月の対象デバイスに基づく料金は発生しない

#### セグメント

以下の 2 通りのセグメントがある

- 動的セグメント: ユーザーが定義した属性に基づくセグメント
- 静的セグメント: CSV/JSON 形式で定義インポートされたセグメント

動的なセグメントを作成するときは 1 つ以上のセグメントグループを指定する必要があり、セグメントグループは以下の 2 つのコンポーネントから構成される。複数のセグメントグループは AND/OR どちらの論理演算が可能。

- 基本セグメント: ユーザーの母集団を定義するセグメントで、1 つ、複数、全てのセグメントを指定できる
- フィルタ: 基本セグメントに加えて、セグメントの属性などに対しての条件を指定できる

本機能を用いると、例えば Android ユーザーの Oreo 以前のデバイス または iOS ユーザーの iOS 11 以前のデバイスに、サポート終了のお知らせを手軽に送信できる

## Amazon CloudWatch Synthetics とは

- エンドポイントや API をモニタリングするカナリアの作成を支援するツール

## Amazon Cognito とは

おもなコンポーネントはユーザープールと ID プール

- ユーザープールの機能
  - セキュアでスケーラブルなユーザーディレクトリ・ユーザープロファイル管理サービス
  - サインアップ・サインインサービス、Facebook・Google ソーシャルサインイン、Login with Amazon、SAML、OIDC IdP 経由のサインインを提供
  - 組み込みウェブ UI の提供
  - MFA や漏洩認証情報のチェック、アカウントの乗っ取りに対する保護などのセキュリティ機能
  - AWS Lambda 連携とカスタマイズされたワークフローの提供
- ID プールの機能
  - 一時的な AWS 認証情報を取得し、AWS 各サービスへのアクセス許可を制御する
  - 匿名ゲストユーザーと ID プールのユーザーを認証し、それぞれに対してアクセス制御を行う
  - Amazon Cognito ユーザープール、Facebook・Google ソーシャルサインイン、Login with Amazon、OIDC プロバイダ、SAML ID プロバイダなどの IdP に対応している

## AWS Batch とは

公式ドキュメント: [AWS Batch とは - AWS Batch](https://docs.aws.amazon.com/ja_jp/batch/latest/userguide/what-is-batch.html)

- バッチコンピューティングのワークロードの実行をインフラの設定や管理を排除しつつ実行できる
- リージョン内の複数の AZ でのバッチジョブの実行を簡略化できる

### 基本的なコンポーネント

- ジョブ
  - AWS Batch に送信する作業単位
  - 実体はシェルスクリプトや Linux 実行可能ファイル、Docker コンテナイメージ
- ジョブ定義
  - ジョブの実行方法を指定する
  - ジョブのリソースの設計図
  - メモリと CPU の要件、IAM ロール、永続的ストレージのコンテナのプロパティ、環境変数、マウントポイントなどを指定できる
- ジョブキュー
  - ジョブがコンピューティング環境にスケジュールされるまでそのジョブが滞留できる場所
  - ジョブキューには 1 つ以上のコンピューティング環境を優先度つきで関連づけられる
- コンピューティング環境
  - ジョブを実行するためのマネージドもしくはあんマネージドなコンピューティングリソースのセット

# API Gateway

- REST, HTTP, WebSocket API を作成・公開・維持・モニタリング・セキュア化するためのサービス
  - REST, HTTP: HTTP ベースのステートレスなクライアント/サーバー通信を提供し、GET/POST/PUT などの標準の HTTP メソッドを実装
  - WebSocket API: WebSocket プロトコルを遵守し、クライアント/サーバー間のステートフルな全二重通信を実現
- API Gateway HTTP API の特徴
  - REST API よりも低いレイテンシーとコストで RESTful API を作成できる
  - AWS Lambda 関数などの AWS サービスやパブリックな HTTP エンドポイントにリクエストをプロキシできる
  - OpenID Connect, OAuth2.0 をサポートしている
  - HTTP API と REST API の機能差については次のドキュメントを参照: [HTTP API と REST API 間で選択する](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/http-api-vs-rest.html)
- 基本概念
  - エッジ最適化 API: AWS Regions 全体からのクライアントアクセスを容易にするために CloudFormation ディストリビューションを使用した API

## API Gateway - REST/WebSocket API の内部インターフェース

### メソッドリクエスト

- API メソッドのパブリックインターフェース
- クライアントが API を介してバックエンドにアクセスするために送る必要のあるパラメータと本文が定義されている
  - 認可の有無/リクエスト（クエリパラメータ/リクエストヘッダー）の検証/API Key の必要性/キャッシュの有無が設定できる

### 統合リクエスト

- クライアントから受け取ったパラメータ、リクエストなどをバックエンドが必要とする形にマッピングするための内部インターフェイス
- Velocity Template Language(VTL) を用いて記述したマッピングテンプレートにてマッピングを定義する

### 統合レスポンス

- バックエンドから受け取ったステータスコード/ヘッダー/ペイロードをクライアントに返却するレスポンス形式にマップするための内部インターフェイス
- Velocity Template Language(VTL) を用いて記述したマッピングテンプレートにてマッピングを定義する

### メソッドレスポンス

- クライアントが API からのレスポンスに求めるステータスコード/ヘッダー/本文を定義する内部インターフェイス

## API Gateway - REST API 統合

- Mock 統合: バックエンドを必要とせず API Gateway が直接レスポンスを生成する
- Lambda 統合: バックエンドが Lambda 関数、リクエストをそのまま Lambda 関数に引き渡せるプロキシ統合を行うことも可能
- HTTP 統合: バックエンドが HTTP エンドポイント、リクエストをそのまま引き渡せるプロキシ統合を行うことも可能
- AWS サービス統合: バックエンドが AWS サービスエンドポイント
- VPC リンク統合: バックエンドが VPC 内のエンドポイント

## API Gateway WebSocket API

### 検証ツール

WebSocket API とのインタラクションを手軽に試すツールとして wscat がある

```
npm install -g wscat
```

### 検証

適当な WebSocket API をデプロイし遊ぶ

以下のような適当な Lambda 関数をデプロイしておく

```
import json

def lambda_handler(event, context):
    print(json.dumps(event))
    return {
        "statusCode": 200
    }
```

WebSocket API をデプロイしコマンドを叩く

```
$ wscat -c wss://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/production
Connected (press CTRL+C to quit)
> {"action":"echo","data":"hoge"}
```

Lambda 関数のログを除くと以下のように出力されている

```
{
    "requestContext": {
        "routeKey": "echo",
        "messageId": "EOCvncUCtjMAdig=",
        "eventType": "MESSAGE",
        "extendedRequestId": "EOCvnFZxNjMF8eQ=",
        "requestTime": "17/Aug/2021:16:33:14 +0000",
        "messageDirection": "IN",
        "stage": "production",
        "connectedAt": 1629217811891,
        "requestTimeEpoch": 1629217994107,
        "identity": {
            "sourceIp": "XXXXXXXX"
        },
        "requestId": "EOCvnFZxNjMF8eQ=",
        "domainName": "XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com",
        "connectionId": "EOCTIf72tjMAdig=",
        "apiId": "XXXXXXXX"
    },
    "body": "{\"action\":\"echo\",\"data\":\"hoge\"}",
    "isBase64Encoded": false
}
```

この connectionId 宛にメッセージを送ると、サーバー側からの該当のコネクションにメッセージ送信ができる
これを試すために Lambda 関数を次のように書き換え、ロールに適切な権限を付与する

```
import json
import boto3

def lambda_handler(event, context):
    print(json.dumps(event))

    connection_id = event["requestContext"]["connectionId"]
    domain_name = event["requestContext"]["domainName"]
    stage = event["requestContext"]["stage"]
    api = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domain_name}/{stage}')
    api.post_to_connection(
        ConnectionId=connection_id,
        Data=json.dumps({
            "data": "accepted"
        })
    )

    return {
        "statusCode": 200
    }
```

この状態で実験するとサーバー側からのメッセージが来るようになる

```
$ wscat -c wss://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/production
Connected (press CTRL+C to quit)
> {"action":"echo","data":"hoge"}
< {"data": "accepted"}
```
