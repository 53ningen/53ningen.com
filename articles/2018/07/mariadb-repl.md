---
slug: mariadb-repl
title: MariaDB から RDS for MariaDB へのレプリケーション
category: programming
date: 2018-07-27 23:02:35
tags: [AWS, mysql, RDS, MariaDB]
pinned: false
---

オンプレミスの MariaDB についてバージョン 10.0.24 以降を利用している場合、 RDS for MariaDB のインスタンスをレプリケーションスレーブにする場合 GTID ベースのレプリケーションを行う。

```
# MariaDB バージョン
Server version: 10.2.10-MariaDB MariaDB Server
```

**GTID: Global Transaction ID** は、マスターでコミットされたトランザクションに対して一意に関連づけられる識別子で、次のような形式を持つ。ここで `source_id` はサーバーの識別子、`transaction_id` はシーケンス番号となる。

```
source_id:transaction_id
```

### 参考資料

- [MySQL :: MySQL 5.6 リファレンスマニュアル :: 17.1.3.1 GTID の概念](https://dev.mysql.com/doc/refman/5.6/ja/replication-gtids-concepts.html)
- [漢(オトコ)のコンピュータ道: MySQL レプリケーションの運用が劇的変化！！GTID について仕組みから理解する](http://nippondanji.blogspot.com/2014/12/mysqlgtid.html)

## 1. master 側の準備

### 1.1. master の設定

server-id やバイナリログフォーマットを設定しておく

```
[mysql]
server-id=1
log-bin=mysql-bin
binlog-format=ROW
expire_logs_days=7
log-slave-updates
```

ついでに、データがないと動作確認できないので、適当なデータを突っ込んでおく

```
MariaDB [test]> CREATE TABLE users(
    ->     id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    ->     name VARCHAR(50)
    -> );
Query OK, 0 rows affected (0.00 sec)

MariaDB [test]> INSERT INTO users(name) VALUE ('Cocoa');
```

### 1.2. レプリケーション用のユーザー作成

※ 以下で作ってるのはテスト用のパスワードなので、以降ベタ書きする

```
$ cat /dev/urandom | tr -dc 'a-zA-Z0-9\.\-\_' | fold -w 30 | head -n 1 | sort | uniq
E4E817qPhenCYgfUDG2vusprINYFKZ

$ mysql
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 12
Server version: 10.2.10-MariaDB MariaDB Server

Copyright (c) 2000, 2017, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE USER 'repl'@'%' IDENTIFIED BY "E4E817qPhenCYgfUDG2vusprINYFKZ";
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> GRANT REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'repl'@'%' IDENTIFIED BY 'E4E817qPhenCYgfUDG2vusprINYFKZ';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SHOW GRANTS for 'repl'@'%'\G
*************************** 1. row ***************************
Grants for repl@%: GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'repl'@'%' IDENTIFIED BY PASSWORD 'E4E817qPhenCYgfUDG2vusprINYFKZ'
1 row in set (0.00 sec)

MariaDB [(none)]> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)
```

### 1.3. レプリケーションスレーブへのデータのインポート

LOCK をかけ GTID ポジションを確認する

```
MariaDB [(none)]> FLUSH TABLES WITH READ LOCK;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SET GLOBAL read_only = ON;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SELECT @@gtid_current_pos;
+--------------------+
| @@gtid_current_pos |
+--------------------+
| 0-1-1              |
+--------------------+
1 row in set (0.00 sec)

MariaDB [(none)]> exit
Bye
```

mysqldump でレプリケーションスレーブ DB へ愚直なデータインポートを行う

```
$ mysqldump \
>     --databases test \
>     --single-transaction \
>     --compress \
>     --order-by-primary \
>     -u root | mysql \
>         --host=db01.*********.ap-northeast-1.rds.amazonaws.com \
>         --port=3306 \
>         -u root \
>         -p
Enter password:
$
```

ロックを解除しておく

```
MariaDB [(none)]> SET GLOBAL read_only = OFF;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> UNLOCK TABLES;
Query OK, 0 rows affected (0.00 sec)
```

## 2. slave でのレプリケーションの設定と開始

### 2.1. 通常の MariaDB への GTID ベースのレプリケーション

RDS for MariaDB では SUPER USER 権限がないため通常とは異なり、用意されたストアドプロシージャを叩くことになる。その前に通常の MariaDB へレプリケーションスレーブの設定をする手順を確認しておく

```
MariaDB [(none)]> SET GLOBAL slave_pos = '0-1-1';
Query OK, 0 rows affected (0.01 sec)

MariaDB [(none)]> CHANGE MASTER TO
  MASTER_HOST='xxxxxxxx',
  MASTER_USER='repl',
  MASTER_PASSWORD='E4E817qPhenCYgfUDG2vusprINYFKZ',
  MASTER_USE_GTID = slave_pos;

Query OK, 0 rows affected (0.01 sec)

MariaDB [(none)]> START SLAVE;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SHOW SLAVE STATUS\G                                                                *************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
...
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
...
                   Using_Gtid: Slave_Pos
                  Gtid_IO_Pos: 0-1-5
...
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
1 row in set (0.00 sec)
```

MASTER 側に INSERT して POSITION がちゃんと進むか確認しておく

### 2.2. RDS for MariaDB とのレプリケーション

手順は [Amazon RDS MariaDB DB インスタンスへの GTID ベースレプリケーションの設定](https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/MariaDB.Procedural.Importing.html#MariaDB.Procedural.Replication.GTID) に書かれているので、まねをすれば良い

```
MariaDB [(none)]> CALL mysql.rds_set_external_master_gtid ('xx.xx.xx.xxx', 3306, 'repl', 'E4E817qPhenCYgfUDG2vusprINYFKZ', '0-1-6', 0);
Query OK, 0 rows affected (0.03 sec)

MariaDB [(none)]> CALL mysql.rds_start_replication;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
...
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
...
        Seconds_Behind_Master: 0
...
                   Using_Gtid: Slave_Pos
                  Gtid_IO_Pos: 0-1-7
...
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
1 row in set (0.00 sec)
```

参考資料: [Replication Will not Start On AWS RDS for MariaDB 10.2 – Mydbops](https://mydbops.wordpress.com/2018/01/18/replication-will-not-start-on-rds-mariadb-10-2/)
