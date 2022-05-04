---
title: 関数の引数の void
category: programming
date: 2018-09-17 20:02:05
tags: [C言語]
pinned: false
---

引数を取らないことを表明するために `func_name(void)` と書くのと `func_name()` と書くのは何が違うのか。違いを観察してみる。

## 何もかかないとき

次のようなコードをコンパイルすると通ってしまう。

```
#include <stdio.h>
#include <stdlib.h>

void do_nothing() {
}

int main(int argc, char *argv[]) {
    do_nothing("hoge");
    exit(0);
}
```

コンパイルして実行してみる。

```
$ make
mkdir -p bin
gcc ./src/main.c -o ./bin/main -Wall
$ ./bin/main
$
```

## 引数を void とした場合

```
#include <stdio.h>
#include <stdlib.h>

void do_nothing(void) {
}

int main(int argc, char *argv[]) {
    do_nothing("hoge");
    exit(0);
}
```

以下のように怒られが発生する

```
$ make
mkdir -p bin
gcc ./src/main.c -o ./bin/main -Wall
./src/main.c: In function ‘main’:
./src/main.c:8:5: error: too many arguments to function ‘do_nothing’
     do_nothing("hoge");
     ^
./src/main.c:4:6: note: declared here
 void do_nothing(void) {
      ^
make: *** [main] Error 1
```
