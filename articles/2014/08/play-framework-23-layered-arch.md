---
title: play framework 2.3でレイヤードアーキテクチャを強制する
category: programming
date: 2014-08-03 16:15:22
tags: [Scala, Play]
pinned: false
---

[記事「Play2.1 で sbt のマルチプロジェクトビルド機能を利用してレイヤードアーキテクチャを強制する方法を」](http://sifue.hatenablog.com/entry/2014/04/29/120212)参考に， play2.3 での Build.scala の記述をマイグレーションガイドを見ながら試してみました．

[GitHub:53ningen/LayeredArchitectureInPlay2.3](https://github.com/53ningen/LayeredArchitectureInPlay2.3)

### 今回ためしてみたこと

以下のようなディレクトリ構造を持たせ，application/domain/infrastructure という３層のレイヤー構造でアプリケーションを構築します． このとき application からは domain と infrastructure, domain からは infrastructure しか参照出来ないようにプロジェクトの設定をします． 当然 infrastructure から上位層にはアクセスできず，IDE の補完もでない状態になります．

![](https://static.53ningen.com/wp-content/uploads/2018/02/17161716/Structure.png)

### build.sbt

以下のように書けばお k． 一旦ビルドすると modules 以下の layeredApplication, layeredDomain, layeredInfrastructure が勝手に生成されビルドが失敗するので， 出来た各サブモジュールのなかにまた build.sbt を作る．

```
import play.PlayScala

name := """Layered"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)
  .aggregate(layeredApplication, layeredDomain, layeredInfrastructure)
  .dependsOn(layeredApplication, layeredDomain, layeredInfrastructure)

lazy val layeredApplication = (project in file("modules/layered-application"))
  .enablePlugins(PlayScala)
  .dependsOn(layeredDomain, layeredInfrastructure)

lazy val layeredDomain = (project in file("modules/layered-domain"))
  .enablePlugins(PlayScala)
  .dependsOn(layeredInfrastructure)

lazy val layeredInfrastructure = (project in file("modules/layered-infrastructure"))
  .enablePlugins(PlayScala)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws
)
```
