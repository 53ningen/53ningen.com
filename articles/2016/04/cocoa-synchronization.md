---
slug: cocoa-synchronization
title: Cocoaにおける同期
category: programming
date: 2016-04-25 01:44:59
tags: [Swift, Cocoa]
pinned: false
---

ひとつのアプリケーションに複数のスレッドがあると、同じリソースに対する複数スレッドから変更が意図せず干渉する場合がある。基本的かつ有効な方針は、共有リソースを減らし、スレッド間のやり取りを最小化することだ。

不変オブジェクトはスレッドセーフであるので、スレッド間で安全に受け渡しすることができる。また、そもそもあるオブジェクトが単一のスレッドからしか利用されない場合は、当たり前ではあるがなにも問題はない。Foudation の基本的なクラスはだいたいスレッドセーフになっているが、そうでないものもあるので注意が必要。

## 同期ツール

しかし、完全に干渉のない設計が常にできるわけではないのでその場合には同期ツールを使う。同期ツールには以下のようなものがある。

- **アトミック操作**: 単純なデータ型を操作するだけの同期、スレッドをブロックしない点が特徴
- **メモリバリア**: 確実に正しい順序でメモリ操作を実行させる
- **ロック**: クリティカルセクションの保護ができる
- **条件変数**: 特定の条件に該当する場合にスレッド同士シグナルを送り合う

### パフォーマンス

- mutex: 0.2 μsec
- compare and swap: 0.05 μsec

### デッドロックおよびライブロックへの配慮

単一のスレッドで複数のロックを同時に取得しようとする場合は、常にデッドロックが発生する可能性がある。できるだけそういう処理を避ける。

## アトミック操作

ハードウェア命令とメモリバリアにより、特定の操作を必ず完了してから、その操作の影響を受けるメモリへのアクセスが再開されるような仕組みになっている。

対応している演算は以下のとおり

- **Add**: 加算
- **Increment**: +1
- **Decrement**: -1
- **論理 OR**: OR
- **論理 AND**: AND
- **論理 XOR**: XOR
- **compare and swap**:
  - 古い値と変数を比較して等しい場合に、新しい値を代入する
  - 比較と代入をアトミックに行う
- **test and set**:
  - 変数ないのビットをテストし、このビットを 1 にして、元のビットの値をブール値として返す
- **test and clear**:
  - 指定された変数内のビットをテストし、このビットを 0 にして、元のビットの値をブール値として返す

```
var value: Int32 = 0
OSAtomicTestAndSet(0, &value)
value // value is now 128.

value = 0
OSAtomicTestAndSet(7, &value)
value // value is now 1.

value = 0
OSAtomicTestAndSet(15, &value)
value // value is now 256.

OSAtomicCompareAndSwap32(256, 512, &value)
value // value is now 512.

OSAtomicCompareAndSwap32(256, 1024, &value)
value // value is still 512.
```

## ロック

いろいろなロック

- **ミューテックス**: リソースを囲む保護バリアとして機能する相互排他的なロック。一度に 1 つのスレッドだけにアクセスを許可するセマフォの一種。
- **再帰ロック**: ミューテックスロックの亜種。ロックを取得した単一のスレッドで、そのロックを解放する前に複数回ロックを取得できる。同じ回数アンロックをかけるとロックを解除できる。
- **読み取り/書き込みブロック**: 共有排他ロックのこと。規模の大きな操作で利用することがおおい。データの読み取りを頻繁に行いながら、部分修正するような場合にパフォーマンスが良い。POSIX スレッドを用いる。
- **分散ロック**: プロセスレベルの相互に排他的なアクセスを実装できる
- **スピンロック**: 条件が真になるまでロックの条件を繰り返しポーリングする。粗相されるロック待機時間が短いマルチプロセッサシステムで用いられる。カーネルプログラミングにより実装する。

### POSIX ミューテックスロック

どのアプリケーションからも利用できる。

```
var mutex = pthread_mutex_t()

func initialize() {
    pthread_mutex_init(&mutex, nil)
}

func destroy() {
    pthread_mutex_destroy(&mutex)
}


func lockingFunction() {
    pthread_mutex_lock(&mutex)
    defer { pthread_mutex_unlock(&mutex)}
    //
    //  ロックを利用できる
    //
}
```

### NSLock

```
var lock = NSLock()

func lockingFunction() {
    lock.lock()
    defer { lock.unlock() }
    //
    // ロックを利用できる
    //
}
```

`tryLock() -> Bool` とか `lockBeforeDate` など便利なやつもいる。

### NSRecrsiveLock

同一スレッドによる複数回ロック取得が可能なロック。ロック数をカウントしているので、対応するアンロックがすべて走ってようやくロックが解除される。使い方は `NSLock` と同じ。再帰呼び出しが発生する場合はこれを使うべし。ただ再帰呼び出しが発生しないように実装できるならばその限りでない。

### NSConditionLock

`NSConditionLock` は特定の値を使用してロックおよびロック解除できるミューテックスロックを定義する。

```
let condLock = NSConditionLock(condition: 0)

while true {
    condLock.lock()
    condLock.unlockWithCondition(1)
    //
    // ロックを利用できる
    //
}
```

## 条件変数の利用

条件変数は、必要な順序に合わせて操作を進めるために使用出来るロック。ある条件で待機しているスレッドはその条件のシグナルが別スレッドから明示的に送られるまでブロックされたままになる。

### NSCondition の利用

```
let cond = NSCondition()

dispatch_async(dispatch_get_global_queue(0, 0), {
    sleep(2)
    cond.signal()
})
while true {
    cond.wait()
    //
    // 処理
    //
    cond.unlock()
    break
}
```

# Appendix

### 参考文献

Apple 公式の[これ](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Multithreading/ThreadSafety/ThreadSafety.html)とか[これ](https://developer.apple.com/jp/documentation/Multithreading.pdf)とか[これ](https://developer.apple.com/jp/documentation/ConcurrencyProgrammingGuide.pdf)を読んだ。

### 用語の定義

ドキュメントの中では用語の定義が以下のようになされている。

- **スレッド**: コードを実行する、他とは切り離されたパスのこと
- **プロセス**: 動作中の実行形式コードのことで、複数のスレッドから成ることもある
- **タスク**: 実行するべき処理を表す、抽象的な概念

### スレッドの代替テクノロジ

- **オペレーションオブジェクト**: NSOperation のインスタンス, 通常は OperationQueue に突っ込んで使う
- **Grand Central Dispatch(GCD)**
- 他、アイドル時間通知, 非同期関数, タイマー, プロセス
