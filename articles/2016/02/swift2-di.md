---
slug: swift2-di
title: Swift2で静的なDIを実現する謎のソースコード
category: programming
date: 2016-02-13 13:21:15
tags: [Swift]
pinned: false
---

とりあえず書いたら動いたけど、なんだかよくわかっていないのでコードだけ貼っておきます。元ネタは[ここ](http://acqui-hire.me/dependency-injection-with-the-cake-pattern-in-swift/)。元ネタでは AppContext で頑張って配線しているけど、めんどうくさいのでどうにかならんのか、と思っていろいろいじってたらこうなった。

いろいろ分かったらまとめて記事を書きます。Xcode の Playground で動いたので、貼っていじってみるとよいのではないですかね。

```
// A & AComponent
public protocol A {
    func getA() -> String
}

private class AImpl: A {
    private func getA() -> String {
        return "a"
    }
}

public protocol AComponent {
    static var a: A { get }
}

public protocol DefaultAComponent: AComponent {}
extension DefaultAComponent {
    public static var a: A {
        return AImpl()
    }
}


// AB & ABComponent
public protocol AB {
    func getAB() -> String
}

private class ABUsingA: AB {
    private let a: A
    private init(a: A) {
        self.a = a
    }
    private func getAB() -> String {
        return a.getA() + "b"
    }
}
private class SimpleAB: AB {
    private func getAB() -> String {
        return "AB"
    }
}

public protocol ABComponent {
    static var ab: AB { get }
}
public protocol DefaultABComponent: ABComponent {}
extension DefaultABComponent where Self: AComponent {
    public static var ab: AB {
        return ABUsingA(a: a)
    }
}
public protocol SimpleABComponent: ABComponent {
    static var ab: AB { get }
}
extension SimpleABComponent {
    public static var ab: AB {
        return SimpleAB()
    }
}

// Components
public typealias Components = protocol<AComponent, ABComponent>

public enum DefaultComponents: DefaultAComponent, DefaultABComponent {}
let defaultComponents: Components.Type =  DefaultComponents.self
defaultComponents.a.getA()   //=> "a"
defaultComponents.ab.getAB() //=> "ab"

public enum SimpleComponents: DefaultAComponent, SimpleABComponent {}
let simpleComponents: Components.Type =  SimpleComponents.self
simpleComponents.a.getA()    //=> "a"
simpleComponents.ab.getAB()  //=> "AB"
```
