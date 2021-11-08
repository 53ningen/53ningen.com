---
slug: docker-wordpress
title: WordPress を PHP-FPM, NGINX, MariaDB の Docker イメージ上で動かす
category: programming
date: 2020-06-14 01:42:59
tags: [PHP, Docker]
pinned: false
---

53ningen.com は色々言われている WordPress で動いています。現在の足元は EC2 + ALB + RDS ですが ECS Fargate を使った構成に変更したいなと思う昨今。

移行の準備としてまず、新規の WordPress アプリケーションを php-fpm, nginx, mariadb の Docker イメージを利用して動く状態にすることで作業のイメージやつまづきどころをあらかじめ理解しておこうという流れをメモっておきます。

そもそもなんで WordPress なんて運用してるのと思う方も多いかと思います。流行りのヘッドレス CMS などにすれば軽くて安くて安全に運用にブログを運用できるのであたりまえですよね。

ただ、お金を払ってでも PHP, NGINX, MariaDB など複数のミドルウェアを扱う実践的かつ、自分も使うアプリケーションを手元で運用しつづけておきたいなという気持ちで WordPress を運用し続けてます。

手元で 10 年〜20 年単位のスパンで保守・運用し続けておく何かがあるとまあ良さそうですが、そのアプリケーションとして手頃かつ実用的だというハナシです。

そして、小さいインスタンスで動かしていて負荷がちょっとあがると簡単にスケールする様が見れて面白いのも良いですね。

## ステップ 1: NGINX + PHP-FPM で PHP が動作するところまで持っていく

横着せず、まずは NGINX と PHP-FPM のイメージを利用して `phpinfo()` の表示がでるところまで持っていきます。ディレクトリ構造はこんな感じ。

```
$ tree
.
├── docker-compose.yml
├── nginx
│   ├── Dockerfile
│   ├── default.conf
│   └── nginx.conf
└── wordpress
    ├── Dockerfile
    └── src
        └── index.php
```

`docker-composer.yml` はこんな感じ

```yaml
version: '3'
services:
  nginx:
    build: ./nginx
    ports:
      - 8080:80
    depends_on:
      - wordpress
    volumes:
      - ./nginx/html:/usr/share/nginx/html
      - ./logs/nginx:/var/log/nginx
  wordpress:
    build: ./wordpress
    volumes:
      - ./wordpress/src:/var/www/html
      - ./logs/wordpress/php:/var/log/php
```

NGINX の Dockerfile （wp-login.php に BASIC_AUTH かける .htpasswd はいい塩梅に設置しておく）

```dockerfile
FROM nginx:latest

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./.htpasswd /etc/nginx/.htpasswd
```

nginx.conf（色々お好みで設定いれているけど省略）

```
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    server_tokens off;

    include /etc/nginx/conf.d/*.conf;
}
```

default.conf（どうせあとで WordPress 突っ込むので BASIC_AUTH や wp-config への DENY とか入れてる）

```
server {
    index index.php index.html;
    server_name localhost;
    root /var/www/html;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 10d;
    }

    location ~* /wp-config.php {
        deny all;
    }

    location ~wp-login.php$ {
        include fastcgi_params;
        auth_basic "Basic Auth";
        auth_basic_user_file /etc/nginx/.htpasswd;
        fastcgi_pass wordpress:9000;
        fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
    }

    try_files $uri $uri/ /index.php?q=$uri&$args;

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass wordpress:9000;
        fastcgi_index index.php;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root html;
    }
}
```

PHP-FPM 側の Dockerfile はこんな感じ（あらかじめ必要そうなものを入れている）

```dockerfile
FROM php:7.4-fpm

RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd zip mysqli pdo_mysql

```

`wordpress/src/index.php` に `phpinfo();` を書いて、`docker-compose up` すれば晴れて `phpinfo` が表示されます。

## ステップ 2: WordPress が動く状態にする

### MariaDB の追加

- `docker-compose.yml` を次のようにして、MariaDB を追加する
  - `/var/lib/mysql` に `resources/mariadb` をマウントする
  - WordPress 用のデータベースやユーザーなども `enviroment` で指定して作っておく

```yaml
version: "3"
services:

  ...(nginx, wordpress の service 定義いろいろ省略)

  mariadb:
    build: ./mariadb
    ports:
      - "3306:3306"
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: example
    volumes:
      - ./resources/mariadb:/var/lib/mysql
      - ./logs/mariadb:/var/log/mysql

```

MariaDB の Dockerfile は `FROM mariadb:latest` で終わり

### WordPress アプリケーションの導入

- 基本的にダウンロードしてきて、配置してマウントして終わり
- ダウンロードと配置は `setup.sh` として以下のようにまとめた

```sh
#!/bin/bash

curl https://ja.wordpress.org/latest-ja.zip -o /tmp/latest-ja.zip
unzip /tmp/latest-ja.zip -d /tmp
mv /tmp/wordpress ./src
```

んで、`docker-compose.yml` は最終的に以下のようになる

- あたりまえだけど NGINX, PHP-FPM の双方に WordPress アプリケーションをマウントする
- ログファイルのディレクトリなどもいい塩梅にマウントしておく

```yaml
version: '3'
services:
  nginx:
    build: ./nginx
    ports:
      - 8080:80
    depends_on:
      - wordpress
    volumes:
      - ./src:/var/www/html
      - ./logs/nginx:/var/log/nginx
  wordpress:
    build: ./wordpress
    depends_on:
      - mariadb
    volumes:
      - ./src:/var/www/html
      - ./logs/wordpress/php:/var/log/php
  mariadb:
    build: ./mariadb
    ports:
      - '3306:3306'
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: example
    volumes:
      - ./resources/mariadb:/var/lib/mysql
      - ./logs/mariadb:/var/log/mysql
```

これで `docker-compose up --build` すれば WordPress がローカルで動くはず。とてもお手軽。しかし、本番で動いてる WordPress の移行がこんなにすんなりいくとは到底思えないので、この先実践に入ると苦しむのだろう...。

実際に移行の作業に入る前にまずこうして構成したものを ECS 上で動かすところまでやっておこうと思うので、その記録はまた別の記事に...。

今回試した内容は一応 [GitHub 上にアップ](https://github.com/53ningen/docker-wordpress)しておいた。
