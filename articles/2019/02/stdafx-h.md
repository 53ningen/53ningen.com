---
title: StdAfx.h
category: programming
date: 2019-02-08 03:40:37
tags: [C++]
pinned: false
---

- [StdAfx.h に関する考察 | iSUS](https://www.isus.jp/products/c-compilers/stdafxh/)
- 参照: [c++ - error C2065: 'cout' : undeclared identifier - Stack Overflow](https://stackoverflow.com/questions/1868603/error-c2065-cout-undeclared-identifier)

```cpp
#include "stdafx.h"
#include <iostream>

using namespace std;

int main()
{
    cout << "Hello Future Contact!" << endl;
    return 0;
}
```

何の変哲も無い Windows Console Application(C++) のハロワだけれど、#include "stdafx.h" の前に #include <iostream> を置くと cout が undefined な identifier になる
