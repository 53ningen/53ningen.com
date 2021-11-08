---
slug: telnet-onegiri
title: telnet コマンドをワン切りする
category: programming
date: 2018-01-25 05:51:48
tags: [network, telnet, nc]
pinned: false
---

ワン切りという言葉が死後になりつつある気がしないでもないですが、telnet で繋いですぐ切りたいときに次のようにすればよさげ。

```
% (sleep 0.2 && echo 'quite') | telnet 53ningen.com 80
Trying 160.16.144.83...
Connected to 53ningen.com.
Escape character is '^]'.
Connection closed by foreign host.
```

とここまで書いたときに冷静に考えて nc コマンド使えば良いだけだったということを思い出した

```
% nc -vz 53ningen.com 80
Connection to 53ningen.com port 80 [tcp/http] succeeded!
```

けど、CentOS 7 の nc コマンド、ncat へのエイリアスになってて、z オプションが存在しなくなってしまっている...。[同じことにくるしんでいる記事](https://qiita.com/lumbermill/items/2309b4257d3618b8c501)があって、そこにある解決策はこんなかんじだった。なるほど...。

```
$ timeout 0.1 bash -c 'cat < /dev/null > /dev/tcp/53ningen.com/80'
$ timeout 0.1 bash -c 'cat < /dev/null > /dev/tcp/53ningen.com/81'
bash: connect: Connection refused
bash: /dev/tcp/53ningen.com/81: Connection refused
```
