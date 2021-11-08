---
slug: pull-request
title: プルリクエストを便利に取得できるアレ
category: programming
date: 2016-02-12 21:19:59
tags: [ポエム]
pinned: false
---

```
vim ~/.gitconfig

# [alias]に以下を突っ込む
  pr = "!sh -c 'git fetch $1 pull/$2/head & git co FETCH_HEAD\n' -"

git pr {:remoteの名前} {:PRのid(#xxx)}

```
