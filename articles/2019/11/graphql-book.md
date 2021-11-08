---
slug: graphql-book
title: 初めての GraphQL 読書メモ
category: programming
date: 2019-11-16 01:34:32
tags: [GraphQL]
pinned: false
---

オライリーから出ている [はじめての GraphQL](https://www.amazon.co.jp/%E5%88%9D%E3%82%81%E3%81%A6%E3%81%AEGraphQL-%E2%80%95Web%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%A6%E5%AD%A6%E3%81%B6%E6%96%B0%E4%B8%96%E4%BB%A3API-Eve-Porcello/dp/487311893X/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=jazzjazz-22&linkId=648e5cc403f06675de999cae08a41bf8&language=ja_JP) の自分向け読書メモ

## GraphQL とは

- **GraphQL**: API のための問い合わせ言語
- プロトコルの指定はないが一般的に **HTTP プロトコル** が使われる

### Hello, GraphQL

[SWAPI](https://graphql.org/swapi-graphql/) で気軽に試せるのでまずは触ってみる。以下のようにデータのやりとりができる。

```
query {
 film(filmID: 1) {
    title,
    director
  }
}


// returns
{
  "data": {
    "film": {
      "title": "A New Hope",
      "director": "George Lucas"
    }
  }
}
```

### 設計原則

- **階層構造**: クエリは階層構造になっており、レスポンスと同じ構造を取る
- **プロダクト中心**: クライアントの言語およびランタイムに従って実装される
- **強い型付け**: それぞれのフィールドは固有の型を持ち、バリデーションされることが GraphQL の型システムに保証されている
- **クライアントごとのクエリ**: クライアントが必要とするクエリに対するレスポンスを提供する
- **自己参照**: GraphQL サーバー自身の型システムを問い合わせられる

### なぜ GraphQL を使うのか

- **REST**
  - リソースをアクションで状態変化させられるリソース志向アーキテクチャ
  - URI は情報に対応する
- REST の課題
  - アプリケーションが必要としない余分なデータが得られる場合が多々ある（過剰な取得）
  - アプリケーションが必要とするデータが不足している場合も多々あり、再リクエストを行うといったことが多々発生する（過小な取得）
  - しばしばアプリケーションに最適化したエンドポイントが作られるが変更に弱く、管理するエンドポイントが増える傾向にある（エンドポイントの管理）
- GraphQL の解決策
  - GraphQL 言語により必要なフィールドだけを指定してクエリすることにより過小・過剰な取得を防ぐ
  - 単一のエンドポイントに対して GraphQL 言語によるクエリを行う形にすることにより管理するエンドポイントは一つとなる
- GraphQL の実際
  - 多くの組織では GraphQL と REST を併用している
  - 漸進的に取り入れていこう
  - GraphQL は単なる仕様でしかなく、様々な環境から利用可能

### GraphQL 関連のツール

- GraphiQL: ブラウザから利用できる GraphQL API の統合開発環境
  - 入力補完、シンタックスハイライト、構文エラー表示、クエリ実行結果確認などの機能
- GraphQL Playground: GraphiQL と似ているが、HTTP ヘッダの書き換えが可能などいくつかの GraphiQL にない機能がある
- 公開されている GraphQL API
  - SWAPI（スターウォーズ API）
  - GitHub API
  - Yelp

## グラフ理論のさわり

- **グラフ**: データを含むオブジェクト（**ノード**, 頂点）とコネクション（**エッジ**）から構成される
  - グラフ **G** = (頂点 **V**, エッジ **E** )
  - V = {1, 2, 3}, E ={ {1,2}, {2, 3} } のように表現できる
- **無向グラフ** は、エッジのリストの順番の入れ替えに対して不変
- **有向グラフ** は、エッジに向きがある、この場合 E = ( {1,2}, {2, 3} ) のように表現する
- ノード A と B がエッジでつながっているとき、**隣接している** という
- ノード A につながるエッジの数のことを、**エッジの次数** という
  - ノードの次数がすべて奇数だと、すべてのエッジを一度だけ通ってノードを巡回する方法がないことをオイラーが気づいた
  - すべてのエッジを一度だけ通ってノードを巡回できるようなグラフを **オイラー路** とよぶ
- **閉路**: 開始と終了のノードが同一になるグラフの経路
- **オイラー閉路**: 閉路のうち、すべてのエッジを一度だけ通ってノードを巡回できるような経路
- **木**: 根や開始ノードがあるグラフ
  - ノードを根から辿る際に根側にあるノードを **親**、そうでないノードを **子** とよぶ
  - 特に子を持たないノードを **葉** とよぶ
  - 根からのノードまでの距離を **深さ** とよぶ
- **二分木**: ノードが高々 2 つの子しか持たない木
- **二分探索木**: ノードが特別な順番で並んでいる二分木

### 実世界との比較

- Twitter のフォロー/フォロワー関係: 有向グラフ
- Facebook の友人関係: 無向グラフ
  - あるユーザーを起点にした友人関係のデータのリクエストは木構造になる
  - これは GraphQL のクエリによく似ている

```
- person
  - name
  - location
  - friends
    - friend name
    - friend location
```

## GraphQL 言語

- GraphQL は SQL と同じく**問い合わせ言語(Query Language)**
- データの取得には `query` コマンド 、データの操作には `mutation` コマンドを使う
- データの変更を監視する `subscription` コマンドもある
- GraphQL には **スカラー型** と **オブジェクト型** が存在する
  - スカラー型: **Int**, **Float**, **String**, **Boolean**, **ID**
  - オブジェクト型: 一つ以上のスキーマで定義されているフィールドの集合

query の実例

```sh
$ # succeeded
$ curl http://snowtooth.herokuapp.com/ \
    -H 'Content-Type: application/json' \
    --data '{"query": "{ allLifts { name } }"}'
{"data":{"allLifts":[{"name":"Astra Express"},{"name":"Jazz Cat"},{"name":"Jolly Roger"},{"name":"Neptune Rope"},{"name":"Panorama"},{"name":"Prickly Peak"},{"name":"Snowtooth Express"},{"name":"Summit"},{"name":"Wally's"},{"name":"Western States"},{"name":"Whirlybird"}]}}

$ # error
$ curl http://snowtooth.herokuapp.com/ \
    -H 'Content-Type: application/json' \
    --data '{"query": "{ allLifts { hoge } }"}'
{"errors":[{"message":"Syntax Error: Expected Name, found <EOF>","locations":[{"line":1,"column":21}],"extensions":{"code":"GRAPHQL_PARSE_FAILED","exception":{"stacktrace":["GraphQLError: Syntax Error: Expected Name, found <EOF>","    at syntaxError (/app/node_modules/graphql/error/syntaxError.js:15:10)","    at Parser.expectToken (/app/node_modules/graphql/language/parser.js:1404:40)","    at Parser.parseName (/app/node_modules/graphql/language/parser.js:94:22)","    at Parser.parseField (/app/node_modules/graphql/language/parser.js:291:28)","    at Parser.parseSelection (/app/node_modules/graphql/language/parser.js:280:81)","    at Parser.many (/app/node_modules/graphql/language/parser.js:1518:26)","    at Parser.parseSelectionSet (/app/node_modules/graphql/language/parser.js:267:24)","    at Parser.parseField (/app/node_modules/graphql/language/parser.js:308:68)","    at Parser.parseSelection (/app/node_modules/graphql/language/parser.js:280:81)","    at Parser.many (/app/node_modules/graphql/language/parser.js:1518:26)"]}}}]}
```

mutation の実例

```sh
$ curl http://snowtooth.herokuapp.com/ \
    -H 'Content-Type: application/json' \
    --data '{"query": "{ Lift(id: \"panorama\") { name status } }"}'
{"data":{"Lift":{"name":"Panorama","status":"OPEN"}}}

$ curl http://snowtooth.herokuapp.com/ \
     -H 'Content-Type: application/json' \
     --data '{"query": "mutation { setLiftStatus(id: \"panorama\" status: CLOSED) { name status } }"}'
{"data":{"setLiftStatus":{"name":"Panorama","status":"CLOSED"}}}

$ curl http://snowtooth.herokuapp.com/ \
    -H 'Content-Type: application/json' \
    --data '{"query": "{ Lift(id: \"panorama\") { name status } }"}'
{"data":{"Lift":{"name":"Panorama","status":"CLOSED"}}}
```

### クエリ

- 一度に送信できるクエリはひとつまでなので、複数のクエリを行いたい場合はひとつのクエリにまとめる
- 指定したフィールドのことを **選択セット** とよぶ

```
// これは NG
query {
  allLifts {
    name
    status
  }
  liftCount
}

query {
  allTrails {
    name
  }
  trailCount
}

// 以下のようにmatomeru
query {
  allLifts {
    name
    status
  }
  liftCount
  allTrails {
    name
  }
  trailCount
}
```

### クエリ引数

結果をフィルタリングできる

```
query {
 allLifts(status: CLOSED) {
    name
  }
}
```

### エイリアス

返却される際のフィールドの名前を指定できる

```
query {
  Lift(id: "jazz-cat") {
    liftname: name
    status
  }
}
```

### フラグメント

複数の場所で使いまわせる選択セットのことをフラグメントとよぶ

```
// Trail に関する情報が繰り返し登場している
query {
  Lift(id: "summit") {
    name
    status
    trailAccess {
      name
      difficulty
    }
  }
  Trail(id: "fish-bowl") {
    name
    difficulty
  }
}

// fragment を用いると以下のようにまとめられる
query {
  Lift(id: "summit") {
    name
    status
    trailAccess {
      ...trailInfo
    }
  }
  Trail(id: "fish-bowl") {
    ...trailInfo
  }
}

fragment trailInfo on Trail {
  name
  difficulty
}
```

### ユニオン型

Either みたいなやつ

```
query {
  entry {
    ...on Directory {
     path
    }
    ...on File {
     path
     content
    }
  }
}

// 以下のようにも書ける
query {
  entry {
    ...dir
    ...file
  }
}

fragment dir on Directory {
  path
}

fragment file on File {
  path
  content
}
```

### インターフェース

よくあるインターフェースのようなやつ（雑）

```
query {
  entry {
   path
  }
}
```

### ミューテーション

データの操作を行うコマンド、操作後の返り値としてほしいものをフィールドとして指定できる

```
mutation closeLift {
  setLiftStatus(id: "jazz-cat" status: CLOSED) {
    name
    status
  }
}
```

### クエリ変数

クエリ内の値を置き換えられる

```
mutation closeLift($liftId: ID!) {
  setLiftStatus(id: $liftId, status: CLOSED) {
    name
    status
  }
}

// 変数設定は以下のようにする
{
  "liftId": "jazz-cat"
}
```

### サブスクリプション

変更を通知として受け取れる

```
subscription {
  liftStatusChange {
    name
    status
  }
}
```

### イントロスペクション

API スキーマの詳細を取得できる機能

```
query {
  __schema {
    types {
      name
      kind
    }
  }
  __type(name: "Lift") {
    name
    kind
    description
  }
}
```

## GraphQL SDL

- GraphQL のスキーマを定義する言語として **GraphQL SDL(Schema Definition Language)** がある
- スキーマファイルの拡張子は `.graphql`

### スカラー型

以下のように ID, String, Int, Float, Boolean といったスカラー型を定義でき、`!` は non-null を表す

```
type User {
  id: ID!
  name: String!
  age: Int!
  verified: Boolean!
  score: Float
}
```

### カスタムスカラー型

以下のように `scalar` キーワードでカスタムスカラー型を定義できる

```
scalar DateTime

type Record {
  id: ID!
  created: DateTime!
}
```

### Enum

以下のように `enum` キーワードで Enum 型を定義できる

```
enum Status {
  OPEN
  CLOSED
}

type Store {
  status: Status!
}
```

### リスト

以下のように `[]` を使ってリストを定義できるが、要素とリスト自体の null 許容を両方していできる点、結構考えられている

```
enum Topping {
  NINNIKU
  YASAI
  ABURA
  KARAME
}

type Store {
  toppings: [Topping!]!
}
```

### オブジェクトの一対一の接続

単純にある型が他の型に内包されているパターン

```
type User {
 id: ID!
 name: String!
}

type Post {
 id: ID!
 postedBy: User!
}
```

### オブジェクトの一対多の接続

単純にある型のリストが他の型に内包されているパターン

```
type Character {
 id: ID!
 name: String!
}

type VoiceActor {
 id: ID!
 characters: [Character!]!
}
```

また Query ルート型には次のようにフィールドの追加ができる

```
type Query {
  allCharcters: [Character!]!
  totalCharacters: Int!
}

schema {
  query: Query
}
```

### オブジェクトの多対多の接続

双方向の一対多の関係

```
type User {
 id: ID!
 name: String!
 posts: [Post!]!
}

type Post {
 id: ID!
 title: String!
 content: String!
 editedBy: [User!]!
}
```

### ユニオン型

あるあるな表記で Good!

```
union Entry = Directory | File

type Directory {
  path: String!
}
type File {
  path: String!
  content: String!
}
```

### インターフェース

あるあるな表記で Good!

```
interface Entry {
  path: String!
}

type Directory implements Entry {
}

type File implements Entry {
  content: String!
}
```

### 引数

Query に定義してやればよい

```
type Query {
  // User 型を返す
  User(id: ID!): User!
  // Post 型の title, content だけを要求
  Post(id: ID!) {
    title
    content
  }
}
```

データのフィルター、ページング、ソートなども引数を使って表現できる

```
enum Category {
  ...
}
enum Sort {
  ...
}

type Query {
  allPosts(category: Category!)
  allPosts(limit: Int=50, offset: Int=0, sort: Sort=CREATED_DESC): [Post!]!
}
```

### ミューテーション

ルート型の Mutation に追加していく

```
type Mutation {
  createPost(
   title: String!
   content: String!
   postedBy: User!
  ): Post!
}

schema {
  query: Query
  mutation: Mutation
}
```

### 入力型

多数の引数をまとめられる型で引数にのみ利用できる

```
input CreatePostInput {
 title: String!
 content: String!
 postedBy: User!
}

type Mutation {
  createPost(input: CreatePostInput): Post!
}
```

### サブスクリプション

`subscription` ルート型に定義する

```
type Subscription {
 newPost: Post!
}

schema {
 query: Query
 mutation: Mutation
 subscription: Subscription
}
```

### ドキュメンテーション

`"` で囲うらしい

```
"""
ユーザー
"""
type User {
 id: ID!
 """
 ユーザー名
 """
 name: String!
 posts: [Post!]!
}

type Query {
  User(
   "ユーザーID"
   id: ID!
  ): User!
}
```

## GraphQL サーバーの実装

Apollo Server を使って実際に GraphQL サーバーを実装してみる

### Hello, GraphQL

次のようなコードを実装する

```js
const { ApolloServer } = require(`apollo-server`)

const typeDefs = `
  type Query {
    totalEvents: Int!
  }
`

const resolvers = {
  Query: {
    totalEvents: () => 100,
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => console.log(`Running on ${url}`))
```

`npm start` でサーバーを起動すると以下のようにクエリできるようになっている

```
{
  totalEvents
}

// return
{
  "data": {
    "totalEvents": 100
  }
}
```
