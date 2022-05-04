---
title: ファイルシステムのマウント
category: programming
date: 2018-04-14 00:36:19
tags: [AWS, Linux, EC2, EBS, Storage]
pinned: false
---

> 情報ソース:
>
> - man mount
> - man umount
> - [ファイルシステムのマウント](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/storage_administration_guide/sect-using_the_mount_command-mounting)

- パーティションやリムーバブルデバイス上にあるファイルシステムをディレクトリツリーないの特定のポイントであるマウントポイントに接続すること
- ファイルシステムをマウントするには `mount` コマンドを使う
  - `device` はブロックデバイスへの完全パス(ex: `/dev/sda3`)やボリュームラベルを指定する
- `mount -a` は `/etc/fatab` に書かれているファイルシステムについてすべてマウントするという動き

```
SYNOPSIS
  mount [-lhV]
  mount -a [-fFnrsvw] [-t vfstype] [-O optlist]
  mount [-fnrsvw] [-o option[,option]...]  device|dir
  mount [-fnrsvw] [-t vfstype] [-o options] device dir
```

## マウントされているファイルシステムの一覧

- 現在マウントされているファイルシステムの一覧は、単純に `mount` で確認できる
- df でも確認できる

```
[ec2-user@ip-172-31-40-79 ~]$ mount
proc on /proc type proc (rw,relatime)
sysfs on /sys type sysfs (rw,relatime)
devtmpfs on /dev type devtmpfs (rw,relatime,size=499560k,nr_inodes=124890,mode=755)
devpts on /dev/pts type devpts (rw,relatime,gid=5,mode=620,ptmxmode=000)
tmpfs on /dev/shm type tmpfs (rw,relatime)
/dev/xvda1 on / type ext4 (rw,noatime,data=ordered)
devpts on /dev/pts type devpts (rw,relatime,gid=5,mode=620,ptmxmode=000)
none on /proc/sys/fs/binfmt_misc type binfmt_misc (rw,relatime)
```

## マウントオプション

