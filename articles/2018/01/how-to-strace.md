---
title: strace コマンドで遊ぶ
category: programming
date: 2018-01-11 03:38:48
tags: [Linux, strace]
pinned: false
---

「ふつうの Linux プログラミング」という本をラビットハウス社で輪読しているが、その中で `strace` コマンドというものが出てきた。

# man STRACE(1)

man によると strace とはシステムコールとシグナルをトレースできるツールのようだ

- NAME: strace - trace system calls and signals
- SYNOPSIS: strace [-CdffhiqrtttTvVxxy] [-In] [-bexecve] [-eexpr]... [-acolumn] [-ofile] [-sstrsize] [-Ppath]... -ppid... / [-D] [-Evar[=val]]... [-uusername] command [args]
- In the simplest case strace runs the specified command until it exits. It intercepts and records the system calls which are called by a process and the signals which are received by a process. The name of each system call, its arguments and its return value are printed on standard error or to the file specified with the -o option.

# hello, world の strace

ハロワの strace を見てみよう。テスト対象のコードを書く必要もない気がするけど、次のとおり。

```
#include<stdio.h>

int main() {
    printf("%s", "Hello, World!\n");
}
```

コンパイルして、strace を実行してみる。ちなみに実行環境は CentOS 7。

```
$ gcc hello.c -o hello
$ ./hello
Hello, World!

$ strace ./hello
execve("./hello", ["./hello"], [/* 21 vars */]) = 0
brk(0)                                  = 0x8f3000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f58d095d000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=23239, ...}) = 0
mmap(NULL, 23239, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f58d0957000
close(3)                                = 0
open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0@\34\2\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2118128, ...}) = 0
mmap(NULL, 3932672, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f58d037e000
mprotect(0x7f58d0534000, 2097152, PROT_NONE) = 0
mmap(0x7f58d0734000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1b6000) = 0x7f58d0734000
mmap(0x7f58d073a000, 16896, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f58d073a000
close(3)                                = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f58d0956000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f58d0954000
arch_prctl(ARCH_SET_FS, 0x7f58d0954740) = 0
mprotect(0x7f58d0734000, 16384, PROT_READ) = 0
mprotect(0x600000, 4096, PROT_READ)     = 0
mprotect(0x7f58d095e000, 4096, PROT_READ) = 0
munmap(0x7f58d0957000, 23239)           = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 0), ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f58d095c000
write(1, "Hello, World!\n", 14Hello, World!
)         = 14
exit_group(14)                          = ?
+++ exited with 14 +++
```

`write(1, "Hello, World!\n", 14Hello, World!) = 14` とあるように標準出力に `Hello, World!\n` という文字列を `write(2)` しているのがわかる。 `-c` オプションをつけるとなんかかっこいい感じに統計情報をだしてくれる。

```
$ strace -c ./hello
Hello, World!
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 39.44    0.000028           4         8           mmap
 23.94    0.000017           6         3           fstat
  9.86    0.000007           2         4           mprotect
  7.04    0.000005           3         2           open
  7.04    0.000005           5         1           munmap
  5.63    0.000004           4         1           write
  2.82    0.000002           2         1         1 access
  1.41    0.000001           1         1           read
  1.41    0.000001           1         1           execve
  1.41    0.000001           1         1           arch_prctl
  0.00    0.000000           0         2           close
  0.00    0.000000           0         1           brk
------ ----------- ----------- --------- --------- ----------------
100.00    0.000071                    26         1 total
```

`-e` オプションでトレースしたいシステムコールを指定できる

```
$ strace -e write,open,read,close ./hello
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
close(3)                                = 0
open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0@\34\2\0\0\0\0\0"..., 832) = 832
close(3)                                = 0
write(1, "Hello, World!\n", 14Hello, World!
)         = 14
+++ exited with 14 +++
```

# echo のソースコード

ハロワを出力するだけなら echo で良いので、echo の strace をみてみた

```
$ /bin/echo hello, world!
hello, world!
[cloud@gomi-test02 ~]$ strace /bin/echo hello, world!
execve("/bin/echo", ["/bin/echo", "hello,", "world!"], [/* 21 vars */]) = 0
brk(0)                                  = 0x9db000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f18b0765000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=23239, ...}) = 0
mmap(NULL, 23239, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f18b075f000
close(3)                                = 0
open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0@\34\2\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2118128, ...}) = 0
mmap(NULL, 3932672, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f18b0186000
mprotect(0x7f18b033c000, 2097152, PROT_NONE) = 0
mmap(0x7f18b053c000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1b6000) = 0x7f18b053c000
mmap(0x7f18b0542000, 16896, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f18b0542000
close(3)                                = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f18b075e000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f18b075c000
arch_prctl(ARCH_SET_FS, 0x7f18b075c740) = 0
mprotect(0x7f18b053c000, 16384, PROT_READ) = 0
mprotect(0x606000, 4096, PROT_READ)     = 0
mprotect(0x7f18b0766000, 4096, PROT_READ) = 0
munmap(0x7f18b075f000, 23239)           = 0
brk(0)                                  = 0x9db000
brk(0x9fc000)                           = 0x9fc000
brk(0)                                  = 0x9fc000
open("/usr/lib/locale/locale-archive", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=106070960, ...}) = 0
mmap(NULL, 106070960, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f18a9c5d000
close(3)                                = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 0), ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f18b0764000
write(1, "hello, world!\n", 14hello, world!
)         = 14
close(1)                                = 0
munmap(0x7f18b0764000, 4096)            = 0
close(2)                                = 0
exit_group(0)                           = ?
+++ exited with 0 +++
```

