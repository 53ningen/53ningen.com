---
title: InnoDB 初回起動時の動き
category: programming
date: 2019-05-25 04:31:37
tags: [mysql, InnoDB]
pinned: false
---

InnoDB の基本的な動きと各種関連ファイルに絡む挙動を実験+ドキュメントを確認しつつ理解していく記録

- おしながき
  - 0. 実験環境
  - 1. InnoDB 初回起動時の動き
  - 2. ib_logfile0, ib_logfile1 のローテーション
  - 3. autoextend のふるまい

### 実験環境

- Amazon Linux (ami-92df37ed)

```
$ cat /etc/os-release
NAME="Amazon Linux AMI"
VERSION="2018.03"
ID="amzn"
ID_LIKE="rhel fedora"
VERSION_ID="2018.03"
PRETTY_NAME="Amazon Linux AMI 2018.03"
ANSI_COLOR="0;33"
CPE_NAME="cpe:/o:amazon:linux:2018.03:ga"
HOME_URL="http://aws.amazon.com/amazon-linux-ami/"
```

- MySQL 5.6.40

```
$ sudo yum update -y
...
$ sudo yum -y install http://dev.mysql.com/get/mysql-community-release-el6-5.noarch.rpm
...
$ sudo yum -y install mysql-community-server
...
$ sudo chkconfig mysqld off
$ mysqld --version
mysqld  Ver 5.6.40 for Linux on x86_64 (MySQL Community Server (GPL))
```

- 初期状態の my.conf
  - datadir は `/var/lib/mysql`
  - symbolic-links は `0`

```
$ cat /etc/my.cnf
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock

symbolic-links=0

sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES

[mysqld_safe]
log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```

## InnoDB 初回起動時の動き

- インストール直後の `/var/lib/mysql` の中身は空

```
$ sudo ls -la /var/lib/mysql
total 4
drwxr-x--x.  2 mysql mysql    6 Jun 27 12:15 .
drwxr-xr-x. 30 root  root  4096 Jun 27 12:10 ..
```

- `sudo systemctl start mysqld` で起動させると様々なものが作成される
- ログファイルを覗いてみる

```
$ sudo service mysqld start
Initializing MySQL database:  2018-06-27 13:07:03 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
2018-06-27 13:07:03 0 [Note] Ignoring --secure-file-priv value as server is running with --bootstrap.
2018-06-27 13:07:03 0 [Note] /usr/sbin/mysqld (mysqld 5.6.40) starting as process 2712 ...
(続く)
```

mysqld プロセスがスタートしている

```
2018-06-27 13:07:03 2712 [Note] InnoDB: Using atomics to ref count buffer pool pages
2018-06-27 13:07:03 2712 [Note] InnoDB: The InnoDB memory heap is disabled
2018-06-27 13:07:03 2712 [Note] InnoDB: Mutexes and rw_locks use GCC atomic builtins
2018-06-27 13:07:03 2712 [Note] InnoDB: Memory barrier is not used
2018-06-27 13:07:03 2712 [Note] InnoDB: Compressed tables use zlib 1.2.3
2018-06-27 13:07:03 2712 [Note] InnoDB: Using Linux native AIO
2018-06-27 13:07:03 2712 [Note] InnoDB: Using CPU crc32 instructions
(続く)
```

色々つらつらと確認されていく

```
2018-06-27 13:07:03 2712 [Note] InnoDB: Initializing buffer pool, size = 128.0M
2018-06-27 13:07:03 2712 [Note] InnoDB: Completed initialization of buffer pool
(続く)
```

