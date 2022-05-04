---
title: 複数環境に対応する terraform のディレクトリ構成と tfstate の管理
category: programming
date: 2016-10-05 03:34:41
tags: [AWS, terraform]
pinned: false
---

terraform はディレクトリ内のすべての tf ファイルを実行対象とするので、環境ごとに変数を変えるなどの際には module という機能を使うと良い。このときのディレクトリ構成は terraform が公式でこれというものは定めていないので各々やっていく必要があるが、よさそうな構成は以下の 2 つの記事の内容だった。

- [http://dev.classmethod.jp/devops/directory-layout-bestpractice-in-terraform/](http://dev.classmethod.jp/devops/directory-layout-bestpractice-in-terraform/)
- [http://qiita.com/eigo_s/items/02264a5a7ad0ff6c5387](http://qiita.com/eigo_s/items/02264a5a7ad0ff6c5387)

後者のほうがよりシンプルで個人的には好き。さて、これらのディレクトリ構成をとった場合、 tfstate はそれぞれの環境ごとに作成される。この管理をどうするかという問題が発生する。

基本的には単純に `terraform remote config` コマンドをそれぞれのディレクトリに入った瞬間叩くという運用になるかと思いますが、ちとダルいので以下のようなシェルスクリプトを書くと良さげ。

```
readonly BUCKET=  #BUCKET_NAME
readonly ENV=`pwd | rev | awk -F \/ '{print $1}' | rev`
readonly REMOTE_STATE=${ENV}/terraform.tfstate

terraform remote config -backend=S3 \
  -backend-config="bucket=${BUCKET}" \
  -backend-config="region=ap-northeast-1" \
  -backend-config="key=$ENV/terraform.tfstate" \
  -backend-config="access_key=${TF_VAR_aws_iam_access_key}" \
  -backend-config="secret_key=${TF_VAR_aws_iam_secret_key}"
```

それぞれ dev から実行すれば dev/terraform.tfstate を、 prod から実行すれば prod/terraform.tfstate を remote state として取り扱えるようになる。

# その他

multiple provider 機能も使わねばならんかったのでリンクだけ貼っておく

- [http://dev.classmethod.jp/cloud/aws/vpn-connection-with-terraform-multiple-providers-with-vyos/](http://dev.classmethod.jp/cloud/aws/vpn-connection-with-terraform-multiple-providers-with-vyos/)
