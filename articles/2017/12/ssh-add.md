---
title: 多段SSHがうまく通らないとき
category: programming
date: 2017-12-26 04:52:33
tags: [ssh]
pinned: false
---

```
# 鍵の確認（1段目で確認）
ssh-add -L

# 想定してない鍵だったらlocalで追加して、SSHしなおす
ssh-add -L ~/.ssh/hoge_id_rsa
ssh -A target-host
```
