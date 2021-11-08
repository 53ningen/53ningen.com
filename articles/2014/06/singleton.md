---
slug: singleton
title: Singletonパターンの罠
category: programming
date: 2014-06-29 20:18:34
tags: [Java, デザインパターン]
pinned: false
---

<p>インスタンスが一個しか存在しないクラスを書くためのパターンがSingleton Patternです．登場するのはSingletonクラスひとつのみで以下のようなクラス図になります．</p>

<p><img src="https://static.53ningen.com/wp-content/uploads/2015/12/21012214/L-e1537460534109.png" alt="L" width="188" height="142" class="aligncenter size-full wp-image-64" /></p>

<p>結城本には以下のような感じでサンプルコードが掲載されていました．</p>

```
public class Singleton {
    private Singleton() {}
    private static Singleton singleton = new Singleton();
    public static Singleton getInstance() {
        return singleton;
    }
}
```

<h1>Double-checked locking 問題</h1>

<h2>参考ページ</h2>

<ul>
<li><a href="http://www.ibm.com/developerworks/jp/java/library/j-dcl/">double-checked lockingとSingletonパターン</a></li>
<li><a href="http://en.wikipedia.org/wiki/Double-checked_locking">Double-checked locking</a></li>
<li><a href="http://en.wikipedia.org/wiki/Initialization-on-demand_holder_idiom">Initialization-on-demand holder idiom</a></li>
<li><a href="https://sites.google.com/site/leihcrev/algorithm/initialization-on-demand-holder">Initialization-on-demand holder とは？</a></li>
<li><a href="https://sites.google.com/site/leihcrev/java/validsingleton">正しいシングルトンクラスの実装の仕方</a></li>
</ul>

<h2>概要</h2>

<p>Fooクラスのインスタンスがただ一つだけするようにSingletonパターンを用いて以下のようなコードを書いたとします．</p>

```
class Foo {
    private Helper helper;
    public Helper getHelper() {
        if (helper == null) {      // [1]
            helper = new Helper(); // [2]
        }
        return helper;
    }

    // other functions and members...
}
```

<p>もし２つのスレッドが同時にgetHelper()を呼んだ場合，同時にインスタンスを生成しようとして，片方が完全に初期化されないままのインスタンスの参照を持ってしまうようなことが起こり得ます．これを防ぐためには，コストは大きいですが同期を取ってあげればよく，以下のようなコードに変更すれば良いです(from wikipedia)．</p>

```
// Correct but possibly expensive multithreaded version
class Foo {
    private Helper helper;
    public synchronized Helper getHelper() {
        if (helper == null) {
            helper = new Helper();
        }
        return helper;
    }

    // other functions and members...
}
```

<p>よくよく考えてみるとsynchronizeが必要なのはgetHelper()内の最初のif文のみです．そこでDouble-checked lockingというイディオムが考えられました(from wikipedia)．</p>

```
public static Singleton getInstance()
{
  if (instance == null)
  {
    synchronized(Singleton.class) {  //1
      if (instance == null)          //2
        instance = new Singleton();  //3
    }
  }
  return instance;
}
```

<h1>Initialization-on-demand holder idiom</h1>

<p>Double-checked lockingによりsynchronizedにより初回に正しくインタスタンス生成されたあとは同期を取らずにすみます．理論的には申し分ないのですが，これはJavaプラットフォームのメモリー・モデルが原因で，期待通りの動作が必ずしも保証されません．Javaではシングルトン実装のアンチパターンとされています．そこでInitialization-on-demand holder idiomというものが推奨されています(from wikipedi)．</p>

```java
public class Something {
    private Something() {}

    private static class LazyHolder {
        private static final Something INSTANCE = new Something();
    }

    public static Something getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```
