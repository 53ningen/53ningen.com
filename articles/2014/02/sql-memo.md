---
slug: sql-memo
title: SQLメモ
category: programming
date: 2014-02-27 11:58:51
tags: [mysql]
pinned: false
---

- [MySQL Exercises, Practice, Solution - w3resource](https://www.w3resource.com/mysql-exercises/)

## 主なデータ型

- CHARACTER : 'hoge'
- NATIONAL CHARACTER : N'ほげ'
- NUMERIC : 1
- DATE : DATE'1999-12-31'

## データ検索

- `SELECT [field]... FROM [table]`　フィールドの検索
  - [field] -> \* : 全列指定, SELECT DISTINCT 重複の省略, SELECT ALL 重複の表示
- `SELECT ... FROM ... WHERE [condition]` 条件付き検索
  - WHERE [value] (NOT) BETWEEN A AND B
  - WHERE [value] (NOT) IN([value(s)]...)
  - WHERE [value] LIKE [pattern] ESCAPE [char] あいまい検索(%->[*]+, \_->[*])
  - WHERE [value] IS (NOT) NULL
- `SELECT 品名, 価格*1.08 AS 税込み価格 FROM 商品一覧`
- `SELECT [集合関数] FROM [table]`
  - ex. SELECT SUM(金額), AVG(金額), MAX(金額), MIN(金額) FROM 商品一覧
- `SELECT カテゴリ, SUM(売り上げ) FROM 売上表 GROUP BY カテゴリ HAVING SUM(売り上げ) >= 1000`
- `SELECT カテゴリ, SUM(売り上げ) FROM 売上表 ORDER BY SUM(売り上げ) ASC(DESC)`
- `SELECT [field]... FROM [tableA] INNER JOIN [tableB] ON tableA.[field] = tableB.[field]`
- `SELECT [field]... FROM [tableA] [tableB] WHERE tableA.[field]=tableB.[field]`
- `SELECT [field]... FROM [table] (FULL,RIGHT,LEFT) OUTER JOIN [table] ON t.f=t.f`
- `SELECT [f].. FROM [t] WHERE 品名 = ANY(SOME,ALL)(SELECT 品名 FROM ...)`
- `SELECT [f].. FROM [t] WHERE (NOT) EXISTS(SELECT...)`
- `SELECT [名前] FROM 生徒一覧 UNION(EXCEPT,INTERSECT) SELECT [名前] FROM 塾生一覧`

## データ・トランザクション操作

基本的な構文は、挿入：INSERT、更新：UPATE、削除：DELETE、トランザクションの確定：COMMIT、トランザクションの取り消し：ROLLBACK の５種類。

- `INSERT INTO [table] VALUES([values]...)`
- `INSERT INTO [table]([field]...) VALUES([values]...)`
- `INSERT INTO [table] SELECT [hoge]`
- `UPDATE [table] SET [field]=[value] WHERE [condition]`
- `DELETE FROM [table] WHERE [condition]`

## データベースの作成

```sql
//  表の作成
CREATE TABLE TableName(
  フィールド１ CHARACTER(32) PRIMARY,
  フィールド2 NATIONAL CHARACTER(32) UNIQUE,
  フィールド3 NUMERIC(10) NOT NULL CHECK(フィールド3 > 10),
  フィールド4 DATE,
)

//  表の削除
DROP TABLE TableName (CASCADE)

//  フィールドの追加
ALTER TABLE TableName ADD FieldName DataType

//  フィールドの削除
ALTER TABLE TableName DROP FieldName

//  権限の付与・剥奪
GRANT SELECT,INSERT ON TableName TO User
REVOKE SELECT ON TableName FROM User
```

## テーブル設計

- 正規化
  - 1 つの事柄に対して、保存されるデータを 1 つにする手続き
  - データの重複や不整合を防ぐ
- 関数従属性: ひとつの値が決まると他の項目が決まること
  - 複数のキー項目により値が決定する: 完全従属
  - 主キーの一部により値が決定する: 部分従属
- 主キー
  - 自然キー: キーの値に意味がある
  - サロゲートキー: キーの値に意味がない

### 非正規系

- データが繰り返し項目を持った状態

```
[invoice_id], user_id, user_name, product_id1, product_name1, num_1, product_id2, product_name2, num2
1, user_hoge, hoge, product1, new_product, 10, product2, old_product, 20
```

### 第 1 正規形

- 繰り返し項目がなくなった状態
- すべての非キー項目が主キーに関数従属している
  　- product_id, product_name, num の繰り返しを排除
  - user_id, user_name は invoice_id により一意に定まる
  - product_name, num は invoice_id, product_id により一意に定まる

```
[invoice_id], user_id, user_name
1, user_hoge, hoge

------

[invoice_id], [product_id], product_name, num
1, product1, new_product, 10
1, product2, old_product, 20
```

### 第 2 正規形

- 繰り返し項目がなくなった状態
- すべての非キー項目が主キーに関数従属している
- 主キーの一部に従属する非主キーを排した状態
  - user_id, user_name は invoice_id に従属
  - product_name は product_id にのみ従属（排除の対象）
  - num は invoice_id, product_id に従属

```
[invoice_id], user_id, user_name
1, user_hoge, hoge

------

[product_id], product_name
product1, new_product
product2, old_product

------

[invoice_id], [product_id], num
1, product1, 10
1, product2, 20
```

### 第 3 正規形

- 繰り返し項目がなくなった状態
- すべての非キー項目が主キーに関数従属している
- 主キーの一部に従属する非主キーを排した状態
- 推移的関数従属を排した状態
  - user_name は invoice_id により決定する user_id により決定する（推移的関数従属なので排する）

```
[user_id], user_name
user_hoge, hoge

------

[invoice_id], user_id
1, user_hoge

------

[product_id], product_name
product1, new_product
product2, old_product

-----

[invoice_id], [product_id], num
1, product1, 10
1, product2, 20
```
