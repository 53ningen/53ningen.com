---
slug: rehype-katex
title: react-markdown で数式を表示させる
category: programming
date: 2022-01-22 19:57:00
tags: [React]
pinned: false
---

react-markdown を使って Markdown 形式の記事を SSG する際に数式もいい感じに表示できるようにした。

といっても、react-markdown の [README.md](https://github.com/remarkjs/react-markdown#use-remark-and-rehype-plugins-math) に書かれているとおりの手順を進めるだけ（この記事は半分数式のテスト表示のため...）。

## 導入手順

以下の 2 ステップ

1. `yarn add remark-math rehype-katex`
2. ReactMarkdown 要素の rehypePlugins に rehypeKatex を追加、remarkPlugins に remarkMath を追加

```diff
+ import remarkMath from 'remark-math'
+ import rehypeKatex from 'rehype-katex'
+ import 'katex/dist/katex.min.css'
...
    <ReactMarkdown
+     rehypePlugins={[irehypeKatex]}
+     remarkPlugins={[remarkMath]}
```

## テスト

試しにナビエ-ストークス方程式を表示してみる。Markdown ファイルに直接以下のような記述を行う。

```tex
$$\rho \frac{D \bm{u}}{Dt} = -\nabla p + (\lambda + \mu ) \nabla (\nabla \cdot \bm{u}) + \mu \nabla ^{2} \bm{u} +\rho \tilde{\bm{F}}$$
```

このブログにうまく remark-math, rehype-katex が導入できていれば数式が以下に表示される。

$$\rho \frac{D \bm{u}}{Dt} = -\nabla p + (\lambda + \mu ) \nabla (\nabla \cdot \bm{u}) + \mu \nabla ^{2} \bm{u} +\rho \tilde{\bm{F}}$$

いい感じに表示されているっぽいので大成功！
