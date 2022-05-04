---
title: EC2 に既存のキーペアを追加する
category: programming
date: 2018-03-05 20:13:59
tags: [AWS, EC2]
pinned: false
---

今までマネジメントコンソール上で作ったものを手元に置いていたけど、普通に既存のキーペア使えた...。メモ。

> 情報ソース: [独自のパブリックキーを Amazon EC2 にインポートする](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-key-pairs.html#how-to-generate-your-own-key-and-import-it-to-aws)

- 利用可能な形式は以下の通り
  - OpenSSH パブリックキー形式 (~/.ssh/authorized_keys の形式)
  - Base64 でエンコードされた DER 形式
  - SSH パブリックキーファイル形式 ([RFC4716](http://tools.ietf.org/html/rfc4716) で指定)
- ネットワーク&セキュリティ/キーペアでインポート可能
- CLI 経由での import/delete も可能

```
$ aws ec2 import-key-pair --key-name hoge01 --public-key-material "..........."
{
    "KeyFingerprint": "55:fc:a0:84:ac:18:1a:20:e6:de:ee:e1:71:6b:5d:45",
    "KeyName": "hoge02"
}

$ # あるいは以下のようにもできる
$ cat ~/.ssh/id_rsa.pub | xargs -0 aws ec2 import-key-pair --key-name hoge02 --public-key-material
{
    "KeyFingerprint": "55:fc:a0:84:ac:18:1a:20:e6:de:ee:e1:71:6b:5d:45",
    "KeyName": "hoge02"
}

$ # 新規作成は create-key-pair を使う
$ aws ec2 create-key-pair --key-name hoge03
{
    "KeyFingerprint": "8e:eb:55:9d:ed:ee:6b:fb:b9:ab:3f:c7:29:60:91:5d:ca:37:c2:a3",
    "KeyMaterial": "-----BEGIN RSA PRIVATE KEY-----\n..........\n-----END RSA PRIVATE KEY-----",
    "KeyName": "hoge03"
}

$ # 一覧取得
$ aws ec2 describe-key-pairs
{
    "KeyPairs": [
        {
            "KeyFingerprint": "55:fc:a0:84:ac:18:1a:20:e6:de:ee:e1:71:6b:5d:45",
            "KeyName": "hoge01"
        },
        {
            "KeyFingerprint": "55:fc:a0:84:ac:18:1a:20:e6:de:ee:e1:71:6b:5d:45",
            "KeyName": "hoge02"
        },
        {
            "KeyFingerprint": "8e:eb:55:9d:ed:ee:6b:fb:b9:ab:3f:c7:29:60:91:5d:ca:37:c2:a3",
            "KeyName": "hoge03"
        }
    ]
}

$ # 削除も以下のような形で可能
$ aws ec2 delete-key-pair --key-name hoge01
```

- 削除に関しては既存のインスタンスに影響はないが、**Auto Scaling グループの起動設定で指定されているものを消してしまうとインスタンスの起動に失敗するので注意が必要** [#](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-key-pairs.html#delete-key-pair)
- **private キーを紛失した場合もアクセス手段は残されている** [#](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-key-pairs.html#replacing-lost-key-pair)

### 起動しているインスタンスからキーペアのパブリックキーを取得できる

> 情報ソース: [インスタンスからキーペアのパブリックキーを取得する](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-key-pairs.html#retrieving-the-public-key-instance)

```
[ec2-user@ip-172-31-89-247 ~]$ curl http://169.254.169.254/latest/meta-data/public-keys/0/openssh-key
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCIOKfNhAE51cD22VzMlyXOqu+39mfmR3ymJcEjttg2duh41gCfUMWJ/WbKlvv09keajQTJBmQlzauoneAuKLqKOCjjvS+2ORosM4JbMVvPlwU1/FZJTK7uPjCU+hoA3GAF2tSX6R0c77yruHQWnx5ByJC8QnG36Q82NdW9RFichvzDnnwEQl01GiTfnkIVQfwcOTMvDS+N0fvNWh8tKCeFmnXfIY5YWVfHQ6SdQBGRC4e0D/hzKZWRSy/Lin8vpajJNApj1tnBYN+J6T0Mi9GjVUGIvFM4kdaSu43G8rvUpmbj/82FT9HrmkCfCn9N/cRaFECZyiFuKdhllF0Xz/M1 hogehoge
```

- ほかにも色々な情報を取れる
- 詳細は [インスタンスメタデータの取得](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-instance-metadata.html#instancedata-data-retrieval) に載っている
