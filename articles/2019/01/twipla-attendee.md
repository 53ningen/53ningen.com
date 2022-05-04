---
title: twipla の参加者名とtwitter ID のリストをエクセルファイルに落とし込む
category: programming
date: 2019-01-17 20:35:27
tags: [JavaScript, twipla]
pinned: false
---

twipla で立てたイベントの参加者名と twitter ID を CSV 形式（エクセルでひらけます）で抽出するゴミみたいなワンライナースクリプトを雑に書いたのでメモっておく。

品質はゴミだけど、タイムラインにフラスタ企画立ててる人結構いるので必要な方はどうぞ。

## 使い方

(1) Chrome で twipla のイベントページを開く
(2) Cmd+Option+J で Chrome Developer Tool のコンソールを開く
(3) 次のコードを実行

```js
console.log(
  j$('.float_left.member_list.round_border li')
    .toArray()
    .map((e) =>
      [
        e.textContent.trim(),
        e.lastChild['href'].slice(24, e.lastChild['href'].length),
      ].join(',')
    )
    .join('\n')
)
```

<a href="https://static.53ningen.com/wp-content/uploads/2019/01/17204358/8bb4c6a3b10a4bdbc27047046d0ed26a.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/01/17204358/8bb4c6a3b10a4bdbc27047046d0ed26a-1024x294.png" alt="" width="640" height="184" class="alignnone size-large wp-image-4408" /></a>

↑ こんなかんじで 名前,TwitterID という形式の出力がズラズラでるので、それをコピー

(4) 出力を csv 形式で保存
(5) Windows の人はたぶんそのままファイルを開ける。mac の人は次のコマンドを実行してから開く（やらないと文字化けする）

```
$ nkf -s --overwrite sankasya.csv
```

nkf コマンドない人は brew かなんかで適当に入れてね

```
$ brew install nkf
```

## シェルスクリプトバージョン

次のようなコードを書く

```sh
#!/bin/sh

if !(expr $1 : "[0-9]*$" >& /dev/null); then
  echo "error: event_id is invalid."
  exit 1
fi

event_id=$1
res=$(curl -Lso- "https://twipla.jp/events/printlist/$event_id")
count=$(echo $res | xmllint --html --encode utf-8 --xpath 'count(//html/body/div[1]/table/tr)' -)

for ((i=2; i < $count; i++)); do
  item=$(echo $res | xmllint --html --encode utf-8 --xpath "//html/body/div[1]/table/tr[$i]/td[2]" -)
  item=$(echo $item | sed -e 's/<br>/,/g')
  item=$(echo $item | sed -e 's/<[/]*td>//g')
  echo $item
done
```

引数にイベント id を指定するといい感じに .csv 形式の出力が得られる

```
$ ./function.sh 356796
@yoppiflower,青山吉能さん向け 想い出のパレード 協賛
@pegasus1109,ペガサス
...（中略）...
@gomi_ningen,ゴミ箱
...（中略）...
```

## 補足

あまりにも雑に作ったのでそのうち（twipla 側の変更で）動かなくなると思う
