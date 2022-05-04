---
title: logrotate のログ保持日数の変更
category: programming
date: 2018-01-11 02:17:27
tags: [logrotate]
pinned: false
---

例えば以下のような fluentd ログの logrotate 設定が入っているとします。

```
/var/log/td-agent/td-agent.log {
  daily
  rotate 8
  compress
  delaycompress
  notifempty
  create 640 td-agent td-agent
  sharedscripts
  postrotate
    pid=/var/run/td-agent/td-agent.pid
    if [ -s "$pid" ]
    then
      kill -USR1 "$(cat $pid)"
    fi
  endscript
}
```

この前提のもと、保持する世代を減らすために `rotate` の設定を 8 から 5 に減らす場合には注意が必要で、6 世代目ファイルのみが削除され、6-8 世代のファイルが残ってしまいます。簡単に次のようなコマンドで消しておくとよいかも。保持期間を増やすときはあまり問題は生じなそう？

```
$ ls /var/log/td-agent/ | grep -E 'td-agent.log-2018010[2-4].gz' | sudo xargs rm
```

各設定項目は man を見るのが一番良さそう。ソースコードは[ここ](https://github.com/logrotate/logrotate)でみれます。
ちなみに logrotate の状況は `/var/lib/logrotate/logrotate.status` で確認できます。

```
$ cat /var/lib/logrotate/logrotate.status
logrotate state -- version 2
"/var/log/yum.log" 2018-1-1-4:0:0
"/var/log/boot.log" 2018-1-10-4:40:1
"/var/lib/mysql/mysqld.log" 2018-1-1-4:0:0
"/var/log/chrony/*.log" 2018-1-1-4:0:0
"/var/log/wtmp" 2018-1-1-4:0:0
"/var/log/spooler" 2018-1-7-4:46:1
"/var/log/btmp" 2018-1-1-4:0:0
"/var/log/fail2ban.log" 2018-1-7-4:46:1
"/var/log/maillog" 2018-1-7-4:46:1
"/var/log/wpa_supplicant.log" 2018-1-1-4:0:0
"/var/log/secure" 2018-1-7-4:46:1
"/var/log/ppp/connect-errors" 2018-1-1-4:0:0
"/var/log/messages" 2018-1-7-4:46:1
"/var/log/zabbix/zabbix_agentd.log" 2018-1-7-4:46:1
"/var/account/pacct" 2018-1-1-4:0:0
"/var/log/cron" 2018-1-7-4:46:1
"/var/log/td-agent/td-agent.log" 2018-1-10-4:40:1
```

### ファイルを掴みっぱなしになってるプロセスへの対応

1. postrotate でシグナルをおくってやる
2. copytruncate オプションをつける

copytruncate 便利ですね...
