---
title: 他クラスに依存しないテストを支える仕組み：スタブ・モック・スパイ
category: programming
date: 2014-10-24 20:31:11
tags: [Java, テスト, JUnit, Mockito]
pinned: true
---

手元にはあったが長らく積んでいた[JUnit 実践入門の 11 章：テストダブルの章](http://amzn.to/2qGEXsK)を読んでまとめを書きました．実際のところ Mockito ってなんだかいままでよく分からない存在だったけど，手をつけてみるとかなりお手軽＆便利なものでした．学習コストもそれほど高くないので，何となく敬遠していたり，テストってどう書けば良いのかよくわかっていない私のような人がいたら是非，Mockito を使ったテストコードを実際に書いてみることをお勧めします．

[amazon template=wishlist&asin=477415377X]

# テスト対象クラスが依存するクラス・モジュール問題

理想的なユニットテストは，依存するすべてのクラスや外部システムを使用したもの

- なぜなら，実際に動くコードはそういう状況で動くのだから
- しかし依存する本物のオブジェクトを常に使用できるとは限らないし，ユニットテストで扱いにくいオブジェクトもある
- このようなときにテストしやすいようにリファクタリングしたり，本物のオブジェクトの代役となるオブジェクトに置き換えてテストを行うという手法が用いられる

# テスタビリティを高めるリファクタリング

- Java の Date の精度はミリ秒であるため次のコードは，テストに成功したり失敗したりする
- 乱数を使ったコードは当然ながらテストが書きにくい
- このようにインスタンス生成のタイミングや環境に依存してしまう部分が含まれるコードのテストは難しい

```java
public class DateDependencyExample {
    Date date = new Date();

    public void doSomething() {
        this.date = new Date();
        // do something...
    }
}

public class DateDependencyExampleTest {
    @Test
    public void doSomethingでdateに現在時刻が設定される() throws Exception {
        DateDependencyExample dateDependency = new DateDependencyExample();
        dateDependency.doSomething();

        // このassertionは実行タイミングによって成功したり失敗したりする
        assertThat(dateDependency.date, is(new Date()));
    }
}
```

インスタンス生成の部分を抽出してファクトリメソッドを作ると，ここを Override して振る舞いを変えることができ，依存度を下げることができる

```
public class DateDependencyExample {
    Date date = newDate();

    public void doSomething() {
        this.date = newDate();
        // do something...
    }
}

Date newDate() {
    return new Date();
}

public class DateDependencyExampleTest {
    @Test
    public void doSomethingでdateに現在時刻が設定される() throws Exception {

        final Date currentDate = new Date();
        DateDependencyExample dateDependency = new DateDependencyExample() {
            @Override
            Date newDate() {
                return current;
            }
        };
        dateDependency.doSomething();

        // このassertionは実行タイミングによって成功したり失敗したりする
        assertThat(dateDependency.date, is(current));
    }
}
```

今回の例に対してはやや過剰な実装とはなるが，振る舞いの複雑なメソッドをオブジェクトに切り出し，委譲を使って差し替え可能にするという方法もある

```java
public class DateFactory {
    Date newDate() {
        return new Date();
    }
}

public class DateDependencyExample {
    DateFactory dateFactory = new DateFactory();
    Date date = new Date();

    public void doSomething() {
        date = dateFacotory.newDate();
        // do something...
    }
}

public class DateDependencyExampleTest {
    @Test
    public void doSomethingを実行するとdateに現在時刻が設定される() throws Exception {
        final Date current = new Date();
        DateDependencyExample dateDependency = new DateDependencyExample();
        // dateインスタンス生成の振る舞いを注入している
        dateDependency.dateFacotry = new Date() {
            @Override
            public Date newDate() {
                return current;
            }
        };
        dateDependency.doSomething();
        assertThat(dateDependency.date, is(sameInstance(current)));
    }
```

# テストダブル：スタブ/モック/スパイ

- テスト対象となるクラスが他クラスに依存していないケースはほとんどない
- 依存しているクラスもまた他のクラスに依存している
- この状態でテストを行うメリットは実行時に近い状態でテストができること
- デメリットはテスト対象以外の問題を原因としてテストが失敗する可能性があること
- このとき依存しているオブジェクトの代役（スタブ・モック）を使うことをテストダブルという

## スタブ

- スタブとは依存するクラスやモジュールとして代用できる仮のクラス・モジュール
- 以下のようなときに用いられる
  - 依存オブジェクトが予想できない振る舞いを持つとき
  - 依存オブジェクトのクラスがまだ存在しないとき
  - 依存オブジェクトの実行コストが高く，簡単に利用できない
  - 依存オブジェクトが実行環境に強く依存している
- 例えば乱数を用いるようなクラスのテストは，依存オブジェクト Random が予想できない振る舞いを持つためスタブを使うと良い
- コード的には次のようなものになる

```java
// RandomNumberGenerator.java
package com.ningen.gomi.testdouble;

public interface RandomNumberGenerator {
    int nextInt();
}

// RandomNumberGeneratorImpl.java
package com.ningen.gomi.testdouble;

import java.util.Random;

public class RandomNumberGeneratorImpl implements RandomNumberGenerator {
    private final Random rand = new Random();

    @Override
    public int nextInt() {
        return rand.nextInt();
    }
}

// RandomNumberGeneratorFixedResultStab.java
package com.ningen.gomi.testdouble;

public class RandomNumbergeneratorFixedResultStub implements RandomNumberGenerator {
    @Override
    public int nextInt() {
        return 1;
    }
}

// Randoms.java
package com.ningen.gomi.testdouble;

public class DateFactory {
    Date newDate() {
        return new Date();
    }
}

public class DateDependencyExample {
    DateFactory dateFactory = new DateFactory();
    Date date = new Date();

    public void doSomething() {
        date = dateFacotory.newDate();
        // do something...
    }
}

public class DateDependencyExampleTest {
    @Test
    public void doSomethingを実行するとdateに現在時刻が設定される() throws Exception {
        final Date current = new Date();
        DateDependencyExample dateDependency = new DateDependencyExample();
        // dateインスタンス生成の振る舞いを注入している
        dateDependency.dateFacotry = new Date() {
            @Override
            public Date newDate() {
                return current;
            }
        };
        dateDependency.doSomething();
        assertThat(dateDependency.date, is(sameInstance(current)));
    }
```

## モック

- スタブと同様にテスト対象が依存するクラスやモジュールの代用として使用されるもの
- スタブはメソッドの返り値を予想可能な値にすることにより、依存クラス・モジュールが正しく利用できているか確かめるもの
- モックはメソッドが正しく呼び出されているかを検証するもの

```java
// RandomNumberGenerator.java
package com.ningen.gomi.testdouble;

public interface RandomNumberGenerator {
    int nextInt();
}

// RandomNumberGeneratorImpl.java
package com.ningen.gomi.testdouble;

import java.util.Random;

public class RandomNumberGeneratorImpl implements RandomNumberGenerator {
    private final Random rand = new Random();

    @Override
    public int nextInt() {
        return rand.nextInt();
    }
}

// RandomNumberGeneratorFixedResultStab.java
package com.ningen.gomi.testdouble;

public class RandomNumbergeneratorFixedResultStub implements RandomNumberGenerator {
    @Override
    public int nextInt() {
        return 1;
    }
}

// Randoms.java
package com.ningen.gomi.testdouble;

public class DateFactory {
    Date newDate() {
        return new Date();
    }
}

public class DateDependencyExample {
    DateFactory dateFactory = new DateFactory();
    Date date = new Date();

    public void doSomething() {
        date = dateFacotory.newDate();
        // do something...
    }
}

public class DateDependencyExampleTest {
    @Test
    public void doSomethingを実行するとdateに現在時刻が設定される() throws Exception {
        final Date current = new Date();
        DateDependencyExample dateDependency = new DateDependencyExample();
        // dateインスタンス生成の振る舞いを注入している
        dateDependency.dateFacotry = new Date() {
            @Override
            public Date newDate() {
                return current;
            }
        };
        dateDependency.doSomething();
        assertThat(dateDependency.date, is(sameInstance(current)));
    }
```

## スパイ

- 基本的にテストはメソッドへの入力に対して出力を検証する
- 従って void 型のメソッドの検証はやりにくい
- そこでロガーに書き込まれた内容を検証に使うスパイという手法がある
- 基本的にはロガーのロギング機構に StringBuffer への append の処理を追加して，検証時に toString して文字列比較するという単純なもの

```java
// SpyLogger.java
package com.ningen.gomi.testdouble;

import java.util.logging.Logger;

public class SpyLogger extends Logger {

    final Logger base;
    final StringBuffer log = new StringBuffer();

    public SpyLogger(Logger base) {
        super(base.getName(), base.getResourceBundleName());
        this.base = base;
    }

    @Override
    public void info(String msg) {
        log.append(msg);
        base.info(msg);
    }

}


// SpyExample.java
package com.ningen.gomi.testdouble;

import java.util.logging.Logger;

public class SpyExample {

    Logger logger = Logger.getLogger(SpyExample.class.getName());

    public void doSomething() {
        logger.info("doSomething");
    }

}

// SpyExampleTest.java
package com.ningen.gomi.testdouble;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class SpyExampleTest {

    @Test
    public void SpyLoggerを利用したテスト() {
        SpyExample sut = new SpyExample();
        SpyLogger spy = new SpyLogger(sut.logger);
        sut.logger = spy;
        sut.doSomething();
        assertThat(spy.log.toString(), is("doSomething"));
    }

}
```

# Mockito でスタブ・モックを作る

- mockito が適当に使える状況にしておく
- Mock.mock(モックを作りたい対象のクラス)でモックが作れる
- `where(モックのインスタンス.メソッド()).thenReturn(期待する返り値)P で振る舞いを持たせられる
- その他，コードを見ればきっと分かる！
- 基本的に mockito の使い方自体は簡単だけれど，そもそもスタブ・モックとは何かを理解できていないところが mockito を使う上での最大の壁になると感じた
- 現に本を読んで自分はちゃんとスタブ・モックがなにかを理解できていなかったので反省した

```java
package com.ningen.gomi.testdouble;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;

public class RandomsMockitoTest {

    @Mock
    private List<String> ops;

    @Mock
    private RandomNumberGenerator gen;

    @Mock
    private RandomNumberGenerator randomNumbergenerator = spy(new RandomNumberGeneratorImpl());

    @InjectMocks
    private Randoms randoms;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }


    @Test
    public void choiceでAを返すMockitoを用いたテスト() throws Exception {

        List<String> options = new ArrayList<String>();
        options.add("a");
        options.add("b");
        Randoms sut = new Randoms();

        RandomNumberGenerator generator = Mockito.mock(RandomNumberGenerator.class);
        when(generator.nextInt()).thenReturn(0);
        sut.randomNumberGenerator = generator;

        assertThat(sut.choice(options), is("a"));
        verify(sut.randomNumberGenerator).nextInt();
    }

    @Test
    public void choiceでAを返すMockitoを用いたテスト2() throws Exception {

        List<String> options = new ArrayList<String>();
        options.add("a");
        options.add("b");
        Randoms sut = new Randoms();

        RandomNumberGenerator generator = spy(new RandomNumberGeneratorImpl());
        when(generator.nextInt()).thenReturn(0);
        sut.randomNumberGenerator = generator;

        assertThat(sut.choice(options), is("a"));
        verify(sut.randomNumberGenerator).nextInt();

    }

    @Test
    public void choiceでAを返すMockitoを用いたテストwithMockアノテーション() throws Exception {

        when(ops.get(0)).thenReturn("a");
        when(ops.get(1)).thenReturn("b");
        when(ops.size()).thenReturn(2);
        when(gen.nextInt()).thenReturn(0);

        Randoms sut = new Randoms();
        sut.randomNumberGenerator = gen;

        assertThat(sut.choice(ops), is("a"));

    }

    @Test
    public void choiceでAを返すMockitoを用いたテストwithInjectMocksアノテーション() throws Exception {

        when(ops.get(0)).thenReturn("a");
        when(ops.get(1)).thenReturn("b");
        when(ops.size()).thenReturn(2);
        when(randomNumbergenerator.nextInt()).thenReturn(0);

        Randoms sut = new Randoms();
        sut.randomNumberGenerator = randomNumbergenerator;

        assertThat(sut.choice(ops), is("a"));

    }

}
```

この本はやっぱり必読感がある...

[amazon template=wishlist&asin=477415377X]
