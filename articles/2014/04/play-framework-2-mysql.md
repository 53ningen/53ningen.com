---
title: Play Framework 2でMySQLを利用する
category: programming
date: 2014-04-29 15:06:56
tags: [Scala, Play]
pinned: false
---

Java + Play framework 2 + JDBC + MySQL でアプリケーションを書くためには、conf/application.conf と build.sbt に手を加える必要があるようです。次の２ステップの手順をメモしておきます。

### conf/application.conf の変更

次のように各項目を変更します。

```
# Database configuration
# ~~~~~
# You can declare as many datasources as you want.
# By convention, the default datasource is named `default`
#
db.default.driver=com.mysql.jdbc.Driver
db.default.url="jdbc:mysql://[ADDRESS]:[PORT]/[DB NAME]"
db.default.user=[USER NAME]
db.default.password="[PASSWORD]"
ebean.default="models.*"
```

### build.sbt の変更

JDBC ドライバを組み込むために、Scala のビルドツール：sbt(simple build tool)の設定ファイル build.sbt を書き換えます。

```
libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache,
  "mysql" % "mysql-connector-java" % "5.1.26"
)

play.Project.playJavaSettings
```


