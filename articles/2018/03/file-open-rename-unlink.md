---
slug: file-open-rename-unlink
title: ファイルを open したまま各種システムコールを呼び出すとどうなるか
category: programming
date: 2018-03-23 03:57:30
tags: [Linux, ふつうのLinuxプログラミング, C言語]
pinned: false
---

会社にて、インフラ屋さんからアプリケーション屋さんまでわりと多分野の数人が集まって[「ふつうの Linux プログラミング」](http://amzn.to/2pxNWc5)という本を輪読しています。各章、それぞれのメンバーが知っていることと知らないことがうまくばらけていて、良い輪読になっています。

また、分野違いの人ならではの視点からの疑問や知識が輪読中に飛び出してきて、なかなか有意義です。業務経験〜10 年くらいの人たちで寄ってたかって読むと良い本ではないかなと思いますので、ぜひ読んでみてください。

[amazon template=wishlist&asin=4797386479]

さて、この本の第 10 章の練習問題には「ファイルを `open()` して、`close()` する前にそのファイルを `rename()` すると何が起きるでしょうか。`unlink()` はどうか、別のファイルを `rename()` するとどうなるか、実験して調べなさい」（230p.より引用）というものがあります。

この問題をみたときに私自身は `logrotate` などの設定をしたことがあるため、`rename()` をした場合、開いていたファイルを掴み続けるという振る舞いはなんとなく想像がつきました（なので、ローテートかけるときにプロセスにシグナルを送りますよね）。しかし、`unlink()` をしたときどうなるか、全員で答えを予想してみたところ、わりとバラけてしまったので、実際にやって実験してみました。

なお、C 言語普段業務などで書いてるわけではないのでおかしな箇所があれば指摘いただけると嬉しいなと思います（予防線）。

## 実験 1: open したファイルを rename する

とても単純なコード。やってることの流れは次のようなもの。

1. ファイルを `open()` して、ファイルディスクリプタ `fd` を得る
2. `fd` に test という文字列を `write()` する
3. リネームする
4. 1 で取得した `fd` にもう一度 test という文字列を `write()` する
5. `close()` する

`rename()` 後に `write()` した場合、1. で開いたパスに書かれるのか、それともリネームした後のパスに書かれるのか、実験からふるまいを確認することが目的になると思います。

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>

int main(int argc, char *argv[])
{
    int fd;
    char buf[] = "test\n";

    if (argc != 3) {
        fprintf(stdout, "Usage: %s src dest\n", argv[0]);
        exit(1);
    }
    fd = open(argv[1], O_RDWR);
    if (fd < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("open: fd = %d\n", fd);
    if (write(fd, buf, sizeof(buf)) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("write: fd = %d\n", fd);
    if (rename(argv[1], argv[2]) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("rename: fd = %d\n", fd);
    if (write(fd, buf, sizeof(buf)) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("write: fd = %d\n", fd);
    if (close(fd) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("close: fd = %d\n", fd);
    exit(0);
}
```

さて、実行してみましょう。

```sh
mbp:c maintainer$ touch /tmp/hoge
mbp:c maintainer$ cat /tmp/hoge
mbp:c maintainer$ ./bin/open_rename_expr /tmp/hoge /tmp/fuga
open: fd = 3
write: fd = 3
rename: fd = 3
write: fd = 3
close: fd = 3
mbp:c maintainer$ cat /tmp/hoge
cat: /tmp/hoge: No such file or directory
mbp:c maintainer$ cat /tmp/fuga
test
test
```

この実験結果から、`open()` によって得られるファイルディスクリプタは、たとえ途中で `rename()` しても、同じ実体ファイルを指し続けることがわかります。

logrotate の際には、一連のローテート処理のなかに、アプリケーションにシグナルを送り、ログファイルを再度開き直すように指示を出すということをしばしばやります。たとえば nginx ならば、`USR1` というシグナルを送ります。詳しくは [nginx のマニュアル](http://nginx.org/en/docs/control.html)を見てください。

## 実験 2: open したファイルを unlink する

さて、同様に `rename()` ではなく `unlink()` した場合どうなるか確認してみましょう。ファイルは　`unlink()` システムコールが呼ばれたときに、ファイルを参照している名前が 0 個であるとき、ファイルシステムから削除されます。

プロセスがファイルを掴んだまま、`unlink()` したときに、次のような疑問が浮かびます

1. そもそも、その `unlink()` は成功するのか
2. 成功するならば、そのときファイルシステムから消えるのか、`close()` するまでファイルシステムに残るのか
3. ファイルシステムから消えるとしたら、ファイルディスクリプタへの書き込み `write()` は成功するのか

これを検証するべく、少しコードは雑ですが、次のようなものを用意しました。

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <unistd.h>

int main(int argc, char *argv[])
{
    int fd;
    char buf[] = "test";

    if (argc != 2) {
        fprintf(stdout, "Usage: %s filename\n", argv[0]);
        exit(1);
    }
    fd = open(argv[1], O_RDWR);
    if (fd < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("open: fd = %d\n", fd);
    if (write(fd, buf, sizeof(buf)) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("write: fd = %d\n", fd);
    if (unlink(argv[1]) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("unlink: fd = %d\n", fd);
    printf("sleep(10)\n");
    sleep(10);
    //=> ファイルシステムから消えているのか ls で確認する
    if (write(fd, buf, sizeof(buf)) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("write: fd = %d\n", fd);
    if (close(fd) < 0) {
        perror(argv[1]);
        exit(1);
    }
    printf("close: fd = %d\n", fd);
    exit(0);
}
```

早速実験してみます

```
mbp:c maintainer$ touch /tmp/hoge
mbp:c maintainer$ ls -l /tmp/hoge
-rw-r--r--  1 maintainer  wheel  0  3 23 03:48 /tmp/hoge
mbp:c maintainer$
mbp:c maintainer$ ./bin/open_unlink_expr /tmp/hoge &

# [1] 31858
# open: fd = 3
# write: fd = 3
# unlink: fd = 3
# sleep(10)

mbp:c maintainer$ ./bin/open_unlink_ls -l /tmp/hoge
ls: /tmp/hoge: No such file or directory
mbp:c maintainer$

# write: fd = 3
# close: fd = 3

[1]+  終了                  ./bin/open_unlink_expr /tmp/hoge
mbp:c maintainer$
```

ここから、ファイルの実体を指している名前がひとつもなくなるとファイルシステム上から削除はされるが、削除される前に取得していたファイルディスクリプタへの読み書きはファイルシステムから消えたあとでも正常に行えることがわかりました。

よくよく見てみると、このあたりの挙動は `unlink` のマニュアルにも書いてありました。

> DESCRIPTION
> The unlink() function removes the link named by path from its directory and decrements the link count of the file which was referenced by the link. **If that decrement reduces the link count of the file to zero, and no process has the file open, then all resources associated with the file are reclaimed. If one or more process have the file open when the last link is removed, the link is removed, but the removal of the file is delayed until all references to it have been closed.**

このあたりの挙動の理解についてはあやふやだったので勉強になりました。マニュアルをちゃんと読むといいですね。