> 情報ソース: [マウントオプションの指定](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/storage_administration_guide/sect-using_the_mount_command-mounting#sect-Using_the_mount_Command-Mounting-Options)

- RHEL ドキュメントから引用

> async ファイルシステム上での非同期の入/出力を許可します。
> auto mount -a コマンドを使ったファイルシステムの自動マウントを許可します。
> defaults async,auto,dev,exec,nouser,rw,suid のエイリアスを指定します。
> exec 特定のファイルシステムでのバイナリーファイルの実行を許可します。
> loop イメージをループデバイスとしてマウントします。
> noauto mount -a コマンドを使ったファイルシステムの自動マウントをデフォルトの動作として拒否します。
> noexec 特定のファイルシステムでのバイナリーファイルの実行を拒否します。
> nouser 普通のユーザー (つまり root 以外のユーザー) によるファイルシステムのマウントおよびアンマウントを拒否します。
> remount ファイルシステムがすでにマウントされている場合は再度マウントを行います。
> ro 読み取り専用でファイルシステムをマウントします。
> rw ファイルシステムを読み取りと書き込み両方でマウントします。
> user 普通のユーザー (つまり root 以外のユーザー) によるファイルシステムのマウントおよびアンマウントを許可します。

```

# 以下のような形で用いる
mount -o options device directory
```

## アンマウントの実行条件

- アンマウントは `umount` で行える
- `umount` の man の DESCRIPTION は以下のとおり
- ファイルシステムがビジー状態のときはマウントできない
  - 例えば、ファイルを open しているときや、プロセスのワーキングディレクトリとなっているとき

> The umount command detaches the file system(s) mentioned from the file hierarchy. A file system is specified by giving the directory where it has been mounted. Giving the special device on which the file system lives may also work, but is obsolete, mainly because it will fail in case this device was mounted on more than one directory.
> Note that a file system cannot be unmounted when it is 'busy' - for example, when there are open files on it, or when some process has its working directory there, or when a swap file on it is in use. The offending process could even be umount itself - it opens libc, and libc in its turn may open for example locale files. A lazy unmount avoids this problem.

## Amazon EC2 インスタンスにアタッチした EBS ボリュームをマウントする

AWS でサクッと実験

> 情報ソース: [Amazon EBS ボリュームを使用できるようにする](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ebs-using-volumes.html)

### 実験 1: EBS ボリュームへのファイルシステムの作成とマウント

- Amazon EC2 インスタンスに EBS ボリュームをアタッチするとブロックデバイスとして表示される
  - `/dev/sdb`, `/dev/sdc` というデバイス名で EBS ボリュームをアタッチした
  - カーネルによってはこの名前どおりになっていない可能性があるが、ほとんどの場合末尾の文字はそのままつかわれる
  - 下記のようにルートボリュームデバイス `/dev/xvda1` のみが、マウントポイント `/` にマウントされている状態であることがわかる

```
[ec2-user@ip-172-31-40-79 ~]$ lsblk
NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvdc    202:32   0   8G  0 disk
xvda    202:0    0   8G  0 disk
└─xvda1 202:1    0   8G  0 part /
xvdb    202:16   0   8G  0 disk
```

- 新しく作ったボリュームは未加工のブロックデバイスであるため、ファイルシステムを作成する必要がある
- ファイルシステムが存在するのか念のため確認しておくために `sudo file -s /dev/xvdb` などと打っておく
  - 単に `data` と表示された場合はファイルシステムが作られていない

```
[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvda
/dev/xvda: DOS/MBR boot sector; GRand Unified Bootloader, stage1 version 0x3, stage2 address 0x2000, 1st sector stage2 0x800, stage2 segment 0x200, GRUB version 0.94, extended partition table (last)
[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvdc
/dev/xvdc: data
[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvdb
/dev/xvdb: data
```

- デバイス `xvdc`, `xvdb` に ext4 ファイルシステムを作成する

```
[ec2-user@ip-172-31-40-79 ~]$  sudo mkfs -t ext4 /dev/xvdc
mke2fs 1.42.12 (29-Aug-2014)
Creating filesystem with 2097152 4k blocks and 524288 inodes
Filesystem UUID: e95fa823-347a-4f25-bbdc-f02c65bc924b
Superblock backups stored on blocks:
 32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632

Allocating group tables: done
Writing inode tables: done
Creating journal (32768 blocks): done
Writing superblocks and filesystem accounting information: done

[ec2-user@ip-172-31-40-79 ~]$  sudo mkfs -t ext4 /dev/xvdb
mke2fs 1.42.12 (29-Aug-2014)
Creating filesystem with 2097152 4k blocks and 524288 inodes
Filesystem UUID: 9fa3d955-b3db-4cd4-8f71-dc034a2db50f
Superblock backups stored on blocks:
 32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632

Allocating group tables: done
Writing inode tables: done
Creating journal (32768 blocks): done
Writing superblocks and filesystem accounting information: done

[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvdc
/dev/xvdc: Linux rev 1.0 ext4 filesystem data, UUID=e95fa823-347a-4f25-bbdc-f02c65bc924b (extents) (large files) (huge files)
[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvdb
/dev/xvdb: Linux rev 1.0 ext4 filesystem data, UUID=9fa3d955-b3db-4cd4-8f71-dc034a2db50f (extents) (large files) (huge files)
```

- 最後に、マウントポイントを作成して、実際にマウントを行う
  - アンマウントは `umount マウントポイント` でイケる

```
[ec2-user@ip-172-31-40-79 ~]$ df -ha
Filesystem      Size  Used Avail Use% Mounted on
proc               0     0     0    - /proc
sysfs              0     0     0    - /sys
devtmpfs        488M   64K  488M   1% /dev
devpts             0     0     0    - /dev/pts
tmpfs           497M     0  497M   0% /dev/shm
/dev/xvda1      7.8G  1.1G  6.6G  15% /
devpts             0     0     0    - /dev/pts
none               0     0     0    - /proc/sys/fs/binfmt_misc
#=> まだマウントされていない

[ec2-user@ip-172-31-40-79 ~]$ sudo mkdir -p /mnt/c
[ec2-user@ip-172-31-40-79 ~]$ sudo mkdir -p /mnt/b
[ec2-user@ip-172-31-40-79 ~]$ sudo mount /dev/xvdc /mnt/c
[ec2-user@ip-172-31-40-79 ~]$ sudo mount /dev/xvdb /mnt/b
[ec2-user@ip-172-31-40-79 ~]$ df -ha
Filesystem      Size  Used Avail Use% Mounted on
proc               0     0     0    - /proc
sysfs              0     0     0    - /sys
devtmpfs        488M   64K  488M   1% /dev
devpts             0     0     0    - /dev/pts
tmpfs           497M     0  497M   0% /dev/shm
/dev/xvda1      7.8G  1.1G  6.6G  15% /
devpts             0     0     0    - /dev/pts
none               0     0     0    - /proc/sys/fs/binfmt_misc
/dev/xvdc       7.8G   18M  7.4G   1% /mnt/c
/dev/xvdb       7.8G   18M  7.4G   1% /mnt/b
#=> xvdc, xvdb がマウントされていることが確認できた
```

- `/etc/fstab` に書いておけばブート時にマウントされるようになる
  - デバイス名の代わりに UUID を使ったほうが不具合がおきにくい
  - 起動にマウントが必ずしも必要でない場合は nofail マウントオプションを指定しておいたほうが良い

```
[ec2-user@ip-172-31-40-79 ~]$ #=> UUID の確認
[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvdb
/dev/xvdb: Linux rev 1.0 ext4 filesystem data, UUID=9fa3d955-b3db-4cd4-8f71-dc034a2db50f (needs journal recovery) (extents) (large files) (huge files)
[ec2-user@ip-172-31-40-79 ~]$ sudo file -s /dev/xvdc
/dev/xvdc: Linux rev 1.0 ext4 filesystem data, UUID=e95fa823-347a-4f25-bbdc-f02c65bc924b (needs journal recovery) (extents) (large files) (huge files)
[ec2-user@ip-172-31-40-79 ~]$
[ec2-user@ip-172-31-40-79 ~]$ #=> fstab のバックアップ
[ec2-user@ip-172-31-40-79 ~]$ sudo cp /{etc,tmp}/fstab
[ec2-user@ip-172-31-40-79 ~]$
[ec2-user@ip-172-31-40-79 ~]$ #=> fstab の編集
[ec2-user@ip-172-31-40-79 ~]$ sudo /etc/fstab
[ec2-user@ip-172-31-40-79 ~]$
[ec2-user@ip-172-31-40-79 ~]$ diff /{tmp,etc}/fstab
6a7,8
> UUID=9fa3d955-b3db-4cd4-8f71-dc034a2db50f    /mnt/b    ext4    defaults,nofail    0    2
> UUID=e95fa823-347a-4f25-bbdc-f02c65bc924b    /mnt/c    ext4    defaults,nofail    0    2
[ec2-user@ip-172-31-40-79 ~]$
[ec2-user@ip-172-31-40-79 ~]$ #=> 設定がうまくできたか確認（エラーがでなければ OK）
[ec2-user@ip-172-31-40-79 ~]$ sudo mount -a
```

この状態で AMI を作り、新たなインスタンスを起動したときのシステムログをマネジメントコンソールからのぞいてみた

```
[    0.000000] Linux version 4.9.81-35.56.amzn1.x86_64 (mockbuild@gobi-build-64010) (gcc version 7.2.1 20170915 (Red Hat 7.2.1-2) (GCC) ) #1 SMP Fri Feb 16 00:18:48 UTC 2018
[    0.000000] Command line: root=LABEL=/ console=tty1 console=ttyS0 selinux=0 nvme_core.io_timeout=4294967295

...中略...

[    1.377030] blkfront: xvda: barrier or flush: disabled; persistent grants: disabled; indirect descriptors: enabled;
[    1.466646]  xvda: xvda1
[    1.470952] blkfront: xvdb: barrier or flush: disabled; persistent grants: disabled; indirect descriptors: enabled;
[    1.483846] blkfront: xvdc: barrier or flush: disabled; persistent grants: disabled; indirect descriptors: enabled;

...中略...

[    1.945052] EXT4-fs (xvda1): mounted filesystem with ordered data mode. Opts: (null)
[    2.246964] dracut: Remounting /dev/disk/by-label/\x2f with -o noatime,ro
[    2.254239] EXT4-fs (xvda1): mounted filesystem with ordered data mode. Opts: (null)
[    2.261316] dracut: Mounted root filesystem /dev/xvda1
[    2.287777] dracut: Switching root
image_name="amzn-ami-hvm"
image_version="2017.09"
image_arch="x86_64"
image_file="amzn-ami-hvm-2017.09.1.20180307-x86_64.ext4.gpt"
image_stamp="4f0a-5dc5"
image_date="20180307064742"
recipe_name="amzn ami"
recipe_id="c9c871d2-7d71-8baa-e873-c70f-cbbe-ddb2-79ee86e7"
 Welcome to Amazon Linux AMI
[    4.039394] random: crng init done
Starting udev: [    4.090251] udevd[1557]: starting version 173
[    4.155430] input: ImExPS/2 Generic Explorer Mouse as /devices/platform/i8042/serio1/input/input3
[    4.254276] input: Power Button as /devices/LNXSYSTM:00/LNXPWRBN:00/input/input4
[    4.264165] ACPI: Power Button [PWRF]
[    4.267003] input: Sleep Button as /devices/LNXSYSTM:00/LNXSLPBN:00/input/input5
[    4.281774] ACPI: Sleep Button [SLPF]
[    4.285643] mousedev: PS/2 mouse device common for all mice
[  OK  ]

Setting hostname localhost.localdomain:  [  OK  ]

Setting up Logical Volume Management:   WARNING: Failed to connect to lvmetad. Falling back to device scanning.
[  OK  ]

Checking filesystems
Checking all file systems.
[/sbin/fsck.ext4 (1) -- /] fsck.ext4 -a /dev/xvda1
/: clean, 37254/524288 files, 330862/2096635 blocks
[/sbin/fsck.ext4 (1) -- /mnt/b] fsck.ext4 -a /dev/xvdb
[/sbin/fsck.ext4 (2) -- /mnt/c] fsck.ext4 -a /dev/xvdc
/dev/xvdb: clean, 12/524288 files, 70287/2097152 blocks
/dev/xvdc: clean, 11/32768000 files, 2107224/131072000 blocks
[  OK  ]

Remounting root filesystem in read-write mode:  [    5.954268] EXT4-fs (xvda1): re-mounted. Opts: (null)
[  OK  ]

Mounting local filesystems:  [    5.972827] EXT4-fs (xvdb): mounted filesystem with ordered data mode. Opts: (null)
[    5.994295] EXT4-fs (xvdc): mounted filesystem with ordered data mode. Opts: (null)
[  OK  ]

Enabling local filesystem quotas:  [  OK  ]

Enabling /etc/fstab swaps:  [  OK  ]

...中略...

Amazon Linux AMI release 2017.09
Kernel 4.9.81-35.56.amzn1.x86_64 on an x86_64

ip-172-31-41-132 login:
```

### 実験 2. readonly でマウントしてみる

- `ro` オプションをつけると当然ながら、書き込みができない

```
[ec2-user@ip-172-31-40-161 ~]$ sudo mount -o ro /dev/xvdb /mnt/b
[ec2-user@ip-172-31-40-161 ~]$ mount
proc on /proc type proc (rw,relatime)
sysfs on /sys type sysfs (rw,relatime)
devtmpfs on /dev type devtmpfs (rw,relatime,size=499564k,nr_inodes=124891,mode=755)
devpts on /dev/pts type devpts (rw,relatime,gid=5,mode=620,ptmxmode=000)
tmpfs on /dev/shm type tmpfs (rw,relatime)
/dev/xvda1 on / type ext4 (rw,noatime,data=ordered)
devpts on /dev/pts type devpts (rw,relatime,gid=5,mode=620,ptmxmode=000)
none on /proc/sys/fs/binfmt_misc type binfmt_misc (rw,relatime)
/dev/xvdb on /mnt/b type ext4 (ro,relatime,data=ordered)
[ec2-user@ip-172-31-40-161 ~]$
[ec2-user@ip-172-31-40-161 ~]$ #=> read-only でマウントしているので書き込めない
[ec2-user@ip-172-31-40-161 ~]$ sudo touch /mnt/b/test
touch: cannot touch ‘/mnt/b/test’: Read-only file system
```

### 実験 3. マウント失敗時のふるまいを試す

1. `/mnt/b` に `cd` して、cwd を マウントポイントにします
2. そして、いざアンマウントしてみると以下のように失敗します

```
[ec2-user@ip-172-31-40-161 b]$ mount
proc on /proc type proc (rw,relatime)
sysfs on /sys type sysfs (rw,relatime)
devtmpfs on /dev type devtmpfs (rw,relatime,size=499564k,nr_inodes=124891,mode=755)
devpts on /dev/pts type devpts (rw,relatime,gid=5,mode=620,ptmxmode=000)
tmpfs on /dev/shm type tmpfs (rw,relatime)
/dev/xvda1 on / type ext4 (rw,noatime,data=ordered)
devpts on /dev/pts type devpts (rw,relatime,gid=5,mode=620,ptmxmode=000)
none on /proc/sys/fs/binfmt_misc type binfmt_misc (rw,relatime)
/dev/xvdb on /mnt/b type ext4 (rw,relatime,data=ordered)
[ec2-user@ip-172-31-40-161 b]$ pwd
/mnt/b
[ec2-user@ip-172-31-40-161 b]$ sudo umount /mnt/b
umount: /mnt/b: target is busy.
        (In some cases useful info about processes that use
         the device is found by lsof(8) or fuser(1))
```

また、cwd がマウントポイントなプロセスが動いている状態で、umount しても（あたりまえではあるが）同様

```
[ec2-user@ip-172-31-40-161 tmp]$ cd /mnt/b/
[ec2-user@ip-172-31-40-161 b]$
[ec2-user@ip-172-31-40-161 b]$
[ec2-user@ip-172-31-40-161 b]$
[ec2-user@ip-172-31-40-161 b]$
[ec2-user@ip-172-31-40-161 b]$ bash &
[2] 2758
[ec2-user@ip-172-31-40-161 b]$ cd /tmp/
[ec2-user@ip-172-31-40-161 tmp]$ ps aux | grep 2758
ec2-user  2758  0.0  0.2 115220  2980 pts/0    T    15:10   0:00 bash
ec2-user  2760  0.0  0.2 110468  2140 pts/0    S+   15:10   0:00 grep --color=auto 2758
[ec2-user@ip-172-31-40-161 tmp]$ ls -l /proc/2758/cwd
lrwxrwxrwx 1 ec2-user ec2-user 0 Apr 13 15:11 /proc/2758/cwd -> /mnt/b
[ec2-user@ip-172-31-40-161 tmp]$ sudo umount /mnt/b/
umount: /mnt/b: target is busy.
        (In some cases useful info about processes that use
         the device is found by lsof(8) or fuser(1))
```
