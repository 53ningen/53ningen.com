---
title: Cのコードがどのように処理されるのか
category: programming
date: 2016-09-22 21:00:02
tags: [C++]
pinned: false
---

# プリプロセッシング

空のファイルのプリプロセッシングを進めてみる

```
% touch pre.c
% cc -E pre.c
# 1 "pre.c"
# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 329 "<built-in>" 3
# 1 "<command line>" 1
# 1 "<built-in>" 2
# 1 "pre.c" 2
```

続いて、簡単なコードを書いてみた上で...

```
% echo "int i = 0;" > pre2.c
% cc -E pre2.c
# 1 "pre2.c"
# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 329 "<built-in>" 3
# 1 "<command line>" 1
# 1 "<built-in>" 2
# 1 "pre2.c" 2
int i = 0;
```

`#define` を使って見ると...

```
% echo "#define CONST_I 1\n\nint i = CONST_I;" > pre3.c
%  cc -E pre3.c
# 1 "pre3.c"
# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 329 "<built-in>" 3
# 1 "<command line>" 1
# 1 "<built-in>" 2
# 1 "pre3.c" 2


int i = 1;
```

`#include` の動きは単純にソースコードをガバッと持ってくるだけ。コメントの除去とかもこのタイミングの模様。

```
% echo '/* hage aho ba-ka! */' > pre4.c
% cc -E pre4.c
# 1 "pre4.c"
# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 329 "<built-in>" 3
# 1 "<command line>" 1
# 1 "<built-in>" 2
# 1 "pre4.c" 2
```

# コンパイル

プリプロセッサの出力をソースにしてアセンブリコードを生成する。
空のプログラムを流してみる

```
% cc -E pre.c > _pre.c
% cat _pre.c
# 1 "pre.c"
# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 329 "<built-in>" 3
# 1 "<command line>" 1
# 1 "<built-in>" 2
# 1 "pre.c" 2
% cc -S _pre.c
% cat _pre.s
        .section        __TEXT,__text,regular,pure_instructions
        .macosx_version_min 10, 11

.subsections_via_symbols
```

続いて `int i = 1;` とだけ書かれたコード

```
        .section        __TEXT,__text,regular,pure_instructions
        .macosx_version_min 10, 11
        .section        __DATA,__data
        .globl  _i                      ## @i
        .align  2
_i:
        .long   1                       ## 0x1

.subsections_via_symbols
```

さすがにつまらん...。単純な関数とかはこんな感じ。まあここらへんは別の記事とかで...。

```
        .section        __TEXT,__text,regular,pure_instructions
        .macosx_version_min 10, 11
        .globl  _hoge
        .align  4, 0x90
_hoge:                                  ## @hoge
        .cfi_startproc
## BB#0:
        pushq   %rbp
Ltmp0:
        .cfi_def_cfa_offset 16
Ltmp1:
        .cfi_offset %rbp, -16
        movq    %rsp, %rbp
Ltmp2:
        .cfi_def_cfa_register %rbp
        movl    $10, %eax
        popq    %rbp
        retq
        .cfi_endproc
```

# アセンブル

アセンブリコードからバイナリの生成を行うフェーズ。

```
% echo 'int i = 1;' > as1.c
% cc -S as1.c
% cc -o as1.o as1.s
% hexdump -C as1.o
00000000  cf fa ed fe 07 00 00 01  03 00 00 00 01 00 00 00  |................|
00000010  04 00 00 00 60 01 00 00  00 20 00 00 00 00 00 00  |....`.... ......|
00000020  19 00 00 00 e8 00 00 00  00 00 00 00 00 00 00 00  |................|
00000030  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000040  04 00 00 00 00 00 00 00  80 01 00 00 00 00 00 00  |................|
00000050  04 00 00 00 00 00 00 00  07 00 00 00 07 00 00 00  |................|
00000060  02 00 00 00 00 00 00 00  5f 5f 74 65 78 74 00 00  |........__text..|
00000070  00 00 00 00 00 00 00 00  5f 5f 54 45 58 54 00 00  |........__TEXT..|
00000080  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000090  00 00 00 00 00 00 00 00  80 01 00 00 00 00 00 00  |................|
000000a0  00 00 00 00 00 00 00 00  00 00 00 80 00 00 00 00  |................|
000000b0  00 00 00 00 00 00 00 00  5f 5f 64 61 74 61 00 00  |........__data..|
000000c0  00 00 00 00 00 00 00 00  5f 5f 44 41 54 41 00 00  |........__DATA..|
000000d0  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
000000e0  04 00 00 00 00 00 00 00  80 01 00 00 02 00 00 00  |................|
000000f0  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000100  00 00 00 00 00 00 00 00  24 00 00 00 10 00 00 00  |........$.......|
00000110  00 0b 0a 00 00 00 00 00  02 00 00 00 18 00 00 00  |................|
00000120  84 01 00 00 01 00 00 00  94 01 00 00 04 00 00 00  |................|
00000130  0b 00 00 00 50 00 00 00  00 00 00 00 00 00 00 00  |....P...........|
00000140  00 00 00 00 01 00 00 00  01 00 00 00 00 00 00 00  |................|
00000150  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
*
00000180  01 00 00 00 01 00 00 00  0f 02 00 00 00 00 00 00  |................|
00000190  00 00 00 00 00 5f 69 00                           |....._i.|
00000198
```

あっ、ハイ...って感じだ。次のコードを試してみる。

```
int main() {
    return 0;
}
```

```
% objdump -d as2.o

as2.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <main>:
   0:   55                      push   %rbp
   1:   48 89 e5                mov    %rsp,%rbp
   4:   b8 00 00 00 00          mov    $0x0,%eax
   9:   5d                      pop    %rbp
   a:   c3                      retq
```

# リンク

実行可能なバイナリにする。ライブラリや他の必要なコードとの結合を行う。

# 参考にしたページ

ありがとうございます ?

- [http://www5d.biglobe.ne.jp/~noocyte/Programming/Decompile.html](http://www5d.biglobe.ne.jp/~noocyte/Programming/Decompile.html)
- [http://nanoappli.com/blog/archives/3899](http://nanoappli.com/blog/archives/3899)
- [http://sa.eei.eng.osaka-u.ac.jp/eeisa003/tani_prog/HOWTOprogC/compile.htm](http://sa.eei.eng.osaka-u.ac.jp/eeisa003/tani_prog/HOWTOprogC/compile.htm)
- [http://ukai.jp/debuan/2002w/elf.html](http://ukai.jp/debuan/2002w/elf.html)
- [http://aoking.hatenablog.jp/](http://aoking.hatenablog.jp/)
