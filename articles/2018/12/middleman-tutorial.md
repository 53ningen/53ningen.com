---
title: middleman tutorial
category: programming
date: 2018-12-27 02:25:45
tags: [Ruby]
pinned: false
---

静的サイトを構築のための簡単なフレームワーク Middleman を使ってみたので、道中のメモを残します

## 1. 導入

```
$ cat .ruby-version
2.5.1

$ vi Gemfile
...

$ cat Gemfile
source 'https://rubygems.org'

gem 'middleman', '~> 4.2'

$ rbenv exec bundle install
...

$ rbenv exec bundle exec middleman version
Middleman 4.2.1

$ rbenv exec bundle exec middleman init .
...
```

`middleman server` で localhost で静的ページを serve できます

```
$ rbenv exec bundle exec middleman server
```

`middleman build` で静的ページファイルを書き出せます

```
$ rbenv exec bundle exec middleman build
      create  build/stylesheets/site.css
      create  build/javascripts/site.js
      create  build/images/.keep
      create  build/index.html
Project built successfully.
```

## 2. Hello, World!
