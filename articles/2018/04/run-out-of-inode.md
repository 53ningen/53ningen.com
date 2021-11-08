---
slug: run-out-of-inode
title: inode を枯渇させる
category: programming
date: 2018-04-14 17:12:36
tags: [Linux,FileSystem]
pinned: false
---

## ファイルシステムと inode

- ファイルシステムにより、ブロックデバイスのファイル管理を構造的に取り扱える
- ファイルはブロックの集まりに名前をつけたものにすぎない
- 一般的には木構造でファイル/ディレクトリを取り扱う
- ファイルシステムにより、ブロックデバイスの仕様を知らなくてもファイルにアクセスできたり、権限管理ができたりする
- inode はファイルシステムオブジェクトのメタデータを保持するデータ構造


## ext4 の inode を使い果たす

- ext4 は最初に inode 1つあたりのデータのバイト数を指定して作る（bytes-per-inode）
- 空のファイルを大量に作ると inode が枯渇して楽しい（？）
  - Let's get started!

```
$ # inode の空きを確認
$ df -i
Filesystem     Inodes  IUsed  IFree IUse% Mounted on
devtmpfs       124891    456 124435    1% /dev
tmpfs          127132      1 127131    1% /dev/shm
/dev/xvda1     524288  37453 486835    8% /
/dev/xvdf       65536     11  65525    1% /mnt/f
$
$ # ファイルをたくさん作る
$ for i in `seq 0 65535`; do sudo touch /mnt/f/files/$i; done &
[1] 17473
$
$ # inode が使われていく様を観察してると楽しい（ホンマか？）
$ watch -d -n 1 df -i
Every 1.0s: df -i                                                            Sat Apr 14 06:36:02 2018

Filesystem     Inodes  IUsed  IFree IUse% Mounted on
devtmpfs       124891    456 124435    1% /dev
tmpfs          127132    1 127131    1% /dev/shm
/dev/xvda1     524288  37453 486835    8% /
/dev/xvdf 65536  14017  51519   22% /mnt/f

$
$ # ご臨終した様子
$ df -i
Filesystem     Inodes  IUsed  IFree IUse% Mounted on
devtmpfs       124891    456 124435    1% /dev
tmpfs          127132      1 127131    1% /dev/shm
/dev/xvda1     524288  37453 486835    8% /
/dev/xvdf       65536  65536      0  100% /mnt/f
```

- この状態でファイルを作ろうとすると `No space left on device` なるエラーがでる
  - とはいえディスクのスペース自体は空いてる

```
$ sudo touch /mnt/f/new_file!
touch: cannot touch ‘/mnt/f/new_file!’: No space left on device
$
$ # No space left on device と出るがディスクのスペース自体は余裕がある
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs        488M   64K  488M   1% /dev
tmpfs           497M     0  497M   0% /dev/shm
/dev/xvda1      7.8G  1.1G  6.6G  15% /
/dev/xvdf       976M  2.7M  907M   1% /mnt/f
```


## mkfs 時に bytes-per-inode を変更する

- 小さなファイルを大量に作る予定があるのなら bytes-per-inode を指定してファイルシステムを作ると良い
  - Be warned that it is not possible to change this ratio on a filesystem after it is created

> -i bytes-per-inode
> Specify the bytes/inode ratio.  mke2fs creates an inode  for  every  bytes-per-inode bytes  of space on the disk.  The larger the bytes-per-inode ratio, the fewer inodes will be created.  This value generally shouldn't be smaller than  the  blocksize  of the filesystem, since in that case more inodes would be made than can ever be used. Be warned that it is not possible to change this ratio on a filesystem after  it  is created,  so  be  careful  deciding the correct value for this parameter.  Note that resizing a filesystem changes the numer of inodes to maintain this ratio.
> （man mke2fs より引用）

- bytes-per-inode のデフォルトは `/etc/mke2fs.conf` に書いてある
- `bytes-per-inode = 1024` で作ってみると IFree が `1048565` となった

