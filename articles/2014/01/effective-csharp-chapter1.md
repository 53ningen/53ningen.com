---
title: Effective C# chapter1：イディオム まとめ
category: programming
date: 2014-01-02 14:48:57
tags: [CSharp]
pinned: false
---

Effective C# 4.0：読んだだけだと要点を忘れてしまうので個人的なメモです。まずは chapte1 のイディオムから。

### 1.public メンバの代わりにプロパティを使用する

#### 1.プロパティはメンバとしてアクセスできるが実際にはメソッドとして実装される

- プロパティにアクセスされたときにメソッドとしての振る舞いを持たせることができる。override できる。

#### 2.データバインドの際はプロパティしか使えない。publi メンバはバインドできない。

```
textBox1.DataBindings.Add("targetProperty",ObjectName,"BindProperty");
```

#### 3.プロパティにセットする値が正しいかどうかのチェック処理を簡単に実装できる

あるプロパティに空白文字をセットすることを許可しないという仕様に変更したいとき、プロパティを使っていなければ public メンバもしくはセッタを呼び出してる箇所を全て見つけ出し処理を書き加えなければならない。しかしプロパティを使っていれば set アクセサー内に記述を追加するだけですむ。

#### 4.マルチスレッドサポートの追加が楽

これも前述のものと同様に get/set アクセサーへの追記で変更が終わる。

空文字セット時の例外処理と同期アクセスのサポート

```csharp
public class Hoge{
    private object syncHandle = new Object();
    private string name;
    public string Name
    {
        get
        {
            lock(syncHandle)
                return name;
        }
        set
        {
            if(string.IsNullOrEmpty(value))
            {
                throw new ArgumentException("string is null or empty",Name);
            }
            lock(syncHandle);
                return value;
        }
    }
}
```

#### 5.インデクサの実装に使える

多次元インデクサとかも定義できちゃうらしい(this[int x, int y]とか書けば OK)。けどちょっとダルそう。

```csharp
//配列的に扱えるようにする実装
public int this[int index]
{
    get{...}
    set{...}
}

//辞書的に扱えるようにする実装
public this[string foo]
{
    get{...}
    set{...}
}
```

#### 6.初期実装で public メンバとしておいて、あとからプロパティに変更してはいけない

- プロパティアクセスとデータアクセスでは生成される IL が異なる。
  - cf.)http://www.slideshare.net/ufcpp/compilation-29412750

### 2. const より readonly を使用する

- const:コンパイル時定数 primitive 型,Enum,文字列にしか対象にできない
- readonly:実行時定数
- コンパイル時に値が必要なもの以外は readonly で事足りる
