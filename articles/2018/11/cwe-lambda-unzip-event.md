---
title: CloudWatch Logs サブスクリプションフィルタにより Lambda に流れ込むイベントのデータをデコードする
category: programming
date: 2018-11-06 01:00:25
tags: [Lambda, CloudWatch, JavaScript]
pinned: false
---

[CloudWatch Logs サブスクリプションフィルタの使用](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/SubscriptionFilters.html#LambdaFunctionExample) に書かれているように CloudWatch Logs のサブスクリプションフィルタにより Lambda 関数が起動するときのペイロードの Data は Base64 でエンコード + gzip 圧縮されている。

> Lambda レコードの Data 属性は、Base64 でエンコードされており、gzip 形式で圧縮されています。Lambda が受け取る実際のペイロードは、{ "awslogs": {"data": "BASE64ENCODED_GZIP_COMPRESSED_DATA"} } の形式になります。raw データは、コマンドラインから次の UNIX コマンドを使用して調べることができます。

これを解く簡単なコードをよく使うのでメモとして残しておく。

```js
const zlib = require('zlib')
const unzip = (b) =>
  new Promise((resolve) => {
    const base64Logs = new Buffer(b, 'base64')
    zlib.gunzip(base64Logs, function (err, bin) {
      if (err != null) throw err
      resolve(bin.toString('ascii'))
    })
  })

exports.handler = async (event) => {
  const logs = await unzip(event['awslogs']['data'])
  const obj = JSON.parse(logs)
  console.log(obj)
  return obj
}
```

async/await 好き...。
