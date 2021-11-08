---
slug: nextjs-tutorial
title: Next.js のチュートリアルを進めた記録
category: programming
date: 2020-03-20 19:40:10
tags: [JavaScript, Next.js, React]
pinned: false
---

## チュートリアルを進める

### Hello, World!

[チュートリアル](https://nextjs.org/learn/basics/getting-started/setup) にしたがって脳死状態でコマンドを打ち込んでいきます

```
mkdir yoppibirthday2020
cd yoppibirthday2020
npm init -y
npm install --save react react-dom next
mkdir pages
```

package.json の scripts をちょっといじって以下のようにしてあげる

```
{
  "name": "yoppibirthday2020",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "next",
    "build": "next build",
    "start": "next start"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "next": "^9.2.2",
    "react": "^16.13.0",
    "react-dom": "^16.13.0"
  }
}
```

`npm run dev` すると localhost:3000 でリクエストを待ち受けてくれるようになり、まだ何も作ってないので 404 が帰るようになる

`pages/index.js` を以下のような内容で作成するとハロワ終了

```
export default function Index() {
  return (
    <div>
      <p>Hello Next.js</p>
    </div>
  );
}
```

どうやら ホットリロードが何も記述しなくても働くっぽくて、該当のソースコードを保存すると自動的に更新される（便利）。そして `pages/about.js` を作ると localhost:3000/about でアクセスできる。

### サイト内リンクの作り方

`next/link` を用いるとクライアントサイドのナビゲーションで遷移できる。 History に積まれるので普通に Back ボタンも動作する。

```
import Link from "next/link";

export default function Index() {
  return (
    <div>
      <Link href="/about">About</Link>
      <p>Hello Next.js</p>
    </div>
  );
}
```

ルーティングの仕組みの詳細については次のページに記載があるようです: [Introduction - Documentation | Next.js](https://nextjs.org/docs/routing/introduction)

### コンポーネント

> The only special directories are /pages and /public.

特別なディレクトリは pages と public のみで、コンポーネントは特に決まった命名のディレクトリはなし。`components` でも `comps` でもなんでも良いようです。

`components/Header.js` を以下のように作成して、index.js と about.js に Header コンポーネントを差し込むと共通ヘッダーが作成できる。

```
import Link from "next/link";

const linkStyle = {
  marginRight: 15
};

const Header = () => (
  <div>
    <Link href="/">
      <a style={linkStyle}>Home</a>
    </Link>
    <Link href="/about">
      <a style={linkStyle}>About</a>
    </Link>
  </div>
);

export default Header;
```

同様に使い回しの効くスタイルであるレイアウトコンポーネントも作成できる。たとえば `components/MyLayout.js` を以下のように作成できる。

```
import Header from './Header';

const layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD'
};

const Layout = props => (
  <div style={layoutStyle}>
    <Header />
    {props.children}
  </div>
);

export default Layout;
```

なお、レイアウトコンポーネントは子要素を props にとったり、関数の引数にとったりすることもできる: [Learn - Using Shared Components | Next.js](https://nextjs.org/learn/basics/using-shared-components/rendering-children-components)

### 動的なページの生成

#### クエリストリングを用いる方法

- `next/router` の `useRouter` の query にクエリが格納されているらしい
- 例えば以下のようなコードで、クエリの値に応じてページの内容を構成できる

```
// pages/post.js

import { useRouter } from "next/router";
import Layout from "../components/MyLayout";

const Page = () => {
  const router = useRouter();

  return (
    <Layout>
      <h1>{router.query.title}</h1>
      <p>This is the blog post content.</p>
    </Layout>
  );
};

export default Page;
```

- `/post?title=hoge` にアクセスすると タイトルに hoge と書かれた記事を表示できる
- コンポーネントにおいても useRouter は使える
- これは React Hooks: [Introducing Hooks – React](https://reactjs.org/docs/hooks-intro.html)

#### パスベースの動的なページの実現

- めっちゃ簡単で、`contents/[title].js` みたいな形でファイル作れば良いっぽい、なるほどなぁ。

### リモートからのデータの取得

- 非同期通信に `isomorphic-unfetch` を使うため、`npm install isomorphic-unfetch`
- あとは以下のようなコードを書けば良い
  - `getInitialProps` に初期化に必要なデータ取得処理を記述する

```
import Link from "next/link";
import Layout from "../components/MyLayout";
import fetch from "isomorphic-unfetch";

const PostLink = props => (
  <li>
    <Link href={`/contents/${props.title}`}>
      <a>{props.title}</a>
    </Link>
  </li>
);

const Index = props => (
  <Layout>
    <h1>Tasks</h1>
    <ul>
      {props.tasks.map(task => (
        <li key={task.id}>
          <Link href="/p/[id]" as={`/p/${task.id}`}>
            <a>{task.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async () => {
  await sleep(4000);
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  const data = await res.json();
  return {
    tasks: data
  };
};

export default Index;
```

また getInitialProps でクエリの値などを利用したいときは次のように `context.query` から引っ張ってこれる

```
import Link from "next/link";
import Layout from "../components/MyLayout";
import fetch from "isomorphic-unfetch";

const PostLink = props => (
  <li>
    <Link href={`/contents/${props.title}`}>
      <a>{props.title}</a>
    </Link>
  </li>
);

const Index = props => (
  <Layout>
    <h1>Tasks</h1>
    <ul>
      {props.tasks.map(task => (
        <li key={task.id}>
          <Link href="/p/[id]" as={`/p/${task.id}`}>
            <a>{task.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async context => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  const data = await res.json();
  const tasks = data.slice(0, context.query.limit);
  console.log(tasks);
  return {
    tasks: tasks
  };
};

export default Index;
```

### スタイルコンポーネント

- React アプリでは PostCSS や SASS などの伝統的な CSS ファイルベースのスタイリングもしくは JS 内に CSS を記述するスタイルがある
- 特に SSR などに置いて前者の方法はいくつかの課題がある（正直よくわかってない）ので、Next.js では後者のほうを用いていく
- Next.js ではあらかじめ styled-jsx という CSS in JS フレームワークが組み込まれている

```
    <style jsx>{`
      h1,
      a {
        font-family: "Arial";
      }
    `}</style>
```

> As you have witnessed, CSS rules have no effect on elements inside of a child component.
> This feature of styled-jsx helps you to manage styles for bigger apps.

というわけで、グローバルに適用したいスタイルは `style jsx global` で定義する

### API

Next.js では `pages/api` が API のルートであり、ここに例えば以下のような簡単な API を生やす

```
export default (req, res) => {
  const now = new Date().toISOString();
  res.status(200).json({
    date: now,
    message: "Hello"
  });
};

```

すると、以下のように簡単に API が生える

```
$ curl -w '\n' http://localhost:3000/api/hello
{"date":"2020-03-01T11:58:29.589Z","message":"Hello"}
```

リモートフェッチ時には `swr` がベンリ、ひとまず `npm install swr` して、わかりやすさのために API に sleep をはさんどく

```
function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

export default async (req, res) => {
  await sleep(1);
  const now = new Date().toISOString();
  res.status(200).json({
    date: now,
    message: "Hello"
  });
};
```

んで、 `index.js` を次のようにすれば loading, error, onLoad で表示を手軽に変化させられる

```
import Link from "next/link";
import Layout from "../components/MyLayout";
import Markdown from "react-markdown";
import fetch from "isomorphic-unfetch";
import useSWR from "swr";

function fetcher(url) {
  return fetch(url).then(r => r.json());
}

const PostLink = props => (
  <li>
    <Link href={`/contents/${props.title}`}>
      <a>{props.title}</a>
    </Link>
  </li>
);

const Index = props => {
  const { data, error } = useSWR("/api/hello?hoge", fetcher);

  let message = data?.message;
  if (!data) message = "Loading...";
  if (error) message = "Failed to fetch time.";

  return (
    <Layout>
      <Markdown
        source={`
# Tasks

time: ${message}

**This is a list of my tasks.**

Could you please help me?

          `}
      />
      <ul>
        {props.tasks.map(task => (
          <li key={task.id}>
            <Link href="/contents/[id]" as={`/contents/${task.id}`}>
              <a>{task.title}</a>
            </Link>
          </li>
        ))}
      </ul>
      <style jsx>{`
        h1,
        a {
          font-family: "Arial";
        }

        ul {
          padding: 0;
        }

        li {
          list-style: none;
          margin: 5px 0;
        }

        a {
          text-decoration: none;
          color: blue;
        }

        a:hover {
          opacity: 0.6;
        }
      `}</style>
    </Layout>
  );
};

Index.getInitialProps = async context => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  const data = await res.json();
  const tasks = data.slice(0, context.query.limit);
  console.log(tasks);
  return {
    tasks: tasks
  };
};

export default Index;
```

この API Routes には便利なように [ビルトインのミドルウェア](https://nextjs.org/docs/api-routes/api-middlewares) が組み込まれており、簡単にクエリパラメータ、リクエスト本文、クッキーなどを取得できる

### デプロイ

- Zeit Now が作ったライブラリだけに Zeit を推してる
- ひとまずつかってみる

```
brew install now-cli
now
```

デプロイ終わった　すご w

### 静的 HTML アプリケーションのエクスポート

エクスポートにあたっては `next.config.js` というファイルを作成する必要がある

```
module.exports = {
  exportTrailingSlash: true,
  exportPathMap: function() {
    return {
      '/': { page: '/' }
    };
  }
};
```

そして `package.json` に以下を追加して `npm run build && npm run export`

```
"scripts": {
  "build": "next build",
  "export": "next export"
}
```

成果物を確認するには `serve` を使えばよい

```
npm install -g serve
cd out
serve -p 8080
```

`next.config.js` は普通に JS ファイルなので、以下のような芸当も可能

```
const fetch = require("isomorphic-unfetch");

module.exports = {
  exportTrailingSlash: true,
  exportPathMap: async function() {
    const paths = {
      "/": { page: "/" },
      "/about": { page: "/about" }
    };

    const res = await fetch("https://jsonplaceholder.typicode.com/todos");
    const tasks = await res.json();
    tasks.forEach(task => {
      paths[`/contents/${task.id}`] = {
        page: "/contents/[id]",
        query: { id: task.id }
      };
    });

    return paths;
  }
};
```

### TypeScript の導入

```
npm install --save-dev typescript @types/react @types/node
```

- その後、`*.js` → `*.tsx` として `npm run dev` すると勝手に `tsconfig.json` が生成される
- `tsconfig.json` の strict を true にすると、型アノテーションが抜けてる際にエラーとなる

### AMP の導入

以下のようにするだけ

```
export const config = { amp: true };

// export const config = { amp: 'hybrid' };
```
