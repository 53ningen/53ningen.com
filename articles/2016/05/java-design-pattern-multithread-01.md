---
title: Java言語で学ぶデザインパターン 〜マルチスレッド編〜 読書メモ (1)
category: programming
date: 2016-05-15 21:17:48
tags: [Java]
pinned: false
---

結城先生のデザパタ本マルチスレッド編がサクッと読めそうだったので読み進めているので、自分用メモ。ほとんど知っている内容ではあったけど、体系的に知識が入っていなかったので、よい確認になる...。

## Java 言語のスレッド

### スレッドの起動方法

スレッドを起動する方法は 2 つある

1. `Thread` クラスのサブクラスのインスタンスを使ってスレッドを起動する
2. `Runnable` インターフェースの実装クラスのインスタンスを使ってスレッドを起動する

```java
class ThreadSubclass extends Thread {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public void run() {
        IntStream.range(0, 10).forEach(i -> logger.info(Integer.toString(i)));
    }

}

class RunnableImpl implements Runnable {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public void run() {
        IntStream.range(0, 10).forEach(i -> logger.info(Integer.toString(i)));
    }

}
```

それぞれ `run()` メソッドを実装している。これらを直接呼び出した場合、呼び出したスレッドで処理が実行される。別のスレッドで実行させたい場合は、`start()` を呼び出す必要がある。以下のテストを実行すると、`run()` の呼び出しはメインスレッドから行なわれているのが観測できる。

```java
@Test
    public void threadSubclassTest() {
        final ThreadSubclass threadSubclass = new ThreadSubclass();
        threadSubclass.run();
        threadSubclass.start();
        try {
            threadSubclass.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void runnableImplTest() {
        final RunnableImpl runnable = new RunnableImpl();
        final Thread thread = new Thread(runnable);
        thread.run();
        thread.start();
        try {
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
```

スレッドの生成には `ThreadFactory` なるものを使うこともできる。これにより `Thread` を `new` せずに済む。

```java
    @Test
    public void runnableImplTestWithThreadFacotory() {
        final ThreadFactory factory = Executors.defaultThreadFactory();
        final Thread thread = factory.newThread(new RunnableImpl());
        thread.run();
        thread.start();
        try {
            thread.join();
        } catch (InterruptedException e) {
            LoggerFactory.getLogger(this.getClass()).error("interrupted", e);
        }
    }
```

### Thread の排他制御

1. `synchronized` メソッドを使う
2. `synchronized` ブロックを使う

あるスレッドから synchronized インスタンスメソッドが呼ばれている間は、
他のスレッドは同じインスタンスの synchronized メソッドを呼び出すことができない。
非 synchronized インスタンスメソッドについては問題なく呼び出すことができる。
ロックはインスタンスごとにされる点に注意。

次の synchronized メソッド と synchronized ブロックを使ったメソッドは等価になります。

```java
class TestClass {

    synchronized void methodWithSynchronized() {
        // do something
    }

    void methodWithSynchronizedBlock() {
        synchronized (this) {
            // do something
        }
    }

}
```

また、次の synchronized クラスメソッドと synchronized ブロックを使ったクラスメソッドは等価になります。

```java
class TestClass {

       static synchronized void staticMethodWithSynchronized() {
           // do something
       }

        static void staticMethodWithSynchronizedBlock() {
            synchronized (TestClass.class) {
                //do something
            }
        }

   }
```

スレッドの排他制御をする仕組みを **モニタ** と呼びます。
また、ロックをとっていることをモニタを所有する、あるいはロックをホールドすると呼ぶこともあります。

### スレッドの協調

各インスタンスはウェイトセットという仮想的な概念を持っています。
あるインスタンスがあるスレッドに `wait` メソッドを呼び出されたとき、インスタンスのウェイトセットにそのスレッドが追加されます。
スレッドは `notify`, `notifyAll`, `interrupt` の呼び出しが発生するか `wait` のタイムアウトが発生するまで停止します。
synchronized 文やブロックの外側で オブジェクトの wait を呼び出すと `IllegalMonitorStateException` が発生がスローされます。

```java
    private final Object obj = new Object();

    private void testMethod() throws Exception {
        final Thread thread = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (final Exception e) {
                e.printStackTrace();
            }
            synchronized (obj) {
                obj.notify(); // obj のウェイトセットに入ってるスレッドを1つだけ起こす
            }
        });
        thread.start();
        synchronized (obj) {
            obj.wait(); // main thread が obj の ウェイトセットに入る
        }
    }
```

スレッドには処理をキャンセルする機能があったり、優先度を設定できたり、スレッドの終了待ちをできたりもする。

## マルチスレッドプログラミングの評価基準

- 安全性(safety): オブジェクトを壊さないこと
- 生存性(liveness): 必要な処理が行われること
- 再利用性(reusability): クラスを再利用できること
- パフォーマンス(performance): 処理を高速・大量に行えること

うち安全性と生存性を守るのは必須
