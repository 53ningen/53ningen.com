---
slug: assembly01
title: 定数を返すだけの関数のアセンブリコード
category: programming
date: 2016-05-03 23:08:24
tags: [アセンブリ言語]
pinned: false
---

いろいろあって、必要に迫られアセンブラの勉強を始めた。基本的に知識が全くないので非常に低レベルな自分用のまとめです。

## 定数を返すだけの関数

とりあえず定数を返すだけの関数を定義してみる。

```
int one() {
    return 1;
}
```

`clang -S -mllvm --x86-asm-syntax=intel const.c` で生成されたファイルが以下のような具合。

```
.section __TEXT,__text,regular,pure_instructions
 .macosx_version_min 10, 11
 .globl _one
 .align 4, 0x90
_one:                                   ## @one
 .cfi_startproc
## BB#0:
 push rbp
Ltmp0:
 .cfi_def_cfa_offset 16
Ltmp1:
 .cfi_offset rbp, -16
 mov rbp, rsp
Ltmp2:
 .cfi_def_cfa_register rbp
 mov eax, 1
 pop rbp
 ret
 .cfi_endproc


.subsections_via_symbols
```

`.globl` はリンカに渡す名前を定義する擬似命令。`.align 4, 0x90` については、4 の倍数のアドレスに配置してくれという命令になるようです。`_one` は C 言語にもあるようなラベルで使い方もだいたい同じ。

`cfi_startproc` は全然わからなかったので調べたら[なんとなく説明があるページ](https://sourceware.org/binutils/docs/as/CFI-directives.html)をみつけた。

> .cfi_startproc is used at the beginning of each function that should have an entry in .eh_frame. It initializes some internal data structures. Don't forget to close the function by .cfi_endproc.

ふむ。とりあえず `cfi` から始まる擬似命令は Call Frame Information とよばれるものに関する何かなようだ。よくわかっていない。[stack overflow](http://stackoverflow.com/questions/2529185/what-are-cfi-directives-in-gnu-assembler-gas-used-for) にそれらしき内容の質問があった。特定のプラットフォーム下では例外処理の際に `Call Frame Information` を利用しているそうな。とりあえず cfi ディレクティブを外してみていくのが良さそうなので、一旦削ったものを以下に示す。

```
_one:                                   ## @one
    push  rbp       ## (1)
    mov   rbp, rsp  ## (2)
    mov   eax, 1    ## (3)
    pop   rbp       ## (4)
    ret             ## (5)
```

(1) の `push rbp` では、`rbp` レジスタの内容をスタックに push している。(2) の `mov rbp, rsp` は、スタックポインタ `rsp` の値を `rbp` レジスタにセットしている。これらは何のために行なわれているのでしょうか。

関数の処理に入る前に `rbp` レジスタがどのように使われていたのかはわからないのですが、関数内ではこのレジスタを使います。ということは関数の処理を終える際に、`rbp` レジスタの値をもとに戻せないと困ります。もとに戻す処理は実際 (4) で行われています。

実際、`push` と `pop` の命令は次のようなものとおなじになります。

```
# push <r32>
mov [rsp-4], <r32>
sub rsp, 4

# pop <r32>
add rsp, 4
mov <r32>, [rsp-4]
```

スタックポインタの値は push するとマイナス方向へ進み、pop するとプラス方向に進みます。

(2) ではスタックポインタ `rsp` の値を `rbp` に格納しています。これは mov 命令の `[]` を用いたアドレス指定に `rsp` レジスタを指定できない決まりになっているためらしいです。したがって、このように `rbp` に一旦移し、それを使って処理を記述していくことになります。

C 言語では関数の戻り値を `eax` レジスタで返すことになっているため、(3) の処理では、`eax` に定数 `1` を突っ込んでいます。(4) の処理で `rbp` の値をもとに戻して、 (5) の ret でスタックの値をみて制御を関数が呼ばれる前に記憶した位置に戻します。

【残ってる疑問】このケースの場合、`rbp` レジスタを利用していないので、(1)(2)(4)の処理は外せるのでは？

# 参考ページ

- http://d.hatena.ne.jp/suu-g/20080510/1210408956
- https://sourceware.org/binutils/docs-2.24/as/CFI-directives.html#CFI-directives
- http://msumimz.hatenablog.com/entry/2014/02/19/214605
