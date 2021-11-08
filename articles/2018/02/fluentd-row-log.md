---
slug: fluentd-row-log
title: fluentd で生ログを転送する
category: programming
date: 2018-02-07 21:20:45
tags: [fluentd]
pinned: false
---

<p>　タイムスタンプの付加などをせずに、データを単に集約したいだけの場合は <code>format directive</code> に <code>@type single_value</code> を指定してやれば良い模様。</p>

```
<match ${pattern}>
  @type file
  path /var/log/fluent/myapp
  time_slice_format %Y%m%d
  compress gzip
  <format>
    @type single_value
  </format>
</match>
```

<h3>参考資料</h3>

<ul>
<li><a href="https://docs.fluentd.org/v0.12/articles/out_file">out_file Output plugin</a></li>
<li><a href="https://docs.fluentd.org/v0.12/articles/formatter_single_value">single_value Formatter plugin</a></li>
</ul>
