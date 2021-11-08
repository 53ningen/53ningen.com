---
slug: single-threaded-execution
title: Single Threaded Executionパターン
category: programming
date: 2016-05-15 22:29:55
tags: [Java]
pinned: false
---

結城先生のデザパタ本マルチスレッド編　第1章のまとめ

## 問題

複数のスレッドがインスタンスを共有している状態で、
それぞれのスレッドがインスタンスの状態を勝手に変更すると、インスタンスの安全性が失われます。

## 解決方法

そこで、そのままではインスタンスが不定な状態に陥ってしまう範囲を定めます。
これをクリティカルセクションと呼びます。
このクリティカルセクションを `synchronized` を用いて1つのスレッドだけが実行できるようにガードします。
このようなパターンを **Single Threaded Execution** パターンと呼びます。

## 関連するパターン

* インスタンスの状態が変化しないときには **Immutable** パターンを使うことにより、スループットを向上させることができる
* インスタンスの状態を参照するスレッドと変更するスレッドが分かれている場合は **Read-Write Lock** パターンを使うことにより、スループットを向上させることができる

## 例

以下のようなカウンターがあったとします

```java
class Counter {

    private Integer count;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    Counter(final Integer count) {
        this.count = count;
    }

    public void increment() {
        count++;
        logger.info("count: {}", count);
    }

}
```

これを次のように複数のスレッドから呼び出すとおかしなことが起こります

```java
    private static final Counter counter = new Counter(0);

    public static void main() throws Exception {
        final Runnable runnable = () -> {
            IntStream.range(0, 100).forEach(i -> counter.increment());
        };
        final Thread thread1 = new Thread(runnable);
        final Thread thread2 = new Thread(runnable);
        final Thread thread3 = new Thread(runnable);
        thread1.start();
        thread2.start();
        thread3.start();

        thread1.join();
        thread2.join();
        thread3.join();
    }
```

実行すると同じ値がログ出力されたり、
300回 `increment` が呼び出されているはずなのに、最後のログ出力が `300` になっていなかったりするはずです。
`increment` はインスタンス内部の状態を変化させるメソッドであり、複数のスレッドから呼び出すと予期せぬ挙動をとります。
この部分をクリティカルセクションとして保護してあげれば良いでしょう。単に `synchronized` をつければよいだけです。

```java
    public synchronized void increment() {
        count++;
        logger.info("count: {}", count);
    }
```

パフォーマンスのために、一般にクリティカルセクションは小さく保つほうが良いでしょう。

## 適用可能性 

* 複数のスレッドからクラスへのアクセスが行われるとき
  * シングルスレッドで実行するプログラムにはこのような対応は必要ない。
* クラスが状態変化する可能性を持っているとき
* 安全性を保つ必要があるとき

## 余談
### long と double はアトミックに扱われない

Javaのprimitive型の参照や代入は基本的にアトミックです。
しかし、`long` と `double` に関してはアトミックではありません。

例えば、同じ `long` フィールドに対して、異なる2つのスレッドから同時に `5678`, `1234` という形で代入をおこなったとします。
するとこのフィールドがどのような値をとるか保証されません。この場合は `synchronized` を使うか `volatile` キーワードを使うという手があります。

まとめると

* 基本型・参照型の参照・代入はアトミック
* `long`, `double` に関しては例外
* `long`, `double` をスレッド間で共有する場合は `synchronized` か `volatile` を使う

### 計数セマフォ

`synchronized` を使うと、ある領域を1つのスレッドのみが実行できるように制限できますが、
n個のスレッドのみが実行できるようにしたいなどという場合には計数セマフォというものが用意されている。

使い方は簡単で次のような感じ

```java
class BoundedResource {

    private final Semaphore semaphore;

    BoundedResource(int permits) {
        this.semaphore = new Semaphore(permits);
    }

    void use() throws InterruptedException {
        semaphore.acquire();
        try {
            // do something
        } finally {
            semaphore.release();
        }
    }

}
```
