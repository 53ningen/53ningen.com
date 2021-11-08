---
slug: ansible-proxy
title: 特定ホストに対してのみ踏み台を経由して Ansible を実行する
category: programming
date: 2018-01-04 01:03:35
tags: [ansible]
pinned: false
---

ネットワーク的に踏み台サーバーを経由しないと到達できないサーバーに Ansible を流す

* 公式ドキュメント: [How do I configure a jump host to access servers that I have no direct access to?](http://docs.ansible.com/ansible/latest/faq.html#how-do-i-configure-a-jump-host-to-access-servers-that-i-have-no-direct-access-to)

公式ドキュメントに書かれている方法はすべてのサーバーでの作業時に踏み台を踏むような形になるが、外から疎通できない一部のホストだけ踏み台を踏むようにしたい場合は、`host_vars` に対象ホスト名と同じ名前でファイルを作って、以下のように設定を入れればよい。

```
---

ansible_ssh_common_args: '-o ProxyCommand="ssh -W %h:%p -q user@host"'
```
