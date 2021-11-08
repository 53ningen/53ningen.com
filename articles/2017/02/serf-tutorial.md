---
slug: serf-tutorial
title: serf を試す
category: programming
date: 2017-02-03 06:15:10
tags: [serf,HashiCorp]
pinned: false
---


* serf で /etc/hosts とか config の更新とかをクラスタ全台にサクッと反映させたい
* でも serf そのものがよくわからんのでまずは　hello, world から
* 資料は https://www.serf.io/intro/getting-started/install.html

```
# serf の導入
$ wget https://releases.hashicorp.com/serf/0.8.0/serf_0.8.0_linux_amd64.zip
$ unzip serf_0.8.0_linux_amd64.zip
Archive:  serf_0.8.0_linux_amd64.zip
  inflating: serf
$ cp serf /usr/local/bin/

# node01(10.28.64.107) にて
$ serf agent -node=node01 -bind=10.28.64.107 &

# node02(10.28.64.108) にて
$ serf agent -node=node01 -bind=10.28.64.108 &
$ serf join 10.28.64.107

$ serf members 
node02  10.28.64.107:7946  alive
node01  10.28.64.108:7946  alive

# イベントデモ
$ serf event 'Hello World'

# node01, 02 ともに Hello, World イベントが飛んでくる
$ serf monitor
2017/02/03 05:51:53 [INFO] agent.ipc: Accepted client: 127.0.0.1:40231
2017/02/03 05:43:38 [INFO] agent: Serf agent starting
2017/02/03 05:43:38 [INFO] serf: EventMemberJoin: node02 10.28.64.107
2017/02/03 05:43:39 [INFO] agent: Received event: member-join
2017/02/03 05:43:44 [INFO] agent.ipc: Accepted client: 127.0.0.1:40210
2017/02/03 05:44:07 [INFO] agent.ipc: Accepted client: 127.0.0.1:40211
2017/02/03 05:44:07 [INFO] agent: joining: [10.28.64.108] replay: false
2017/02/03 05:44:07 [INFO] serf: EventMemberJoin: node01 10.28.64.108
2017/02/03 05:44:07 [INFO] agent: joined: 1 nodes
2017/02/03 05:44:08 [INFO] agent: Received event: member-join
2017/02/03 05:44:13 [INFO] agent.ipc: Accepted client: 127.0.0.1:40213
2017/02/03 05:51:41 [INFO] agent.ipc: Accepted client: 127.0.0.1:40229
2017/02/03 05:51:46 [INFO] agent.ipc: Accepted client: 127.0.0.1:40230
2017/02/03 05:51:47 [INFO] agent: Received event: user-event: Hello World
2017/02/03 05:51:53 [INFO] agent.ipc: Accepted client: 127.0.0.1:40231
```

* ご覧のように、全台に簡単に通知を飛ばせる
* この通知をフックして、更新をするシェルスクリプトを仕込めば /etc/hosts の更新や config の更新がお手軽にできる気がする

そこで以下のような簡単なスクリプトを用意（node01, node02に配置）

```sh
#!/bin/bash

echo
echo "New event: ${SERF_EVENT}. Data follows..."
while read line; do
    printf "${line}\n"
done
```

一旦各マシンで serf を落とし、イベントハンドラを指定して再起動

```
# node01
serf agent -node=node01 -bind=10.28.64.107 -log-level=debug -event-handler=./handler.sh &

# node02
serf agent -node=node02 -bind=10.28.64.108 -log-level=debug -event-handler=./handler.sh &
serf join 10.28.64.107

$ serf event 'Hello World'

```

これは良さそうだ。実践編として /etc/hosts や config 系の反映についてどうすれば良いか気が向いたら書きます。
