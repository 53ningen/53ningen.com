---
slug: linux-book-memo-1
title: コンピュータシステムとプロセスの概要
category: programming
date: 2018-02-26 01:47:47
tags: [アセンブリ言語, Linux, Linuxのしくみ]
pinned: false
---

[Linux のしくみ](http://amzn.to/2t3uUPQ)を読んで、気になった点、ちょっと深い情報が欲しいなと思い調べた点、ポイントとしてまとめておきたいと思った点、実際に自分の手を動かしてやってみた実験結果などをメモ。

[amazon template=wishlist&asin=477419607X]

## コンピュータシステムの概要

- 種類が同じデバイスは、デバイスドライバを通して同じインターフェースで操作
- CPU やメモリなどリソースはカーネルが管理している
  - プロセス管理システム
  - プロセススケジューラ
  - メモリ管理システム
  - デバイスドライバ
- ストレージはデバイスドライバを通じて直接命令することができるが、通常はファイルシステムを介してアクセスする
  - ファイルシステム

## CPU のモード遷移

- CPU の動作モードにはユーザーモードとカーネルモードがある
- プロセスは通常ユーザーモードで動作しているが、システムコールが発行されると、CPU に割り込みというイベントが発生し、これによりカーネルモードに遷移する
- システムコールの発行は strace コマンドなどで確認できる
  - <a href="https://53ningen.com/how-to-strace/">「strace コマンドで遊ぶ」参照</a>

## プログラムと CPU の動作モード

- sar コマンドを使うとプロセスがユーザーモードとカーネルモードのどちらで実行しているかという割合を取得できる
- ユーザーモードで動作するのはたとえば以下のようなコード
- システムコールを呼び出していない
  - もっともシステムコールを呼び出さないとファイルや画面への読み書きもできないので、意味のあるプログラムは基本的になんらかのシステムコールを呼ぶ

```c
int main(int argc, char *argv[])
{
    while(1);
}
```

- sar コマンドで動作を確認すると確かに 100% ユーザーモードで実行されていることがわかる

```
[common@gomi-back01 workspace]$ gcc -o loop loop.c
[common@gomi-back01 workspace]$ ./loop &
[1] 15233
[common@gomi-back01 workspace]$ sar -P ALL 1 1
Linux 3.10.0-327.36.3.el7.x86_64 (gomi-back01)  02/25/2018  _x86_64_ (3 CPU)

12:12:47 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
12:12:48 PM     all     38.26      0.00      3.36      0.34      0.00     58.05
12:12:48 PM       0    100.00      0.00      0.00      0.00      0.00      0.00
12:12:48 PM       1      0.99      0.00      0.99      0.99      0.00     97.03
12:12:48 PM       2     14.14      0.00     10.10      0.00      0.00     75.76

Average:        CPU     %user     %nice   %system   %iowait    %steal     %idle
Average:        all     38.26      0.00      3.36      0.34      0.00     58.05
Average:          0    100.00      0.00      0.00      0.00      0.00      0.00
Average:          1      0.99      0.00      0.99      0.99      0.00     97.03
Average:          2     14.14      0.00     10.10      0.00      0.00     75.76
[common@gomi-back01 workspace]$ kill 15233
[common@gomi-back01 workspace]$
```

- pid を取得する `getppid` システムコールをよぶ処理を入れると、カーネルモードでの動作優勢となる

```c
[common@gomi-back01 workspace]$ cat ./pid.c
int main(int argc, char *argv[])
{
    while(1)
    {
        getppid();
    }
}

[common@gomi-back01 workspace]$ gcc -o pid pid.c
[common@gomi-back01 workspace]$ ./pid &
[1] 15839
[common@gomi-back01 workspace]$ sar -P ALL 1 1
Linux 3.10.0-327.36.3.el7.x86_64 (gomi-back01)  02/25/2018  _x86_64_ (3 CPU)

12:52:53 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
12:52:54 PM     all      7.74      0.00     25.59      0.00      0.00     66.67
12:52:54 PM       0     23.47      0.00     76.53      0.00      0.00      0.00
12:52:54 PM       1      1.00      0.00      0.00      0.00      0.00     99.00
12:52:54 PM       2      0.00      0.00      0.00      0.00      0.00    100.00

Average:        CPU     %user     %nice   %system   %iowait    %steal     %idle
Average:        all      7.74      0.00     25.59      0.00      0.00     66.67
Average:          0     23.47      0.00     76.53      0.00      0.00      0.00
Average:          1      1.00      0.00      0.00      0.00      0.00     99.00
Average:          2      0.00      0.00      0.00      0.00      0.00    100.00
[common@gomi-back01 workspace]$ kill 15839
[common@gomi-back01 workspace]$
```

### システムコールのラッパー関数

- x86_64 における `getppid` システムコールは次のように発行する
- このあたりは glibc に含まれている
  - glibc は POSIX 規格の関数なども定義されている
- リンクされているライブラリは `ldd` コマンドで確認できる

```
mov $0x6e.%eax
syscall
```

- `getppid()` 呼び出し箇所をインラインアセンブラで記述するとこのような具合

```
[common@gomi-back01 workspace]$ cat ./asm.c
#define GETPPID_SYS_NUM 110 # 0x6e


int main(int argc, char *argv[])
{
    while(1)
    {
        asm volatile("mov %0, %%eax" :: "i"(GETPPID_SYS_NUM));
        asm("syscall;");
    }
}

[common@gomi-back01 workspace]$ gcc ./asm.c  -o asm
[common@gomi-back01 workspace]$ ldd ./loop
 linux-vdso.so.1 =>  (0x00007ffde1f99000)
 libc.so.6 => /lib64/libc.so.6 (0x00007ffae8edb000)
 /lib64/ld-linux-x86-64.so.2 (0x00007ffae92a9000)
[common@gomi-back01 workspace]$ ./asm &
[1] 16998
[common@gomi-back01 workspace]$ sar -P ALL 1 1
Linux 3.10.0-327.36.3.el7.x86_64 (gomi-back01)  02/25/2018  _x86_64_ (3 CPU)

02:15:51 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
02:15:52 PM     all      7.07      0.00     26.60      0.00      0.00     66.33
02:15:52 PM       0      7.14      0.00     28.57      0.00      0.00     64.29
02:15:52 PM       1     14.00      0.00     51.00      0.00      0.00     35.00
02:15:52 PM       2      0.00      0.00      0.00      0.00      1.00     99.00

Average:        CPU     %user     %nice   %system   %iowait    %steal     %idle
Average:        all      7.07      0.00     26.60      0.00      0.00     66.33
Average:          0      7.14      0.00     28.57      0.00      0.00     64.29
Average:          1     14.00      0.00     51.00      0.00      0.00     35.00
Average:          2      0.00      0.00      0.00      0.00      1.00     99.00
[common@gomi-back01 workspace]$ kill 16998
[1]+  Terminated              ./asm
```

## プロセス生成の方法・目的

- `fork`: ウェブサーバーなどで同時にリクエストを受け付ける場合などに、プログラムの処理を複数のプロセスに分ける
- `execve`: シェルから各種プログラムをたちあげるときなどに、プロセスを生成する

### fork 関数のふるまい

1. 子プロセスのメモリ領域を確保して親プロセスのメモリをコピー
2. `fork` 関数は親プロセスと子プロセスで戻り値が異なり、その値に応じたソースコードを、それぞれのプロセスで実行していく

```
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    pid_t pid;
    pid = fork();
    if (pid < 0) {
        printf("%sn", "error");
        exit(-1);
    } else if (pid == 0) {
        // child process
        printf("child process, pid = %dn", getppid());
    } else {
        // parent process
        printf("parent process, pid = %dn", pid);
    }
}

// $ ./bin/fork
// parent process, pid = 13144
// child process, pid = 13143
```

### execve 関数のふるまい

```
#include <unistd.h>

int execve(const char *filename, char *const argv[], char *const envp[]);
```

1. 現在のプロセスのメモリに、引数で指定された実行ファイルのデータを上書きする
2. 新しいプロセスの最初の処理から実行していく

たとえば、execve に `/bin/echo` を引数として渡してやると、そのプロセスは `echo` を実行するプロセスとなる。一般的には `fork()` で生まれた子プロセスの頭で `execve` を呼んで、異なるプログラムを実行させるなどという使い方がある。

```
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    pid_t pid;
    pid = fork();
    if (pid < 0) {
        printf("%s\n", "error");
        exit(-1);
    } else if (pid == 0) {
        // child process
        printf("child process, pid = %d\n", getppid());
        char *as[] = { "/bin/ls", "-l", "/", NULL };
        execve("/bin/ls", as, NULL);
    } else {
        // parent process
        printf("parent process, pid = %d\n", pid);
    }
}

# $ ./execve
# parent process, pid = 9829
# child process, pid = 9828
# $ total 32
# lrwxrwxrwx    1 root root    7 Jan  9 02:30 bin -> usr/bin
# dr-xr-xr-x.   5 root root 4096 Jan  9 02:34 boot
# drwxr-xr-x   19 root root 2860 Nov  6  2016 dev
# drwxr-xr-x.  98 root root 8192 Feb 10 21:56 etc
# drwxr-xr-x.   6 root root   66 Nov  6  2016 home
# lrwxrwxrwx    1 root root    7 Jan  9 02:30 lib -> usr/lib
# 以下略...
```

### プログラムをメモリ上に展開するとは？

- Linux の実行ファイルは Executable Linkable Format (ELF) というフォーマットで構成されている
  - `readelf` コマンドで各種情報が得られる

簡単な Hello, World プログラムの各種実行ファイル情報はこちら

```
[common@gomi-back01 tmp]$ ./hello
hello
[common@gomi-back01 tmp]$ readelf -h hello
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x400440
  Start of program headers:          64 (bytes into file)
  Start of section headers:          6592 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         9
  Size of section headers:           64 (bytes)
  Number of section headers:         30
  Section header string table index: 27
[common@gomi-back01 tmp]$ readelf -S hello
There are 30 section headers, starting at offset 0x19c0:

Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0
  [ 1] .interp           PROGBITS         0000000000400238  00000238
       000000000000001c  0000000000000000   A       0     0     1
  [ 2] .note.ABI-tag     NOTE             0000000000400254  00000254
       0000000000000020  0000000000000000   A       0     0     4
  [ 3] .note.gnu.build-i NOTE             0000000000400274  00000274
       0000000000000024  0000000000000000   A       0     0     4
  [ 4] .gnu.hash         GNU_HASH         0000000000400298  00000298
       000000000000001c  0000000000000000   A       5     0     8
  [ 5] .dynsym           DYNSYM           00000000004002b8  000002b8
       0000000000000060  0000000000000018   A       6     1     8
  [ 6] .dynstr           STRTAB           0000000000400318  00000318
       000000000000003d  0000000000000000   A       0     0     1
  [ 7] .gnu.version      VERSYM           0000000000400356  00000356
       0000000000000008  0000000000000002   A       5     0     2
  [ 8] .gnu.version_r    VERNEED          0000000000400360  00000360
       0000000000000020  0000000000000000   A       6     1     8
  [ 9] .rela.dyn         RELA             0000000000400380  00000380
       0000000000000018  0000000000000018   A       5     0     8
  [10] .rela.plt         RELA             0000000000400398  00000398
       0000000000000048  0000000000000018  AI       5    12     8
  [11] .init             PROGBITS         00000000004003e0  000003e0
       000000000000001a  0000000000000000  AX       0     0     4
  [12] .plt              PROGBITS         0000000000400400  00000400
       0000000000000040  0000000000000010  AX       0     0     16
  [13] .text             PROGBITS         0000000000400440  00000440
       0000000000000182  0000000000000000  AX       0     0     16
  [14] .fini             PROGBITS         00000000004005c4  000005c4
       0000000000000009  0000000000000000  AX       0     0     4
  [15] .rodata           PROGBITS         00000000004005d0  000005d0
       0000000000000016  0000000000000000   A       0     0     8
  [16] .eh_frame_hdr     PROGBITS         00000000004005e8  000005e8
       0000000000000034  0000000000000000   A       0     0     4
  [17] .eh_frame         PROGBITS         0000000000400620  00000620
       00000000000000f4  0000000000000000   A       0     0     8
  [18] .init_array       INIT_ARRAY       0000000000600e10  00000e10
       0000000000000008  0000000000000000  WA       0     0     8
  [19] .fini_array       FINI_ARRAY       0000000000600e18  00000e18
       0000000000000008  0000000000000000  WA       0     0     8
  [20] .jcr              PROGBITS         0000000000600e20  00000e20
       0000000000000008  0000000000000000  WA       0     0     8
  [21] .dynamic          DYNAMIC          0000000000600e28  00000e28
       00000000000001d0  0000000000000010  WA       6     0     8
  [22] .got              PROGBITS         0000000000600ff8  00000ff8
       0000000000000008  0000000000000008  WA       0     0     8
  [23] .got.plt          PROGBITS         0000000000601000  00001000
       0000000000000030  0000000000000008  WA       0     0     8
  [24] .data             PROGBITS         0000000000601030  00001030
       0000000000000004  0000000000000000  WA       0     0     1
  [25] .bss              NOBITS           0000000000601034  00001034
       0000000000000004  0000000000000000  WA       0     0     1
  [26] .comment          PROGBITS         0000000000000000  00001034
       000000000000002d  0000000000000001  MS       0     0     1
  [27] .shstrtab         STRTAB           0000000000000000  00001061
       0000000000000108  0000000000000000           0     0     1
  [28] .symtab           SYMTAB           0000000000000000  00001170
       0000000000000618  0000000000000018          29    45     8
  [29] .strtab           STRTAB           0000000000000000  00001788
       0000000000000237  0000000000000000           0     0     1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), l (large)
  I (info), L (link order), G (group), T (TLS), E (exclude), x (unknown)
  O (extra OS processing required) o (OS specific), p (processor specific)
```

- 主なポイント
  - `.text`: コード領域（機械語）
  - `.data`: データ領域
- より詳細な情報は `man elf` で確認できる
- プログラム実行時に作成されたプロセスのメモリマップは `/proc/${pid}/maps` に書いてある
  - この出力のどこが何を示すかは、`/usr/bin/sleep` の `readelf -S` 情報を付き合わせればわかる

```
[common@gomi-back01 tmp]$ sleep 100000 &
[2] 10459
[common@gomi-back01 tmp]$ cat /proc/10459/maps
00400000-00406000 r-xp 00000000 fd:04 425117                             /usr/bin/sleep
00606000-00607000 r--p 00006000 fd:04 425117                             /usr/bin/sleep
00607000-00608000 rw-p 00007000 fd:04 425117                             /usr/bin/sleep
0096e000-0098f000 rw-p 00000000 00:00 0                                  [heap]
7ff9755e7000-7ff97bb10000 r--p 00000000 fd:04 533586                     /usr/lib/locale/locale-archive
7ff97bb10000-7ff97bcc8000 r-xp 00000000 fd:04 4300641                    /usr/lib64/libc-2.17.so
7ff97bcc8000-7ff97bec8000 ---p 001b8000 fd:04 4300641                    /usr/lib64/libc-2.17.so
7ff97bec8000-7ff97becc000 r--p 001b8000 fd:04 4300641                    /usr/lib64/libc-2.17.so
7ff97becc000-7ff97bece000 rw-p 001bc000 fd:04 4300641                    /usr/lib64/libc-2.17.so
7ff97bece000-7ff97bed3000 rw-p 00000000 00:00 0
7ff97bed3000-7ff97bef4000 r-xp 00000000 fd:04 4300634                    /usr/lib64/ld-2.17.so
7ff97c0e6000-7ff97c0e9000 rw-p 00000000 00:00 0
7ff97c0f3000-7ff97c0f4000 rw-p 00000000 00:00 0
7ff97c0f4000-7ff97c0f5000 r--p 00021000 fd:04 4300634                    /usr/lib64/ld-2.17.so
7ff97c0f5000-7ff97c0f6000 rw-p 00022000 fd:04 4300634                    /usr/lib64/ld-2.17.so
7ff97c0f6000-7ff97c0f7000 rw-p 00000000 00:00 0
7ffd39aaf000-7ffd39ad0000 rw-p 00000000 00:00 0                          [stack]
7ffd39ba7000-7ffd39ba9000 r-xp 00000000 00:00 0                          [vdso]
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0                  [vsyscall]

[common@gomi-back01 tmp]$ readelf -S /bin/sleep
There are 30 section headers, starting at offset 0x79d8:

Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0

# 中略...

  [11] .init             PROGBITS         0000000000401190  00001190
       000000000000001a  0000000000000000  AX       0     0     4
  [12] .plt              PROGBITS         00000000004011b0  000011b0
       0000000000000360  0000000000000010  AX       0     0     16
  [13] .text             PROGBITS         0000000000401510  00001510
       00000000000030ac  0000000000000000  AX       0     0     16
  [14] .fini             PROGBITS         00000000004045bc  000045bc
       0000000000000009  0000000000000000  AX       0     0     4

# 中略...

  [18] .init_array       INIT_ARRAY       0000000000606d28  00006d28
       0000000000000008  0000000000000000  WA       0     0     8
  [19] .fini_array       FINI_ARRAY       0000000000606d30  00006d30
       0000000000000008  0000000000000000  WA       0     0     8

# 以下略...
```

## 参考ページ

- [Linux システムコール徹底ガイド](http://postd.cc/the-definitive-guide-to-linux-system-calls/)
- [０から作る Linux プログラム　システムコールその１　システムコールの呼び出し](http://softwaretechnique.jp/Linux/SystemCall/sc_01.html)
- [GCC Inline Assembler](http://caspar.hazymoon.jp/OpenBSD/annex/gcc_inline_asm.html)
- [システムプログラム](http://www.coins.tsukuba.ac.jp/~syspro/2005/No3.html)
