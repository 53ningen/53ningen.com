---
title: Cの基本的なコードとアセンブリコード
category: programming
date: 2016-05-04 13:45:42
tags: [アセンブリ言語]
pinned: false
---

## if 文

```c
int abs(int i) {
    if (i > 0) {
        return i;
    } else {
        return -1 * i;
    }
}
```

絶対値を返す簡単な関数について見てみる。まずは最適化なし（`-O0`）

```
_abs:                                   ## @abs
    push rbp
    mov  rbp, rsp
    mov  dword ptr [rbp - 8], edi ## 引数をdword ptr [rbp-8]領域へ格納
    cmp  dword ptr [rbp - 8], 0   ## 0と比較
    jle  LBB0_2 ## 0と同じかそれ以下だったら LBB0_2 ラベルへジャンプ
## BB#1:
    mov  eax, dword ptr [rbp - 8] ## eax レジスタへdword ptr [rbp-8]領域の値をロード
    mov  dword ptr [rbp - 4], eax ## dword ptr [rbp-4]領域へ eax レジスタの値をセット
    jmp  LBB0_3 ## LBB0_3 ラベルへジャンプ
LBB0_2:
    imul eax, dword ptr [rbp - 8], 4294967295 ## eax レジスタへdword ptr [rbp-8]領域の値に4294967295(FFFFFF)をかけたものをロード
    mov  dword ptr [rbp - 4], eax ## dword ptr [rbp-4]領域へ eax レジスタの値をセット
LBB0_3:
    mov  eax, dword ptr [rbp - 4] ## eax レジスタの値へdword ptr [rbp-4]領域の値をセット
    pop  rbp
    ret
```

`cmp`, `jle`, `jmp` 命令などによって if 文のふるまいが表現されていることがわかる。符号を反転させる部分は以下のような感じ（Swift）

```
// 2147483648(signed int では -16)
let i: UInt32 = 0b11111111_11111111_11111111_11110000

// 4294967295(singed int では -1)
let j: UInt32 = 0b11111111_11111111_11111111_11111111

let result = i &* j //~> 16
```

続いて最適化あり（`-O2`）

```
_abs:                                   ## @abs
    push  rbp
    mov   rbp, rsp
    mov   eax, edi  ## 引数を eax にロード
    neg   eax       ## eax の符号反転（2の補数を取る）
    cmovl eax, edi  ## eax < edi なら mov eax, edi する
    pop   rbp
    ret
```

`cmovl` は conditonal move if less だそうで、つまり第 1 オペランドが第 2 オペランドより小さかったら第 1 オペランドへロードするというものらしい。だいぶ処理が軽くなっているのがわかる。

## 末尾呼び出しの最適化

### 末尾呼び出しでない階乗関数

C のコードはこんなかんじで。

```c
int fact(int n) {
    return n == 0 ? 1 : n * fact(n - 1);
}
```

アセンブリコードを見てみる。

```
## 最適化なし（-O0）
_fact:                                  ## @fact
 push rbp
 mov rbp, rsp
 sub rsp, 16  ## 16バイト分のローカル変数領域を確保
 mov dword ptr [rbp - 4], edi  ## dword ptr [rbp-4] へ n を格納
 cmp dword ptr [rbp - 4], 0  ## dword ptr [rbp-4] と 0 を比較(n != 0 ?)
 jne LBB0_2  ## not equal なら LBB0_2 へジャンプ
## BB#1: 基底ケース
 mov eax, 1  ## eax レジスタに 1を格納
 mov dword ptr [rbp - 8], eax ## dword ptr [rbp-8]へ eax レジスタの値を格納
 jmp LBB0_3  ## LBB0_3 へジャンプ
LBB0_2: ## 再帰ケース
 mov eax, dword ptr [rbp - 4] ## eax レジスタに n を格納
 mov ecx, dword ptr [rbp - 4] ## ecx レジスタに n を格納
 sub ecx, 1 ## ecx = n - 1
 mov edi, ecx ## edi（再帰呼び出しの引数） へ n - 1 をセット
 mov dword ptr [rbp - 12], eax ## dword ptr [rbp-12] へ n を格納
 call _fact ## 自己再帰呼び出し
 mov ecx, dword ptr [rbp - 12] ## ecx へ n を格納
 imul ecx, eax ## ecx = n * fact(n - 1)
 mov dword ptr [rbp - 8], ecx ## dword ptr [rbp-8] へ ecx の値をセット
LBB0_3:
 mov eax, dword ptr [rbp - 8] ## eax へ dword ptr [rbp-8] の値をセット
 add rsp, 16 ## ローカル変数領域をクリーンアップ
 pop rbp
 ret
```

再帰が深い場合、スタックを食いつぶすことがわかる。続いて末尾再帰版。

```
int loop(int n, int acc) {
    if (n == 0) {
        return acc;
    } else {
        return loop(n - 1, n * acc);
    }
}

int fact(int n) {
    return loop(n, 1);
}
```

最適化あり（`-O1`）で生成したコード。`-O2` だとちょっと読むのが厳しいくらい最適化されたコードが生成されてしまったので...。

```
_loop:                                  ## @loop
    push rbp
    mov  rbp, rsp
    test edi, edi  ## if (edi == 0) { ZF = 1 } else { ZF = 0 }
    je   LBB0_2    ## if (ZF == 1) { jump LBB0_2 }
LBB0_1:
    imul esi, edi  ## esi = esi * edi
    dec  edi       ## edi-- （演算結果が 0 なら ZF(zero flag) が立つ）
    jne  LBB0_1    ## ZF == 0 なら LBB0_1 へジャンプ
LBB0_2:
 mov eax, esi    ## eax へ esi の値をセットして、呼び出し元へ返却
 pop rbp
 ret

_fact:                                  ## @fact
    push rbp
    mov  rbp, rsp
    mov  esi, 1
    pop  rbp
    jmp  _loop                   ## TAILCALL
```

末尾呼び出しがジャンプ命令に置き換わっているのがわかる。コールスタックを消費しない形式となっている。

## Hello, world

C のコードを掲載するまでもないと思うんですが、まあ一応掲載

```c
#include <stdio.h>

int main() {
    printf("hello, work!\n");
}
```

`-O2` で生成したコード。

```
.section __TEXT,__text,regular,pure_instructions
 .macosx_version_min 10, 11
 .globl _main
 .align 4, 0x90
_main:                                  ## @main
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
 lea rdi, [rip + L_str]
 call _puts
 xor eax, eax
 pop rbp
 ret
 .cfi_endproc

 .section __TEXT,__cstring,cstring_literals
L_str:                                  ## @str
 .asciz "hello, work!"


.subsections_via_symbols
```

あんまり面白くなかった。"hello, work!" という文字列への参照を `rdi` レジスタにぶち込んで `_puts` よんでるだけだった。最後に `xor eax, eax` しているのは `main` 関数の `return 0` を表現しているのだろう...。

## 参考文献

- http://kira000.hatenadiary.jp/entry/2014/08/26/052447
- https://codezine.jp/article/detail/485
