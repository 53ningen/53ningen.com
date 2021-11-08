---
slug: mkfile
title: 指定したサイズのファイルを作る
category: programming
date: 2018-08-11 00:20:47
tags: [dd]
pinned: false
---

実験時にある特定のサイズをもったファイルを作りたいとき用のメモ

## Linux

`dd if=/dev/zero of=./hoge bs=<block_size> count=<count>`

```
$ dd if=/dev/zero of=./hoge bs=1 count=100
100+0 records in
100+0 records out
100 bytes (100 B) copied, 0.000647603 s, 154 kB/s
$ ls -la ./hoge
-rw-rw-r-- 1 maintainer maintainer 100 Jul 30 12:43 ./hoge
```

でかいファイル作るときはまあ適当に

```
$ dd if=/dev/zero of=./hoge bs= 16k count=100
```


## Windows

`fsutil file createnew <filename> <bytes>`

```
fsutil file createnew ./hoge 100
```
