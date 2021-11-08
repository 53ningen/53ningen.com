---
slug: git185-head
title: git 1.8.5 で HEAD が @ と書けるようになっていた
category: programming
date: 2018-07-08 00:33:10
tags: [Git]
pinned: false
---

知らなかった。[この記事](https://qiita.com/suin/items/8c9862ca9d3bfe90c238)みて知った。

> Instead of typing four capital letters "HEAD", you can say "@" now,
> e.g. "git log @".
> [git/Documentation/RelNotes/1.8.5.txt](https://github.com/git/git/blob/v1.8.5/Documentation/RelNotes/1.8.5.txt#L100-101) より引用

たとえば `git reset --soft HEAD~` は `git reset --soft @~` と書けるようになった。便利。
