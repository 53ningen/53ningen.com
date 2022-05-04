---
title: .htpasswd ファイルの生成コマンドメモ
category: programming
date: 2018-02-03 02:39:57
tags: [httpd]
pinned: false
---

ごくたまにしかやらなすぎて毎回ググってるので、メモっておく

- document: https://httpd.apache.org/docs/2.4/programs/htpasswd.html

```
 htpasswd -n [user_name]
```

- `-n`: Don't update file; display results on stdout.

はい。
