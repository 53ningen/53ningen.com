---
title: XenServer 7.4 のインストール
category: programming
date: 2018-05-08 21:24:18
tags: [Xen]
pinned: false
---

不要になった Lenovo に XenServer 7.4 をいれておもちゃにするための作業ログ

## XenServer 7.4 イメージの準備

- [XenServer 7.4 Free Edition - Citrix](https://www.citrix.com/downloads/xenserver/product-software/xenserver-74-free-edition.html) にてダウンロードできる
- 続いて以下のような感じで　 USB メモリに書き込む

```
~ $ diskutil list
/dev/disk0 (internal):

...

/dev/disk2 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *2.0 GB     disk2
   1:                 DOS_FAT_16 NIKON D90               2.0 GB     disk2s1

~ $
~ $ sudo diskutil eraseDisk FAT32 XEN MBRFormat /dev/disk2
Started erase on disk2
Unmounting disk
Creating the partition map
Waiting for partitions to activate
Formatting disk2s1 as MS-DOS (FAT32) with name XEN
512 bytes per physical sector
/dev/rdisk2s1: 3854960 sectors in 481870 FAT32 clusters (4096 bytes/cluster)
bps=512 spc=8 res=32 nft=2 mid=0xf8 spt=32 hds=255 hid=2 drv=0x80 bsec=3862526 bspf=3765 rdcl=2 infs=1 bkbs=6
Mounting disk
Finished erase on disk2
~ $ diskutil unmountDisk /dev/disk2
Unmount of all volumes on disk2 was successful
~ $ cd ~/Downloads/
Downloads $ sudo dd bs=1m if=XenServer-7.4.0-install-cd.iso of=/dev/rdisk2
652+0 records in
652+0 records out
683671552 bytes transferred in 99.742969 secs (6854333 bytes/sec)
```

## XenServer のインストール

- BIOS の設定変更
  - ブート優先順位を USB 最優先に設定する
  - Hardware Virtualization Assist Support を有効化する
- USB メモリをマシンに差し込んで起動するとインストールウィザードが流れるので、それにしたがいよしなに
  - thin プロビジョニングを有効化してインストールしました
  - IP アドレスを static に割り当て

## XenServer にログインで散歩

- ssh で普通に入れる

```
$ ssh root@192.168.1.250
root@192.168.1.250's password:
Last login: Tue May  8 22:11:42 2018 from 192.168.1.19
[root@xenserver01 ~]# lsblk
NAME                                                                                              MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda                                                                                                 8:0    0 465.8G  0 disk
├─sda1                                                                                              8:1    0    18G  0 part /
├─sda2                                                                                              8:2    0    18G  0 part
├─sda3                                                                                              8:3    0 424.3G  0 part
│ └─XSLocalEXT--a2caae22--0533--5884--2202--56fa891ec813-a2caae22--0533--5884--2202--56fa891ec813 253:0    0 424.3G  0 lvm  /run/sr-mount/a2caae22-0533-5884-2202-56fa891ec813
├─sda4                                                                                              8:4    0   512M  0 part
├─sda5                                                                                              8:5    0     4G  0 part /var/log
└─sda6                                                                                              8:6    0     1G  0 part [SWAP]
sr0                                                                                                11:0    1  1024M  0 rom
loop0                                                                                               7:0    0  43.7M  1 loop /var/xen/xc-install
```

### vm リストを表示する

```
[root@xenserver01 ~]# xe vm-list
uuid ( RO)           : c47a8bda-a687-4c98-9259-915e30e00d49
     name-label ( RW): Control domain on host: xenserver01
    power-state ( RO): running
```

### マネジメントコンソールをリモートホスト上で表示する

`xsconsole` と打つと以下のようにリモートホスト上からもマネジメントコンソールが表示できる

<a href="https://static.53ningen.com/wp-content/uploads/2018/05/08230722/UKQ5F8o.png"><img src="https://static.53ningen.com/wp-content/uploads/2018/05/08230722/UKQ5F8o-1024x830.png" alt="" width="640" height="519" class="aligncenter size-large wp-image-2435" /></a>

## XenServer 上に CentOS 7 仮想マシンを起動する

1. [CentOS VM Images for VMware & VirtualBox](https://www.osboxes.org/centos/) にて VMDK ファイルをダウンロードする
2. Install-Package 7Zip4Powershell
3. Expand-7Zip ./CentOS_7-1708-VB-64bit.7z
4. [How to Import VMDK Files to XenServer](https://support.citrix.com/article/CTX140423) に従い XenCenter から Import する

- [Password for virtual machines](https://www.osboxes.org/faq/what-are-the-credentials-for-virtual-machine-image/) を参照して起動した VM にログイン
