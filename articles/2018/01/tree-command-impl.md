---
slug: tree-command-impl
title: tree コマンドを実装する
category: programming
date: 2018-01-27 05:15:08
tags: [Linux]
pinned: false
---

　個人的に抜けている知識の穴を探したり、見つかった穴を塞ぐ目的で、最近[「ふつうの Linux プログラミング」](http://amzn.to/2DFrgQV)という本を読んでいます。C 言語をガリガリ書くみたいなことを普段はそれほどやらないので、結構知らないことがあったり、誤解している部分がポロポロと見つかって非常に良いので、みなさん是非読んでみてください。これと並列に「Go ならわかるシステムプログラミング」も読みながらコードを書いています。

　さて、そんな本の中盤で `ls` コマンドの実装をする局面がありました。この実装自体はわりと単純で、ディレクトリを `opendir(3)` で開き、`readdir(3)` で読んでいくというもの。man によると返される dirent 構造体は次のようなものであるそうだ。

```
struct dirent { /* when _DARWIN_FEATURE_64_BIT_INODE is NOT defined */
        ino_t      d_ino;                /* file number of entry */
        __uint16_t d_reclen;             /* length of this record */
        __uint8_t  d_type;               /* file type, see below */
        __uint8_t  d_namlen;             /* length of string in d_name */
        char    d_name[255 + 1];   /* name must be no longer than this */
};
```

　したがって、d_name を拾って出力してゆけばよいということになります。実際に `ls` の中核の処理部は以下のような簡単なコードで表現できます。

```
static void do_ls(char *path) {
    DIR *d;
    struct dirent *ent;

    d = opendir(path);
    if (!d) {
        perror(path);
        exit(1);
    }
    while ((ent = readdir(d))) {
        printf("%s\n", ent->d_name);
    }
    closedir(d);
}
```

## tree コマンドへの発展

　`ls` コマンドの応用として、`tree` を実装するのは面白そうだなということで今回実装してみようと思いました。基本的には `ls` で得られた各エントリがディレクトリであれば、再帰的に掘っていくみたいなことをすれば実現できそうで、ちょっと拡張すればできるのではないかなという見立てもあり、10分くらいで終わるだろみたいな気持ちでチャレンジです（と思ったら直後にそれらしい内容が本の本文に書いてあってなるほどなという気持ちになった、是非本買って読んでみて）。

おおまかに次の3つの対応をいれなければならないかなと思います。

1. カレントディレクトリ `.`、ペアレントディレクトリ `..` をトラバースの対象から除外
2. ファイルやシンボリックリンクをトラバースの対象から除外
3. 階層に応じて良き感じの木構造の出力を行う

それぞれ対応していきましょう

### `.` と `..` の除外

簡単に strcmp で比較して除外でよいかなと思い次のようなコードを書いてみた。

```
while ((ent = readdir(d))) {
    if (!strcmp("..",ent->d_name) || !strcmp(".",ent->d_name)) continue;
    printf("%s\n", ent->d_name);
}
```

こんなんで良いのかちょっと不安になったので[ソースコード](https://github.com/nodakai/tree-command/blob/master/tree.c#L692-L707)を覗きにいったら同じことしてたので良かった（？）。この状態で `.` と `..` が除外されたバージョンの `ls` のふるまいをするようになったので、第一課題はクリア。

### ファイルとシンボリックリンクを判定する

`man dirent` には `dirent->d_type` の種類が掲載されているので、それを見ればよさそう。`File types` は次のような種類があるそうだ。

```
/*
 * File types
 */
#define DT_UNKNOWN       0
#define DT_FIFO          1
#define DT_CHR           2
#define DT_DIR           4
#define DT_BLK           6
#define DT_REG           8
#define DT_LNK          10
#define DT_SOCK         12
#define DT_WHT          14
```

　これより `DT_DIR` のみをトラバースの対象にすればよさそうなので、処理部を次のようなコードに変えてみるとほぼ `tree` に近い出力が得られるようになってきた。

```
while ((ent = readdir(d))) {
    if (!strcmp("..",ent->d_name) || !strcmp(".",ent->d_name)) continue;

    printf("%s%s\n", branch, ent->d_name);
    if (ent->d_type == DT_DIR) {
        sprintf(cd, "%s/%s", path, ent->d_name);
        do_tree(cd);
    }
}
```

### 枝をいい感じに生やす

枝をいい感じににょきにょき生やす作業はわりとダルいので適当でいいやみたいな気持ちになって雑に実装した。

```
static void get_branch(char *buf, int depth) {
    int i;

    sprintf(buf, "%s", "");
    for (i = 0; i < depth; i++) {
        sprintf(buf, "%s%s", buf, "    ");
    }
    sprintf(buf, "%s%s", buf, "├── ");
}

static void do_tree(char *path, int depth) {
    DIR *d;
    struct dirent *ent;
    char cd[1024];
    char branch[8 * depth + 1];
    get_branch(branch, depth);

    d = opendir(path);
    if (!d) {
        perror(path);
        exit(1);
    }
    while ((ent = readdir(d))) {
        if (!strcmp("..",ent->d_name) || !strcmp(".",ent->d_name)) continue;

        printf("%s%s\n", branch, ent->d_name);
        if (ent->d_type == DT_DIR) {
            sprintf(cd, "%s/%s", path, ent->d_name);
            do_tree(cd, depth + 1);
        }
    }
    closedir(d);
}
```

このコードは 現在のディレクトリの相対パス `cd` の長さを 1024 に決め打っているあたりと、`tree` コマンドの枝の出力などがわりと適当です。出力はこんな感じでダサいけど、一応 `tree` の方向性には向かっている。

```
$ ./bin/tree
├── .DS_Store
├── .gitignore
├── bin
    ├── bug_head
    ├── cat
    ├── cat2
    ├── echo
    ├── head
    ├── hello
    ├── ls
    ├── tree
├── hoge
├── LICENSE
├── Makefile
├── obj
    ├── echo.out
    ├── hello.out
├── README.md
├── src
    ├── .DS_Store
    ├── bug_head.c
    ├── cat.c
    ├── cat2.c
    ├── echo.c
    ├── head.c
    ├── hello.c
    ├── ls.c
    ├── tree.c
```

本家の実装見る感じ、やはりこのあたりはちゃんと地道にやっていく必要がある。眠くなってきたので、一旦寝るとして、続きはのちほど追記するかもしれないけど、ひとまずここまでメモ。まあ電車のなかでソースコードでも読みます。このあたりになると、やっぱり C でコード書くのだるいな〜みたいな感じになって、Go とかそのあたりの言語を使う旨味がでてくるのかなーと思った。
