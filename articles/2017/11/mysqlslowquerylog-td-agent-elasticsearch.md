---
title: MySQL スロークエリログを fluentd 経由で elasticsearch に流し込む
category: programming
date: 2017-11-17 04:09:21
tags: [elasticsearch, kibana, mysql, fluen]
pinned: false
---

MySQL のスロークエリログを fluentd で elasticsearch に流し込む流れをメモ。基本は以下のステップ。

1. my.conf のスロークエリログ出力設定をして mysql restart
2. fluent-plugin-mysqlslowquery を導入
3. ログを elasticsearch に流し込む fluentd の conf を書いて td-agent restart

### 1. MySQL のスロークエリログ出力設定

- docs: https://dev.mysql.com/doc/refman/5.6/ja/slow-query-log.html
- 以下を追加して MySQL を restart すれば OK
- 起動中の場合は set global で対応できる（restart しないでも OK）

```
[mysqld]
slow_query_log=1
long_query_time=1
slow_query_log_file=/usr/local/var/mysql/slow_query.log
```

### 2. fluent-plugin-mysqlslowquery の導入

- repository: https://github.com/yuku-t/fluent-plugin-mysqlslowquery
- 以下のような具合でおしまい

```
td-agent-gem install fluent-plugin-mysqlslowquery
```

### 3. td-agent の conf 作成

- 送信側

```
<source>
  type mysql_slow_query
  path /path/to/mysqld-slow.log
  tag mysqld.slow_query
</source>
```
