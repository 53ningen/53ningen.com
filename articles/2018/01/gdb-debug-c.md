---
title: gdb を使ったデバッグ
category: programming
date: 2018-01-17 23:42:13
tags: [C++, gdb, C言語]
pinned: false
---

<ul>
<li>「<a href="http://amzn.to/2CQhKu1">ふつうの Linux プログラミング</a>」というほんでバグがある C のコード <code>bug_head.c</code> のデバッグ作業をするときに <code>gdb</code> というツールが紹介されていた</li>
<li>デバッグ時に <code>gdb</code> が役に立つので、ひとまずその流れを以下でみてみる</li>
</ul>

<h3>基本的なデバッグの流れ</h3>

<p>流れを見た方がわかりやすいのでまず実例からみていく</p>

```
# コンパイルは -g オプションをつける
$ gcc ./src/bug_head.c -g -o ./bin/bug_head

# gdb をかましてデバッグ対象バイナリを実行する
$ gdb ./bin/bug_head
GNU gdb (GDB) Red Hat Enterprise Linux 7.6.1-94.el7
Copyright (C) 2013 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-redhat-linux-gnu".
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>...
Reading symbols from /home/gomi_ningen/src/head...done.
(gdb)

# バイナリを実行する
(gdb) run -n 3
Starting program: /home/gomi_ningen/src/./head -n 3

Program received signal SIGSEGV, Segmentation fault.
0x00007ffff7a55d47 in ____strtoll_l_internal () from /lib64/libc.so.6
Missing separate debuginfos, use: debuginfo-install glibc-2.17-157.el7_3.1.x86_64

# セグフォが出ているので問題点を確認すべくスタックトレースを吐き出させる
(gdb) backtrace
#0  0x00007ffff7a55d47 in ____strtoll_l_internal () from /lib64/libc.so.6
#1  0x00000000004008ec in main (argc=3, argv=0x7fffffffe498) at ./head.c:24

# 手元で書いたコードの L24 に問題がありそうなので、該当部分のコードを確認
(gdb) frame 1
#1  0x00000000004008ec in main (argc=3, argv=0x7fffffffe498) at ./head.c:24
24                nlines = atol(optarg);

# L24 周辺のコードを確認
(gdb) list
19      long nlines = DEFAULT_N_LINES;
20
21      while ((opt = getopt_long(argc, argv, "n", longopts, NULL)) != -1) {
22          switch (opt) {
23            case 'n':
24                nlines = atol(optarg);
25                break;
26            case 'h':
27                fprintf(stdout, "Usage: %s [-n LINES] [FILE ...]\n", argv[0]);
28                exit(0);

# L24 の各変数がどうなっているか出力して確認してみる
(gdb) print optarg
$1 = 0x0

# どうやら optarg が NULL のようで、これを atol しようとしてセグフォをはいているのだなと推測できる
```

<p>以上のように <code>gdb</code> は</p>

<ul>
<li>エラーが出た際のスタックトレース</li>
<li>該当部分のソースコード</li>
<li>各変数の状態出力</li>
</ul>

<p>などが手軽に行えるイカしたツールです。</p>

<h3>参考にしたページ</h3>

<ul>
<li>https://qiita.com/aosho235/items/d0bc0191f76ec5bd1776</li>
</ul>
