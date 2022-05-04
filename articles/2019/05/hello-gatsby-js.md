---
title: Gatsby.js ことはじめ
category: programming
date: 2019-05-18 15:47:53
tags: [JavaScript, Gatsby.js]
pinned: false
---

- 5/18 から Gatsby.js を書き始めた
- つまづいて、調べて解決した点をメモっていく
- 言語学習の過程が記録として残る
- 間違っている可能性が大いにあるので、この記事は自分向けです

## 導入

[Quick Start | GatsbyJS](https://www.gatsbyjs.org/docs/quick-start) を見ながら進めれば難なくできます

```
npm install -g gatsby-cli
gatsby new gatsby-site
cd gatsby-site

# Start development server.
gatsby develop

# Create a production build.
gatsby build

# Serve the production build locally.
gatsby serve
```

## GitHub pages にデプロイ

[How Gatsby Works with GitHub Pages | GatsbyJS](https://www.gatsbyjs.org/docs/how-gatsby-works-with-github-pages/) を見るとわかりやすい

gh-pages をインストールする

```
yarn add --dev gh-pages
```

yarn deploy でデプロイできるように以下を追加

```
   {
        "scripts": {
            ...
            "deploy": "gatsby build && gh-pages -d public -b master",
        }
    }
```

## ロゴなどを配置する

[Using the Static folder | GatsbyJS](https://www.gatsbyjs.org/docs/static-folder/) をみる

- パスを固定したいものはルート直下の static に配置する
- static 直下に置いたものがホスティングの際のルートパス直下に配置される形でコピーが走る
- Twitter カード向けの画像などは現実的に static 下に置く形となりそう？

## Meta タグの設定をいい感じにやりたい

[Adding page metadata | GatsbyJS](https://www.gatsbyjs.org/docs/add-page-metadata/) をみる

```
yarn add gatsby-plugin-react-helmet react-helmet
```

gatsby-config.js に以下を追加

```
{
  plugins: [`gatsby-plugin-react-helmet`]
}
```

より実践的な OGP や Twitter カードの設定などは [Adding an SEO component | GatsbyJS](https://www.gatsbyjs.org/docs/add-seo-component/) を参照

## ソーシャルメディアシェアボタンの設置

[nygardk/react-share: Social media share buttons and share counts for React](https://github.com/nygardk/react-share) を使うと手軽

```
npm install react-share --save
```

コンポーネント

```
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  PinterestShareButton,
  VKShareButton,
  OKShareButton,
  RedditShareButton,
  TumblrShareButton,
  LivejournalShareButton,
  MailruShareButton,
  ViberShareButton,
  WorkplaceShareButton,
  LineShareButton,
  PocketShareButton,
  InstapaperShareButton,
  EmailShareButton,
} from 'react-share';
```
