---
title: グローバル変数とローカル変数とアセンブリコード
category: programming
date: 2016-05-04 00:57:32
tags: [アセンブリ言語]
pinned: false
---

次のようなグローバル変数がどのように扱われるかを確認する

```c
int a = 10;

int add() {
    return a * 2;
}
```

`clang -S -mllvm --x86-asm-syntax=intel global.c` で以下のようなコードが生成される。

```
.section __TEXT,__text,regular,pure_instructions
 .macosx_version_min 10, 11
 .globl _add
 .align 4, 0x90
_add:                                   ## @add
 .cfi_startproc
## BB#0:
 push rbp  ## いつもの
Ltmp0:
 .cfi_def_cfa_offset 16
Ltmp1:
 .cfi_offset rbp, -16
 mov rbp, rsp ## いつもの
Ltmp2:
 .cfi_def_cfa_register rbp
 mov eax, dword ptr [rip + _a1]  ## eax に [rip + _a1]アドレスから dword長(32bit)の領域の値を読み込む
 shl eax, 1  ## 2倍する演算は1ビット左シフトすれば実現出来る
 pop rbp    ## いつもの
 ret        ## いつもの
 .cfi_endproc

 .section __DATA,__data
 .globl _a1                     ## @a1
 .align 2
_a1:
 .long 10                      ## 0xa

.subsections_via_symbols
```

なるほど、グローバル変数 `a` は `DATA` セクションにラベル `_a` が振られているようです。2 倍の演算は `shl` によって左ビットシフトすることにより実現しているようです。

未定義のグローバル変数に関しては `.comm` という擬似命令を使って表現されるようです。次の C コードで確認してみます。

```
// 定義済みのグローバル変数
int a1 = 10;

// 未定義のグローバル変数
int b1;

int add() {
    return a1 * 3;
}
```

```
.section __TEXT,__text,regular,pure_instructions
 .macosx_version_min 10, 11
 .globl _add
 .align 4, 0x90
_add:                                   ## @add
 .cfi_startproc
## BB#0:
 push rbp ## いつもの
Ltmp0:
 .cfi_def_cfa_offset 16
Ltmp1:
 .cfi_offset rbp, -16
 mov rbp, rsp ## いつもの
Ltmp2:
 .cfi_def_cfa_register rbp
 imul eax, dword ptr [rip + _a1], 3
 pop rbp ## いつもの
 ret ## いつもの
 .cfi_endproc

 .section __DATA,__data
 .globl _a1                     ## @a1
 .align 2
_a1:
 .long 10                      ## 0xa

 .comm _b1,4,2                 ## @b1

.subsections_via_symbols
```

`.comm` についてリファレンスには以下のように記載してあります。

> .comm name, size,alignment
> The .comm directive allocates storage in the data section. The storage is referenced by the identifier name. Size is measured in bytes and must be a positive integer. Name cannot be predefined. Alignment is optional. If alignment is specified, the address of name is aligned to a multiple of alignment.

今回 add 関数は a1 を 3 倍した値を返すという内容にしてみました（名前変えるのわすれてた）。すると `imul` という命令が登場しました。こいつは単純な Signed Multiply を実現する命令です。`dword ptr [rip + _a1]` の値を 3 倍して `eax` レジスタに格納するといったことをやっています。どうやら 2 のべき乗のときだけ `shl` 命令を使い、それ以外のときは `imul` 命令が使われる雰囲気がある。

## ローカル変数

対してローカル変数はどう扱われるのか。簡単な C コードで確認してみる。

```
int a = 10;

int add() {
    int b = 10;
    return a + b;
}
```

最適化をかけずにアセンブリコードを生成。

```
.section __TEXT,__text,regular,pure_instructions
 .macosx_version_min 10, 11
 .globl _add
 .align 4, 0x90
_add:                                   ## @add
 push rbp      ## いつもの
 mov rbp, rsp ## いつもの
 mov dword ptr [rbp - 4], 10   ## rbp レジスタに 10 という値を積む（スタックポインタは進めていない点に注意）
 mov eax, dword ptr [rip + _a] ## アキュムレータに _a の値をロード
 add eax, dword ptr [rbp - 4]  ## アキュムレータに さきほど rbp に積んだ値 10 を加算
 pop rbp  ## rbp を以前の状態に戻す
 ret          ## 呼び出し元へ制御を戻す

 .section __DATA,__data
 .globl _a                      ## @a
 .align 2
_a:
 .long 10                      ## 0xa


.subsections_via_symbols
```

.cfi を省いたアセンブリコード。各行にコメントを付与した。\_add で関数のおきまりの処理（`push rbp`, `mov rbp, rsp`）を行ったあと、`rbp` はスタックポインタと同じ位置を指しているはずだ。`int b = 10;` というコードはスタック領域に積む形で値 10 が格納されることにより実現されていることがわかる。ただし `rsp` は進んでいないため、スタックにプッシュしたことにはならない。すなわち、関数の外側からはローカル変数には（通常）アクセスできないような仕組みになっている。なるほど...という感じだ。あとは `eax` に演算処理結果を突っ込んでいって `ret` するという流れのようです。

ところで、この C コードにおけるローカル変数 `b` は明らかに無駄なコードです。最適化オプションをオンにして生成されるアセンブリコードを見てみます。

```
_add:                                   ## @add
 push rbp
 mov rbp, rsp
 mov eax, dword ptr [rip + _a]
 add eax, 10
 pop rbp
 ret
```

今度は、`rbp-4` へ 10 の格納を行わず、直接 `eax` レジスタへ定数 10 を加算しているのが見て取れる。なるほどなぁ...って感想です。

# 参考文献

- https://ja.wikibooks.org/wiki/X86%E3%82%A2%E3%82%BB%E3%83%B3%E3%83%96%E3%83%A9/GAS%E3%81%A7%E3%81%AE%E6%96%87%E6%B3%95
- http://www.mztn.org/slasm/arm07.html
- http://milkpot.sakura.ne.jp/note/x86.html
- http://www7b.biglobe.ne.jp/~robe/pf/pf001.html
- https://docs.oracle.com/cd/E26502_01/html/E28388/eoiyg.html
- http://x86.renejeschke.de/html/file_module_x86_id_138.html
- https://docs.oracle.com/cd/E19455-01/806-3773/instructionset-39/index.html
