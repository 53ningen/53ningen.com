---
slug: fluentd-elasticsearch-kibana
title: fluentd + elastic search + kibanaでログを見れるようにする
category: programming
date: 2016-12-16 17:23:17
tags: [fluentd,elasticsearch,kibana]
pinned: false
---

ありきたりな組み合わせですが、誰が何をして、どの設定がどうで、どの部分がどの実体ファイルなのか理解せずに生きていたので心を入れ替えるためにまとめます。ubuntuです。


# fluentd の導入

* `curl -L https://toolbelt.treasuredata.com/sh/install-ubuntu-trusty-td-agent2.sh | sh` で導入
* `/etc/td-agent/td-agent.conf` に設定ファイルがあるので編集
* `sudo /etc/init.d/td-agent start` でデーモンとして立ち上げる

```
# 初期設定ではcurl で post すると
curl -X POST -d 'json={"json":"message"}' http://localhost:8888/debug.test
# 以下のファイルに吐き出される
cat /var/log/td-agent/td-agent.log
```

```
# このときの設定ファイルの様子はこちら
# HTTP input
# POST http://localhost:8888/<tag>?json=<json>
# POST http://localhost:8888/td.myapp.login?json={"user"%3A"me"}
# @see http://docs.fluentd.org/articles/in_http
<source>
  @type http
  port 8888
</source>
```