- バッファプールの初期化が走っている
- MySQL 5.6 での innodb_buffer_pool_size の[デフォルト値](https://dev.mysql.com/doc/refman/5.6/ja/innodb-parameters.html#sysvar_innodb_buffer_pool_size)は 128 MB

```
2018-06-27 13:07:03 2712 [Note] InnoDB: The first specified data file ./ibdata1 did not exist: a new database to be created!
2018-06-27 13:07:03 2712 [Note] InnoDB: Setting file ./ibdata1 size to 12 MB
2018-06-27 13:07:03 2712 [Note] InnoDB: Database physically writes the file full: wait...
```

- データファイル ibdata1 が存在しないので作成される様子が伺える
- MySQL 5.6 での innodb_data_file_path の[デフォルト](https://dev.mysql.com/doc/refman/5.6/ja/innodb-parameters.html#sysvar_innodb_data_file_path)は以下のとおり
  - MySQL 5.6.7+: ibdata1:12M:autoextend
  - MySQL 5.6.6-: ibdata1:10M:autoextend

```
2018-06-27 13:07:03 2712 [Note] InnoDB: Setting log file ./ib_logfile101 size to 48 MB
2018-06-27 13:07:03 2712 [Note] InnoDB: Setting log file ./ib_logfile1 size to 48 MB
2018-06-27 13:07:04 2712 [Note] InnoDB: Renaming log file ./ib_logfile101 to ./ib_logfile0
2018-06-27 13:07:04 2712 [Warning] InnoDB: New log files created, LSN=45781
```

- 続いてログファイルが作成されている
- MySQL 5.6 での innodb_log_file_size の[デフォルト](https://dev.mysql.com/doc/refman/5.6/ja/innodb-parameters.html#sysvar_innodb_log_file_size) は 48 MB

```
2018-06-27 13:07:04 2712 [Note] InnoDB: Doublewrite buffer not found: creating new
2018-06-27 13:07:04 2712 [Note] InnoDB: Doublewrite buffer created
2018-06-27 13:07:04 2712 [Note] InnoDB: 128 rollback segment(s) are active.
```

- お次はダブルライトバッファの作成

```
2018-06-27 13:07:04 2712 [Warning] InnoDB: Creating foreign key constraint system tables.
2018-06-27 13:07:04 2712 [Note] InnoDB: Foreign key constraint system tables created
2018-06-27 13:07:04 2712 [Note] InnoDB: Creating tablespace and datafile system tables.
2018-06-27 13:07:04 2712 [Note] InnoDB: Tablespace and datafile system tables created.
2018-06-27 13:07:04 2712 [Note] InnoDB: Waiting for purge to start
2018-06-27 13:07:04 2712 [Note] InnoDB: 5.6.40 started; log sequence number 0
2018-06-27 13:07:04 2712 [Note] Binlog end
2018-06-27 13:07:04 2712 [Note] InnoDB: FTS optimize thread exiting.
2018-06-27 13:07:04 2712 [Note] InnoDB: Starting shutdown...
2018-06-27 13:07:06 2712 [Note] InnoDB: Shutdown completed; log sequence number 1625977
2018-06-27 13:07:06 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
2018-06-27 13:07:06 0 [Note] Ignoring --secure-file-priv value as server is running with --bootstrap.
2018-06-27 13:07:06 0 [Note] /usr/sbin/mysqld (mysqld 5.6.40) starting as process 2734 ...
2018-06-27 13:07:06 2734 [Note] InnoDB: Using atomics to ref count buffer pool pages
2018-06-27 13:07:06 2734 [Note] InnoDB: The InnoDB memory heap is disabled
2018-06-27 13:07:06 2734 [Note] InnoDB: Mutexes and rw_locks use GCC atomic builtins
2018-06-27 13:07:06 2734 [Note] InnoDB: Memory barrier is not used
2018-06-27 13:07:06 2734 [Note] InnoDB: Compressed tables use zlib 1.2.3
2018-06-27 13:07:06 2734 [Note] InnoDB: Using Linux native AIO
2018-06-27 13:07:06 2734 [Note] InnoDB: Using CPU crc32 instructions
2018-06-27 13:07:06 2734 [Note] InnoDB: Initializing buffer pool, size = 128.0M
2018-06-27 13:07:06 2734 [Note] InnoDB: Completed initialization of buffer pool
2018-06-27 13:07:06 2734 [Note] InnoDB: Highest supported file format is Barracuda.
2018-06-27 13:07:06 2734 [Note] InnoDB: 128 rollback segment(s) are active.
2018-06-27 13:07:06 2734 [Note] InnoDB: Waiting for purge to start
2018-06-27 13:07:06 2734 [Note] InnoDB: 5.6.40 started; log sequence number 1625977
2018-06-27 13:07:06 2734 [Note] Binlog end
2018-06-27 13:07:06 2734 [Note] InnoDB: FTS optimize thread exiting.
2018-06-27 13:07:06 2734 [Note] InnoDB: Starting shutdown...
2018-06-27 13:07:07 2734 [Note] InnoDB: Shutdown completed; log sequence number 1625987


(中略)

Starting mysqld:                                           [  OK  ]
```

## データファイルサイズ

### データファイルとは

[MySQL の公式ドキュメント](https://dev.mysql.com/doc/refman/5.6/ja/glossary.html#glos_data_files)には以下のように記載されている

> 物理的に InnoDB テーブルおよびインデックスデータを含むファイル。システムテーブルスペース (データディクショナリと同様に複数の InnoDB テーブルを保持できる) の場合のように、データファイルとテーブルとの間に 1 対多関係が存在することがあります。file-per-table 設定が有効で、新しく作成する各テーブルが個別のテーブルスペースに格納されるときのように、データファイルとテーブルとの間に 1 対 1 関係が存在することもあります。
