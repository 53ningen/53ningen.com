---
slug: terraform-hands-on
title: terraform を使ったAWS構成管理 ハンズオン
category: programming
date: 2016-10-13 03:17:38
tags: [AWS, terraform]
pinned: false
---

terrafrom は、インフラの構築や設定などをコードで表現して管理できるようにするツールです。AWS や Azure、 Heroku など様々な環境に対応しています。

この資料はラビットハウス社内で開催される、 AWS リソースを terrform で管理するためのハンズオン向けに作成した資料になります。AWS 構成管理をコードで管理したいなどと思っている方のなかにも、こういったツールが面倒臭そうだとか、すぐ使えなくなってしまいそうだとお思いの方が多いかと思いますが、 terraform の挙動はとてもシンプルで学習コストはものすごい低いツールです。また AWS 構成をコード化することでより深く AWS について理解することできる側面もあると考えています。

是非この機会に terraform に入門してみませんか...？ この記事の通りにコマンドを入力していけば、きっとあなたも１時間もしないうちに terraform を使いこなせるようになっているでしょう。

## 1. 環境構築

このハンズオンでは `terraform v0.7.4` を前提として話を進めます

### Mac の場合

- [https://www.terraform.io/downloads.html](https://www.terraform.io/downloads.html)
- `brew install terraform` でも可

### Windows の場合

[https://www.terraform.io/downloads.html](https://www.terraform.io/downloads.html)

### AWS 側の準備

あらかじめ terraform で用いる IAM ユーザーを作成しておきましょう

1. [IAM ユーザー管理ページ](https://console.aws.amazon.com/iam/home?region=ap-northeast-1#users)にアクセス
2. 新規ユーザーの作成
3. 必要なポリシーのアタッチ
4. access_key, secret_key の作成

## 2. S3 bucket を管理する

まずは S3 bucket を作ったり変更したり壊したりして遊んでみましょう。下準備として、適当な作業用ディレクトリを作成してください。次に AWS リソースにアクセスするための設定を書きます。

```
provider "aws" {
  region     = "ap-northeast-1"
  access_key = "***************"
  secret_key = "***************"
}
```

### 2-1. S3 bucket を作る

早速 S3 bucket を作ってみましょう。次のようなファイルを作成してください。ただし **bucket の名称はグローバルで一意になるように定めてください。**

```
resource "aws_s3_bucket" "terraform_tutorial" {
    bucket = "com.github.53ningen.terraform.tutorial" # S3 bucket 名は global で一意になるように
    acl = "private"
    versioning {
        enabled = true
    }
}
```

以上のようなファイルを作ったら、`terraform validate` で正しい `.tf` ファイルを記述できているかを確認してみましょう。きっと上記の通りに書けば問題なくコマンドが通ると思います。

つづいて `terraform plan` コマンドで、これからどのようなことが実行されるのかを確認します。この操作は常に安全で、AWS に対して情報の読みとり操作しか行われません。

```
% terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.


The Terraform execution plan has been generated and is shown below.
Resources are shown in alphabetical order for quick scanning. Green resources
will be created (or destroyed and then created if an existing resource
exists), yellow resources are being changed in-place, and red resources
will be destroyed. Cyan entries are data sources to be read.

Note: You didn't specify an "-out" parameter to save this plan, so when
"apply" is called, Terraform can't guarantee this is what will execute.

+ aws_s3_bucket.terraform_tutorial
    acceleration_status:         "<computed>"
    acl:                         "private"
    arn:                         "<computed>"
    bucket:                      "com.github.53ningen.terraform.tutorial"
    force_destroy:               "false"
    hosted_zone_id:              "<computed>"
    policy:                      "<computed>"
    region:                      "<computed>"
    request_payer:               "<computed>"
    versioning.#:                "1"
    versioning.69840937.enabled: "true"
    website_domain:              "<computed>"
    website_endpoint:            "<computed>"


Plan: 1 to add, 0 to change, 0 to destroy.
```

`+ aws_s3_bucket.terraform_tutorial` とあるように S3 の bucket が作成されることが確認出来たので `terraform apply` コマンドで実際に実行してみましょう。

```
% terraform apply
aws_s3_bucket.terraform_tutorial: Creating...
  acceleration_status:         "" => "<computed>"
  acl:                         "" => "private"
  arn:                         "" => "<computed>"
  bucket:                      "" => "com.github.53ningen.terraform.tutorial"
  force_destroy:               "" => "false"
  hosted_zone_id:              "" => "<computed>"
  policy:                      "" => "<computed>"
  region:                      "" => "<computed>"
  request_payer:               "" => "<computed>"
  versioning.#:                "" => "1"
  versioning.69840937.enabled: "" => "true"
  website_domain:              "" => "<computed>"
  website_endpoint:            "" => "<computed>"
aws_s3_bucket.terraform_tutorial: Creation complete

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

The state of your infrastructure has been saved to the path
below. This state is required to modify and destroy your
infrastructure, so keep it safe. To inspect the complete state
use the `terraform show` command.

State path: terraform.tfstate
```

無事、成功したようですので、とりあえず aws cli から s3 bucket が本当に存在するのか確認してみましょう。

```
% aws s3 ls
...
2016-10-10 17:28:13 com.github.53ningen.terraform.tutorial
...
```

ちゃんと `s3.tf` ファイルで指定した `com.github.53ningen.terraform.tutorial` という名前の bucket ができていることがわかります。さて、`terraform apply` が無事に成功したあとには `terraform.tfstate` というファイルができていると思います。

```
% ls -a
.  ..  .git  s3.tf  terraform.tfstate  variable.tf
```

このファイルの中身はリモート（今の場合 AWS）の状態を保存するファイルになります。この中にはアクセスキーやシークレットキーがふくまれているため、`git` 管理対象外にしておきましょう。このファイルの管理についてはのちほど 「remote state の管理」の節でご説明します。とりあえず以下のような `.gitignore` ファイルを追加しておきましょう。

```

.DS_Store
*.tfstate
*.tfstate.backup
vendor/bundle
.bundle/
config.tfvars
.terraform/

```

### 2-2. S3 bucket の状態を変更する

さきほど作った S3 bucket はバージョニングが有効になっていますが、これを無効にしてみましょう。`s3.tf` を次のように修正します。

```diff
resource "aws_s3_bucket" "terraform_tutorial" {
    bucket = "com.github.53ningen.terraform.tutorial" # S3 bucket 名は global で一意になるように
    acl = "private"
    versioning {
-       enabled = true
+       enabled = false
   }
}
```

続いて `terraform validate` コマンドで `tf` ファイルのシンタックスを検証し、 `terraform plan` で AWS リソースに対してどうのような変更が行われるか確認しましょう。

```
% terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.

aws_s3_bucket.terraform_tutorial: Refreshing state... (ID: com.github.53ningen.terraform.tutorial)

The Terraform execution plan has been generated and is shown below.
Resources are shown in alphabetical order for quick scanning. Green resources
will be created (or destroyed and then created if an existing resource
exists), yellow resources are being changed in-place, and red resources
will be destroyed. Cyan entries are data sources to be read.

Note: You didn't specify an "-out" parameter to save this plan, so when
"apply" is called, Terraform can't guarantee this is what will execute.

~ aws_s3_bucket.terraform_tutorial
    versioning.2972667452.enabled: "" => "false"
    versioning.69840937.enabled:   "true" => "false"


Plan: 0 to add, 1 to change, 0 to destroy.
```

`Plan: 0 to add, 1 to change, 0 to destroy.` とあるので、既存の S3 は削除されず、表示されたパラメータのみが変更されることがわかります。確認をしたら `apply` をすれば S3 の状態の変更は完了です。

```
% terraform apply
aws_s3_bucket.terraform_tutorial: Refreshing state... (ID: com.github.53ningen.terraform.tutorial)
aws_s3_bucket.terraform_tutorial: Modifying...
  versioning.2972667452.enabled: "" => "false"
  versioning.69840937.enabled:   "true" => "false"
aws_s3_bucket.terraform_tutorial: Modifications complete

Apply complete! Resources: 0 added, 1 changed, 0 destroyed.

The state of your infrastructure has been saved to the path
below. This state is required to modify and destroy your
infrastructure, so keep it safe. To inspect the complete state
use the `terraform show` command.

State path: terraform.tfstate
```

### 2-3. S3 bucket を破棄する

さて、いままでチュートリアルとして S3 bucket を作成してきましたが、不要なので削除しておきましょう。`terraform destroy` コマンドを使えば OK ですが、この操作もやはり実行する前に確認しておきたいものです。そんな場合はまず `terraform plan --destroy` を実行してみましょう。これで `terraform destroy` 時の実行計画を見ることができます。

```
% terraform plan --destroy
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.

aws_s3_bucket.terraform_tutorial_tfsate: Refreshing state... (ID: com.github.53ningen.terraform.tutorial.tfstate)

The Terraform execution plan has been generated and is shown below.
Resources are shown in alphabetical order for quick scanning. Green resources
will be created (or destroyed and then created if an existing resource
exists), yellow resources are being changed in-place, and red resources
will be destroyed. Cyan entries are data sources to be read.

Note: You didn't specify an "-out" parameter to save this plan, so when
"apply" is called, Terraform can't guarantee this is what will execute.

- aws_s3_bucket.terraform_tutorial_tfsate


Plan: 0 to add, 0 to change, 1 to destroy.
```

実行計画に問題がなさそうであれば、`terraform destroy` を実行してみましょう。

```
% terraform destroy
Do you really want to destroy?
  Terraform will delete all your managed infrastructure.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

aws_s3_bucket.terraform_tutorial: Refreshing state... (ID: com.github.53ningen.terraform.tutorial)
aws_s3_bucket.terraform_tutorial: Destroying...
aws_s3_bucket.terraform_tutorial: Destruction complete

Destroy complete! Resources: 1 destroyed.
```

`terraform destroy` を実行すると本当にリソースを削除して良いのか聞かれます。`yes` と入力すると、ここまでに作った S3 bucket は削除されます。

### 2-4. tf ファイルをフォーマットする

`terrform fmt` でファイルをフォーマットできます

```
% terraform fmt
remote_state.tf
variable.tf
```

### 2-5. terraform 基本コマンドのまとめ

以上で terraform の基本的な 5 コマンドは理解できたかと思います。まとめると以下のようになります。

- `terraform validate`: `.tf` ファイルのシンタックスを検証する
- `terraform plan`: terraform がこれから行う実行計画を表示する。`--destroy` オプションで destroy 時の実行計画を表示できる。
- `terraform apply`: plan を実行する。
- `terraform destroy`: terraform で作ったリソースを破棄する
- `terraform fmt`: tf ファイルをフォーマットする

**基本的には `apply` の前にかならず `plan` で実行計画を確認することを徹底してください。** `destroy` は実際にはほとんど使うことはないと思います。また、`terraform.tfstate` を git で管理したり、他人の目に触れるような状態にすることをお忘れなく。

## 3. remote state を管理する

`terraform.tfstate` ファイルはリモートの状態を管理するファイルです。`apply` が成功すると、どのようなリソースがどのようなパラメータで作成されたのかを細かく記録しています。

`tfstate` ファイルを誤って削除すると terraform はリモートにリソースが存在しないと認識して、`tf` ファイルに定義された構成を新規作成しようとしてしまいます。しがって何らかの形で、このファイルを管理する必要があるのですが、秘匿情報が多分に含まれているため単純に git で管理するわけにはいきません。

管理する方法は何通りかあるのですが、ここでは private な S3 bucket を使ってこのファイルを管理する方法をご紹介します。

### 3-1. tfsate 管理用 S3 bucket の作成

S3 bucket の作成は前節でやったのでもうきっと理解できていると思います。復習がてらやってみましょう。`remote_state.tf` という名前で次のようなファイルを作ってみましょう。

```
resource "aws_s3_bucket" "terraform_tutorial_tfsate" {
    bucket = "com.github.53ningen.terraform.tutorial.tfstate" # S3 bucket 名は global で一意になるように
    acl = "private"
    versioning {
        enabled = true
    }
}
```

`terraform plan` で実行計画を確認したのち、`terraform apply` で bucket を作成します。terraform 公式ドキュメントによると `versioning` を有効にすることが推奨されています。

### 3-2. tfstate 管理設定を行う

無事 S3 bucket が作成されたら `terraform remote config` コマンドを使って tfstate ファイルの管理設定を行います。次のコマンドの `bucket` や `access_key` などは自分のものに適宜変更してください。

```
% terraform remote config \
    -backend=S3 \
    -backend-config="bucket=com.github.53ningen.terraform.tutorial.tfstate" \
    -backend-config="region=ap-northeast-1" \
    -backend-config="key=terraform.tfstate" \
    -backend-config="access_key=${access_key}" \
    -backend-config="secret_key=${ecret_key}"
Remote state management enabled
Remote state configured and pulled.
```

ここで `key` というのは S3 上でどのような名前で tfstate ファイルを管理するかという指定になります。今コマンドが無事通るとカレントディレクトリにあった `terraform.tfstate` はきっと `.terraform` 下に移動するかと思います。

### 3-3. remote に tfstate を push する

さて、管理設定が無事おわったら S3 に tfstate ファイルを転送しておきましょう。

```
% terraform remote push
State successfully pushed!
```

リモートへの `terraform apply` を行った場合は必ず `terraform remote push` を行いましょう。

### 3-4. remote から tfstate を pull する

普通にいかのような感じになります。複数人での開発で、他人が `apply` したあとの remote state を反映させたい場合などに使います。

```
% terraform remote pull
Local and remote state in sync
```

## 4. より高度なリソース定義を行う

### 4-1. 変数を用いる

aws の `access_key` や `secret_key` を `variable.tf` に直接書き込んでいますが、変数という機能を使えば、実行時に指定することができます。

```
provider "aws" {
  region = "ap-northeast-1"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

variable "access_key" {}
variable "secret_key" {}

```

このようにした上で、`terraform plan` を実行すると各パラメータとしてどの値をとるかを対話式に尋ねられます。

```
% terraform plan
var.access_key
  Enter a value: hoge

var.secret_key
  Enter a value: fuga

Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.

...以下略
```

また、次のように変数のデフォルト値を指定しておくこともできます。

```
provider "aws" {
  region = "${var.region}"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "ap-northeast-1"
}

```

### 4-2. 環境変数を用いる

CLI から `access_key` や `secret_key` を毎回指定するのも面倒なので、環境変数を用いると楽そうです。terraform では `TF_VAR_` というプレフィックスがついた環境変数を `.tf` ファイルの中で用いることができます。さっそく、これを用いて `access_key`, `secret_key` を環境変数から取ってくるように変更しましょう。

```
% echo 'export TF_VAR_MY_AWS_ACCESS_KEY=XXXXXXXXXXX' >> ~/.bash_profile
% echo 'export TF_VAR_MY_AWS_SECRET_KEY=XXXXXXXXXXX' >> ~/.bash_profile
% source ~/.bash_profile
```

続いて `variable.tf` を以下のように変更しましょう

```
provider "aws" {
  region = "${var.region}"
  access_key = "${var.MY_AWS_ACCESS_KEY}"
  secret_key = "${var.MY_AWS_SECRET_KEY}"
}

variable "MY_AWS_ACCESS_KEY" {}
variable "MY_AWS_SECRET_KEY" {}
variable "region" {
  default = "ap-northeast-1"
}
```

`terraform plan` を変数指定なしで利用できるようになっていれば、無事環境変数の利用ができているということになります。

### 4-3. 依存管理のあるリソース定義を行う

より複雑なリソースを構成するときには、リソース同士に依存関係が生じます。たとえば terraform で作成した IAM ユーザーにポリシーをアタッチしたいときに、リソース間に依存が生じていると思います。

いま、 IAM ユーザー `cocoa` さんを作成し `IAMReadOnlyAccess` ポリシーをアタッチしたいとします。その場合の `.tf` ファイルは以下のように記述すれば OK です。

```
# IAM ユーザーの作成
resource "aws_iam_user" "cocoa" {
  name = "cocoa"
  path = "/"
}

# IAM ポリシーのアタッチ
resource "aws_iam_policy_attachment" "IAMReadOnlyAccess-policy-attachment" {
  name       = "IAMReadOnlyAccess-policy-attachment"

  # IAMReadOnlyAccess の ARN
  policy_arn = "arn:aws:iam::aws:policy/IAMReadOnlyAccess"
  groups     = []

  # 上で定義した cocoa ユーザーの name を参照している
  users      = ["${aws_iam_user.cocoa.name}"]
  roles      = []
}
```

`terraform plan` を実行すると依存関係が解決されていることがわかるでしょう。

```
% terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.

aws_s3_bucket.terraform_tutorial_tfsate: Refreshing state... (ID: com.github.53ningen.terraform.tutorial.tfstate)

The Terraform execution plan has been generated and is shown below.
Resources are shown in alphabetical order for quick scanning. Green resources
will be created (or destroyed and then created if an existing resource
exists), yellow resources are being changed in-place, and red resources
will be destroyed. Cyan entries are data sources to be read.

Note: You didn't specify an "-out" parameter to save this plan, so when
"apply" is called, Terraform can't guarantee this is what will execute.

+ aws_iam_policy_attachment.IAMReadOnlyAccess-policy-attachment
    name:             "IAMReadOnlyAccess-policy-attachment"
    policy_arn:       "arn:aws:iam::aws:policy/IAMReadOnlyAccess"
    users.#:          "1"
    users.3920907786: "cocoa"

+ aws_iam_user.cocoa
    arn:           "<computed>"
    force_destroy: "false"
    name:          "cocoa"
    path:          "/"
    unique_id:     "<computed>"


Plan: 2 to add, 0 to change, 0 to destroy.
```

### 4-4. 設定ファイルを使う

複雑なリソースを管理するときには設定だけをまとめた設定ファイルが使えると便利そうです。 terraform には設定ファイルを使う仕組みも備わっています。今回は AWS のリージョン指定を設定ファイルに切り出しましょう。`variable.tf` の `region` 変数から default 値を削除してください。

```diff
provider "aws" {
  region = "${var.region}"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

variable "access_key" {}
variable "secret_key" {}
variable "region" {
-  default = "ap-northeast-1"
}
```

そして `config.tfvars` という名前で次のように設定を記述しましょう。

```
region = "ap-northeast-1"

```

あとは `terraform plan` や `terraform apply` 時に設定ファイルを指定してあげれば OK です。設定ファイルの指定は `-var-file=` オプションを使います。

```
% terraform plan -var-file=./config.tfvars
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.

\# 以下略
```

### 4-5. 出力を行う

`terrform apply` 後に作成されたリソースの ARN が知りたい場合などは `output` という機能を使うとよいでしょう。たとえば先ほど作成した cocoa ユーザーの ARN を出力させるには次のようにすれば OK です。

```diff
resource "aws_iam_user" "cocoa" {
  name = "cocoa"
  path = "/"
}

# IAM policy attatchments

resource "aws_iam_policy_attachment" "IAMReadOnlyAccess-policy-attachment" {
  name       = "IAMReadOnlyAccess-policy-attachment"
  policy_arn = "arn:aws:iam::aws:policy/IAMReadOnlyAccess"
  groups     = []
  users      = ["${aws_iam_user.cocoa.name}"]
  roles      = []
}

+ output "cocoa_arn" {
+   value = "${aws_iam_user.cocoa.arn}"
+ }
```

`terraform plan`, `terraform apply` を実行してみましょう

```
% terraform apply
aws_iam_user.cocoa: Refreshing state... (ID: cocoa)
aws_s3_bucket.terraform_tutorial_tfsate: Refreshing state... (ID: com.github.53ningen.terraform.tutorial.tfstate)
aws_iam_policy_attachment.IAMReadOnlyAccess-policy-attachment: Refreshing state... (ID: IAMReadOnlyAccess-policy-attachment)

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.

Outputs:

cocoa_arn = arn:aws:iam::XXXXXXXXXXXX:user/cocoa
```

しっかりと ARN が出力されていることが確認できます。

## 5. モジュールと複数のステージへの対応

terraform はカレントディレクトリに置かれている `.tf` ファイルを実行するというとても単純なふるまいを持っています。しかし複数ディレクトリに構造化してファイルを保存したい場合や、複数のステージを作るためにパラメータだけ変えて呼び出したいなどさまざまに理由により、異なるディレクトリ下にあるものを呼び出したいことがあるでしょう。そのときに使えるのが、モジュールという機能です。

### 5-1. モジュールの利用の基礎

モジュールを試すためにまずは以下のようなディレクトリ構造を作りましょう。

```
% tree
.
├── dev
│   ├── modules.tf
│   └── variable.tf
├── modules
│   └── s3
│       └── s3.tf
└── prod
    ├── modules.tf
    └── variable.tf
```

modules に それぞれのリソースを定義していくことになります。今回はサンプルとして dev/prod 向きそれぞれの S3 bucket を作ってみましょう。まずは `modules/s3/s3.tf` の中身から。

```
resource "aws_s3_bucket" "tutorial_s3" {
  bucket = "${var.env}.53nigen.github.com.tutorial.s3" # S3 bucket 名は global で一意になるように
  acl    = "private"

  versioning {
    enabled = false
  }
}

variable "env" {}
```

続いて `dev/modules.tf`, `prod/modules.tf` というファイルにそれぞれ、`modules/s3` 以下のファイルを取り込んで実行するコードを書いてみましょう。`modules` という新たな構文を利用します。

```
module "s3" {
  source = "../modules/s3"  # ここで読み込むパスを指定

  env = "${var.env}"
}

variable "env" {
  default = "dev"  # prod のほうには prod と書いてください
}
```

最後に、`dev/variable.tf`, `prod/variable.tf` に対して、AWS を操作する設定値などを記述します。

```
provider "aws" {
  region = "${var.region}"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "ap-northeast-1"
}
```

これで準備が整いました。`dev` ディレクトリ下から実行すると dev 環境向けの構成、`prod` ディレクトリ下から実行すると prod 環境向けの構成を管理することができます。 dev 環境向けのリソースを実際に作ってみましょう。 `dev` ディレクトリに移動して、`terraform get` を実行して依存モジュールのコードを取り込みを前もってやっておく以外は、いままでと基本的には同じ操作で OK です。

```
% cd dev/                                                                                                     % terraform get
Get: file:///Users/*******/tutoterra/sample/modules/s3
% terraform plan                                                                                              Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but
will not be persisted to local or remote state storage.


The Terraform execution plan has been generated and is shown below.
Resources are shown in alphabetical order for quick scanning. Green resources
will be created (or destroyed and then created if an existing resource
exists), yellow resources are being changed in-place, and red resources
will be destroyed. Cyan entries are data sources to be read.

Note: You didn't specify an "-out" parameter to save this plan, so when
"apply" is called, Terraform can't guarantee this is what will execute.

+ module.s3.aws_s3_bucket.tutorial_s3
    acceleration_status:           "<computed>"
    acl:                           "private"
    arn:                           "<computed>"
    bucket:                        "dev.53nigen.github.com.tutorial.s3"
    force_destroy:                 "false"
    hosted_zone_id:                "<computed>"
    policy:                        "<computed>"
    region:                        "<computed>"
    request_payer:                 "<computed>"
    versioning.#:                  "1"
    versioning.2972667452.enabled: "false"
    website_domain:                "<computed>"
    website_endpoint:              "<computed>"


Plan: 1 to add, 0 to change, 0 to destroy.
% terraform apply
module.s3.aws_s3_bucket.tutorial_s3: Creating...
  acceleration_status:           "" => "<computed>"
  acl:                           "" => "private"
  arn:                           "" => "<computed>"
  bucket:                        "" => "dev.53nigen.github.com.tutorial.s3"
  force_destroy:                 "" => "false"
  hosted_zone_id:                "" => "<computed>"
  policy:                        "" => "<computed>"
  region:                        "" => "<computed>"
  request_payer:                 "" => "<computed>"
  versioning.#:                  "" => "1"
  versioning.2972667452.enabled: "" => "false"
  website_domain:                "" => "<computed>"
  website_endpoint:              "" => "<computed>"
module.s3.aws_s3_bucket.tutorial_s3: Creation complete

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

The state of your infrastructure has been saved to the path
below. This state is required to modify and destroy your
infrastructure, so keep it safe. To inspect the complete state
use the `terraform show` command.

State path: terraform.tfstate
```

### 5-2. 複数ステージへモジュールを用いたの対応例

このようなモジュールの機能を用いて dev や production など複数のステージ向けにデプロイできるように更生する場合、ディレクトリ構造として特に決まっているものはないのですが、優れたものとして以下のような形があるので、参考にしながら進めると良いと思います。

- [オレオレ terraform ディレクトリ構成ベストプラクティス](http://qiita.com/eigo_s/items/02264a5a7ad0ff6c5387)
- [Terraform におけるディレクトリ構造のベストプラクティス](http://dev.classmethod.jp/devops/directory-layout-bestpractice-in-terraform/)

## 6. 既存の AWS リソースを terraform で管理する

### 6-1. terraforming の導入

terraforming は既存の AWS リソースにアクセスして terraform のコードを生成してくれたり、tfstate を生成してくれたりするツールです。導入は `Gemfile` に次のように書いて、`bundle install` すれば OK です。

```
source "https://rubygems.org"

gem 'terraforming', '0.10.0'
```

### 6-2. 既存の IAM user を terraform で管理する

AWS アカウントを持っているほぼ全ての人は、すでに IAM user などのリソースを持っていると思います。従って、まずここを terraform で管理する形にしましょう。次のようにすると現在の IAM user リソースに応じた HCL が出力されます。

```sh
% terraforming iamu --profile default                                                                                                                                 resource "aws_iam_user" "gomi_ningen" {
    name = "gomi_ningen"
    path = "/"
}
```

これをファイルに書き出しましょう。

```
resource "aws_iam_user" "gomi_ningen" {
    name = "gomi_ningen"
    path = "/"
}
```

またリモートの状態を手元の `.tfstate` ファイルに反映させるなければ、terraform はリソースを新規に作成しようとしてしまいます。そのために以下のようにしておきましょう。

`terraforming iamu --tfstate --profile default --merge=.terraform/terraform.tfstate`

出力をみて問題なさそうであれば、このコマンドに `--overwrite` オプションを付加して反映させます。こののちに `terraform plan` をして差分がでなければ、晴れて IAM user の管理を terraform に移行できたことになります。

`terraform plan` 時にもしも、 **destroy** されるリソースが表示されたとしたら、既存のリソースやシステムが破壊される可能性がありますので、特に慎重に操作してください。また、IAM policy などについては JSON の改行位置やインデントなどが差分として出やすいので、悩んだときはそのあたりが既存のポリシー設定と食い違っていないか確認することをお勧めします。

さて、terraforming はよく使われるほとんどの AWS リソースに対応しているため、まずはこれを使ってできるところまで terraform に移行すると良いでしょう。v0.7.0 では以下のようなものに対応しています。

```
% terraforming help
Commands:
  terraforming asg             # AutoScaling Group
  terraforming dbpg            # Database Parameter Group
  terraforming dbsg            # Database Security Group
  terraforming dbsn            # Database Subnet Group
  terraforming ec2             # EC2
  terraforming ecc             # ElastiCache Cluster
  terraforming ecsn            # ElastiCache Subnet Group
  terraforming eip             # EIP
  terraforming elb             # ELB
  terraforming help [COMMAND]  # Describe available commands or one specific command
  terraforming iamg            # IAM Group
  terraforming iamgm           # IAM Group Membership
  terraforming iamgp           # IAM Group Policy
  terraforming iamip           # IAM Instance Profile
  terraforming iamp            # IAM Policy
  terraforming iampa           # IAM Policy Attachment
  terraforming iamr            # IAM Role
  terraforming iamrp           # IAM Role Policy
  terraforming iamu            # IAM User
  terraforming iamup           # IAM User Policy
  terraforming igw             # Internet Gateway
  terraforming lc              # Launch Configuration
  terraforming nacl            # Network ACL
  terraforming nat             # NAT Gateway
  terraforming nif             # Network Interface
  terraforming r53r            # Route53 Record
  terraforming r53z            # Route53 Hosted Zone
  terraforming rds             # RDS
  terraforming rs              # Redshift
  terraforming rt              # Route Table
  terraforming rta             # Route Table Association
  terraforming s3              # S3
  terraforming sg              # Security Group
  terraforming sn              # Subnet
  terraforming sqs             # SQS
  terraforming vgw             # VPN Gateway
  terraforming vpc             # VPC
```

### 6-3. terraform のコードを管理するリポジトリを作成する

個人アカウントの aws 構成を open な github repository に配置するのは、はばかられるので code commit リポジトリを作成しておくと良いでしょう。

```
# このアカウントのAWS構成を管理するterraformコードを配置するレポジトリ
resource "aws_codecommit_repository" "my-terraform" {
  repository_name = "my-terraform"
  description = "terrform"
}
```

code commit 上に作成したレポジトリにアクセスするためポリシーのアタッチ、ならびに公開鍵登録も terraform を使って行うことができます。

```
#...

resource "aws_iam_policy_attachment" "my_codecommit_policy_attachment" {
  name       = "my_terraform_codecommit_policy_attachment"
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeCommitPowerUser"
  groups     = []
  users      = ["${aws_iam_user.gomi_ningen.name}"]
  roles      = []
}

resource "aws_iam_user_ssh_key" "gomi_ningen" {
    username = "${aws_iam_user.gomi_ningen.name}"
    encoding = "PEM"
    public_key = <<EOF
######################
##### public_key #####
######################
EOF
}

output "aws_iam_user_ssh_key.gomi_ningen.ssh_key_id"  {
    value = "${aws_iam_user_ssh_key.gomi_ningen.ssh_public_key_id}"
}
```

この状態で `terraform plan`, `terraform apply` をしてみます

```
% terraform apply                                                                                                                                                     aws_s3_bucket.my_terraform_tfstate: Refreshing state... (ID: com.53ningen.aws.terraform.tfstates)
aws_codecommit_repository.my-terraform: Refreshing state... (ID: my-terraform)

# 中略

Outputs:

aws_iam_user_ssh_key.gomi_ningen.ssh_key_id = XXXXXXXXXXXX
```

すると以上のように作成された `ssh_public_key_id` が出力されるので、あとはこいつを `~/.ssh/config` に反映させれば手元のマシンから作成した code commit レポジトリに疎通がとれるようになります。

```
Host git-codecommit.*.amazonaws.com
  User XXXXXXXXXXXX
  IdentityFile ~/.ssh/id_rsa
```

### 6-4. terraform import

T.B.D

## 7. 構成管理方法の整理

### 7-1. 個人開発の場合

個人の AWS リソースを管理する場合は大きく分けて次の 2 つの方法があるかと思います

- `.tfstate` ごと git で管理して、 code commit にぶちこむ
- `.tfstate` は S3 で管理、コードは code commit で管理

### 7-2. チーム開発の場合

- `.tfstate` はセキュリティ上の理由から S3 で管理することが望ましい
- `.tfstate` やアクセスキーなどを含むものをコミットせず、GitHub Enterprise, code commit, GitHub private repository に push する
