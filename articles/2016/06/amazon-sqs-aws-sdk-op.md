---
slug: amazon-sqs-aws-sdk-op
title: AWS SDK for Node.jsを用いたSQSの操作
category: programming
date: 2016-06-04 03:13:19
tags: [AWS, Node.js]
pinned: false
---

AWS Lambda を使ってお手軽に SQS を操作するために、普段はあまり使わないが Node.js 経由で試してみることにした。本当は Java のほうが慣れているし、好きなのですがいかんせん Lambda にいちいち jar をアップロードするのは非常に厳しい気持ちになるので、まあたまには...。

自分のためのメモ書きなので、各位はドキュメントを見るべきだと思います
[http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html)

## SQS へのメッセージの送信

```js
'use strict'
const AWS = require('aws-sdk')
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' })
const Lambda = new AWS.Lambda({ apiVersion: '2015-03-31' })

const QUEUE_URL = '..........'

exports.handler = (event, context, callback) => {
  var params = {
    MessageBody: JSON.stringify({ key: 'value' }) /* required */,
    QueueUrl: QUEUE_URL /* required */,
    DelaySeconds: 0,
  }
  SQS.sendMessage(params, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  })
}
```

## SQS メッセージの受信

```js
exports.handler = (event, context, callback) => {
  const params = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 10,
  }
  SQS.receiveMessage(params, (err, data) => {
    if (err) return callback(err)
    const promises = data.Messages.map((message) => {
      console.log(message)
    })
  })
}
```

## SQS 受信メッセージの削除

```js
exports.handler = (event, context, callback) => {
  const params = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 10,
  }
  SQS.receiveMessage(params, (err, data) => {
    if (err) return callback(err)
    const promises = data.Messages.map((message) => {
      console.log(message)

      var params = {
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message['ReceiptHandle'],
      }
      SQS.deleteMessage(params, function (err, data) {
        if (err) console.log(err, err.stack)
        else console.log(data)
      })
    })
  })
}
```

Node.js 書くのかったるい...
