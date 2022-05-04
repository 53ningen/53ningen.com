---
title: WordPress から Next.js への移行
category: programming
date: 2021-11-11 02:29:47
tags: [WordPress, JavaScript, Next.js, React]
pinned: false
---

- たしか 2012 年ごろから 53ningen.com の裏側として WordPress が動いていました
  - 当初はさくら VPS 上に MySQL, Nginx, WordPress などのほかいろんなものを相乗りにさせていた（学生時代なのでやんちゃは許される）
  - その後 AWS 上の EC2 に MySQL, WordPress を相乗りにする形を経て、ALB + EC2 + RDS (+ S3 + CloudFront) の構成に落ち着きました
  - コンテナ移行しようと思ってましたが WordPress で頑張ることにモチベーションをあまり見いだせなくなっていました
- そんなこんなの経緯があり、このたび WordPress を停止し Next.js の静的サイト生成（SSG）を用いる形に変更しました
- この記事では移行の流れについて簡単にメモしておきます（半分自分向け）

## 😢 そもそもなぜ WordPress を使いつづけていたのか

- 手元で長期間にわたり運用しつづける LAMP スタック的なアプリケーション（実際には nginx, MariaDB 使っていたのですが）を持っていると個人的な検証やトラブルシューティングの際に便利かなと思いまして...
  - 実際年 1 くらいで役に立つ時がありました
  - 無駄に Zabbix, Elasticsearch, Kibana とかと連携させて遊んでたんですが、そんなに楽しくなかった
  - 最近はサーバーレス方面を触ることが多く、コストのほうが高くついている印象だったのでばっさり捨てることにした
- 普段ウェブフロントをがっつりやるということはほぼないですが、ウェブフロントまわりの技術が落ち着いてきているように見えたので Next.js に移行することを決意

## 😂 移行の方針

- WordPress で蓄積した記事はそのままお引越ししたい
- カテゴリ, タグ, アーカイブなど WordPress で利用していた記事の分類はなるべくそのまま使えるようにしたい
- 運用コストをほぼゼロ円にする
- SSG で頑張る、SSR を使わない

## 🤗 移行作業

### Next.js で各ページの作成

