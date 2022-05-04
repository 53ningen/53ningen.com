---
title: ansible-playbook の --limit を複数指定する
category: programming
date: 2018-02-17 02:33:09
tags: [ansible]
pinned: false
---

ansible-playbook コマンドで limit を複数指定したい場合はカンマ区切りで group や host を指定すれば良い。例えば `gomi-web0[1-3]` に playbook 実行をしたい場合は以下のようにしてあげればよい

```
ansible-playbook -i ./prod --limit gomi-web01,gomi-web02,gomi-web03 ./web.yml
```

[amazon template=wishlist&asin=4295003271]
