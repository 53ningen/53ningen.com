---
slug: terraform-init-backend-config
title: バックエンドが S3 の terraform で init 時に profile 指定する
category: programming
date: 2018-02-10 20:58:34
tags: [AWS,terraform,S3]
pinned: false
---

複数のクレデンシャルを使っているときに、デフォルトじゃないものに切り替える方法、毎回忘れて history 見てるのでメモ。紛らわしい...。
以下のように [partial configuration](https://www.terraform.io/docs/backends/config.html#partial-configuration) を用いて profile 指定してあげれば良い。

```
terraform init -backend-config="profile=${aws_profile}"
```

ただ、backend に直接記述してしまえば、そもそもあまりこういう心配しなくて良い。

```
terraform {
  backend "s3" {
    bucket         = "******"
    key            = "******"
    dynamodb_table = "******"
    region         = "ap-northeast-1"
    shared_credentials_file = "~/.aws/credentials"
    profile = "53ningen"
  }
}
```

公式ドキュメント的には[このあたり](https://www.terraform.io/docs/backends/types/s3.html#configuration-variables)を参照のこと
