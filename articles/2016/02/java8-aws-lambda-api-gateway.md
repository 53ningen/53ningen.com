---
slug: java8-aws-lambda-api-gateway
title: Java8 + AWS Lambda + API Gateway で遊ぶ
category: programming
date: 2016-02-28 01:40:12
tags: [Java, AWS]
pinned: false
---

この記事では `Java8` で書いたメソッドを `AWS Lambda` に実行させ、その実行結果を `API Gateway` を用いて外から取得できるような簡単なアプリケーションを作成していきます。

めっちゃ雑にいうと、Java で String を返すメソッドを書いて、その文字列を返す API を作るというようなことをやります。

この際、String を返す Java のコードを実行するのが、AWS Lambda の役割で、その実行結果を取得できるエンドポイントを提供するのが API Gateway の役割になります。

また、ちょっと手を加えるだけで簡単に JSON を返す API を作ることもできるので、使い方次第では遊べるツールになるのではないでしょうか？

# 固定した文字列を返す API を作成する

まず、あるエンドポイントを叩くと、ただ文字列が帰ってくるだけの API を作成しながら、`AWS Lambda` と `API Gateway` の使い方を確認していきます。

## Gradle プロジェクト作成〜実行対象のメソッド作成

gradle で適当にプロジェクトを作成してください。手元で実際に使った `build.gradle` ファイルは以下のような具合です。

```groovy
group 'com.github.gochiusa'

version '1.0-SNAPSHOT'
apply plugin: 'java'

sourceCompatibility = 1.8

repositories {
    mavenCentral()
}

dependencies {
    testCompile group: 'junit', name: 'junit', version: '4.11'
    compile (
        'com.amazonaws:aws-lambda-java-core:1.1.0',
        'com.amazonaws:aws-lambda-java-events:1.1.0'
    )
}

task buildZip(type: Zip) {
    from compileJava
    from processResources
    into('lib') {
        from configurations.runtime
    }
}
build.dependsOn buildZip
```

続いて、`AWS Lambda` で実行する対象のメソッドを作成します。めっちゃ簡単なので「馬鹿にしてんのか！」って思うかもしれませんが、まあチュートリアルですので...。

```java
package com.github.gochiusa.lambda.routes.api.v1.text;

import com.amazonaws.services.lambda.runtime.Context;

public class Words {

    public String get(final Context context) {
        return "ご注文はうさぎですか?";
    }

}
```

あとはプロジェクトルートから `./gradlew builde` を叩いて `build/libs` 以下にできた `jar` を `AWS Lambda` にアップロードするだけ！めっちゃ簡単じゃないですか？

## AWS Lambda への jar のアップロードと実行

以下のように進めてください

1. AWS のマネジメントコンソールから Lambda を探してクリックします 2. `create a lambda function` ボタンをクリック 3. 適当なテンプレート一覧が出てくるが、スルーして右下の `skip` をクリック 4. `Name` を適当に埋め、`Runtime` で `java8` を選択 5. zip をアップロードできるようになるので、さっき作った jar を選択する 6. Handler のところにはさっき作ったメソッドを指定。上の例だと `com.github.gochiusa.lambda.routes.api.v1.text.Words::get` という感じで `{package}.{class}::{method}` という感じでしていすれば良い。残りの項目も適当に埋める。

適当にすすめると、左上に `test` というボタンが出てくるので押せば、晴れて AWS Lambda 上 で、自分が書いた Java8 コードが実行されてくれる。だいぶ説明を端折っているので詳しくは [AWS のドキュメント](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/getting-started.html)を見ればいいと思います。

## API Gateway でエンドポイントを作る

マネジメントコンソールから API Gateway へ行き、`create API` をクリック

![](http://53ningen.com/wp-content/uploads/2016/02/22280327e9a853452fbb41abf81c92eb.png)

API の名前を適当につけ先に進む

![](http://53ningen.com/wp-content/uploads/2016/02/6c4394301426c8a69dfe3caf64182ece.png)

`create Method` をクリックする

![](http://53ningen.com/wp-content/uploads/2016/02/e75abcbdb1f73eaa3d90da2a90c1d5d8.png)

以下のような感じで適当に各フィールドを埋める。ここで指定する lamda resion はさっき作った lamda function が置いてあるリージョンを指定。lambda function は作ったやつの名前を入れる。

![](http://53ningen.com/wp-content/uploads/2016/02/230307ab6255ce752bc48aa43c8ff51d.png)

以上がおわったら `Save` を押して、Deploy API のほうに進めば、`"ご注文はうさぎですか?"` とだけ返してくれる最高な API が出来上がる。

# JSON を返す API を作る

JSON を返す lambda function も簡単につくれます。AWS Lambda は、`POJO` を返す Lamda function を実行すると JSON のレスポンスに変換してくれるみたいでめっちゃ楽しそうです。具体的にはこんな API がつくれます。

```shell
% curl https://2ruhxlj2xj.execute-api.ap-northeast-1.amazonaws.com/prod/api/v1/words
{"word":"はぁ〜もふもふ気持ちいい〜 いけないよだれが・・・"}%

% curl https://2ruhxlj2xj.execute-api.ap-northeast-1.amazonaws.com/prod/api/v1/words
{"word":"喫茶店... ラビットハウス..."}%
```

まずは、上記の感じ構造を持った `POJO` を定義しましょう。

```java
public static class WordObject {

    private String word;

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

}
```

んであとは、関数の戻り型、戻り値をこいつにしてやれば OK です。

```java
public class Words {

    private static final Random random = new Random();
    public static final List<String> words = Arrays.asList(
            "喫茶店... ラビットハウス...",
            "この前お客さんにココアちゃんはシスター・コンプレックスだねって言われちゃった",
            "リゼちゃん聞いてー私シスター・コンプレックスなんだって",
            "今回の新作もすごいねー まるで本物の戦場だよ",
            "うっさぎ〜 うっさぎ〜♪",
            "ウサギがいない!?",
            "コーヒー3杯頼んだから3回触る権利を手に入れたよ!",
            "この上品な香り！これがブルーマウンテンかー",
            "この酸味・・・キリマンジャロだね",
            "安心する味！これインスタントの・・・",
            "はぁ〜もふもふ気持ちいい〜 いけないよだれが・・・",
            "なんかこの子にダンディな声で拒絶されたんだけど"
    );

    public WordObject get(final Context context) {
        final WordObject obj = new WordObject();
        obj.setWord(words.get(random.nextInt(words.size())));
        return obj;
    }

}
```

ソースコードは[ここ](https://github.com/gochiusa/lambda)にまとめて置いてあるのでまあ適当に見ていただければ...。

# おわりに

AWS Lambda で Java のコード動かしている記事があんまりなかったので書いたが、だいぶ雑なので迷ったらドキュメントか、他の優しい人が書いた記事を読むと良いと思います。AWS Lambda と API Gateway、どちらも素晴らしいサービスですね。どんどん活用していきたい...。

# 謝辞など...

実は[Wantedly さんでやっていた Serverless Framework の勉強会](http://wantedly.connpass.com/event/25226/)に参加させていただき、この周辺のものに触れることができました。Wantedly さん、ありがとうございます...。[この記事](http://qiita.com/susieyy/items/1c2af0ef7b88b742c37a)の内容に近いもののハンズオンでしたので、AWS Lambda や API Gateway に初めて触る方は、まずそちらを試して見ると良いと思います。
