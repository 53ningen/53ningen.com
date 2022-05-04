---
title: Wordpress のメディアに画像をアップロードする際にサムネイルや中・大サイズが生成されない問題
category: programming
date: 2018-02-11 21:57:16
tags: [PHP, WordPress, libjpeg]
pinned: false
---

Wordpress のメディアに画像をアップロードすると自動的に中・大サイズの画像やサムネイルを生成してくれます。

しかし php をソースコードからビルドしてインストールするように運用を変えたあとから、これらの画像が生成されなくなっていたので修正しました。この画像変換には php の拡張モジュール GD を利用しているようなので、php の configure オプションに `--with-gd` を追加しました。

```sh
./configure --enable-fpm --enable-mbstring --enable-zip \
    --with-mysqli=mysqlnd --with-pdo-mysql=mysqlnd \
    --with-mysql=mysqlnd --with-zlib --with-openssl --with-curl  --with-gd
```

すると png のリサイズはかかるようになりましたが、jpeg のリサイズは相変わらずされずという状況。 `php_info` を見てみると以下のような具合。

```sh
gd

GD Support => enabled
GD Version => bundled (2.1.0 compatible)
GIF Read Support => enabled
GIF Create Support => enabled
PNG Support => enabled
libPNG Version => 1.5.13
WBMP Support => enabled
XBM Support => enabled

Directive => Local Value => Master Value
gd.jpeg_ignore_warning => 1 => 1
```

`JPG Support => enabled` が出ていない。とりあえず `--with-jpeg-dir=/usr/lib64` という具合に `libjpeg.so` のあるディレクトリを明示的に指定してみる。

```sh
./configure \
  --enable-fpm \
  --enable-mbstring \
  --enable-zip \
  --with-mysqli=mysqlnd \
  --with-pdo-mysql=mysqlnd \
  --with-mysql=mysqlnd \
  --with-zlib \
  --with-openssl \
  --with-curl \
  --with-gd
  --with-jpeg-dir=/usr/lib64
```

これで `make install` し直すとうまく動きました。環境は CentOS 7, PHP 7 系です。 作業後の `php_info` は以下のようになります。

```
gd

GD Support => enabled
GD Version => bundled (2.1.0 compatible)
GIF Read Support => enabled
GIF Create Support => enabled
JPEG Support => enabled
libJPEG Version => 6b
PNG Support => enabled
libPNG Version => 1.5.13
WBMP Support => enabled
XBM Support => enabled

Directive => Local Value => Master Value
gd.jpeg_ignore_warning => 1 => 1
```

[amazon template=wishlist&asin=4774144371]
