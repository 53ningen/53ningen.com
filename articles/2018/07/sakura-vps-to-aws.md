---
slug: sakura-vps-to-aws
title: さくらVPSからAWS環境への移行手順メモ
category: programming
date: 2018-07-31 19:56:37
tags: [AWS, さくらVPS]
pinned: false
---

特に必要に迫られたわけではないが、53ningen.com をさくら VPS から AWS 環境へお引越ししてみる。

現状 nginx, MariaDB が稼働する gomi-web 系と zabbix, elasticsearch, kibana, その他諸々をぶん回している gomi-back 系がある。これを ELB + EC2 2 台 + RDS という構成に変更する。

## 構成の変更

- お金もないので、ひとつのサーバーに色々乗っけて遊んでました
- 財布を灰にする代わりにもう少しまともな構成にする

### ウェブサーバ

主に nginx, php-fpm, MariaDB が稼働していたさくら VPS の gomi-web 系統から MariaDB を分離し RDS にお引越し

- 【変更前】 さくら VPS: 2 コア/1GB/SSD30GB （現状余裕がある）
- 【変更後】 t2.nano 1vCPU/0.5GiB/SSD8GB + RDS db.t2.micro 1vCPU/1GiB

### バックエンド系

zabbix, elasticsearch, kibana, influxdb, graphana など色々てんこ盛りで動いてたバックエンド系 + 実験用サーバだが、カオスだったり、環境をぶっ壊しがちだったので、定常的に動かすものとそうでないものを分離しておく

- 【変更前】 さくら VPS: 3 コア/2GB/SSD50GB
- 【変更後】 t2.medium 2vCPU/2GiB/SSD10GB

ウェブサーバの構成変更点は以下のようなもの

#### 前段への ALB 設定によるアプリケーション構成変更

nginx で直接 SSL を解いていたが、前段の ALB によって SSL オフロードする

- nginx 443 ssl で受けているものを全て 8443 で受けるように変更
- nginx の conf から証明書まわりの記述を削除
- Wordpress が http に対してのリクエストに対して、依存リソースを http で返さないよう wp-config.php に以下を追加

```
if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
   $_SERVER['HTTPS']='on';
}
```

## 作業手順

### 1. ウェブサーバ用の EC2 インスタンス + ALB を作成し、証明書などをセットしておく

- VPC, Subnet, Security Group, NACLs, Routing Table などを適切に切って、EC2 インスタンスをポコっとたてる
- Target Group, ALB を作成して HTTPS リスナーに ACM で作成した SSL 証明書を設定しておく
  - いままでは nginx + let's encrypt でやっていたので、 nginx conf 修正、 Wordpress の wp-config.php 修正が必要

### 2. playbook を修正し、EC2 インスタンスに流す

- なんやかんやでむかし使えていたはずの playbook が途中でとまったりすることはよくある
- まずは使用する AMI に対して、すんなり ansible を流し終えられるように修正をいれていく
  - 案の定 java のインストールにコケたり
- inventory にホスト追加したり
- あとは nginx の設定変更
  - SSL を nginx で解いていたが、これからは ALB で解くため、443 ssl で linsten していたものを 8443 に変えたり、証明書に関する記述を削除したりする

```diff
- listen 443 ssl;
+ listen 8443;
```

### 3. Wordpress のデプロイ

- rsync で旧サーバーからごそっと持ってくるだけで基本的に OK （な作りにしてある）
  - 静的コンテンツは S3 plugin を使って、もともと S3 に置いてあったので、ほぼ php コードの sync

```
rsync -av ./wordpress/ remote_ip:/path/to/wordpress/ --dry-run
rsync -av ./wordpress/ remote_ip:/path/to/wordpress/
```

- wp-config.php から DB の向き先だけ、インターネット越しにさくら VPS の MariaDB を見に行くように修正
- あわせてさくら VPS 側の FW を該当 EIP tcp 3306 への通信を accept するように修正

```
sudo firewall-cmd --zone=external --add-rich-rule='rule family="ipv4" source address="xx.xx.xx.xx/32" service name="mysql" accept'
sudo firewall-cmd --zone=external --add-rich-rule='rule family="ipv4" source address="xx.xx.xx.xx/32" service name="mysql" accept' --permanent
```

- MariaDB に該当 EIP から接続するユーザーをいい感じに作る

