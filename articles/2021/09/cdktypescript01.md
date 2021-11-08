---
slug: cdktypescript01
title: 'TypeScript + CDK で理解する AppSync: はじめの一歩'
category: programming
date: 2021-09-05 01:57:34
tags: [GraphQL, CDK, TypeScript, AppSync]
pinned: false
---

この記事は TypeScript の CDK で単純な Hello, World! を返却する AppSync の GraphQL API を作成することを通して AppSync や GraphQL API に関する基本的な内容を段階を踏んで理解できるように構成されたものです。

あわせて作成した GraphQL を curl、Node.js アプリケーション、React アプリケーションから呼び出す方法についても確認していきます。

これらのステップを踏むことにより、さらに複雑で実践的な GraphQL や AppSync に関する内容を掴むための足掛かりとなるかと思います。

なお、本記事中の各種コードは [GitHub](https://github.com/53ningen/CDK-AppSync) にて公開しています。

```
$ git clone git@github.com:53ningen/CDK-AppSync.git
```

## 1. Hello, World!

まずは GraphQL クエリを投げると、Hello, World! が帰ってくる画期的なシステムを構築してみます。GraphQL API は GraphQL SDL によりそのインターフェースを定義します。今回は単純に Hello, World! という文字列（String! 型）を返すクエリを定義したいため次のようなスキーマとなります。

```graphql
# backend/src/graphql/schema.graphql
type Query {
　　　　sayHello: String!
}

schema {
　　　　query: Query
}
```

sayHello をクエリすると単純に Hello, World! が帰ってくるようなリソースは以下の CDK コードにより構築可能です。

```tsx
// backend/lib/hello-appsync-stack.ts
import {
  AuthorizationType,
  GraphqlApi,
  MappingTemplate,
  Schema,
} from '@aws-cdk/aws-appsync'
import * as cdk from '@aws-cdk/core'

export class HelloAppSyncStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const api = new GraphqlApi(this, 'HelloAppSyncApi', {
      name: 'HelloAppSync',
      schema: Schema.fromAsset('src/graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
      },
    })
    const sayHelloDataSoruce = api.addNoneDataSource('SayHelloDataSoruce', {})
    const sayHelloResolver = sayHelloDataSoruce.createResolver({
      typeName: 'Query',
      fieldName: 'sayHello',
      requestMappingTemplate: MappingTemplate.fromString(
        JSON.stringify({
          version: '2018-05-29',
          payload: 'Hello, World!',
        })
      ),
      responseMappingTemplate: MappingTemplate.fromString(
        '$util.toJson($context.result)'
      ),
    })
    new CfnOutput(this, 'ApiUrl', { value: api.graphqlUrl })
    new CfnOutput(this, 'Apikey', { value: api.apiKey || '' })
  }
}
```

上記のような CDK コードのもと `cdk deploy --outputs-file ../outputs.json` コマンドにてデプロイを行ったうえで、以下のクエリを投げると Hello, World! というレスポンスが得られます。

```tsx
// Query
query MyQuery {
  sayHello
}

// Response
{
  "data": {
    "sayHello": "Hello, World!"
  }
}
```

CDK コードを見ると `GraphqlApi`, `NoneDataSource`, `Resolver` という 3 つのリソース定義が行われていることがわかります。これらは **GraphQL API**, **データソース**, **リゾルバ** という要素となります。

### 1.1. GraphQL API リソースとは

GraphQL API リソースはその名のとおり AppSync の GraphQL API そのものを指します。GraphQL API のインターフェースを定めるスキーマは本リソースの属性のひとつと考えることができます。

このリソースは CloudFormation における [AWS::AppSync:GraphQLApi](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-graphqlapi.html) リソースに対応します。

### 1.2. データソースリソースとは

AppSync の GraphQL API はスキーマにより定義されたインターフェースを通じてバックエンドにあるデータソースから必要な情報を取得しレスポンスを返します。現時点において AppSync はデータソースとして DynamoDB テーブル、Elasticsearch テーブル、Lambda 関数、RDS、HTTP エンドポイントなど対応しています。

今回の目的は Hello, World! という固定された文字列を返却することです。これを達成するために例えば DynamoDB テーブルに Hello, World! という文字列を格納しておくといった方法があるかと思います。あるいは Hello, World! という文字列を返す Lambda 関数を作っておくという方法も考えられます。

前述の CDK コードではデータソースタイプとして、None を選択しています。実は、固定の文字列を返す際にはわざわざその文字列のデータを DynamoDB テーブルなどに格納する必要はありません。後述のリゾルバを作成する際に指定するマッピングテンプレートを活用することにより実現が可能です。

このリソースは CloudFormation における [AWS::AppSync::DataSource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-datasource.html) リソースに対応します。

### 1.3. リゾルバとは

これまでに GraphQL API リソースおよびデータソースリソースについてみてきました。例えば、あるクエリ実行時に必要な情報をデータソースである DynamoDB テーブルから取得する必要がある場合、クエリの入力を DynamoDB へのリクエストにマッピングする生じることは想像できるでしょう。また DynamoDB からのレスポンスをスキーマにて定義した形式にマッピングする必要も生じるでしょう。このような定義を行うリソースがリゾルバとなります。

まとめるとリゾルバとは主に、各クエリに対する GraphQL リクエストをもとに必要なデータが取得できるようデータソース側へのリクエスト内容をマッピングする **リクエストマッピングテンプレート** と、データソースから返却されたデータをクエリのスキーマで定義した形式にマッピングする **レスポンスマッピングテンプレート** から構成されるリソースとなります。それぞれのマッピングテンプレートは VTL(Apache Velocity Template Language) により記述します。

今回の目的は Hello, World! という固定された文字列を返却することですが、この場合単純にレスポンスマッピングテンプレートにて "Hello, World!" を返却するよう記述すればよいこととなります。実際 CDK コードのなかから抽出したリクエストマッピングテンプレートとレスポンスマッピングテンプレートの内容はそれぞれ次のとおりとなっています。

```json
// リクエストマッピングテンプレート
{
  "version": "2018-05-29",
  "payload": ""
}

// レスポンスマッピングテンプレート
"Hello, World!"
```

この場合、データソースは必要ないため前述のとおりデータソースタイプとして None を選択しています。データソースタイプによりリクエスト/レスポンスマッピングテンプレートのフォーマットは異なりますが、None データソースの場合の詳細についてはドキュメント: [データソース None 向けのリゾルバーマッピングテンプレートリファレンス](https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/resolver-mapping-template-reference-none.html)に詳細の記載があります。

このリソースは CloudFormation における [AWS::AppSync::Resolver](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-resolver.html) リソースに対応します。

### 1.4. Hello, World! の総括

ここまで TypeScript を用いた CDK コードにてクエリすると Hello, World! を返却する AppSync の GraphQL API とそれに関連するリソースを作成してきました。

CDK コードにて GraphQL SDL で記述した**スキーマ**により String! を返却する sayHello クエリのインターフェースを定義しました。この**クエリ**には入力やデータソースからのレスポンスを無視して単純に Hello, World! を返却する**マッピングテンプレート**を指定した**リゾルバ**を紐づけました。

また今回データソース自体が必要ないため、データソースタイプとして None を指定した**データソース**を作成し、リゾルバに紐づけました。

以上のことから GraphQL API、リゾルバ、データソースは次の図のような関係にあることがわかります。

<a href="https://static.53ningen.com/wp-content/uploads/2021/09/05015657/17c41269df617853609aa274.png"><img src="https://static.53ningen.com/wp-content/uploads/2021/09/05015657/17c41269df617853609aa274.png" alt="" width="639" height="272" class="aligncenter size-full wp-image-6263" /></a>

## 2. Lambda 関数をデータソースとした Hello, World!

つづいて、学習のためにあえてデータソースを Lambda 関数としたクエリを作ってみます。まずは スキーマに `sayHelloLambda(name: String!)` を追加します。ただ Hello, World! と返すだけでは芸がないので、今回追加するものはクエリの引数として `yourName` を受け取り、レスポンスとして `Hello, ${yourName}!` を返却するインターフェースを目指します。

```graphql
# backend/src/graphql/schema.graphql
type Query {
  sayHello: String!
  sayHelloLambda(yourName: String!): String!
}

schema {
  query: Query
}
```

Lambda 関数の実装は以下のようなとても簡単なものとなります。

```tsx
// backend/src/lambda/hello.ts
import 'source-map-support/register'

type HelloInput = {
  arguments: {
    yourName: string
  }
}

type HelloOutput = String

export async function handler(
  input: HelloInput,
  _: object
): Promise<HelloOutput> {
  console.log(`input: ${JSON.stringify(input)}`)
  return `Hello, ${input.arguments.yourName}!`
}
```

最後に CDK コードに必要なリソースに対する記述を追加します。GraphQL API 自体は最初に作ってあるため、今回は Lambda 関数とデータソースとリゾルバの 3 つを追加する形となります。

```tsx
// backend/lib/hello-appsync-stack.ts
    const sayHelloDataSoruce = api.addNoneDataSource('SayHelloDataSoruce', {})
    const sayHelloResolver = sayHelloDataSoruce.createResolver({
      typeName: 'Query',
      fieldName: 'sayHello',
      requestMappingTemplate: MappingTemplate.fromString(JSON.stringify({
        "version": "2018-05-29",
        "payload": ""
      })),
      responseMappingTemplate: MappingTemplate.fromString('"Hello, World!"')
    })

    const sayHelloLambdaFunction = new NodejsFunction(this, 'SayHelloLambdaFunction', {
      entry: 'src/lambda/hello.ts',
      timeout: Duration.seconds(3),
      memorySize: 128,
      bundling: {
        sourceMap: true,
        sourceMapMode: SourceMapMode.DEFAULT,
      }
    }
```

上記のような CDK コードのもとデプロイを行ったうえで、以下のクエリを投げると Hello, Takashi! というレスポンスが得られます。

```json
// Query
query MyQuery {
  sayHelloLambda(yourName: "Takashi")
}

// Response
{
  "data": {
    "sayHelloLambda": "Hello, Takashi!"
  }
}
```

### 2.1. Lambda 関数のデータソースとリゾルバについて

None タイプのデータソースを用いた際にはリゾルバ定義時にマッピングテンプレートを指定しましたが、今回の CDK コード `sayHelloLambdaDataSoruce.createResolver` の箇所にはマッピングテンプレートの指定がありません。

[Lambda のリゾルバマッピングテンプレートリファレンス](https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/resolver-mapping-template-reference-lambda.html#direct-lambda-resolvers) を確認するとリゾルバの定義においてマッピングテンプレートが指定されなかった場合の振る舞いの記載があります。これによるとリクエストマッピングテンプレートが指定されなかった場合、AppSync は Context オブジェクトを Lambda 関数に直接送信するとのことです。同様にレスポンスマッピングテンプレートが指定されなかった場合、以下のようにエラーでなければ単純に Lambda 関数のレスポンスを JSON に変換しレスポンスを返すという振る舞いとなります。

```json
#if($ctx.error)
     $util.error($ctx.error.message, $ctx.error.type, $ctx.result)
#end
$util.toJson($ctx.result)
```

もちろんデータソースとして Lambda 関数を選択した場合も、マッピングテンプレートの指定は可能です。しかしながら Lambda 関数そのものが実装コードによりレスポンスを整形できる性質のものであるため、前述のようなマッピングテンプレートを省略できる仕組みも用意されている形となります。

## 3. curl を用いて GraphQL API を呼び出す

ここまでのステップでは定数を返すクエリ: `sayHello` と、Lambda 関数をデータソースとして引数に応じてレスポンスが変化するクエリ: `sayHelloLambda` を持つ GraphQL API 構築しました。つづいて curl を用いて作成した GraphQL API にリクエストを送ってみることにしましょう。

REST API では HTTP メソッドとリソースを指定し HTTP リクエストを行うことで、種々のレスポンスを得ます。対して GraphQL API では同一の URI に対して様々なクエリを投げることにより、それぞれに対応するレスポンスを得ます。GraphQL の URI は AppSync マネジメントコンソールの該当 API の「設定」ページもしくは `aws appsync get-graphql-api` コマンドにて確認可能です。

また AppSync の GraphQL API には API キー、IAM、OpenID Connect、Cognito ユーザープール、Lambda 関数などにより認証モードを設定する必要があります。簡単のため CDK コードにて GraphqlApi リソースを作成した際には認証モードとして API キーを指定しています。この API キーについても AppSync マネジメントコンソールの該当 API の「設定」ページにて確認可能です。

以上の手順にて取得した `API_URL` および `API_KEY` をもとに次のように curl を用いて GraphQL API に簡単にリクエスト可能です。

```bash
$ cat ./src/etc/hello.sh
#!/bin/sh

API_URL=$(cat ../outputs.json | jq -r '.HelloAppSyncStack.ApiUrl')
API_KEY=$(cat ../outputs.json | jq -r '.HelloAppSyncStack.ApiKey')

curl -s -H "x-api-key: $API_KEY" \
    -d '{ "query": "query MyQuery { sayHello }" }' $API_URL | jq
curl -s -H "x-api-key: $API_KEY" \
    -d '{ "query": "query MyQuery { sayHelloLambda(yourName: \"Ken\") }" }' $API_URL | jq

$ ./src/etc/hello.sh
{
  "data": {
    "sayHello": "{sayHello!=Hello, World}"
  }
}
{
  "data": {
    "sayHelloLambda": "Hello, Ken!"
  }
}
```

## 4. Node.js アプリケーションから GraphQL API を利用する

### 4.1. node-fetch での生々しいリクエストを試す

つづいて TypeScript で記述された Node.js アプリケーションから GraphQL API を利用してみましょう。前述のとおり API の URL に対して HTTP POST メソッドにてクエリを送ればレスポンスが得られるため、HTTP クライアントがあれば十分で特別なライブラリは必要ありません。たとえば `node-fetch` を用いて次のように記述できます。

```tsx
// backend/src/etc/hello.ts
import fetch from 'node-fetch'
import Outputs = require('../../../outputs.json')

const apiUrl = Outputs.HelloAppSyncStack.ApiUrl
const apiKey = Outputs.HelloAppSyncStack.Apikey
const query = `
{
  sayHelloLambda(yourName: "Ken")
}
`

const main = async () => {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  console.log(JSON.stringify(data))
}

main().then((_) => {})
```

`ts-node` を用いてこのコードを実行してみると curl の場合と同様にクエリできていることが確認できるかと思います。

```bash
$ ts-node src/etc/hello.ts | jq
{
  "data": {
    "sayHelloLambda": "Hello, Ken!"
  }
}
```

しかしながら GraphQL スキーマは型付けがなされており、かつクライアントサイドを TypeScript で記述しているにもかかわらず、クエリを `String` で記述し、かつレスポンスを `any` で受け取っている点はとても残念です。また特に実用上のアプリケーションにおいては GraphQL スキーマはとても複雑になることが想定されます。

幸いにも GraphQL スキーマから TypeScript のコード生成を行ってくれるツールがいくつか存在します。今回はそのなかでも `[GraphQL code generator](https://www.graphql-code-generator.com)` を用いてコード生成を行ってみることにします。

### 4.2. スキーマからの生成コードを利用したリクエストを試す

GraphQL スキーマから TypeScript コード生成を行うため早速必要なモジュールを追加していきます。GraphQL スキーマに対応する型定義、実際のクエリおよび GraphQL API へのリクエストに必要なコードを生成させたいため以下のようなものを導入します。

```bash
$ yarn add graphql
$ yarn add -D \
    @graphql-codegen/cli \
    @graphql-codegen/typescript \
    @graphql-codegen/typescript-operations \
    @graphql-codegen/typescript-graphql-request
```

つづいてクエリの内容を定義したファイルを作成します。

```graphql
# src/graphql/sayHelloLambda.graphql
query sayHelloLambda($yourName: String!) {
  sayHelloLambda(yourName: $yourName)
}
```

最後にコード生成に必要な設定ファイル `codegen.yml` を作成します。

```yaml
# codegen.yml
overwrite: true
schema: src/graphql/schema.graphql
documents: src/graphql/**/*.graphql
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-graphql-request
```

この状態で `graphql-codegen --config codegen.yml` コマンドを叩くと `backend/src/generated/graphql.ts` が生成されます。準備が完了したので生成されたコードを利用して AppSync の GraphQL API を叩いてみましょう。次のコードのようにリクエストもレスポンスも TypeScript のコードとしてスマートに取り扱えます。

```tsx
// backend/src/etc/hello-with-generated-code.ts
import { GraphQLClient } from 'graphql-request'
import { getSdk } from '../generated/graphql'
import Outputs = require('../../../outputs.json')

const apiUrl = Outputs.HelloAppSyncStack.ApiUrl
const apiKey = Outputs.HelloAppSyncStack.Apikey

const cli = new GraphQLClient(apiUrl, {
  headers: {
    'x-api-key': apiKey,
  },
})
const sdk = getSdk(cli)

const main = async () => {
  const res = await sdk.sayHelloLambda({ yourName: 'Ken' })
  console.log(res.sayHelloLambda)
}

main().then((_) => {})
```

## 5. React アプリケーションから GraphQL API を利用する

Hello, World! の最終課題として React アプリケーションから GraphQL API を利用する流れをみておきましょう。完成形のイメージは以下のスクリーンショットのようにテキストボックスに名前を入力すると sayHelloLambda クエリを呼び出し、そのレスポンスである Hello, ${yourName}! を表示するというものです。

<a href="https://static.53ningen.com/wp-content/uploads/2021/09/05015638/output.gif"><img src="https://static.53ningen.com/wp-content/uploads/2021/09/05015638/output.gif" alt="" width="600" height="477" class="aligncenter size-full wp-image-6262" /></a>

これは大まかに以下のステップで実現可能です。

1. `npx create-react-app --template typescript` コマンドで TypeScript の React アプリケーションの雛形を作成する
2. 作成した雛形に GraphQL API コールに必要なライブラリを追加
3. GraphQL スキーマから GraphQL API コールに必要なコードを生成するため `backend/codegen.yml` に追記
4. Hello コンポーネントを `frontend/hello/src/Hello.tsx` として作成
5. `App.tsx` に Hello コンポーネントを組み込む

ステップ 1. に関してはコマンドを叩くだけです。ステップ 2. では React アプリケーションルート: `frontend/hello/` にて以下のコマンドを叩けば完了となります。

```bash
$ yarn add graphql graphql-request
$ yarn add --dev @graphql-codegen/typescript
```

つづいて GraphQL スキーマから React アプリケーション内部にコード生成を行うように `backend/codegen.yml` を以下のとおりに書き換え `yarn generate` コマンドを叩きます。

```yaml
# backend/codegen.yml
overwrite: true
schema: src/graphql/schema.graphql
documents: src/graphql/**/*.graphql
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-graphql-request
  ../frontend/hello/src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-graphql-request
```

そして、いよいよアプリケーションの実装に入ります。`frontend/hello/src/Hello.tsx` として次のような Hello コンポーネントを実装します。ご覧のように生成した GraphQL API 関連のコードの呼び出し方は Node.js アプリケーションの場合と同じような形となります。

```tsx
// frontend/hello/src/Hello.tsx
import { GraphQLClient } from 'graphql-request'
import React, { useEffect, useState } from 'react'
import './App.css'
import { getSdk } from './generated/graphql'
import Outputs from './outputs.json'

const apiUrl = Outputs.HelloAppSyncStack.ApiUrl
const apiKey = Outputs.HelloAppSyncStack.Apikey

const cli = new GraphQLClient(apiUrl, {
  headers: {
    'x-api-key': apiKey,
  },
})
const sdk = getSdk(cli)

export const Hello = () => {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchMessage = async () => {
      const result = await sdk.sayHelloLambda({ yourName: name })
      setMessage(result.sayHelloLambda)
    }
    const timer = setTimeout(() => {
      console.log(name)
      if (name === '') {
        setMessage('INPUT YOUR NAME')
      } else {
        fetchMessage()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [name])
  return (
    <p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>{message}</p>
    </p>
  )
}
```

最後に `frontend/hello/App.tsx` に作成した Hello コンポーネントを組み込み、`yarn start` コマンドにて React アプリケーションを実行すれば、テキストボックスに入力した名前に応じて `Hello, {yourName}!` というメッセージが表示されるアプリケーションの完成です。

```tsx
// frontend/hello/src/App.tsx
import React from 'react'
import './App.css'
import { Hello } from './Hello'
import logo from './logo.svg'

export const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
        <Hello />
      </header>
    </div>
  )
}
```

## 6. 「AppSync はじめの一歩」の総括

本章ではまず TypeScript で記述した CDK コードにて AppSync の GraphQL API とそれに関連する各種 AWS リソースの作成方法を確認しました。

GraphQL API はそのインターフェースを **GraphQL スキーマ** にて定義します。それに付随して、スキーマにて定義した各クエリが値を返すために必要な情報が格納されている **データソース** および、クエリからのリクエスト内容をデータソースのインターフェースに合うように変換し、かつデータソースからのレスポンス内容をクエリのインターフェースに合うように変換する役割をもつ **リゾルバ** も定義する必要があることを学びました。

つづいて段階を踏んで `curl`コマンド、Node.js アプリケーション、React アプリケーションから GraphQL API を呼び出す方法について学んでいきました。

以上により GraphQL API を構築するバックエンド側、および GraphQL API を利用するフロントエンド側の開発の雰囲気が理解できたでしょう。そして、この内容を足掛かりとすれば、より複雑な AppSync および GraphQL の機能についての理解がスムーズになるかとなるかと思います。
