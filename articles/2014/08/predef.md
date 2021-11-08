---
slug: predef
title: Scalaのクエスチョンマーク3つは「Predef.???」
category: programming
date: 2014-08-11 20:24:44
tags: [Scala]
pinned: false
---

つい数日まえについに Scala でいろいろ書き始めました． コップ本のクラス定義の仕方とかそのあたりを適当に流し読みして， とりあえずいろいろ書いて分かんないところ読もうという方針のもと，コードを書いていくことにしました． わりと順調に進んで，型付きパターンマッチや， 変位指定アノテーションあたりなどちょくちょく分からないところをコップ本とググってでてきたページで解決してきました．

しかしながら，いろいろ調べものして出てきた Scala のコードに def hoge = ???なる記述が...。とりあえずコップ本の索引を見てみるも載っておらず，?は記号なのでググっても引っかからない．「scala クエスチョンマーク」「scala 記号」で検索してもダメで，twitter でぼやいたところ，その正体が Predef.???だということを教えていただきました（ありがとうございました）．

例えば def hoge = ???としておくとコンパイルは通りますが，実行時に NotImplementedError をスローするという挙動をするもののようです．これは Scala2.10 から追加されたもののようで，追加に向けて Forum でいろいろ議論がされていたようです．

すこしでも検索に引っかかりやすくなるようまとめてみました．
正確な話は公式の Document やソースコードを見て頂けると良いかと．

- [ScalaDocument Predef](http://www.scala-lang.org/files/archive/nightly/docs/library/index.html#scala.NotImplementedError)
- [ScalaDocument NotImplementedError](http://www.scala-lang.org/api/current/index.html#scala.Predef$@???:Nothing)

ちっと「???」はググって解決しにくいよなぁ...と，思いました（小並感）．

## 以下最近調べた Scala まわりのことまとめ

### 型付きパターンマッチ

obj が Identifier[_]型のときマッチされ，値を以下の例だと that という名前で扱える．別に that じゃなくても良い．

```scala
  override def equals(obj: Any) = obj match {
    case that: Identifier[_] =>
      value == that.value
    case _ => false
  }
```

全てのオブジェクトに実装されている##メソッドの実態

### `##` は基底クラス(Any)に定義されているハッシュ値の取得メソッド

`override def hashCode: Int = 31 * id.##`

### 変位指定アノテーション：非変・反変・共変

[T]: 非変(nonvariant) => 指定した型変数のみを受け入れる
[-T]: 反変(contravariant) => 指定した型変数のスーパークラスを受け入れる
[+T]: 共変(covariant) => 指定した型変数のサブクラスを受け入れる

```scala
trait Identifier[+T] {

  /**
   * 識別子の値
   */
  def value: T

  override def equals(obj: Any) = obj match {
    case that: Identifier[_] =>
      value == that.value
    case _ => false
  }

  override def hashCode = 31 * value.hashCode()

}
```

この場合，Indentifier トレイトの型変数には，T とそのサブクラスを受け入れることができる．
