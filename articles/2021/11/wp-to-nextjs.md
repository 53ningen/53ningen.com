---
slug: wp-to-nextjs
title: WordPress から Next.js への移行
category: programming
date: 2021-11-10 01:57:34
tags: [WordPress, Next.js, TypeScript]
pinned: false
---

## 記事本文の抽出

メタデータの抽出

```
mysql -h $DB_HOST -N -e 'SELECT p.ID as id, p.post_name as slug, p.post_date as date, p.post_title as title, c.name as category, GROUP_CONCAT(t.`name`) as tags, p.post_content_filtered as content FROM wp_posts p JOIN wp_term_relationships cr on (p.`id`=cr.`object_id`) JOIN wp_term_taxonomy ct on (ct.`term_taxonomy_id`=cr.`term_taxonomy_id` and ct.`taxonomy`="category") JOIN wp_terms c on (ct.`term_id`=c.`term_id`) JOIN wp_term_relationships tr on (p.`id`=tr.`object_id`) JOIN wp_term_taxonomy tt on (tt.`term_taxonomy_id`=tr.`term_taxonomy_id` and tt.`taxonomy`='post_tag') JOIN wp_terms t on (tt.`term_id`=t.`term_id`) GROUP BY p.id' > metadatas
```

記事本文を含めた markdown ファイルの作成

```
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

## 画像の URL 置き換え

```
mysql -h gomi-pdb01.crffyqald1aw.ap-northeast-1.rds.amazonaws.com wddb -N -B -r -e "select source_path, path from wp_as3cf_items" > images
```

```python
#!/usr/bin/env python3
import csv

with open('./articles') as f:
  for cols in csv.reader(f):
    targetFile = cols[0]

    with open(targetFile) as reader:
      content = reader.read()
      content = content.replace('https://53ningen.com/wp-content/uploads', 'https://static.53ningen.com/wp-content/uploads')

      with open('./images') as fff:
        for cs in csv.reader(fff, delimiter='\t'):
          fromString = f'wp-content/uploads/{cs[0][0:len(cs[0])-4]}'
          toString = cs[1][0:len(cs[1])-4]
          content = content.replace(fromString, toString)

        outputFile = targetFile[18:len(targetFile)]
        with open(f'./out/{outputFile}', 'w+') as writer:
          writer.write(content)
```
