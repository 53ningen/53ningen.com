---
slug: assembly03
title: 関数呼び出しとアセンブリコード
category: programming
date: 2016-05-04 12:06:39
tags: [アセンブリ言語]
pinned: false
---

関数呼び出しとアセンブリコード

次のような簡単な関数について見ていく。`return_two` は `twice` 関数を呼び出している。

```
int twice(int i) {
     return i * 2;
}

int return_two() {
    return twice(1);
}
```

こいつはどのようなアセンブリコードになるのだろうか。とりあえず `clang -S -mllvm --x86-asm-syntax=intel call.c` をしてみる。

```
.globl _twice
 .align 4, 0x90
_twice:                                 ## @twice
 push rbp
 mov  rbp, rsp
 mov  dword ptr [rbp - 4], edi
 mov  edi, dword ptr [rbp - 4]
 shl  edi, 1
 mov  eax, edi
 pop  rbp
 ret

 .globl _return_two
 .align 4, 0x90
_return_two:                            ## @return_two
 push rbp
 mov  rbp, rsp
 mov  edi, 1
 call _twice
 pop  rbp
 ret

.subsections_via_symbols
```

`_return_two` はいつも通り、`rbp` レジスタの内容を退避させる。その後、`twice` 関数を呼び出しをおこなう。`twice` 関数は引数をひとつ取る関数で、どうやら `edi` レジスタに格納することにより、引数の引き渡しを実現しているようだ（`mov edi, 1`）。次に `call` 命令により `_twice` ラベルへと制御を引き渡している。

`_twice` でもいつも通り、`rbp` レジスタの内容を退避させる。それから、`edi` レジスタから引数を受け取り、ローカル変数と同じような感じで `rbp-4`へ格納する。その後の `edi` 領域を同じ値で上書きしている処理が見えるが、この意図はよく分からない。最適化をかけるとこういった処理はなくなるので一旦無視。次に `edi` レジスタの値を 1bit 左シフトした値を、`eax` レジスタに格納して、この手続きは終了する。

最適化をかけた状態のアセンブリコードも見てみよう。`clang -O2 -S -mllvm --x86-asm-syntax=intel call.c` という感じでやってみると以下のような具合。

```
.globl _twice
 .align 4, 0x90
_twice:                                 ## @twice
 push rbp
 mov  rbp, rsp
 lea  eax, [rdi + rdi]
 pop  rbp
 ret

 .globl _return_two
 .align 4, 0x90
_return_two:                            ## @return_two
 push rbp
 mov  rbp, rsp
 mov  eax, 2
 pop  rbp
 ret
```

`_return_two` のほうに関しては、関数の戻り値が常に `2` になるために、もはや `_twice` の `call` すら走らない形に最適化されている。

`_twice` についてみてみると `lea` という命令が目につく。`lea <src>, <dest>` 命令は、`scr` のアドレスを計算し、`dest` にロードするというものです。`lea` はアドレス計算に使われるものではあるが、足し算を実現するのにも使われるようだ。64bit 汎用レジスタ `rdi` の値を足し合わせて `eax` レジスタに格納している。なお、`lea` vs `add` については[この記事](http://stackoverflow.com/questions/6323027/lea-or-add-instruction)が詳しそう。

> One significant difference between LEA and ADD on x86 CPUs is the execution unit which actually performs the instruction. Modern x86 CPUs are superscalar and have multiple execution units that operate in parallel, with the pipeline feeding them somewhat like round-robin (bar stalls). Thing is, LEA is processed by (one of) the unit(s) dealing with addressing (which happens at an early stage in the pipeline), while ADD goes to the ALU(s) (arithmetic / logical unit), and late in the pipeline. That means a superscalar x86 CPU can concurrently execute a LEA and an arithmetic/logical instruction.

## 複数の引数を取る関数

複数の引数を取る関数についても見ていこう。

```
int add2(int a, int b) {
    return a + b;
}

int add3(int a, int b, int c) {
    return a + b + c;
}
```

この C コードはどのようになるだろうか。`-O2` で最適化をかけたアセンブリコードを見てみる。

```
.globl _add2
 .align 4, 0x90
_add2:                                  ## @add2
 push rbp
 mov rbp, rsp
 add edi, esi
 mov eax, edi
 pop rbp
 ret

 .globl _add3
 .align 4, 0x90
_add3:                                  ## @add3
 push rbp
 mov rbp, rsp
 add edi, esi
 lea eax, [rdi + rdx]
 pop rbp
 ret
```

`_add2` は引数が `edi`, `esi` に格納されて渡されるようだ。`_add3` は `edi`, `esi`, `edx` から引数を受け取っている。
