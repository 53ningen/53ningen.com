---
title: mkdir で作成したディレクトリをカレントディレクトリにする
category: programming
date: 2018-02-17 04:49:00
tags: [mkdir, shell]
pinned: false
---

ディレクトリを作ったあと、50% くらいの割合で作ったディレクトリに移動している気がするんですが、みなさんいかがでしょうか。たとえば以下のような感じです。

```shell
mkdir "新しいフォルダー(1)"
cd "新しいフォルダー(1)"
```

`.bash_profile` に以下のような感じに書いておけば、`mkdir` と `cd` が一気にできます。

```shell
mkcd () {
    mkdir $@ && cd `echo $@ | sed -e "s/-[^ \f\n\r\t]*//g"`
}
```

実際の使い心地は以下のような具合です。

```
[user@host /tmp]$ mkcd hoge
[user@host /tmp/hoge]$ mkcd fuga
[user@host /tmp/hoge/fuga]$ cd ../
[user@host /tmp/hoge]$ mkcd fuga
mkdir: cannot create directory `fuga': File exists
[user@host /tmp/hoge]$ mkcd -p fuga
[user@host /tmp/hoge/fuga]$ pwd
/tmp/hoge/fuga
```

`mkdir` のオプションはそのまま使える仕様で、複数のディレクトリを作成した場合は前方一致のディレクトリに移動します。仕様として `-` や `--` という名前のディレクトリには移動できません。ちゃんとやるなら、そこらへんにも対応する必要があるけど、まあ必要なさそう...。

[amazon template=wishlist&asin=4873112672]

#### 余談パート

ちなみに `-h` とか `--hoge` みたいなファイルを普通に作ろうとすると引数だと解釈されてしまいうまく作れない。`--` は以後を非オプション引数として扱ってくれるので、これを使えばいい感じに実現可能。

```
$ touch -p
touch: invalid option -- 'p'
Try 'touch --help' for more information.
$ touch --piyo
touch: unrecognized option '--piyo'
Try 'touch --help' for more information.
$ touch -- -p
$ touch -- --piyo
$
```
