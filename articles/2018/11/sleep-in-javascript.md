---
title: sleep in JavaScript
category: programming
date: 2018-11-01 15:58:29
tags: [JavaScript]
pinned: false
---

稀によく使うのでメモ

```
const sleep = ms => new Promise(res => setTimeout(res, ms));
const do_sleep = async _ => {
  await sleep(1000);
}
```
