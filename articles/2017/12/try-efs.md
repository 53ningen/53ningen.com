---
slug: try-efs
title: EFS を使ってみる
category: programming
date: 2017-12-25 15:00:27
tags: [AWS,EFS]
pinned: false
---

- マネジメントコンソールから us-east-1 に作った VPC とサブネットを選択して良き感じに EFS を作る
- 次のコマンドでマウントする

```
$ sudo yum -y update
$ sudo reboot 

$ sudo yum -y install nfs-utils
$ sudo mkdir -p /mnt/nfstest
$ sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 fs-7cbe1134.efs.us-east-1.amazonaws.com:/ /mnt/nfstest/
$ df -Ph
Filesystem                                 Size  Used Avail Use% Mounted on
devtmpfs                                   484M   60K  484M   1% /dev
tmpfs                                      494M     0  494M   0% /dev/shm
/dev/xvda1                                 7.8G  1.2G  6.6G  15% /
fs-7cbe1134.efs.us-east-1.amazonaws.com:/  8.0E     0  8.0E   0% /mnt/nfstest
```

- 起動時にマウントさせる方法は次の2つがある
  - fstab に追加する
  - EC2 UserData をつかう
  - 詳細は [自動的にマウントする - Amazon Elastic File System](https://docs.aws.amazon.com/ja_jp/efs/latest/ug/mount-fs-auto-mount-onreboot.html) を参照
- [Amazon EFS: 仕組み - Amazon Elastic File System](https://docs.aws.amazon.com/ja_jp/efs/latest/ug/how-it-works.html)
- [How to Set Up DNS Resolution Between On-Premises Networks and AWS Using AWS Directory Service and Amazon Route 53 | AWS Security Blog](https://aws.amazon.com/jp/blogs/security/how-to-set-up-dns-resolution-between-on-premises-networks-and-aws-using-aws-directory-service-and-amazon-route-53/)
