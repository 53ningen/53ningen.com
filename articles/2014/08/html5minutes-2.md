---
title: HTML5minutes! #2に参加してきた
category: programming
date: 2014-08-23 14:03:21
tags: [html5]
pinned: false
---

HTML5minutes!というイベントが近場であったので参加してきた． フロントエンドよりのイベントに参加するのは初めてだったので， なんかちょくちょくいくあたりのイベントの雰囲気との違いに困惑した． 具体的に言うとなんか明るい感じだった w． 人間的にゴミな私にはまぶしい世界でした．

Vue.js が最近流行っているといっていた人がいたので， なんか自分の調査はあながちまちがっていなかったのだなぁと安心できたので行ってよかった．

クライアントサイドの実装についてもっと聞きたかったなぁ．こんなフレームワーク使ってますよっていうのはよく聞くんだけど，じゃあそのフレームワーク使って，どんなアプリケーションをどういうふうに実装しているのかが知りたい今日この頃...．

ちなスライドをみつけたやつはリンクを貼った．HTML5 でつくるデジタルインスタレーションはすごかったなぁ〜．

以下要約．なお速記のため書けてないところアンド， 自分が理解できてないところはまるまる空白の模様．

### モバイル時代の Web パフォーマンス Tips

基調講演（19:35〜20:05）吉川 徹氏（html5j 新リーダー）

- html5 に足りないところ
  - Performance: especially mobile
  - APIs: power management / wifi など...
  - Tools
- なんで html5 で書いたか
  - cross platform

#### Web パフォーマンス Tips

- リソースの最適化
  - 画像圧縮
  - JS, CSS minify
- リクエスト数をおさえる
  - モバイル回線に置いては 200msec/req 増えるくらいコストが高い
  - JS/CSS 結合，画像の埋め込みなど
  - DNS プリフェッチ: 事前に DNS Lookup を済ませてキャッシュしておく
- リダイレクトを避ける
  - 同一 URI で複数 UA に対応
- レンダリングの優先度
  - js はレンダリングをブロックするので最後に読み込む
  - ファーストビューリソースを最優先にロードする
  - 画像の遅延読み込み(lazy load)
  - progressive jpeg など...
- Runtime
  - 角丸系，陰，opacity などの変形や等価処理をおさえる
  - アニメーションを避ける
  - requestAnimationFrame を使う（非対応ブラウザには polyfil がある）
- DOM アクセスの最適化
  - DOM プロパティを変数のように扱わない（特に offset*, client*, scroll\*）
- メモリの最適化
  - 最初に必要なメモリを確保するなど
  - 再利用可能なオブジェクトをオブジェクトプールへ

#### CSS Living Style Guide

- 静的につくる: 納品時には死んでいる
- ジェネレータなどで自動化(StyleDog/FrontNote など...)

### FirefoxOS スマホ体験記

LT が始まると思ったらカラオケがはじまった

### HTML5 でつくるデジタルインスタレーション

- Chrome/Web speech API
- Google の音声認識エンジン
- ユーザによる許可は https にすると１回で済む
- 3D 文字は WebGL でためしたがやめて，Three.js の TextGeometry
- Three.js: デフォルト日本語使えないが，ちょっとめんどくさいことするとできるようになる

### jade で作る client template

- クライアントテンプレート：データとテンプレートを用いて文字列を生成する
  - Mustache/Hogan.js など
  - jade を使うという選択肢がある
- jade とは何か
  - html template engine
  - compile option を指定すると js にもコンパイルできる
  - browserify を使用する

### 5 分で分かる WebRTC コーデックウォーズ

- WebRTC とは
  - ブラウザでデバイスリソースを扱える
  - プラグインレス
- コーデックウォーズとは
  - IETF の標準化の現場で行われているビジネスチックな戦争
  - H.264 と VP8
- 標準コーデック決まらない問題
  - いろいろあったけどコーデックがまだ決まらない
  - お金・利権の問題
  - 今後も決まらない感じ

### Angular.JS の高速化

- Augular.js：パフォーマンス悪い
- なぜか
  - 2 way data binding に起因
  - Pure JS Object を ViewModel として使う
  - Dirty Checking
  - Angular 1.3 から one-time binding が導入されたー
  - Polymer でゆるふわ MaterialDesign 体験
  - Polymer: WebComponents の UI Framework
  - MaterialDesign: Google I/O で発表された UI/UX ガイドライン
  - platform.js
  - DEMO

```
bower install --save Polymer/polymer
```

### かすたむ！　※コスプレ有り

#### ぜ　か　ま　し

- WebComponents がアツい
- Template/Custom Elements/ShadowDOM/Html Import
- 実装は Chrome のみ
- Custum Elements
- 独自のタグ作れる
- `<ni-so></ni-so>` のタグ作れる！
- `<pantsu></pantsu>` のタグ作れる！
- `<pantsu ichigo>` とかできる！
- 実用的なところでページネーションなんかに使える！
- パーツの設計をしっかりしていればとても便利

### HTML5 でできるフォーム最適化

```
<input type="text" required>
<input type="email">
<input type="url">
<input type="email">
<input type="tel">
<input type="date">
<input type="color">
```

#### pattern:正規表現で指定できる

```
<input type="text" pattern="[regex]">
```

### Node.js でシングルページウェブアプリケーション

- js で DOM を構築，UI/UX に優れている
- フロントエンド MV\*フレームワーク

#### Sails.js

- サーバーサイド JSMVC フレームワーク
- CRUD 標準
- passport.js: twitter や Facebook などの認可

```
npm install sails
```

詳しくは O'Rilly シングルページアプリケーション

### 公開しよう自作 Web Components

- HTML タグを記述するだけなので潜在ユーザ多い
- ブラウザに標準実装される予定で普及可能性が高い
- 今のうちに好きなコンポーネント名を取って HTML5 技術者として名を売るチャンス
- Web Components Gallary Site がある
- 手順
  - Polymer を勉強する
  - WebComponents を作る
  - 書きそびれた
  - ReadMe をかく

### Web サービス開発のモジュール設計

すごいディレクトリ構造参考になったけど，書き写す余裕はなかった．
