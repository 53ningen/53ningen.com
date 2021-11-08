---
slug: nginx-mirror-module
title: nginx mirror module を使う
category: programming
date: 2018-11-26 21:56:09
tags: [nginx]
pinned: false
---

nginx 1.14 から HTTP リクエストを複製してくれる mirror モジュールが標準で使えるようになった。これは動作テストに便利。使い方も簡単なのでまとめておく。

- 公式ドキュメント: [Module ngx_http_mirror_module](http://nginx.org/en/docs/http/ngx_http_mirror_module.html)


## 環境

```
$ cat /etc/system-release
CentOS Linux release 7.5.1804 (Core)
```

## nginx のインストール

```
$ vi /etc/yum.repos.d/nginx.repo
$ nginx -v
nginx version: nginx/1.14.1
[centos@ip-172-31-34-177 ~]$ cat /etc/yum.repos.d/nginx.repo
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1

$ sudo vi /etc/yum.repos.d/nginx.repo
$ sudo yum update -y
...
$ sudo yum install nginx -y
...
$ nginx -v
nginx version: nginx/1.14.1

$ sudo systemctl start nginx
$ curl localhost -I
HTTP/1.1 200 OK
Server: nginx/1.14.1
Date: Mon, 26 Nov 2018 11:44:41 GMT
Content-Type: text/html
Content-Length: 612
Last-Modified: Tue, 06 Nov 2018 14:04:51 GMT
Connection: keep-alive
ETag: "5be19f83-264"
Accept-Ranges: bytes

$ sudo systemctl status nginx
● nginx.service - nginx - high performance web server
   Loaded: loaded (/usr/lib/systemd/system/nginx.service; disabled; vendor preset: disabled)
   Active: active (running) since Mon 2018-11-26 11:44:37 UTC; 9s ago
     Docs: http://nginx.org/en/docs/
  Process: 27406 ExecStart=/usr/sbin/nginx -c /etc/nginx/nginx.conf (code=exited, status=0/SUCCESS)
 Main PID: 27407 (nginx)
   CGroup: /system.slice/nginx.service
           ├─27407 nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
           └─27408 nginx: worker process

Nov 26 11:44:37 ip-172-31-34-177.ap-northeast-1.compute.internal systemd[1]: Starting nginx - high performance web server...
Nov 26 11:44:37 ip-172-31-34-177.ap-northeast-1.compute.internal systemd[1]: PID file /var/run/nginx.pid not readable (yet?) after start.
Nov 26 11:44:37 ip-172-31-34-177.ap-northeast-1.compute.internal systemd[1]: Started nginx - high performance web server.
```

## nginx mirror モジュールを使う

nginx.conf を次のように設定

```
    location / {
        proxy_pass http://{ミラーリング先のホスト};
    }
```

リクエストを送ってみる

```
[root@ip-172-31-34-177 ~]# curl localhost -I
HTTP/1.1 200 OK
Server: nginx/1.14.1
Date: Mon, 26 Nov 2018 12:24:44 GMT
Content-Type: text/html; charset=UTF-8
Content-Length: 166
Connection: keep-alive
Last-Modified: Thu, 05 Apr 2018 02:32:11 GMT
ETag: "605df-a6-56910bf30abcd"
Accept-Ranges: bytes
```

アクセスログがそれぞれのサーバーで以下のように出力される

```
# on 172-31-34-177
127.0.0.1 - - [26/Nov/2018:12:24:44 +0000] "HEAD / HTTP/1.1" 200 0 "-" "curl/7.29.0" "-"

# on 172-31-43-119
172.31.34.177 - - [26/Nov/2018:12:24:44 +0000] "HEAD / HTTP/1.0" 200 - "-" "curl/7.29.0"
```

