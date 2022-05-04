---
title: Scalaのtraitを解剖してみた
category: programming
date: 2015-08-04 20:03:53
tags: [Java, Scala]
pinned: false
---

Scala の trait を解剖してみた

```scala
trait Trait {

    val value: String = s"$getOne"

    def getOne: Int = 1

    def getTwo: Int

}
```

これを jad すると

```java
// Decompiled by Jad v1.5.8g. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.kpdus.com/jad.html
// Decompiler options: packimports(3)
// Source File Name:   Trait.scala

import scala.Predef$;
import scala.StringContext;
import scala.runtime.BoxesRunTime;

public abstract class Trait$class
{

    public static int getOne(Trait $this)
    {
        return 1;
    }

    public static void $init$(Trait $this)
    {
        $this.Trait$_setter_$value_$eq((new StringContext(Predef$.MODULE$.wrapRefArray((Object[])(new String[] {
            "", ""
        })))).s(Predef$.MODULE$.genericWrapArray(((Object) (new Object[] {
            BoxesRunTime.boxToInteger($this.getOne())
        })))));
    }
}


// Decompiled by Jad v1.5.8g. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.kpdus.com/jad.html
// Decompiler options: packimports(3)
// Source File Name:   Trait.scala


public interface Trait
{

    public abstract void Trait$_setter_$value_$eq(String s);

    public abstract String value();

    public abstract int getOne();

    public abstract int getTwo();
}
```

こうなりました

String Interpolation については以下のスライドが詳しいです

- [http://tototoshi.github.io/slides/rpscala-83-string-interpolation/#0](http://tototoshi.github.io/slides/rpscala-83-string-interpolation/#0)
