---
slug: websocket-intro
title: WebSocket はじめのいっぽ
category: programming
date: 2014-03-28 19:43:16
tags: [JavaScript, WebSocket]
pinned: false
---

WebSocket はサーバー/クライアント間での効率的な双方向通信を実現するための仕組みです。チャット・グループウェア・ゲームなどで利用されることが多いです。サーバー側は WebSocket に対応している node.js などを利用します。

### WebSocket の動作とクライアント側の実装

WebSocket による通信では、まずサーバーとのコネクションを確立を行います。クライアント側からサーバー側へ HTTP でコネクション確立のリクエストを送り、サーバー側が接続元やプロトコルを確認した後、接続可否のレスポンスを返します。接続が許可された場合、クライアント側は WebSocket によるコネクションを開始します。これをハンドシェイクと呼びます。クライアント側のハンドシェイクは以下の一行で済みます。

```
//  Insatiate WebSocket Object
var websocket = new WebSocket('ws://hoge.com/foo', 'protocol');
```

コネクションが確立すると onopen イベントハンドラ、切断されると onclose イベントハンドラが実行されます。またメッセージをサーバーに送信するには send メソッド、受信するには message イベントを捕捉します。クライアント側からコネクションを切断する処理を書くことはあまりないかもしれませんが、そのときには close メソッドを利用します。

コネクションの状況は WebSocket インスタンスの readyState プロパティを参照するとわかるようになっています。コネクションの状況を表す定数はそれぞれ、 WebSocket.CONNECTING = 0, WebSocket.OPEN = 1, WebSocket.CLOSING =2, WebSocket.CLOSED = 3 というように定義されています。

```
// Insatiate WebSocket Object
var websocket = new WebSocket('ws://hoge.com/foo', 'protocol');

// On Open
websocket.onopen = function(event) { ... }

// On Close
websocket.onclose = function(event) { ... }

// Send Message From Client
websocket.send('THIS IS MESSAGE FROM CLIENT');

// On Message
websocket.onmessage = function(event) {
  var receivedMessage = event.data;

  /*  処　理  */

}

// ------------------------------
//    JSONのやりとり
// ------------------------------
websocket.send(JSON.stringify({key1: value1, key2: value2});
websocket.onmessage = function(event) {
  var receivedMessage = JSON.parse(event.data);

/*   処　理  */

}

// ------------------------------
//    Binaryのやりとり
// ------------------------------
websocket.send(blob);
websocket.send(arrayBuffer);

websocket.binaryType = '[FORMAT]';
websocket.onmessage = function(event) {
  var receivedMessage = event.data;
  if ( receivedMessage == [Format] ) {

    /* 処　理 */

  }
}
```

### WebSocket インスタンスのプロパティ

- URL
- readyState -> CONNECTING, OPEN, CLOSING or CLOSE
- protocol
- bufferAmount -> send()によって送信キューに貯まっている未送信バッファのサイズ
- binaryType -> binary フォーマット指定。blob or arraybuffer。
- [event handler] onopen
- [event handler] onerror
- [event handler] onclose
- [event handler] onmessage
- [method] send(message)
- [method] close()

### アプリケーションの実装（サーバーサイド）

- 【参考】node.js のいろいろなモジュール 23 – ws で WebSocket 接続
- 【参考】express - node Web フレームワーク

メッセージをクライアント側からサーバーに送り、それをサーバー側の画面に出力するだけの基本的なアプリケーションを作ってみました。まず ws をインストールします。

```
% mkdir workingdir
% cd workingdir
% npm install ws
```

続いてサーバー側の実装。1 行目、2 行目は ws モジュールを利用し、WebSocketServer インスタンスを生成。 WebSocketServer に対して connection があったときには、

```js
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: [port number]});

wss.on('connection', function(ws){
  ws.on('message', function(message){
    console.log('received: %s', message);
  });
});
```

ws API Document に書いてあるとおり new ws.Server([Options], [callback])は WebSocket sever のインスタンスを生成します。引数の詳細は以下のとおり。port か server のどちらかは必須です。

- Options Object
  - host String
  - port Number
  - server http.Server
  - verifyClient Function
  - path String
  - noServer Boolean
  - disabelHixie Boolean
  - clientTracking Boolean
- callback Function

### アプリケーションの実装（クライアントサイド）

Chrome のコンソールで接続する場合は次のとおり

```js
// コネクションを確立
var ws = new WebSocket('ws://localhost:[port number]')

// サーバーにメッセージを送信
ws.send('message')
```

Node.js の REPL から接続する場合は次のとおり

```js
// Instiate WebSocket Object
var WebSocket = require('ws')

var ws = new WebSocket('ws://localhost:[port number]')
ws.send('message')
```

### サーバーサイドからのブロードキャスト

接続中のすべてのクライアントに受信したメッセージをブロードキャストするためには、サーバーサイドのコードを以下のように書き換えれば良い。

```js
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 1025 })

wss.broadcast = function (data) {
  for (var i in this.clients) {
    this.clients[i].send(data)
  }
}

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message)
    wss.broadcast(message)
  })
})
```

これであるクライアントからのメッセージがサーバーで受信されると、全てのクライアントにブロードキャストするという動作をするようになります。次にブロードキャストしたデータをクライアント側できちんと受け取る処理を書きます。これは onmessage イベントをハンドルしてやれば OK です。

```js
var WebSocket = require('ws')
var ws = new WebSocket('ws://localhost:[port number]/')

ws.onmessage = function (event) {
  console.log(event.data)
}
```
