---
title: Packer 入門
category: programming
date: 2018-06-23 16:04:24
tags: [Packer]
pinned: false
---

- マシンイメージを管理するためのツール
  - Hashicorp 製
- EC2, VMware, VirtualBox など向けのマシンイメージを作れる
- 主に [Packer ドキュメントのチュートリアル](https://www.packer.io/intro/getting-started/build-image.html)の手順部分のみを抜粋した

## インストール

```
$ brew install packer
$ packer -v
1.2.2
```

## 簡単なマシンイメージの作成

- ひとまず動くものを作っていく
- 以下のような json を適当なディレクトリ下に `example.json` という名前でおく

```json
{
  "variables": {
    "aws_access_key": "",
    "aws_secret_key": ""
  },
  "builders": [
    {
      "type": "amazon-ebs",
      "access_key": "{{user `aws_access_key`}}",
      "secret_key": "{{user `aws_secret_key`}}",
      "region": "us-east-1",
      "source_ami_filter": {
        "filters": {
          "virtualization-type": "hvm",
          "name": "ubuntu/images/*ubuntu-xenial-16.04-amd64-server-*",
          "root-device-type": "ebs"
        },
        "owners": ["099720109477"],
        "most_recent": true
      },
      "instance_type": "t2.micro",
      "ssh_username": "ubuntu",
      "ami_name": "packer-example {{timestamp}}"
    }
  ]
}
```

### テンプレートの validate と build

- `example.json` がマシンイメージを表すテンプレート
- 記述したテンプレートが不正なフォーマットでないかどうかは `packer validate` でチェックできる
- `packer build` でビルドできる
- `AWS_PROFILE=53ningen packer build` とすれば profile を指定できる

```
$ AWS_PROFILE=53ningen packer build ./example.json
amazon-ebs output will be in this color.

==> amazon-ebs: Prevalidating AMI Name: packer-example 1524579611
    amazon-ebs: Found Image ID: ami-6dfe5010
==> amazon-ebs: Creating temporary keypair: packer_5adf3d1b-b3f9-511d-e525-69a91252569b
==> amazon-ebs: Creating temporary security group for this instance: packer_5adf3d26-2760-38e1-ea30-eb13cc87dc0c
==> amazon-ebs: Authorizing access to port 22 from 0.0.0.0/0 in the temporary security group...
==> amazon-ebs: Launching a source AWS instance...
==> amazon-ebs: Adding tags to source instance
    amazon-ebs: Adding tag: "Name": "Packer Builder"
    amazon-ebs: Instance ID: i-01015a96015c7e859
==> amazon-ebs: Waiting for instance (i-01015a96015c7e859) to become ready...
==> amazon-ebs: Waiting for SSH to become available...
==> amazon-ebs: Connected to SSH!
==> amazon-ebs: Stopping the source instance...
    amazon-ebs: Stopping instance, attempt 1
==> amazon-ebs: Waiting for the instance to stop...
==> amazon-ebs: Creating the AMI: packer-example 1524579611
    amazon-ebs: AMI: ami-8a9327f5
==> amazon-ebs: Waiting for AMI to become ready...
==> amazon-ebs: Terminating the source AWS instance...
==> amazon-ebs: Cleaning up any extra volumes...
==> amazon-ebs: No volumes to clean up, skipping
==> amazon-ebs: Deleting temporary security group...
==> amazon-ebs: Deleting temporary keypair...
Build 'amazon-ebs' finished.

==> Builds finished. The artifacts of successful builds are:
--> amazon-ebs: AMIs were created:
us-east-1: ami-8a9327f5

$ # あるいは
$ export AWS_ACCESS_KEY_ID="anaccesskey"
$ export AWS_SECRET_ACCESS_KEY="asecretkey"
$ export AWS_DEFAULT_REGION="us-west-2"
$ packer build packer.json
```
