---
title: struct と typedef struct
category: programming
date: 2018-09-19 01:07:20
tags: [C言語]
pinned: false
---

`struct` と宣言すると変数宣言のときに `struct struct_name variable_name` という形で書かないといけない。たとえば以下のような感じ。

```
#include <stdio.h>
#include <stdlib.h>

struct hoge {
    int fuga;
};

int main(int argc, char *argv[]) {
    struct hoge h;
    h.fuga = 1;
    printf("%d\n", h.fuga);
    exit(0);
}
```

もし `struct hoge h` ではなく `hoge h` と書いたら以下のようにエラーがでます。

```
$ make
mkdir -p bin
gcc ./src/main.c -o ./bin/main -Wall
./src/main.c: In function ‘main’:
./src/main.c:9:5: error: unknown type name ‘hoge’
     hoge h;
     ^
./src/main.c:10:6: error: request for member ‘fuga’ in something not a structure or union
     h.fuga = 1;
      ^
./src/main.c:11:21: error: request for member ‘fuga’ in something not a structure or union
     printf("%d\n", h.fuga);
                     ^
./src/main.c:9:10: warning: variable ‘h’ set but not used [-Wunused-but-set-variable]
     hoge h;
          ^
make: *** [main] Error 1
```

`typedef struct hoge { ... } hoge_t;` と書くと `hoge_t h` と宣言できる

```
#include <stdio.h>
#include <stdlib.h>

typedef struct Hoge {
    int fuga;
} hoge_t;

int main(int argc, char *argv[]) {
    hoge_t h;
    h.fuga = 1;
    printf("%d\n", h.fuga);
    exit(0);
}
```

`typedef struct { ... } hoge_t;` とも書ける

```
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int fuga;
} hoge_t;

int main(int argc, char *argv[]) {
    hoge_t h;
    h.fuga = 1;
    printf("%d\n", h.fuga);
    exit(0);
}
```
