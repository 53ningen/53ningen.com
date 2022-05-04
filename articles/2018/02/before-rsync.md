---
title: rsync をかけるときに確認すべきこと
category: programming
date: 2018-02-14 04:43:52
tags: [rsync]
pinned: false
---

1. dry-run を行い転送するデータ量を確認する

- 必要であれば exclude オプションを使い、不要なファイルの同期を除外する
- exclude オプションはパターンしていなので、絶対パスを指定すると期待した動作にならない点に注意

2. 受け入れ側サーバーに転送データを置く空きスペースがあるか確認する

```
# dry-run を行う
$ rsync -ah --dry-run --size-only --stats --exclude '$pattern' $src $dest

# 受け入れ側サーバーのディスクの空きを確認する
$ df -hl

# rsync をかける
rsync -ahv --size-only --stats $src $dest
```

意図としては

- ディスクフルを防ぐ
- サーバ間の意図しない大きなトラフィック発生を防ぐ
- 転送サイズが、作業想定よりも大きかったり小さかったりすることを確認することにより作業ミスを早期発見できる

他にも何かあれば追記していく

[amazon template=wishlist&asin=4774184268]
