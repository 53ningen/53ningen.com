---
title: 多段 ssh 時に微妙にハマったメモ
category: programming
date: 2018-07-20 23:22:55
tags: [ssh]
pinned: false
---

private なネットワーク内に新しいサーバーを立て、踏み台を経由していつもどおり多段 ssh でログインしようと以下を設定

```
Host hoge-piyo001
  HostName hoge-piyo001
  ProxyCommand ssh -W %h:%p gomi-web001
```

ssh でログインしようとしたら以下ようなエラーメッセージ

```
$ ssh  xxx@hoge-piyo001
channel 0: open failed: administratively prohibited: open failed
stdio forwarding failed
ssh_exchange_identification: Connection closed by remote host
```

手元から一段ずつ入ってみると、入れる

```
$ ssh -A hoge-fuamidai001
Last login: Fri Jul 20 14:20:16 2018 from xx.xx.xx.xx
$ ssh xxx@hoge-piyo
Last login: Fri Jul 20 14:15:58 2018 from xx.xx.xx.xx
```

単純に踏み台の `/etc/hosts` を更新していないだけだった（が、10 分くらい溶かした）。
反省の意味を含めてまとめ。
