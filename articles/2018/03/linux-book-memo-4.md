---
title: ストレージとファイルシステム
category: programming
date: 2018-03-01 02:50:03
tags: [Linux, Linuxのしくみ, ストレージ, ファイルシステム]
pinned: false
---

[Linux のしくみ](http://amzn.to/2t3uUPQ)の第７章をよみつつ、気になりどころをまとめたり、手元のマシンで実験したりしてみました。

[amazon template=wishlist&asin=477419607X]

## ファイルシステムをなぜ使うのか

- データの位置と内容の対応関係を管理したい
  - ストレージに記録されているのはあたりまえではあるが基本的にはデータの列
  - したがって、0 番地から 100 番地には秘密のメモ、101 番地から 259 番地はメールなどといった具合に、データと内容の対応関係を覚えていなければならない
  - この役割を担うのがファイルシステム
- 複数の用途で使われるシステムに対して、用途に応じてディスク割り当てを絞りたい
  - システムタスク動作中に、ディスクが枯渇してしまうとシステムに深刻な影響が発生するが、クォータをわけるとシステム動作に必要な領域を仕組みで確保できる
  - また特定のユーザーが大量にディスクを消費して、他のユーザーの利用に支障がでることを防ぎたいなど（ext4, XFS のユーザークォータ、ディレクトリクォータ/Btrfs のサブボリュームクォータ）
- 電源喪失などによって発生する不整合をカバーしたい
  - ext4 や XFS においては、ジャーナル領域に更新内容を書きつつ、実際のデータ領域を操作することにより障害発生時の不整合を防ぐ ジャーナリングという仕組みがある
  - Btrfs ではデータ更新時に新しい領域に更新後データを書き写し、リンクを付け替えるコピーオンライトという仕組みがある
  - ファイルシステムの不整合時にひとまずマウントできる状態への復旧を試みる `fsck` というコマンドがあるが、基本的にはバックアップで対応する

## ファイルシステムとは何か

- Linux でストレージにアクセスする際には通常ファイルシステムを介する
  - 実際には、ファイルシステム共通の処理/独自の処理、デバイスドライバの操作などが、統一したシステムコールというインターフェースで呼び出せる形になっている
- ファイルシステムではファイルとディレクトリが扱える
  - ファイルといってもユーザーが作成する通常のファイルのほかにデバイスファイルというものがある

### デバイスファイル

- デバイスファイルにはシーク可能なブロックデバイスと、シーク不可能なキャラクタデバイスというバリエーションがある
- デバイスファイルはファイルなので、通常のファイルを扱う操作が可能
  - 例えば `echo hoge > /dev/pts/0` などで端末に書き込める（対象の端末に標準出力される）
- ファイルシステムの生データは `strings` コマンドで見ることができる

```
# strings -t x /dev/vda1 | less
      0 XFSB
    200 XAGF
    400 XAGI
   1000 ABTB
   2000 ABTC
   3000 IABT
   8000 INAm
   80db selinuxsystem_u:object_r:root_t:s0
   83db selinuxsystem_u:object_r:root_t:s0
   84db selinuxsystem_u:object_r:etc_t:s0
   85d3 selinuxsystem_u:object_r:etc_t:s0
   85f5 me_t:s0
   86d3 selinuxsystem_u:object_r:etc_t:s0
   86f5 me_t:s0
   872a Oy,g
   8764 /proc/self/mounts
   87db selinuxsystem_u:object_r:etc_t:s0
```

### tmpfs

- メモリベースのファイルシステム
  - 電源を切ると揮発するが、高速
  - `/tmp` や `/var/run` などに使われている

```
$ mount | grep ^tmpfs
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
tmpfs on /run type tmpfs (rw,nosuid,nodev,mode=755)
tmpfs on /sys/fs/cgroup type tmpfs (ro,nosuid,nodev,noexec,mode=755)
tmpfs on /run/user/0 type tmpfs (rw,nosuid,nodev,relatime,size=101612k,mode=700)
tmpfs on /run/user/2001 type tmpfs (rw,nosuid,nodev,relatime,size=101612k,mode=700,uid=2001,gid=2000)
```

### procfs

- プロセスについての情報は procfs というファイルシステムによって `/proc` 下に展開されている
  - 実際`procps` は `/proc` 下のファイルを読み書きしている

### sysfs

- procfs に雑多なものを置くようになってきてしまったので、乱用を防ぐため作られた
- `/sys` 下にマウントされる
  - `/sys/devices`, `/sys/fs` など

### cgroupfs

- プロセスやプロセスのグループに対してリソース制限をかける cgroup が、cgroupfs を介して機能する
- この fs は root しか触れない

### Btrfs(B-tree file system)

- [2017 年 8 月 3 日　 Red Hat，RHEL 7.4 リリースで"脱 Btrfs"を明らかに](http://gihyo.jp/admin/clip/01/linux_dt/201708/03?ard=1520518192)

はい。

## 参考資料

- [tmpfs は本当に容量が動的なのか](http://d.hatena.ne.jp/naoya/20060217/1140176470)
- [Ext4 Filesystem](https://www.kernel.org/doc/Documentation/filesystems/ext4.txt)
- [Linux パーティションに mkfs でファイルシステムを作る](http://kazmax.zpp.jp/linux_beginner/mkfs.html)
