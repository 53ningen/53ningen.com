---
slug: lambda-with-io-ts
title: Lambda 関数上で io-ts を利用すると例外発生時にタイムアウトする
category: programming
date: 2021-08-16 03:18:20
tags: [Lambda, TypeScript]
pinned: false
---

※　自分用メモです

- 概要: Node.js 14 ランタイムの Lambda 関数でデプロイパッケージに io-ts が含まれていると、例外発生時に即時関数実行が停止せず、タイムアウトまで待ち時間が発生する

通常、以下のようなコードで簡単に例外を発生させ、関数実行を停止させられる

```
import 'source-map-support/register'

export async function handler(event: object, _: object): Promise<object> {
 throw Error()
}
```

ところが、以下のように io-ts を import しただけで例外発生時にタイムアウトまで待ち時間が発生してしまう

```
import * as t from 'io-ts'
import 'source-map-support/register'

export async function handler(event: object, _: object): Promise<object> {
 throw Error()
}
```

原因については調査していないが 2 回同じ罠をふんだのでメモ
