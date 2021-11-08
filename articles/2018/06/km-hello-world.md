---
slug: km-hello-world
title: Hello, World カーネルモジュール
category: programming
date: 2018-06-03 13:07:08
tags: [Linux, LinuxKernel, C言語]
pinned: false
---

超技術書典で買った [LINUX カーネルモジュール自作入門](http://uchan.hateblo.jp/entry/2017/03/22/074801) を参考にしつつ、自作カーネルモジュールの Hello, World までをやってみました。参考書籍として [Linux カーネル Hacks](https://amzn.to/2LWHRjE) なんかも参照しながら、カーネルまわりに入門した。

- Linux カーネルはモノリシック
- ただしモジュール機能がある
  - ファイルシステム、デバイスドライバなどはモジュール単位でカーネル空間に動的に追加・削除が可能
  - Linux カーネル空間に動的に組み込み可能なバイナリ入るは .ko の拡張子を持つ
- カーネルモジュールの作成方法は以下の 2 通り
  　　- カーネルソースツリーに含まれる機能をモジュールとして作成する
  　　- 独自機能をモジュールとして作成する

以下では独自カーネルモジュールを作成してみる

[amazon template=wishlist&asin=4873115019]

## 環境と準備

### 環境

```c
ubuntu@ip-172-31-34-168:~$ cat /etc/os-release
NAME="Ubuntu"
VERSION="16.04.4 LTS (Xenial Xerus)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 16.04.4 LTS"
VERSION_ID="16.04"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"
VERSION_CODENAME=xenial
UBUNTU_CODENAME=xenial
ubuntu@ip-172-31-34-168:~$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description: Ubuntu 16.04.4 LTS
Release: 16.04
Codename: xenial
ubuntu@ip-172-31-34-168:~$ uname -a
Linux ip-172-31-34-168 4.4.0-1060-aws #69-Ubuntu SMP Sun May 20 13:42:07 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux
```

### 準備

```
$ sudo apt install gcc make
```

## Hello, World!

コードとしては普通にシンプルなコード

```c
#include <linux/module.h>

MODULE_LICENSE("GPL v2");

static int init(void)
{
    printk(KERN_INFO "Hello, Wolrd!\n");
    return 0;
}

module_init(init);
```

- [printk](https://en.wikipedia.org/wiki/Printk): Linux Kernel プログラミングにおけるメッセージ出力のための関数
- ログレベル: printk に指定できるログレベルは以下のようなものがある
  - KERN_EMERG
  - KERN_ALART
  - KERN_CRIT
  - KERN_ERR
  - KERN_WARNING
  - KERN_NOTICE
  - KERN_INFO
  - KERN_DEBUG
- [module_init](https://elixir.bootlin.com/linux/v4.4/source/include/linux/module.h#L77): driver initialization entry point

### ビルド

Makefile をこんな感じで用意して make

```makefile
obj-m := hello.o

all:
 make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
```

### 実行

- 実行には危険を伴うので、いい塩梅の環境で実行する
- 今回は EC2 上の Ubuntu で実験

```
ubuntu@ip-172-31-34-168:~/kern$ make
make -C /lib/modules/4.4.0-1060-aws/build M=/home/ubuntu/kern modules
make[1]: Entering directory '/usr/src/linux-headers-4.4.0-1060-aws'
  CC [M]  /home/ubuntu/kern/hello.o
  Building modules, stage 2.
  MODPOST 1 modules
  CC      /home/ubuntu/kern/hello.mod.o
  LD [M]  /home/ubuntu/kern/hello.ko
make[1]: Leaving directory '/usr/src/linux-headers-4.4.0-1060-aws'
ubuntu@ip-172-31-34-168:~/kern$ sudo insmod ./hello.ko
ubuntu@ip-172-31-34-168:~/kern$ dmesg
[    0.000000] Initializing cgroup subsys cpuset
[    0.000000] Initializing cgroup subsys cpu
...
[    8.618264] cgroup: new mount options do not match the existing superblock, will be ignored
[  932.698886] hello: loading out-of-tree module taints kernel.
[  932.698891] hello: module license 'Dual BDS/GPL' taints kernel.
[  932.698892] Disabling lock debugging due to kernel taint
[  932.698921] hello: module verification failed: signature and/or required key missing - tainting kernel
[  932.700277] Hello, Wolrd!
```

- make すると `.ko` ファイルなどが生成される
- insmode, rmmod でカーネルにモジュールを追加・削除できる

## カーネルモジュールの終了時に処理を行う

`module_init` に対応し、カーネルモジュールの終了処理として `module_exit` に関数を登録すると、カーネルモジュール終了時に処理を行える

```c
#include <linux/module.h>

MODULE_LICENSE("GPL v2");

static int km_init(void)
{
    printk(KERN_INFO "Hello, Wolrd!\n");
    return 0;
}

static int km_exit(void)
{
    printk(KERN_NOTICE "Goodbye, Wolrd!\n");
    return 0;
}


module_init(km_init);
module_exit(km_exit);
```

make してモジュールを組み込み・削除してみる

```
ubuntu@ip-172-31-34-168:~/kern$ make
make -C /lib/modules/4.4.0-1060-aws/build M=/home/ubuntu/kern modules
make[1]: Entering directory '/usr/src/linux-headers-4.4.0-1060-aws'
  Building modules, stage 2.
  MODPOST 1 modules
make[1]: Leaving directory '/usr/src/linux-headers-4.4.0-1060-aws'
ubuntu@ip-172-31-34-168:~/kern$ sudo rmmod hello
ubuntu@ip-172-31-34-168:~/kern$ dmesg
[    0.000000] Initializing cgroup subsys cpuset
[    0.000000] Initializing cgroup subsys cpu
[    0.000000] Initializing cgroup subsys cpuacct
...
[10871.246844] hello: loading out-of-tree module taints kernel.
[10871.246875] hello: module verification failed: signature and/or required key missing - tainting kernel
[10871.247990] Hello, Wolrd!
[10883.036611] Goodbye, Wolrd!
```
