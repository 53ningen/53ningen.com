---
title: C 言語のダイグラフ
category: programming
date: 2018-09-17 19:23:43
tags: [C言語]
pinned: false
---

C 言語にはダイグラフとよばれる環境により存在しない記号の代替となる記法を提供している。2 文字のトークンで 6 種類ある。

- `<:` => `[`
- `:>` => `]`
- `<%` => `{`
- `%>` => `}`
- `%:` => `#`
- `%:%:` => `##`

例えば、以下のような簡単なソースコードがあったとする。

```
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    int hoge[] = { 123 };
    printf("%d\n", hoge[0]);
    exit(0);
}
```

これは普通に動作するコードです。

```
$ mkdir -p bin
gcc ./src/main.c -o ./bin/main -Wall
$ ./bin/main.c
123
```

このソースコードをダイグラフを使ったものに差し替えてみる。

```
%:include <stdio.h>
%:include <stdlib.h>

int main(int argc, char *argv<::>) <%
    int hoge<::> = <% 123 %>;
    printf("%d\n", hoge<:0:>);
    exit(0);
%>
```

すると、ふつうにコンパイルできます。

```
$ mkdir -p bin
gcc ./src/main.c -o ./bin/main -Wall
$ ./bin/main.c
123
```

トライグラフなるものもあるようだが、gcc ではデフォルトでオフってあるそうです

### ところでダイグラフってどういう意味？

> ダイグラフ (英語: digraph)
> 二重音字
> 合字
> Pascal などのコンピュータ言語で記号 1 文字を 2 文字で書き表すこと。例:「(.」→「[」。背景・目的などはトライグラフを参照。

[Wikipedia](https://ja.wikipedia.org/wiki/%E3%83%80%E3%82%A4%E3%82%B0%E3%83%A9%E3%83%95) より