[GitHub リポジトリはこちら](https://github.com/53ningen/53ningen.com)

なんやかんやで作成が必要だったページは以下の 5 ページなので思っていた以上に作業量は少なかった

- 記事ページ
- 記事一覧ページ
- カテゴリ記事一覧ページ
- タグ記事一覧ページ
- アーカイブ記事一覧ページ

しかも記事一覧ページはほぼ同じコンポーネントの使い回しなのでとても良い開発体験だった

Next.js の超初心者なのでもっと良い方法があるのかもしれないが以下のようなあたりに疑問を持った（なんか情報をお持ちの方は Twitter のリプかなんかで教えてください）

- ブログというアプリの性質上 `getStaticPaths` と `getStaticProps` で同じ情報取得しにいく必要があることが多いと思うのだが、前者から後者に渡せるパラメータは path パラメータのみの模様（？）で処理的には無駄では？と感じた
- 同様にほとんどのページで共通の Props（たとえば固定記事やカテゴリ/タグリストなど）を各ページの `getStaticProps` で取得する必要があるようで `_app.tsx` などで済ませられたらもっと便利だなぁと思った
  - 同じようなことを思ってる人がいるみたいで類似の Next.js の Discussion を見つけた: [getStaticProps on \_app #10949](https://github.com/vercel/next.js/discussions/10949)
  - ひとまず記事リスト取得用のモデルクラスでデータをキャッシュする形で回避した

### 記事本文の抽出

頭が悪いのでめちゃくちゃ地味なかんじで進めた。メタデータ（）の抽出は以下のような SQL 文。[このサイト](https://newbedev.com/wordpress-sql-get-post-category-and-tags)を参考にさせていただいた。

```bash
mysql -h $DB_HOST -N -e 'SELECT p.ID as id, p.post_name as slug, p.post_date as date, p.post_title as title, c.name as category, GROUP_CONCAT(t.`name`) as tags, p.post_content_filtered as content FROM wp_posts p JOIN wp_term_relationships cr on (p.`id`=cr.`object_id`) JOIN wp_term_taxonomy ct on (ct.`term_taxonomy_id`=cr.`term_taxonomy_id` and ct.`taxonomy`="category") JOIN wp_terms c on (ct.`term_id`=c.`term_id`) JOIN wp_term_relationships tr on (p.`id`=tr.`object_id`) JOIN wp_term_taxonomy tt on (tt.`term_taxonomy_id`=tr.`term_taxonomy_id` and tt.`taxonomy`='post_tag') JOIN wp_terms t on (tt.`term_id`=t.`term_id`) GROUP BY p.id' > metadatas
```

記事本文を含めた markdown ファイルの作成は以下のようなシェルスクリプトにてひたすら根性！スポ根！で生成（きっともっと知的なやり方があると思いますが Done is better than perfect.）

```bash
FILE="./metadatas"
DB_HOST="<............>"

IFS="$(echo -e '\t')"
while read LINE
do
  LINE=($LINE)
  ID=$(echo ${LINE[0]})
  echo "START: ${ID}"

  SLUG=$(echo ${LINE[1]})
  DATE=$(echo ${LINE[2]})
  TITLE=$(echo ${LINE[3]})
  CATEGORY=$(echo ${LINE[4]})
  TAGS=$(echo ${LINE[5]})
  CONTENT=$(mysql -h $DB_HOST wddb -N -B -r -e "select post_content_filtered from wp_posts where ID=${ID}")

  DATE_YEAR=`echo ${LINE[2]} | awk -F  "-" '{print $1}'`
  DATE_MONTH=`echo ${LINE[2]} | awk -F  "-" '{print $2}'`
  DIR_PATH="./${DATE_YEAR}/${DATE_MONTH}"
  FILE_PATH="${DIR_PATH}/${SLUG}.md"
  mkdir -p ${DIR_PATH}

  echo "---" > ${FILE_PATH}
  echo "slug: ${SLUG}" >> ${FILE_PATH}
  echo "title: ${TITLE}" >> ${FILE_PATH}
  echo "category: ${CATEGORY}" >> ${FILE_PATH}
  echo "date: ${DATE}" >> ${FILE_PATH}
  echo "tags: [${TAGS}]" >> ${FILE_PATH}
  echo "pinned: false" >> ${FILE_PATH}
  echo "---" >> ${FILE_PATH}
  echo "" >> ${FILE_PATH}
  echo ${CONTENT} >> ${FILE_PATH}

  echo "DONE: ${ID}"
done < ${FILE}
```

画像はもともと WordPress のプラグインを用いて S3 上に配置していたため、引っ越しは必要ない... と思いきや一部画像がうまく表示されない問題が発覚した。幸いにも記事本文中の画像のパスとプラグインが書き換える画像のパスの対応関係は簡単な構造でデータベースに格納されている模様だったので以下の SQL 文でぶっこ抜く！

```bash
mysql -h gomi-pdb01.crffyqald1aw.ap-northeast-1.rds.amazonaws.com wddb -N -B -r -e "select source_path, path from wp_as3cf_items" > images
```

ぶっこぬいたデータを利用して、記事中の画像がうまく表示されるように画像の URL 置き換えを以下の Python スクリプトで実施。これも根性！`fromString`, `toString` の扱いがめっちゃダサいけど脳みそ使わずにすんで便利！（使い捨てのスクリプトなので...）

```python
#!/usr/bin/env python3
import csv

with open('./article') as f:
  for cols in csv.reader(f):
    targetFile = cols[0]

    with open(targetFile) as reader:
      content = reader.read()
      content = content.replace('https://53ningen.com/wp-content/uploads', 'https://static.53ningen.com/wp-content/uploads')

      with open('./images') as fff:
        for cs in csv.reader(fff, delimiter='\t'):
          fromString = cs[0].replace(".jpeg", "")
          fromString = fromString.replace(".jpg", "")
          fromString = fromString.replace(".png", "")
          fromString = f'wp-content/uploads/{fromString}'

          toString = cs[1].replace(".jpeg", "")
          toString = toString.replace(".jpg", "")
          toString = toString.replace(".png", "")

          content = content.replace(fromString, toString)

        outputFile = targetFile[11:len(targetFile)]
        with open(f'./out/{outputFile}', 'w+') as writer:
          writer.write(content)
```

もっと色々問題出るかと思いきや、ほぼこれでうまく移行が完了しちゃいました

### デプロイ + DNS 切り替え

- なんか作業としてはあっさりおわったのであとはデプロイして動作検証
- 動作検証していると見つかるさまざまな不具合を細々となおしていく
- よさそうと思ったタイミングにて ALB からデプロイ先へ DNS レコードを変更！

## 😇 今後の展望と感想

- GitHub リポジトリに記事本文も配置しているのやめたいけど、かといって DynamoDB とかに置くのも大袈裟な気がしてきた？
  - Next.js + SSG でブログ運用している人、記事本文みんなどこに置いてるの？（Twitter でこっそりおしえて！）
- 個人用ブログなので必要ないといえばそうなんだけど、マネージ側のページを作ってみたりもしたい
  - 記事作成/管理画面的な厨二病ページを作りたい（勉強も兼ねて）
  - 実はそれらの機能実装を見越して SSR も可能なインフラストラクチャにデプロイしている
- WordPress 触るのダルすぎて最近記事書くのサボってましたが、これを機に色々ちゃんと記録に残す習慣を取り戻していきたい
- Next.js, React, SSG/SSR の良い勉強になりました
  - ウェブフロントが少し好きになれた気がします
