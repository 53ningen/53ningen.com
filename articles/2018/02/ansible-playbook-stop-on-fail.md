---
title: ansible-playbook で対象ホストのうちひとつでもコケたら止める
category: programming
date: 2018-02-09 04:57:22
tags: [ansible]
pinned: false
---

`max_fail_percentage` を使うと良い感じに inventories で指定したホストのうちのひとつでも処理がコケたときに、Ansible 実行を停止できる。公式ドキュメントは[こちら](http://docs.ansible.com/ansible/latest/playbooks_delegation.html)を参照。

> By default, Ansible will continue executing actions as long as there are hosts in the group that have not yet failed. In some situations, such as with the rolling updates described above, it may be desirable to abort the play when a certain threshold of failures have been reached. To achieve this, as of version 1.3 you can set a maximum failure percentage on a play as follows:

実際には以下を playbook に書いてあげればよい。

```
max_fail_percentage: 0
```

[amazon template=wishlist&asin=B06XRSF9HX]
