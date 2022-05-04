---
title: カーネルとスタックとプロセス
category: programming
date: 2018-07-11 23:41:16
tags: [詳解システムパフォーマンス]
pinned: false
---

- [詳解システムパフォーマンス読書メモ](https://amzn.to/2CS2IUE)
  - 第３章 オペレーティングシステム　 3.2.2. スタック ~ 3.2.5. プロセス

### スタックの役割

- システムコール中にプロセスのスレッドは、ユーザースタックとカーネルスタックを持っている
  - システムコール実行が終わるまで、ユーザースタックは変化しない（シグナルハンドラは例外）
- スタックにはスレッドが必要とする、関数やレジスタの状態などの実行情報が格納されている

> Linux カーネルでは、コンテキストの保存領域として thread_info 構造体とカーネルスタックを併用します。 この二つはプロセス毎に割り当てられており、プロセス生成時に作成されます。
> [Linux のしくみを学ぶ - プロセス管理とスケジューリング](https://syuu1228.github.io/process_management_and_process_schedule/process_management_and_process_schedule.html) より引用

## カーネルと割り込み処理

- カーネルはシステムコールのほかにデバイスからの割り込みにも対応する
  - デバイスからの割り込みに対し、割り込みサービスルーチンが登録されるが、重い処理が必要な際は割り込みスレッドにスケジューリングされる
  - 割り込みが到着してから処理されるまでの時間を割り込みレイテンシという
- 割り込みには割り込み優先レベル(interrupt priority level: IPL)というアクティブな割り込みサービスルーチンの優先度を表すものがある
- エラーの IPL は非常に高い、シリアル I/O についてもバッファオーバーフローを避けるためにクロックよりも高い IPL となっている

> Linux カーネルはアプリケーションが動作するための基本環境を提供します。
> （中略）
> Linux カーネルはこれらの便利な機能を提供しますが、処理を依頼されて初めて動作するイベント駆動型のプログラムです。アプリケーションからのシステムコールによる要求、ハードウェアからの割り込みによる要求を受けて、初めてその要求に対応する処理を行います。Linux カーネルが能動的に動作することはありません。
> [0.1 　 Linux カーネルとは - Linux Kernel Documents Wiki - Linux Kernel Documents - OSDN](https://ja.osdn.net/projects/linux-kernel-docs/wiki/0.1%E3%80%80Linux%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%AB%E3%81%A8%E3%81%AF) より引用

## カーネルとプロセス

- プロセスは `fork()` システムコールにて作成される

> プロセス生成の方法・目的
> fork: ウェブサーバーなどで同時にリクエストを受け付ける場合などに、プログラムの処理を複数のプロセスに分ける
> execve: シェルから各種プログラムをたちあげるときなどに、プロセスを生成する
>
> fork 関数のふるまい
> 子プロセスのメモリ領域を確保して親プロセスのメモリをコピー
> fork 関数は親プロセスと子プロセスで戻り値が異なり、その値に応じたソースコードを、それぞれのプロセスで実行していく
>
> execve 関数のふるまい
> 現在のプロセスのメモリに、引数で指定された実行ファイルのデータを上書きする
> [コンピュータシステムとプロセスの概要 – ゴミ箱](https://53ningen.com/linux-book-memo-1/) より

- プロセスの構成要素は以下のようなもの
  - メモリアドレス空間
  - ファイルディスクリプタ
  - スレッドスタック
  - レジスタ
- `fork()` は Copy On Write でパフォーマンスを向上できる
  - 前のアドレス空間の内容を全てコピーするのではなく、参照手段だけを用意し、変更が加わるタイミングでコピーを作る
- プロセスはカーネルによってマルチタスクに実行される
- プロセスは一つ以上のスレッドを持つ
  - スレッドはプロセス空間やファイルディスクリプタを共有する
  - スレッドはスタック、レジスタ、プログラムカウンタから構成される実行コンテキスト
  - マルチスレッドにすると、ひとつのプロセスが複数の CPU にまたがって並列実行可能
- プロセスは以下の task_struct 構造体に対応する
  - [linux/sched.h at master · torvalds/linux](https://github.com/torvalds/linux/blob/master/include/linux/sched.h#L593-L1198)

```
struct task_struct {
 #...
 /* -1 unrunnable, 0 runnable, >0 stopped: */
 volatile long state;

 /*
  * This begins the randomizable portion of task_struct. Only
  * scheduling-critical items should be added above here.
  */
 randomized_struct_fields_start

 void *stack;
 atomic_t usage;
 /* Per task flags (PF_*), defined further below: */
 unsigned int flags;
 unsigned int ptrace;

 #...

 int on_rq;

 int prio;
 int static_prio;
 int normal_prio;
 unsigned int rt_priority;

 const struct sched_class *sched_class;
 struct sched_entity se;
 struct sched_rt_entity rt;
 #...
 struct sched_dl_entity dl;

 #...

 /*
  * Pointers to the (original) parent process, youngest child, younger sibling,
  * older sibling, respectively.  (p->father can be replaced with
  * p->real_parent->pid)
  */

 /* Real parent process: */
 struct task_struct __rcu *real_parent;

 /* Recipient of SIGCHLD, wait4() reports: */
 struct task_struct __rcu *parent;

 /*
  * Children/sibling form the list of natural children:
  */
 struct list_head children;
 struct list_head sibling;
 struct task_struct *group_leader;

 /*
  * 'ptraced' is the list of tasks this task is using ptrace() on.
  *
  * This includes both natural children and PTRACE_ATTACH targets.
  * 'ptrace_entry' is this task's link on the p->parent->ptraced list.
  */
 struct list_head ptraced;
 struct list_head ptrace_entry;

 /* PID/PID hash table linkage. */
 struct pid_link pids[PIDTYPE_MAX];
 struct list_head thread_group;
 struct list_head thread_node;

 struct completion *vfork_done;

 /* CLONE_CHILD_SETTID: */
 int __user *set_child_tid;

 /* CLONE_CHILD_CLEARTID: */
 int __user *clear_child_tid;

 u64 utime;
 u64 stime;

 #...
}
```

- プロセスは以下のようなライフサイクルを持つ
  - マルチスレッド下では スレッドがスケジューリングされるような実装が追加される

```
                          <=　(プリエンプション/タイムクォンタムを使い切る)
プロセス作成 --> [アイドル状態] => [実行可能] => [処理中] => [ゾンビ状態]
                      ^                      |
                      |------[スリープ]<-------|  (I/O など: ブロック)
```

- プロセス環境は、アドレス空間内のデータとカーネルコンテキストから構成される
- カーネルコンテキストは ps コマンドで解析できる
  　　- プロセスのプロパティと統計情報から構成される
- ユーザーアドレス空間には実行可能ファイル、ライブラリ、ヒープからなるプロセスセグメントが含まれている

## 演習

[システムコール、プロセスと task_struct 構造体](http://www.coins.tsukuba.ac.jp/~yas/coins/os2-2013/2013-12-26/) より引用

> ★ 問題(101) システム・コールとライブラリ関数の相違点
> システム・コールとライブラリ関数の相違点を述べなさい。

WIP

> ★ 問題(102) chdir()システムコールの引数と結果
> このシステム・コールを処理する関数がカーネルの中でどのように定義されて いるか、その概略(引数と結果の宣言)を示しなさい。関数の内容は空でよい。 マクロを利用しても利用しなくてもどちらでもよい。

WIP

> ★ 問題(103) Ready 状態のプロセス
> オペレーティング・システムでは、「一般に」プロセスは、 実行待ち(Ready)、実行中(Running)、 待機中(Waiting、Blocked)という３つの 状態を持つ。Linux において、プロセスが Ready 状態であることを 示すために、task struct のフィールド state に、何という値を設定しているか。

WIP

> ★ 問題(104) pid と ppid

WIP

> ★ 問題(105) getuid()システム・コール
> getuid() システム・コールを実装の概略を、今日の授業の範囲内で答えなさい。 利用する重要な変数、マクロ、構造体を列挙しなさい。そして、どのようにポ インタをたどっていくかを示しなさい。概略を記述するためには、簡易的なＣ 言語、日本語、または、英語を使いなさい。

WIP

## 参考資料

> 自分は最初は「バッファオーバーフローぐらい知ってるぞ」などと調子づいていたのですが、それを実現するための鮮やかな手際、環境変数を利用したスマートな攻撃方法、はたまたシェルコードの説明やシェルコードを自作する方法まで載っていて、自分の知らなかった情報が詰まっていてすごく面白かったです。「root 権限で動く process に脆弱性があるとすごく危険」という事実も、知識としては知っていたものの、実際に「脆弱性を突いて root で shell を立ち上げるコード」を目にすることで「実感」を持つことが出来るようになりました
> [「HACKING」や「Linux カーネル 2.6 解読室」など、最近の「買って良かった技術書」について - Nao Minami's Blog](http://south37.hatenablog.com/entry/2016/11/19/%E3%80%8CHACKING%E3%80%8D%E3%82%84%E3%80%8CLinux%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%AB2.6%E8%A7%A3%E8%AA%AD%E5%AE%A4%E3%80%8D%E3%81%AA%E3%81%A9%E3%80%81%E6%9C%80%E8%BF%91%E3%81%AE%E3%80%8C%E8%B2%B7) より引用

面白そう。読んでみたい。

- [加藤和彦先生「オペレーティングシステムの世界」 - YouTube](https://www.youtube.com/watch?v=B0mV2OtkwsE)
- [Write your own Operating System in 1 hour - YouTube](https://www.youtube.com/watch?v=1rnA6wpF0o4&t=446s)
- [Operating System Basics - YouTube](https://www.youtube.com/watch?v=9GDX-IyZ_C8)
- [Lecture 1: Introduction - YouTube](https://www.youtube.com/watch?v=dv4mXBsv6TI&list=PLacuG5pysFbDQU8kKxbUh4K5c1iL5_k7k&t=0s&index=2)
