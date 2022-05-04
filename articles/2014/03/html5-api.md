---
title: HTML5のAPIまとめ
category: programming
date: 2014-03-21 20:36:53
tags: [JavaScript, html5]
pinned: false
---

HTML5 と JavaScript と組み合わせて利用できる API について概要をまとめてみた。

### Drag and Drop API

以前から mouseup,mousedown などのイベントが存在したが、HTML5 では draggable 属性に true と設定するだけで、ほぼ全ての要素がドラッグアンドドロップ可能になる。ドラッグする要素には draggable, ondragstart, id 属性の設定が必須。またドロップする要素には ondragenter, ondragleave, ondragover, ondrop 属性を設定できる。

ドラッグアンドドロップでのデータ受け渡しには DataTransfer を用いる。具体的な実装は以下のようにやる。

```js
function onDrop(e) {
  var text = e.dataTransfer.getData('text/plain')
  //  以下略...
}
```

### File API

この API を用いることにより、ファイルの読み書きをアドオンなしで行うことが出来る。ファイルの内容を取得する API には同期・非同期２種類の用意されている。同期 API は FileReaderSync、非同期のものが FileReader となっている。なお同期 API は Web Workers の中でしか使えない。ファイルへの書き込みにはバイナリ構築のための BlobBuilder, バイナリに名前をつけて保存することができる FileSavar, 非同期書き込みを行う FileWriter, 同期書き込みを行う FileWriterSync の４種類の API がある。具体的な実装は以下の通り。

```js
function onDrop(e) {
  //  ファイルをdataTransferに格納
  var files = e.dataTransfer.files

  //  filesには各ファイルが配列形式で格納されている
  //  各ファイル要素はたとえば次のように利用できる
  for (var i = 0; i < files.length; ++i) {
    console.log('name: ' + files[i].name)
    console.log('type: ' + files[i].type)
    console.log('size: ' + files[i].size)

    //  非同期ファイル読み込みインスタンスの生成
    var fileReader = new FileReader()
    //  画像ファイルの読み込みとタグの生成
    fileReader.onload = function (e) {
      var image = document.createElement('img')
      image.src = e.target.result
    }
    //  ファイル内容をURL形式で返す
    readAsDataURL(files[i])
    //   ファイル内容を指定された文字エンコーディングで返す
    readAsText(files[i])
  }

  // ブラウザからファイルを展開しないように指示
  e.preventDefault()
}

function onDragOver(e) {
  e.preventDefault()
}
```

### Web Strage

key-value 形式、5MB まで保存できる。Cookie と同様の仕組みだが有効期限がない。ウィンドウやタブが閉じるまでデータが保存される sessionStrage と、ドメインとポート番号が同じならば異なるウィンドウ間でデータが共有できる localStrage の２種類ある。Web Strage の利用にはまずストレージオブジェクトを取得する必要があります。その後、ストレージオブジェクトのメソッドを利用してデータの保存、変更、削除を行います。具体的な利用の方法は以下のソースのとおり。

```js
//  Storage Object 取得
var localStorage = window.localStorage
var sessionStorage = window.sessionStorage

//  Local Storageへの保存処理
function saveToLocalStorage(localStorage, key, value) {
  localStorage.setItem(key, value)
}

//  Session Storageへの保存処理
function saveToSessionStorage(sessionStorage, key, value) {
  sessionStorage.setItem(key, value)
}

//  Session Storageへの変更処理 = 保存と全くかわらない処理
function changeValueOfSessionStorage(sessionStorage, key, modifiedValue) {
  saveToSessionStorage(sessionStorage, key, modifiedValue)
}

//  Session Storageへの削除処理
function removeItemFromSessionStorage(sessionStorage, key) {
  sessionStorage.removeItem(key)
}

//  Storageの消去
function clearStorage(storage) {
  storage.clear()
}

//  Key名の取得 -> Valueの取得
function getNthValueFromStorage(storage, n) {
  var itemKey = storage.key(n)
  return storage.getItem(itemKey)
}
```

### Geolocation API

```js
if (navigator.geolocation) {
  //  Geolocation API 使用可能時の処理

  //  現在位置取得
  var currentPostion = navigator.geolocation.getCurrentPosition(
    getCurrentPositionSuccess,    //@args 成功・失敗時のメソッド
    getCurrentPositionError
} else {
  // Geolocation API に対応していないときの処理

  //  hogehoge...

}

function getCurrentPositionSuccess(position) {
  //  緯度・経度をlocationに格納
  var location = { position.coords.latitude, position.coords.longitude }
  //  地図の中心
       var googleMapCenter = new google.maps.LatLng(latitude, longitude);

   //  GoogleMap オプション設定
  var googleMapOption = {
    zoom: 16,
    center: googleMapCenter,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scaleControl: true,
  };

  //  Googleマップオブジェクトの作成
  var googleMap = new google.maps.Map(document,getElementById('map'), mapOption);
  var currentPositionMarker = new google.maps.Marker({
    position: googleMap.center,
    map: googleMapCenter
  });
}
```

### Web SQL Database(relational database)

```js
//  DB open @args  DBname, version, name, database size
var websqlDB = window.openDatabase('websqlUser', 1.0, 'websql db', 1024 * 1024)

//  transaction
websqlDB.transaction(
  function (tx) {
    //  transactionで実行する処理
    //Database の作成
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS websqltable(ID NUMERIC, NAME CHARACTER)'
    )

    //  executeSqlメソッドの使い方
    tx.executeSql(
      'SQL文...',
      'プレースホルダ',
      '成功時のコールバック関数(transactionObject,resultSet)', // resultSet.rows.item(i)で各レコードへアクセス
      '失敗時のコールバック関数(e)'
    )
  },
  function (e) {
    //  例外発生時の処理
  },
  function (e) {
    //  処理成功時の処理
  }
)
```
