---
slug: terraforming-tutorial
title: terraformingを試す
category: programming
date: 2016-10-03 03:00:20
tags: [AWS, terraform]
pinned: false
---

AWS の管理に terraform を導入したいけれど、既存のリソースはもうすでに存在しちゃっているということは、まあよくあると思います。手で `tf` ファイルと `tfstate` ファイルをいじればなんとかやってやれないことはないですが、幸いなことにこれを支援してくれるツールが存在します。それが [terraforming](https://github.com/dtan4/terraforming) です。

# terrraforming の導入

terraforming を取ってくる Gemfile 書いて `bundle install` すれば、お k。

# terraforming の使い方

とても簡単。`bundle exec terraforming [service_name] --profile=[$PROFILE]`で既存の aws の構成通りの tf ファイルのコードを生成してくれます。以下のような具合。

```
% terraforming iamu --profile default                                                                                                              (git)-[cli_app_tokens_register]
resource "aws_iam_user" "gomi_ningen" {
    name = "gomi_ningen"
    path = "/"
}

...
```

これを `tf` ファイルに追記すればよいのですが、 `tfstate` にこれらのリソースがあることが記されていないため、このまま `plan`, `apply` をすると既存のものを無視して構築を始めてしまいます。これを防ぐためには `tfstate` を適切に更新して、 `plan` で差分が出ない状況に持っていく必要があります。そこで `terraforming iam --profile default --tfstate --merge=./terraform.tfstate` とすると既存の `tfstate` に既存の AWS インフラの state を追記してもらえます。こわければ `tfstate` の backup を取っておいたほうが良いかと思います。

とても良いですねー。
