---
title: PHPのスコープについて
category: programming
date: 2016-05-12 03:39:03
tags: [PHP]
pinned: false
---

自分用メモ。PHP の block はスコープの単位とならない。この特徴を示す単純なコードは以下のようなもの。

```php
try {
    $a = "a";
} catch(Exception $e) {
    // do something
}

echo $a;
```

つまり以下のようなコードは冗長だということになる（ただ、個人的には上のコードわかりづらいと思う...）。

```php
$a;
try {
    $a = "a"
} catch (Exception $e) {
    // do something
}
echo $a;
```

他言語を書きながら、ふと PHP を書くと混乱するのでメモ。
