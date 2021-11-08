---
slug: ansible-lint-ci
title: ansible-lint を CI に組み込む
category: programming
date: 2018-02-03 04:39:13
tags: [ansible,drone,travis]
pinned: false
---

　この記事では ansible の linter である [`ansible-lint`](https://github.com/willthames/ansible-lint) を実際にどのように CI に組み込んでいるかをご紹介します。といっても、大した内容ではないのですが、あまり記事が出回ってなかったので、`ansible-lint` 良いぞという気持ちも兼ねて僭越ながら手短にまとめてみました。

## ansible-lint の導入

　`requirements.txt` を以下のように ansible リポジトリにコミットしておき、 `pip install -r requirements.txt` でインストールしています。

```yaml
ansible==2.4.3
ansible-lint==3.4.20
```

## .ansible-lint の設定

　実運用上、なかなか標準ルールすべてを満たすのは大変だったり、ちょっと面倒だったり、別にこれはいいんじゃないのみたいなものがあったりします。そんなときには、`.ansible-lint` の `skip_list` に対象のルールを記載しておけばベンリな感じに対象のルールを無視してくれます。

```yaml
parseable: true
quiet: false
use_default_rules: true
skip_list:
  - ANSIBLE0006
  - ANSIBLE0007
verbosity: 1
```

　特に既存の ansible に新たに ansible-lint を導入すると大量の警告がでてしまうというケースは多いかと思うので、ひとまず警告の出ているルールをすべて追加しておき、隙間時間に簡単そうなルールに順次対応していくとよいのではないかと思います。そういったリファクタリングフェーズでは ansible-lint の `-c` オプションで適用する `.ansible-lint` ファイルパスを指定することができるので便利です。

## travis を利用して pull request 時に ansible-lint を走らせる

　次のような感じで lint をかけたい対象の playbook を指定すれば良いと思います。include, import している各 yaml をトラバースしてくれます。

```yaml
language: python
python:
  - "2.7"
script:
  - pip install -r ./requirements.txt
  - ansible-lint *_playbook.yml
```

## drone を利用して pull request 時に ansible-lint を走らせる

`.drone.yml` をこんな風に書いてオワリ

```yaml
pipeline:
  test:
    image: python:2.7
    commands:
      - pip install -r requirements.txt
      - ansible-lint *_playbook.yml
```

## まとめ

導入は 5 分でできるので、ansible を使っているみなさま、ぜひ `ansible-lint` を使ってみると良いと思います。良さみがあります。
