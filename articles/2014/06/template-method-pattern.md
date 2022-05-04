---
title: Template Method Pattern
category: programming
date: 2014-06-26 19:53:29
tags: [デザインパターン]
pinned: false
---

だいたいの処理の流れが共通しているとき，それをテンプレートとしてスーパークラスに記述して，個々の具体的処理のみをサブクラスに記述するというパターンが Template Method Pattern です．

このパターンに登場するクラスは主に２つあります．ひとつは，ひな形となる AbstractClass で，ここにはテンプレート内で行う個々の処理を抽象メソッドです．もうひとつは，それらを使った一連の処理の流れを実装したメソッドです．個々の処理はサブクラスで実装するために protected か public 修飾子を，それらを使った一連の流れを定義したメソッドは全サブクラスで共通化（テンプレート化）させたいので final 修飾子を付けます．クラス図は以下のような具合になります．

<img src="http://53ningen.com/wp-content/uploads/2014/06/L.png" alt="l" width="438" height="166" class="aligncenter size-full wp-image-678" />

実際にファイルになにかを保存するための一連の流れを想定した例を以下のように書いてみました．

    /**
     * いろんなものを保存するためのテンプレートクラス
     */
    public abstract class Saver {
        protected abstract void open();
        protected abstract void save();
        protected abstract void close();

        public final void run() {
            open();
            save();
            close();
        }
    }


    public class StringSaver extends Saver {
        File file;
        PrintWriter pw;
        String str;

        public StringSaver(File file, String str) {
            this.file = file;
            this.str = str;
        }

        @Override
        protected void open() {
            pw = new PrintWriter(new BufferedWriter(new FileWriter(file)));
        }

        @Override
        protected void save() {
            pw.println(str);
        }

        @Override
        protected void close() {
            pw.close();
        }
    }

## まとめ

- Template Method Pattern は abstract class の有用な使い方のひとつで，「似たような複数の処理の流れ」から共通の性質を見つけ出し，テンプレート化することにより，「似たような複数の処理の流れ」の数が増えたときでも，読みやすいコードが書けるのではないかと思った．
- ただその「似たような複数の処理の流れ」の共通の性質をしっかりと見抜いて，良いテンプレートを作らないとかえって変更が難しいコードになってしまう危険性も持っているのではないかと思いました．
- [事例で学ぶデザインパターン 第３回 Template Method パターン](https://www.ogis-ri.co.jp/otc/hiroba/technical/DesignPatternsWithExample/chapter03.html)
