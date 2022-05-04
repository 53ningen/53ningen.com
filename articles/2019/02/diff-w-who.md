---
title: who コマンドと w コマンドの違い
category: programming
date: 2019-02-04 00:39:45
tags: [Linux]
pinned: false
---

`who` と `w` って何が違うのかよくわからなかったので man で確認した

## who コマンド

```
$ man who
NAME
       who - show who is logged on

...

$ who
ec2-user pts/0        2019-02-03 15:26 (xx.xx.xx.xx)
ec2-user pts/1        2019-02-03 15:26 (xx.xx.xx.xx)
```

## w コマンド

```
$ man w
NAME
       w - Show who is logged on and what they are doing.
...

$ w
 15:30:18 up 60 days, 10:17,  2 users,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM              LOGIN@   IDLE   JCPU   PCPU WHAT
ec2-user pts/0    xx.xx.xx.xx      15:26    4:17   0.00s  0.00s -bash
ec2-user pts/1    xx.xx.xx.xx      15:26    1.00s  0.01s  0.00s w
```

## まとめ

- `w` だとユーザーが何してんのとかわかる
- あと uptime や load average とかもでる

> 参考: [What is the difference between Unix's 'w' and 'who' commands? - Quora](https://www.quora.com/What-is-the-difference-between-Unixs-w-and-who-commands)
