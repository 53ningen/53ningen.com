---
title: シェル上で逆順出力などアレコレ
category: programming
date: 2018-07-07 15:00:28
tags: [shell]
pinned: false
---

reverse 関数的なものをシェル上でやる必要に迫られたこと一切ないのだけれど、気になったら普通にあったのでメモっておく

### on Linux

[util-linux](https://github.com/karelzak/util-linux) に納められている `rev` というコマンドが使える

```
$ cat /tmp/hoge
hoge
fuga
piyo
$ rev /tmp/hoge
egoh
aguf
oyip
```

[coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html) に cat の反対で下から舐めていく tac というコマンドもある

```
$ tac /tmp/hoge
piyo
fuga
hoge
```

### on macOS

`rev` が使える

```
$ rev /tmp/hoge
egoh
aguf
oyip
```

coreutils をぶち込めば `tac` を `gtac` とコールする形で呼び出せる

```
$ brew install coreutils
$ gtac /tmp/hoge
piyo
fuga
hoge
```