```
$ strings /dev/urandom | grep -o '[[:alnum:]]' | head -n 30 | tr -d '\n'; echo;
...........
$ mysql
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 23627
Server version: 10.2.15-MariaDB-log MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE USER 'hoge'@"xx.xx.xx.xx" IDENTIFIED BY '...........';

MariaDB [(none)]> GRANT ......... ON ........ TO 'hoge'@"xx.xx.xx.xx";
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SHOW GRANTS for 'hoge'@"xx.xx.xx.xx";
+-----------------------------------------------------------------------------------------------------------------+
| Grants for 'hoge'@"xx.xx.xx.xx"                                                                                   |
+-----------------------------------------------------------------------------------------------------------------+
| GRANT USAGE ON ....... TO ..... IDENTIFIED BY PASSWORD ........................... |
+-----------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

### 4. ひとまず動作確認

- ALB の FQDN から動作確認

  - HTTP 80 OK (304 redirect to https)
  - HTTPS 443 あれ、504 Gateway Timeout だ... と思ったら vpc 内からの 8443 をあけてなかった

- ウェブサーバの移行残タスクは以下
  - データベース/そのほかバックエンド系の移行
  - DNS レコードの更新（向き先を ELB に変更）

### 5. データベース移行

続いてデータベースの RDS 移行

- ひとまず旧 DB を master、 RDS MariaDB を slave とする構成を作る
- ウェブサーバ EC2 移行時に RDS MariaDB を master 昇格させる

[AWS のドキュメント](https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/MariaDB.Procedural.Importing.html#MariaDB.Procedural.Replication.GTID)によると、MariaDB 10.0.24 以降を利用している場合で RDS MariaDB をレプリケーションスレーブにしたい場合、GTID ベースレプリケーションの設定が必要となる。

（もし既存のレプリケーションがなければ） DB の conf を修正し、restart

```
[mysqld]
server-id={{ mysql_server_id }}

{% if mysql_server_state == 'master' %}
log-bin=mysql-bin
expire_logs_days=3
{% else %}
read_only
{% endif %}
```

（もし既存のレプリケーションがなければ）現行系 DB にレプリケーション用ユーザーを作成

```
# create replication user
$ strings /dev/urandom | grep -o '[[:alnum:]]' | head -n 30 | tr -d '\n'; echo;
...............
$ mysql
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 23627
Server version: 10.2.15-MariaDB-log MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE USER ......... IDENTIFIED BY ...............;
Query OK, 0 rows affected (0.01 sec)

MariaDB [(none)]> SELECT user, host FROM mysql.user;
+------------------+-----------------+
| user             | host            |
+------------------+-----------------+
.........
+------------------+-----------------+
10 rows in set (0.00 sec)

MariaDB [(none)]> GRANT CLIENT, REPLICATION SLAVE ON *.* TO ........... IDENTIFIED BY '........';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SHOW GRANTS for '.....'@'........';
+-----------------------------------------------------------------------------------------------------------------+
| Grants for ..................                                                                                   |
+-----------------------------------------------------------------------------------------------------------------+
........
+-----------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

現行 DB をダンプし、移行先 DB にインポート

```
MariaDB [(none)]> FLUSH TABLES WITH READ LOCK;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SET GLOBAL read_only = ON;
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> SELECT @@gtid_current_pos;
+--------------------+
| @@gtid_current_pos |
+--------------------+
| 0-1001-20104       |
+--------------------+
1 row in set (0.00 sec)

MariaDB [(none)]> exit
Bye

$ mysqldump \
>     --databases hogehoge \
>     --single-transaction \
>     --compress \
>     --order-by-primary  | mysql \
>         --host=dbname.********.ap-northeast-1.rds.amazonaws.com \
>         --port=**** \
>         -u ***** \
>         -p
Enter password:
```

slave の設定を行いレプリケーションを開始する

```
MariaDB [(none)]> CALL mysql.rds_set_external_master_gtid ('*************', *****, 'repl', '***************', '0-1001-20104', 0);
Query OK, 0 rows affected (0.03 sec)

MariaDB [(none)]> CALL mysql.rds_start_replication;
Query OK, 0 rows affected (0.01 sec)

MariaDB [(none)]> UPDATE mysql.rds_replication_status SET action='start slave';
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0

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
...
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
1 row in set (0.01 sec)
```

### 6. 動作確認/DNS 切り替え

新系を数日寝かせて動作確認後、DNS 変更で新系の ELB を向くように Route 53 を設定する

### 7. DB 切り替え

RDS で稼働する DB を新 master に切り替える
