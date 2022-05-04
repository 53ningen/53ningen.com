---
title: ES2015+Flowなlambda関数をApexで管理する
category: programming
date: 2017-03-01 06:24:20
tags: [AWS, js, Serverless]
pinned: false
---

ES2015 + 型チェッカー flow で書かれた AWS Lambda 関数を Apex で管理する方法について、つらつらとメモ。この記事は @nagisio 先生のご指導のおかげで成立しています（謝辞）。

- キーワード
  - AWS Lambda
  - yarn
  - ES2015
  - flow
  - Apex

記事読むの面倒くさいので、動くリポジトリよこせという方は**[ここを clone](https://github.com/53ningen/flow-lambda-sample)**すべし（動かしてから理解する方が楽なのですよねー :wakaru:）

# ES2015 + flow + Apex の環境構築

## yarn の導入

導入はかんたん。

1. `npm init` で `package.json` を作る
2. `npm install yarn --dev` で yarn を導入する

- global に入れたい方はどうぞ

`package.json` はきっとこんな感じになっているのではなかろうか

```
{
  "name": "flow-lambda-sample",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "yarn": "^0.21.3"
  }
}
```

## ESS2015 + flow の環境構築

まずは必要なものを片っ端からいれていく

```
node_modules/yarn/bin/yarn add \
  babel-cli \
  babel-register \
  babel-preset-babili \
  babel-preset-es2015 \
  babel-plugin-transform-flow-strip-types \
  flow-bin \
  flow-typed \
    --dev
```

次に `.babelrc` を次のようにする

```
{
  "presets": [
    "es2015"
  ],
  "plugins": [
    "babel-plugin-transform-flow-strip-types"
  ],
  "env": {
    "production": {
      "presets": [
        "babili"
      ]
    }
  }
}
```

`node_modules/flow-bin/cli.js init` で flow の設定ファイル `.flowconfig` を作り、以下のような感じにする

```
> cat .flowconfig
[ignore]
.*/node_modules/.*

[include]
./src/

[libs]

[options]
```

もう多分この時点で ES2015 + flow のコードが書けるので適当に `src/hello/index.js` に適当なコードを書いてみよう

```
// @flow

/**
 * ラムダ関数のメインエントリポイント
 */
function handler(events: any, context: any) {
  const msg: string = 'hello, work!';
  context.succeed({
    message: msg
  });
}

export default handler;
```

続いてトランスパイルして `functions` 下に成果物を出力してみよう

```
> node_modules/flow-bin/cli.js && node_modules/babel-cli/bin/babel.js src -d functions
No errors!
src/hello/index.js -> functions/hello/index.js
```

成果物は次のようになっているだろう

```
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


/**
 * ラムダ関数のメインエントリポイント
 */
function handler(events, context) {
  var msg = 'hello, work!';
  context.succeed({
    message: msg
  });
}

exports.default = handler;
```

良い感じにハローワークに行きたいくなる良いラムダ関数ですね。さて、ここまできたらあとは Apex を導入して AWS にデプロイするだけです。

ちょっとその前に、トランスパイルするコマンドが長ったらしくてだるいのでエイリアスを張っておきましょう。`package.json` の script の部分をちょちょいといじるといい感じに `npm run build` で諸々実行できます。

```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "node_modules/flow-bin/cli.js  && node_modules/babel-cli/bin/babel.js src -d functions"
  }
```

## Apex の導入

今回 AWS Lambda 関数の管理には `Apex` をつかいます。Apex の挙動は非常に単純で `project.json` に指定されたリソースやタイムアウト時間、IAM ロールの設定で、functions 直下にある各ディレクトリをそれぞれラムダ関数とみなし、デプロイしてくれます。

導入はかんたん

```
curl https://raw.githubusercontent.com/apex/apex/master/install.sh | sh
```

`project.json` をイカのよう設定すればよいでゲソ（各自 IAM ロールは適切なものを指定してください）

```
{
  "name": "flow-lambda-sample",
  "description": "flow lambda sample",
  "memory": 128,
  "timeout": 5,
  "handler": "index.default",
  "role": "arn:aws:iam::************:role/flow-lambda-sample_lambda_function",
  "environment": {}
}
```

`apex deploy` でデプロイできます。`apex invoke hello` で実行できます。

```
> apex deploy
   • creating function         env= function=hello
   • created alias current     env= function=hello version=1
   • function created          env= function=hello name=flow-lambda-sample_hello version=1

> apex invoke hello
{"message":"hello, work!"}
```

良い

## ESLint の導入（お好みで）

ESLint を入れたい方は適当に必要そうなやつをどうぞ（適当）

```
node_modules/yarn/bin/yarn add \
  babel-eslint \
  eslint \
  eslint-config-airbnb \
  eslint-plugin-flowtype \
  eslint-plugin-import \
  eslint-plugin-jsx-a11y \
  eslint-plugin-react \
    --dev
```

`.eslint` を適当に書く

```
{
  "extends": [
    "airbnb",
    "plugin:flowtype/recommended"
  ],
  "env": {
    "browser": true,
    "es6":     true,
    "mocha":   true
  },
  "parser": "babel-eslint",
  "plugins": [
    "flowtype"
  ],
  "rules": {
    "max-len": "off",
    "no-console": "off",
    "class-methods-use-this": "off",
    "comma-dangle": ["error", "never"],
    "dot-notation": ["error", {
      "allowPattern": "^[a-z]+(_[a-z]+)+$"
    }],
    "key-spacing": ["error", {
      "mode": "minimum"
    }],
    "no-multi-spaces": ["error", {
      "exceptions": {
        "ImportDeclaration": true,
        "VariableDeclarator": true,
        "AssignmentExpression": true
      }
    }],
    "no-param-reassign": ["error", {
      "props": false
    }],
    "quote-props": ["error", "consistent"],
    "import/extensions": "off",
    "import/no-extraneous-dependencies": "off",
    "import/no-unresolved": "off"
  }
}
```

## deploy 前に uglify の処理を入れる

lambda の起動時間は多分デプロイされる成果物のサイズが小さい方がはやいので、uglify をかけたほうがよさそう。`packaage.json`を書き換えればいい感じに実現可。

```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "node_modules/flow-bin/cli.js  && node_modules/babel-cli/bin/babel.js src -d functions",
    "build:prod": "node_modules/flow-bin/cli.js && NODE_ENV=production node_modules/babel-cli/bin/babel.js src -d functions"
  }

```

`npm run build:prod` で functions 下にできる成果物を確認してみるとちゃんとできてるか確認出来る。

## ステージ管理

このあたりの対応が一番筋がよさそう? [Lambda with Apex: 環境変数で環境別に Lambda 環境を整える](http://qiita.com/gaishimo/items/af2a05bcaf4cb96e534b#>E5>AF>BE>E5>BF>9C>E6>A1>883-projectjson>E3>83>95>E3>82>A1>E3>82>A4>E3>83>AB>E3>82>92>E9>83>BD>E5>BA>A6>E5>88>87>E3>82>8A>E6>9B>BF>E3>81>88>E3>82>8B)

## おわりに

ES2015 + flow + Apex で快適な AWS Lambda ライフを！

```

```
