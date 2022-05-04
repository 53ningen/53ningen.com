---
title: Let's encrypt による HTTPS 対応
category: programming
date: 2018-02-12 02:02:05
tags: [nginx, letsencrypt]
pinned: false
---

## certbot のインストール

```
sudo yum install epel-release
sudo yum --enablerepo=epel install certbot
```

## 証明書の発行

以下のような形で OK

```
sudo certbot certonly --webroot -w /path/to/document/ -d "example.com"
```

## 証明書更新の自動化

root ユーザーの cron に以下を登録

```
0 2 15 * * /usr/bin/certbot renew && /bin/systemctl reload nginx
```
