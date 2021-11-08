---
slug: terraform-tutorial
title: terraformを試す
category: programming
date: 2016-10-01 03:42:14
tags: [AWS, terraform]
pinned: false
---

[terraform](https://www.terraform.io/)のチュートリアルを見ながら、いろいろ試してみた記録その１。結構使い勝手はよさそうなので、こういうツールでちゃんと AWS のリソースを管理していきたい。

# terraform の導入

導入は `brew install terraform` で OK

# EC2 インスタンスを立てる, 更新する, 破棄する

とりあえず簡単なところから。以下のファイルを example.tf という名前で作成する。

```
provider "aws" {
  access_key = "..."
  secret_key = "..."
  region     = "us-east-1"
}

resource "aws_instance" "example" {
  ami           = "ami-13be557e"
  instance_type = "t2.micro"
}
```

で、 `terraform plan` を実行するとこれから AWS に対して何を行うのかを表示してくれる。なにもないまっさらな状態であれば以下のような出力になるだろう。

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

+ aws_instance.example
    ami:                      "ami-13be557e"
    availability_zone:        "<computed>"
    ebs_block_device.#:       "<computed>"
    ephemeral_block_device.#: "<computed>"
    instance_state:           "<computed>"
    instance_type:            "t2.micro"
    key_name:                 "<computed>"
    network_interface_id:     "<computed>"
    placement_group:          "<computed>"
    private_dns:              "<computed>"
    private_ip:               "<computed>"
    public_dns:               "<computed>"
    public_ip:                "<computed>"
    root_block_device.#:      "<computed>"
    security_groups.#:        "<computed>"
    source_dest_check:        "true"
    subnet_id:                "<computed>"
    tenancy:                  "<computed>"
    vpc_security_group_ids.#: "<computed>"


Plan: 1 to add, 0 to change, 0 to destroy.
```

`terraform apply` を実行すると、実際にリソースが作成される。さっきの `example.tf` を編集してたとえば `t1.micro` にして、 `terraform plan` をするとちゃんと `instance_type` に差分がでる旨の表示が出る。スタックの削除は `terraform destroy` で行ける。

# リソースの依存性を扱う

以下のように、Elastic IP を設定する。Elastic IP に対するパラメタは `instance` しかない。そこには `${aws_instance.example.id}` とあるがこれは、 EC2 インスタンスの id が埋め込まれる変数の役割を持つ。

```
resource "aws_eip" "ip" {
    instance = "${aws_instance.example.id}"
}

resource "aws_instance" "example" {
  ami           = "ami-13be557e"
  instance_type = "t2.micro"
}
```

もうすでに EC2 インスタンスは立ち上がっており、 aws_eip の部分だけ追記をして `terraform plan` を実行すると以下のようになり、この挙動がわかりやすい。

```
+ aws_eip.ip
    allocation_id:     "<computed>"
    association_id:    "<computed>"
    domain:            "<computed>"
    instance:          "i-1a86be2b"
    network_interface: "<computed>"
    private_ip:        "<computed>"
    public_ip:         "<computed>"
```

# プロビジョニング

以下のように provisioner 内の command を設定することによりプロビジョニングを行える

```
resource "aws_instance" "example" {
  ami           = "ami-13be557e"
  instance_type = "t2.micro"

  provisioner "local-exec" {
    command = "echo ${aws_instance.example.public_ip} > file.txt"
  }
}
```

まっさらな状態でこれを実行すると、file.txt がちゃんと生成される

# 変数

`variables.tf` なるファイルを作る

```
variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "us-east-1"
}
```

そして、`example.tf` の provider を以下のように変えてみよう

```
provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}
```

`variables.tf` で定義してある `region` についての挙動はもうおわかりだろう。問題は `access_key` と `secret_key` であるが、これは default が設定されていないので `apply` 時に渡す。たとえば `terraform apply -var 'access_key=...' -var 'secret_key=...'` のような具合だ。

また conf ファイルから読み込みたければ、たとえば `dev.tfvars` という名前で以下のようなファイルを作成し `terraform apply -var-file ./dev.tfvars` を実行すれば良い。

```
access_key = "foo"
secret_key = "bar"
```

環境変数からの呼び出しは `TF_VAR_access_key` などという名前をつければいける。

# 出力

`terraform apply` を実行した結果のうち、重要な値の出力を得たい場合は以下のような形のコードを書けばよい

```
output "ip" {
    value = "${aws_eip.ip.public_ip}"
}
```

すると apply 時に以下のような出力が得られる

```
Outputs:

ip = 52.54.92.30
```

また apply 後に出力だけ得たい場合は `terraform output ip` などとすれば良い。
