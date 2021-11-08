---
slug: update-etc-hosts
title: /etc/hosts の更新
category: programming
date: 2018-02-14 05:27:00
tags: []
pinned: false
---

サーバーの `/etc/hosts` を更新して、ホスト名で追加したサーバーへ疎通がとれるようにする

- 頻繁に実施する際は ansible 化しておいたほうが良い

### 1. 追加/削除したサーバーへの疎通確認

- 削除する場合は、削除するサーバーへの参照がないかを確認する（grep で conf などを洗う）

```
for i in $(grep <!-- 更新対象サーバー --> /etc/hosts | awk -F" "  '{print $1}') ; do echo -e "\n$i" ssh -t $i "grep <!-- 削除するホスト --> <!-- application の conf -->" ; done
```

- 追加する場合は、疎通できるかを確認

```
for i in $(grep <!-- 更新対象サーバー --> /etc/hosts | awk -F" "  '{print $1}') ; do echo -e "\n$i" ssh -t $i "ping <!-- 追加するサーバーのIP -->" ; done
```

### 2. /etc/hosts 配布芸

- 踏み台サーバーに入る（手元からやらない！）
- 手元に配布したい conf を `tmp_etc_hosts` という名前で用意する
- 配布スクリプトを回す

```
for i in $(grep <!-- 更新対象サーバー --> /etc/hosts | awk -F" "  '{print $1}') ; do scp tmp_etc_hosts $i:/tmp/ ; echo -e "\n$i"; ssh -t $i "sudo cp /tmp/tmp_etc_hosts /etc/hosts ;" ; done
```

### 3. 動作確認

- 各台で名前解決できてるかを確認

```
for i in $(grep <!-- 更新対象サーバー --> /etc/hosts | awk -F" "  '{print $1}') ; do echo -e "\n$i" ssh -t $i "ping <!-- 追加した host -->" ; done
```
