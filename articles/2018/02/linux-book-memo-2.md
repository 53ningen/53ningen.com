---
title: プロセスはどのようにスケジューリングされるのか
category: programming
date: 2018-02-28 04:27:59
tags: [Linux, Linuxのしくみ, プロセス, C言語]
pinned: false
---

[Linux のしくみ](http://amzn.to/2t3uUPQ)の プロセススケジューラの章の内容、まあそうですよね...と思いつつ実際に手元マシンで実験してみたことはなかったのでやってみました。ついでに、たまたま気が向いたので結果をグラフ化してまとめておきました。gnuplot 使うの 4 年ぶり以上だ...。

[amazon template=wishlist&asin=477419607X]

## 実験内容

- 複数のプロセスを生成して、それぞれのプロセスにおいてループを回して、ユーザーモードの負荷をかけたとき、どのように各プロセスが実行されるかを観察する
  - 測定の際は、複数の論理 CPU にまたがって実行されないよう `taskset` コマンドで実行する論理 CPU を指定する
- 実際に本に書かれていたことが正しいか自分の環境で実験してみた
- 本のコードは、わりと真面目に良い感じの実験結果が得られるような処理やエラー処理が丁寧に書かれていた
  - 写経が面倒なので、本質的なふるまいはかわらないように適当にコードを書いて実験してみた
  - 雑なコードなので、みなさんコピペして実行せずに内容を確認して、もし実行するならどうでもいいサーバーで実行してください

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>

#define LOOP_COUNT 100000UL
#define NSEC_PER_SEC 1000000000UL

static inline void loop()
{
    long i;
    for(i = 0; i < LOOP_COUNT; i++);
}

static inline void print_progress(long elapsed_time_nsec, int pid, int progress)
{
    printf("%ld\t%d\t%d\n", elapsed_time_nsec, pid, progress);
}

static inline long diff_nsec(struct timespec before, struct timespec after)
{
    return (after.tv_sec * NSEC_PER_SEC + after.tv_nsec) - (before.tv_sec * NSEC_PER_SEC + before.tv_nsec);
}

static inline void child_function(int id, struct timespec before)
{
    struct timespec after;
    int i;
    for (i = 0; i < 100; i++) {
        clock_gettime(CLOCK_MONOTONIC, &after);
        print_progress(diff_nsec(before, after), id, i);
        loop();
    }
    clock_gettime(CLOCK_MONOTONIC, &after);
    print_progress(diff_nsec(before, after), id, 100);
}

int main(int argc, char *argv[])
{
    int status = EXIT_FAILURE;
    if (argc != 2) {
        fprintf(stdout, "Usage: %s nproc\n", argv[0]);
        exit(1);
    }
    int nproc = atoi(argv[1]);
    if (nproc < 1) {
        fprintf(stdout, "Argument: invalid nproc %s nproc\n", argv[0]);
        exit(1);
    }

    struct timespec before;
    clock_gettime(CLOCK_MONOTONIC, &before);
    int i;
    for (i = 0; i < nproc; i++) {
        pid_t pid = fork();
        if (pid < 0) {
            fprintf(stdout, "error\n");
            exit(1);
        } else if (pid == 0) {
            // child process
            child_function(i, before);
            exit(0);
        }
    }

    // parent process
    int j;
    for (j = 0; i < nproc; j++) {
        wait(NULL);
    }
    printf("\n");
    exit(0);
}
```

## 実験結果

- わりと綺麗な結果がとれたので、出力をいい感じに整形し gnuplot でグラフ化してみました

```
taskset -c 0 ./test 1
taskset -c 0 ./test 2
taskset -c 0 ./test 4
```

### nproc = 1

![](https://static.53ningen.com/wp-content/uploads/2018/02/28040907/nproc1.png)

```
throughput: 1 process / 33615570 nsec = 29.748 process / sec
latency(id=0): 3.36x10^7 nsec
```

### nproc = 2

![](https://static.53ningen.com/wp-content/uploads/2018/02/28040909/nproc2.png)

```
throughput: 2 process / 64405632 nsec = 31.053 process / sec
latency(id=0): 5.31x10^7 nsec
latency(id=1): 5.40x10^7 nsec
latency(ave.): 5.36x10-7 nsec
```

### nproc = 4

![](https://static.53ningen.com/wp-content/uploads/2018/02/28040911/nproc4.png)

```
throughput: 4 process / 130027521 nsec = 30.762 process / sec
latency(id=0): 8.67x10^7 nsec
latency(id=1): 10.9x10^7 nsec
latency(id=2): 8.71x10^7 nsec
latency(id=3): 10.8x10^7 nsec
latency(ave.): 9.77x10^7 nsec
```

### 測定結果のまとめ

- 雑に 1 回しか計測してないのでざっくりとした傾向しかでないですが、以下のように表にまとめられる

| プロセス数 | スループット (process/sec) | 平均レイテンシ (x10^7 [nsec]) |
| :--------: | :------------------------: | :---------------------------: |
|     1      |           29.748           |             3.36              |
|     2      |           31.053           |             5.36              |
|     4      |           30.762           |             9.77              |

- 論理 CPU を使い切っている場合には、プロセス数を増やしてもスループットは変わらない
  - 実際のプロセスは I/O wait など色々あり、色々
- グラフ化することによりコンテクストスイッチが発生している様子が実際目に見える
  - ラウンドロビンで均等に割り振られている（`nice` などで優先度操作をしなければ...）
  - `nice` は デフォルトを 0 として、 [-20, 20] の範囲でプロセスに優先度をつけ、CPU 時間はそれに応じて割り振られる
- プロセス数を増やすとレイテンシは悪化する

## 論理 CPU が複数ある場合

以下のような環境で実験してみる（この実験結果は前のマシンとは異なるもので実験しているので、スループットやレイテンシは比較しないでください）

```
$ grep proc /proc/cpuinfo
processor : 0
processor : 1
processor : 2
```

![](https://static.53ningen.com/wp-content/uploads/2018/02/28045515/2nproc4.png)

- 複数のプロセスが同時に進捗しているのがわかる