`echo` なんかもおんなじ感じの出力になったので、ソースコードを探しに南米へと飛んだ

```
$ rpm -qf /bin/echo
coreutils-8.22-15.el7.x86_64
```

なるほどな... と思ってソースコード探そうとしたら江添さんがすでに[いろんな UNIX 環境での echo のソースコードについて比較している記事](https://cpplover.blogspot.jp/2013/04/unixechoc.html)が引っかかった。ふむふむ〜。で、実際のソースコードが[これ](http://git.savannah.gnu.org/cgit/coreutils.git/tree/src/echo.c)。意外にながくてクソだるですわ...。結局最後のほうで、`fputs`, `putchar` を呼び出している感じで、これらは内部でバッファリングして、write を呼び出しているので、システムコールの呼び出しは 1 回なのだろうみたいな感じの模様。

# macOS で dtruss を使う

macOS では strace の代わりに dtruss を使えば同じようなことして遊べそう。

```
% sudo dtruss -c ./hello
dtrace: system integrity protection is on, some features will not be available

SYSCALL(args)   = return
Hello, world!
open("/dev/dtracehelper\0", 0x2, 0x7FFF5F02C8B0)  = 3 0
ioctl(0x3, 0x80086804, 0x7FFF5F02C838)  = 0 0
close(0x3)  = 0 0
thread_selfid(0x3, 0x80086804, 0x7FFF5F02C838)  = 24669017 0
bsdthread_register(0x7FFFC34E9080, 0x7FFFC34E9070, 0x2000)  = 1073741919 0
ulock_wake(0x1, 0x7FFF5F02C06C, 0x0)  = -1 Err#2
issetugid(0x1, 0x7FFF5F02C06C, 0x0)  = 0 0
mprotect(0x100BD7000, 0x88, 0x1)  = 0 0
mprotect(0x100BD9000, 0x1000, 0x0)  = 0 0
mprotect(0x100BEF000, 0x1000, 0x0)  = 0 0
mprotect(0x100BF0000, 0x1000, 0x0)  = 0 0
mprotect(0x100C06000, 0x1000, 0x0)  = 0 0
mprotect(0x100C07000, 0x1000, 0x1)  = 0 0
mprotect(0x100BD7000, 0x88, 0x3)  = 0 0
mprotect(0x100BD7000, 0x88, 0x1)  = 0 0
getpid(0x100BD7000, 0x88, 0x1)  = 95127 0
stat64("/AppleInternal/XBS/.isChrooted\0", 0x7FFF5F02BF28, 0x1)  = -1 Err#2
stat64("/AppleInternal\0", 0x7FFF5F02BFC0, 0x1)  = -1 Err#2
csops(0x17397, 0x7, 0x7FFF5F02BA50)  = -1 Err#22
dtrace: error on enabled probe ID 2158 (ID 561: syscall::sysctl:return): invalid kernel access in action #10 at DIF offset 40
ulock_wake(0x1, 0x7FFF5F02BFD0, 0x0)  = -1 Err#2
csops(0x17397, 0x7, 0x7FFF5F02B330)  = -1 Err#22
getrlimit(0x1008, 0x7FFF5F02D7D8, 0x7FFF5F02B330)  = 0 0
fstat64(0x1, 0x7FFF5F02D7F8, 0x7FFF5F02B330)  = 0 0
ioctl(0x1, 0x4004667A, 0x7FFF5F02D83C)  = 0 0
dtrace: error on enabled probe ID 2133 (ID 951: syscall::write_nocancel:return): invalid kernel access in action #12 at DIF offset 92

CALL                                        COUNT
bsdthread_register                              1
close                                           1
exit                                            1
fstat64                                         1
getpid                                          1
getrlimit                                       1
issetugid                                       1
open                                            1
sysctl                                          1
thread_selfid                                   1
write_nocancel                                  1
csops                                           2
ioctl                                           2
stat64                                          2
ulock_wake                                      2
mprotect                                        8
```
