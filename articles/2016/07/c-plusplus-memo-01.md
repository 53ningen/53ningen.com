---
slug: c-plusplus-memo-01
title: C++メモ
category: programming
date: 2016-07-28 17:22:26
tags: [C++]
pinned: false
---

- struct/class の違い ➡︎ デフォルトの可視性
- 基本的にすべて値型
- const は signature に含まれる
- 抽象クラスを作るときは必ずデストラクタを作る

# 厨二病

```cpp
class Base {
public:
    virtual void f() const volatile noexcept {

    }
};

class Derived: public Base {
public:
    virtual inline void f() const volatile noexcept override final {

    }
};
```

# virtual 継承とそうでないものの違い

```
// | A.Base | B.Base  | Derived |
// | Base   | Derived |             // virtual
```

# super クラスのコンストラクタを取り込む

```
class UsingBase
{
public:
    UsingBase(int) {

    }
};

class Using: public UsingBase
{
public:
    using UsingBase::UsingBase;
};

```

```
struct Hoge {
    Hoge(int) {} // ←これを変換コンストラクタと呼ぶ
    operator int() { // ←これを型変換演算子と呼ぶ
        return 1;
    }
};

int main() {
    Hoge h1;
    Hoge h2;
    Hoge h3 = h1 + h2;
    int i = h3; // 型変換演算子に explicit を書くとこれが禁止される
}
```
