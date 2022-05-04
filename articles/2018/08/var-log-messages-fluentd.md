---
title: /var/log/messages の内容を fluentd でやりとりする
category: programming
date: 2018-08-09 23:43:58
tags: [fluentd]
pinned: false
---

- syslog フォーマットが便利

[syslog Parser Plugin | Fluentd](https://docs.fluentd.org/v0.12/articles/parser_syslog)

### 送り側

```
# config for /var/log/messages
<source>
  @type tail
  format syslog
  path /var/log/messages
  pos_file /var/log/td-agent/pos/var.log.messages.pos
  read_from_head true
  tag syslog.messages
</source>

<filter syslog.messages>
  @type record_transformer
  <record>
    hostname ${hostname}
  </record>
</filter>

{% if server_role != "aggregate" %}
<match syslog.messages>
  @type forward
  <server>
    name back
    host {{ back_hostname }}
  </server>
  buffer_type file
  buffer_path /var/log/td-agent/buffer/syslog.messages
</match>
{% endif %}
```

### 受け側

```
{% if server_role == "aggregate" %}
# config for /var/log/messages
<match syslog.messages>
  @type copy
  <store>
    @type elasticsearch
    logstash_format true
    logstash_prefix syslog.messages
    include_timestamp true
    hosts {{ back_hostname }}
    port 9200
    buffer_type file
    buffer_path /var/log/td-agent/buffer/syslog.messages.back
    buffer_chunk_limit 128k
    buffer_queue_limit 128
  </store>
</match>
{% endif %}
```