```
$ sudo mke2fs -i 1024 -t ext4 /dev/xvdf
mke2fs 1.42.12 (29-Aug-2014)
/dev/xvdf contains a ext4 file system
 last mounted on /mnt/f on Sat Apr 14 07:09:06 2018
Proceed anyway? (y,n) y
Creating filesystem with 262144 4k blocks and 1048576 inodes
Filesystem UUID: bfccd16e-e6e4-4500-8277-7c87bb30715d
Superblock backups stored on blocks:
 8384, 25152, 41920, 58688, 75456, 209600, 226368

Allocating group tables: done
Writing inode tables: done
Creating journal (8192 blocks): done
Writing superblocks and filesystem accounting information: done

$ sudo mount /dev/xvdf /mnt/f
$ df -i
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
devtmpfs        124891    456  124435    1% /dev
tmpfs           127132      1  127131    1% /dev/shm
/dev/xvda1      524288  37453  486835    8% /
/dev/xvdb       524288 195265  329023   38% /mnt/b
/dev/xvdf      1048576     11 1048565    1% /mnt/f
```


## そもそも inode にはどんな情報が載っているのか

- `ls` の `-i` オプションで inode 番号を表示できる

```
$ ls -li
total 16
11 drwx------ 2 root root 16384 Apr 14 07:16 lost+found
$ for i in `seq 1 5`; do sudo touch $i; done
$ ls -li
total 16
12 -rw-r--r-- 1 root root     0 Apr 14 07:25 1
13 -rw-r--r-- 1 root root     0 Apr 14 07:25 2
14 -rw-r--r-- 1 root root     0 Apr 14 07:25 3
15 -rw-r--r-- 1 root root     0 Apr 14 07:25 4
16 -rw-r--r-- 1 root root     0 Apr 14 07:25 5
11 drwx------ 2 root root 16384 Apr 14 07:16 lost+found
```

- `stat` コマンドで inode の情報を垣間見ることができる
- 単に `inode` 構造体見ればよい
  - [linux/include/linux/fs.h](https://github.com/torvalds/linux/blob/master/include/linux/fs.h#L565-L673)
  - [unix-v6/inode.h](https://github.com/hephaex/unix-v6/blob/master/inode.h#L11-L25)
- 基本的には以下の情報を持つ
  - file size
  - file type
  - file permissions
  - pointers to data block
  - creation, modification, access times
  - link count

```
$ stat ./1
  File: ‘./1’
  Size: 0          Blocks: 0          IO Block: 4096   regular empty file
Device: ca50h/51792d Inode: 12          Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2018-04-14 07:25:49.017079827 +0000
Modify: 2018-04-14 07:25:49.017079827 +0000
Change: 2018-04-14 07:25:49.017079827 +0000
 Birth: -
$
$ stat ./
 File: ‘./’
 Size: 4096       Blocks: 8          IO Block: 4096   directory
Device: ca50h/51792d Inode: 2           Links: 4
Access: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2018-04-14 07:25:51.933144558 +0000
Modify: 2018-04-14 07:29:27.926104696 +0000
Change: 2018-04-14 07:29:27.926104696 +0000
Birth: -
```


### debugfs を使って inode に対応するファイルパス一覧を表示する

- `debugfs` を使うと inode にリンクされているパスの一覧を表示できる
  - ファイルを `open` したプロセスがいるまま `unlink` を行うと、そのプロセスがファイルディスクリプタを解放するまでファイルにアクセスが可能ではあるが、そのときに inode に対応するパスが存在しない状態になる

```
$ sudo su -
# cat /mnt/f/test
hello, world!
# ls -i /mnt/f/test
19 /mnt/f/test
# debugfs
debugfs 1.42.12 (29-Aug-2014)
debugfs:  open /dev/xvdf
debugfs:  ncheck 19
Inode Pathname
19 //test
```


## 参考図書

- [はじめてのOSコードリーディング](https://amzn.to/2HimNoq)
- [Linux カーネル Hacks](https://amzn.to/2qxcC57)
- [情報科学類 オペレーティングシステム II ファイルシステム](http://www.coins.tsukuba.ac.jp/~yas/coins/os2-2011/2012-02-28/)

[amazon template=wishlist&asin=4774154644]
