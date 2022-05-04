---
title: nc コマンドでチャットする
category: programming
date: 2014-08-25 05:36:53
tags: [network]
pinned: false
---

サーバー側

```
# 20001 ポートで待ち受け
$ nc -l -p 20001
```

クライアント側

```
$ telnet 192.168.xx.xx 20001
Trying 192.168.xx.xx...
Connected to gomi-web01.
Escape character is '^]'.
hoge
fuga
```

楽しいチャットルームができた
