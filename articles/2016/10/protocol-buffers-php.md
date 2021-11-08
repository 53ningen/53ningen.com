---
slug: protocol-buffers-php
title: Protocol Buffers を PHP から使う
category: programming
date: 2016-10-08 22:09:44
tags: [PHP, protobuf]
pinned: false
---

## Protocol Buffers とは

JSON, XML などは人間の目に比較的優しい形 _[要出典]_ でデータを表現することができます。その反面、データが大きくなったり、データ解析が複雑だったりします。

Protocol Buffers は、通信や永続化などを目的に、データサイズの小ささやパース時のパフォーマンスなどを追及したシリアライズフォーマットです。データ構造はあらかじめプロトコル定義ファイル（`.proto`）に定義をしておき、Google が配布している `protoc` プログラムによって、各プラットフォーム上でのシリアライザ・デシリアライザを含めた関連コードが自動的に生成できるようになっています。

したがって利用する際の基本的な手順は大雑把に次のようになります

1. データ構造を IDL で定義した proto ファイルを作成する
2. proto ファイルから Protocol Buffers の利用に必要なコード（シリアライザ・デシリアライザなどが含まれる）を生成する
3. 生成されたコードを利用したコードを書く

データ構造をはじめに定義し、そのデータ構造に応じたコードをあらかじめ用意しておくあたりが、JSON, XML などと異なります。

## 環境構築

さて、PHP から Protocol Buffers を使うために環境構築を行いましょう。まずは `protoc` プログラムをインストールします。

```
$ brew install protobuf
$ protoc --version
libprotoc 3.0.0
```

また今回利用する PHP ライブラリは pear の `Console_CommandLine` を必要とするため、これも入れます。

```
$ pear install Console_CommandLine
$ pear list
Installed packages, channel pear.php.net:
=========================================
Package             Version State
Archive_Tar         1.3.11  stable
Console_CommandLine 1.2.2   stable
Console_Getopt      1.3.1   stable
PEAR                1.9.4   stable
Structures_Graph    1.0.4   stable
XML_Util            1.2.1   stable
```

最後に PHP ライブラリを composer で導入します。

```
{
    "require": {
        "stanley-cheung/Protobuf-PHP": "v0.6"
    }
}
```

## インターフェース定義ファイルの作成

Google の [proto3 Language Guide](https://developers.google.com/protocol-buffers/docs/proto3) を見ようみまねで、簡単なものを定義してみましょう。次のように `search_request.proto` ファイルを作成してください。

```
syntax = "proto3";

package test;

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}
```

インターフェース定義ファイルは直感的でわかりやすいので、きっと解説はいらないでしょう...。

## Protocol Buffers 利用のためのコード生成

composer でひっぱってきたファイルのなかに必要なコードの生成を補助してくれるファイルがあるので、それを使いましょう。

今、ディレクトリ構造が以下のような形だったと仮定します。

```
$ tree
.
├── composer.json
├── composer.lock
├── search_request.proto
├── src
└── vendor
    ├── autoload.php
    ├── bin
    │   ├── protoc-gen-php.bat -> ../stanley-cheung/protobuf-php/protoc-gen-php.bat
    │   └── protoc-gen-php.php -> ../stanley-cheung/protobuf-php/protoc-gen-php.php
    ├── composer
    │   ├── ClassLoader.php
    │   ├── LICENSE
    │   ├── autoload_classmap.php
    │   ├── autoload_namespaces.php
    │   ├── autoload_psr4.php
    │   ├── autoload_real.php
    │   └── installed.json
    └── stanley-cheung
        # 以下略
```

`vendor/bin` 下 に `protoc-gen-php.php` というファイルが存在しますが、これを使うと簡単に必要なコードを生成することができます。さっそく `SearchRequest` データ構造を PHP で扱うためのコードを生成してみましょう。

```
$ ./vendor/bin/protoc-gen-php.php \
     -Dmultifile \
     -Dnamespace=Dist.Protobuf \
     -o ./src/ \
     -i . \
     ./search_request.proto
Protobuf-PHP @package_version@ by Ivan -DrSlump- Montes

NOTICE: Mapping test to Dist\Protobuf
NOTICE: Generating "Dist/Protobuf/SearchRequest.php"
```

すると `src/Dist/Protobuf` 下に `SearchRequest.php` というファイルが生成されるはずです。

```
$ tree
.
├── Dist
│   └── Protobuf
│       └── SearchRequest.php
├── composer.json
├── composer.lock
├── search_request.proto
├── src
│   └── Dist
│       └── Protobuf
│           └── SearchRequest.php
└── vendor
    # 以下略

```

これで準備が完了しました。

## Protocol Buffers を利用する

まずは SearchRequest のインスタンスを取得し、各フィールドをセットして、シリアライズしてみます。

```
require_once 'vendor/autoload.php';
require_once 'src/Dist/Protobuf/SearchRequest.php';

\DrSlump\Protobuf::autoload();

$req = new \Dist\Protobuf\SearchRequest();
$req->setQuery('Is the order a rabbit?');
$req->setPageNumber(128);
$req->setResultPerPage(12470);

$codec = new \DrSlump\Protobuf\Codec\Binary();
$data = $codec->encode($req);
echo $data;

```

以上のようなコードを実行すると以下のようなバイナリが出力されます。

```
$ php test.php  | hexdump -C
00000000  0a 16 49 73 20 74 68 65  20 6f 72 64 65 72 20 61  |..Is the order a|
00000010  20 72 61 62 62 69 74 3f  10 80 01 18 b6 61        | rabbit?.....a|

```

バイナリサイズは 30 byte でした。対応する標準的な JSON だと 77 byte あるのでおよそ半分になっていることがわかります。

```
$ php test.php > output
$ echo '{"query":"Is the order a rabbit?","page_number":128,"result_par_page":12470}' > output.json
$ ls -al
-rw-r--r--   1 ... ...    30 10  8 21:31 output
-rw-r--r--   1 ... ...    77 10  8 21:33 output.json

```

またデシリアライズは次のようなコードで可能です

```
require_once 'vendor/autoload.php';
require_once 'src/Dist/Protobuf/SearchRequest.php';

\DrSlump\Protobuf::autoload();

$req = new \Dist\Protobuf\SearchRequest();
$req->setQuery('Is the order a rabbit?');
$req->setPageNumber(128);
$req->setResultPerPage(12470);

$codec = new \DrSlump\Protobuf\Codec\Binary();
$data = $codec->encode($req);

$pojo = \Dist\Protobuf\SearchRequest::deserialize($data);
var_dump($pojo);
```

実行すると次のようになります

```
$ php test.php
object(Dist\Protobuf\SearchRequest)#10 (6) {
  ["query"]=>
  string(22) "Is the order a rabbit?"
  ["page_number"]=>
  int(128)
  ["result_per_page"]=>
  int(12470)
  ["_descriptor":protected]=> #以下略

```

ちゃんともとの POJO を復元できていますね
