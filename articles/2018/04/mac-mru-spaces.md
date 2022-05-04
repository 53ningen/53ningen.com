---
title: mac の操作スペースが勝手に並び変わるのを抑止する
category: programming
date: 2018-04-21 11:56:51
tags: [ansible, mac]
pinned: false
---

mac 素人なので知らなかったけど、デフォルトで操作スペースが利用状況に応じて勝手に並び変わるという迷惑な機能がオンになってます。これ、めちゃくちゃ迷惑でなんとかならないかなーと設定いじってたら Mission Control の設定項目にあったので、即オフにした。 ansible だと以下のような感じでかける。

```
- name: 操作スペースの自動並び替えを抑止
  osx_defaults:
    domain: com.apple.dock
    key: mru-spaces
    type: bool
    value: false
    state: present
```

これで安心安全
