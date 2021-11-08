---
slug: try-tdd
title: テスト駆動開発をやってみる会に参加してきた
category: programming
date: 2013-12-13 23:52:58
tags: [CSharp, TDD]
pinned: false
---

先日、TDD（テスト駆動開発）をやってみる会に参加してきました。

JUnit の存在は知っていたんだけど、どういう風にテストコードを書いていけばいいのかよくわかってなかったので、手っ取り早く知ってる人がいるイベントに参加してしまおうというモチベーションで参加。最近はもっぱら C#での開発ばかりなので C#で参加しました。ちなみに２０人ちょい参加者がいた気がしますが C#使いが自分を含めて二人でした。

PHP,Java 使いが多く、Python,Objective-C などもチラホラ。そもそも PHP でテスト環境があることを知らなかった（そんな自分も実は C#を使い始めてからまだ２ヶ月と少し）。研究室のレガシーシステムの書き換えでハードウェア制御の関係で VB か C#(orC++)を選ぶことになり、なんとなく Java に構文が似てそうな C#を選んでせかせか書いてます。

☆ まずはテスト駆動開発についての解説がありました。

1.（失敗する）テストを書く(RED) 2.テストが成功するような実装を書く(GREEN) 3.リファクタリングする(REFACTOR)

という流れで開発を行っていくことを基本とするそうです。

テストする内容は、不安なところ、そもそも動くかわからないところ、特定の入力が来たらどうなるかといったような点から始めていくと良いとのこと。こうしていくことで安心できるコードを書けたり、API 設計について考えることができるようになるようです。ひと通り説明が終わったところで定番の FizzBuzz の実装を例にテスト駆動開発のデモをしてくださいました。デモは PHP で行われたんですが、PHP しばらく読み書きしてなかったので違和感が...笑。若干必死に画面に書かれるコードを追っていってテスト駆動開発の進め方を眺めました。

☆ 続いて、同じ言語使用者同士でペアを作り TDD の実践をしました。

お題は「身長と体重を入力して、横に大きいかどうかを判定するサービスを実装せよ」といったもの。C#チームの我々は Visual Studio 2012 Professional についているテスト環境を使って作業を始めました。ちなみに Express Edition だとテスト環境がついていないのでご注意。学生の特権で Microsoft が無料で提供してくれているのを使ってます。ありがとう Microsoft さん。

まずはテストコードから書き始めます。こんな感じ。

BMI 指数を計算するメソッドのテスト

```csharp
using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SampleLibrary.Test
{
    [TestClass]
    public class SampleTest
    {
        [TestMethod]
        public void TestBmi()
        {
            BmiCalc bmi = new BmiCalc();

            //Wikipediaより身長1.6m 体重50kgのときBMI指数は19.5になるとのことで
            //まずはこうなるように実装することを目指す
            Assert.AreEqual(bmi.Calc(1.6, 50), 19.5);
        }
    }
```

この状態でまずはテストを実行すると当然メソッドを実装していないので結果は RED（失敗）です。
実装に移ります。今回はあんまり深いことを考えずまず適当に動くコードを書き始めちゃいました。こんな感じ。

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SampleLibrary
{
    public class BmiCalc
    {
        public double bmi = 0d;

        public double Calc(double height, double weight)
        {
            return bmi = Math.Round(weight / (height * height), 1);
        }
    }
}
```

実装が終わったところでテストを実行すると GREEN（成功）が点灯、結構嬉しい！笑。計算が絡むと PHP とかだと数値の扱いとか結構面倒くさそうで実際、終了後の発表で入力値として整数を仮定していたチームがありました。BMI 指数計算が無事実装できたのでいろいろ追加していって結局こんなかんじになりました。

```csharp
using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SampleLibrary.Test
{
    [TestClass]
    public class SampleTest
    {
        [TestMethod]
        public void TestBmi()
        {
            BmiCalc bmi = new BmiCalc();
            Assert.AreEqual(bmi.Calc(1.6, 50), 19.5);
        }

        [TestMethod]
        public void TestAreFat()
        {
            BmiCalc bmi = new BmiCalc();
            bmi.Calc(1.6, 50);
            Assert.AreEqual(false, bmi.AreFat);
        }

        [TestMethod]
        public void TestBmiState()
        {
            BmiCalc bmi = new BmiCalc();
            bmi.Calc(1.6, 50);
            Assert.AreEqual(BmiState.普通, bmi.State);

            bmi.bmi = 18.5;
            Assert.AreEqual(BmiState.普通, bmi.State);

            bmi.bmi = 25;
            Assert.AreEqual(BmiState.肥満1度, bmi.State);

            bmi.bmi = 30;
            Assert.AreEqual(BmiState.肥満2度, bmi.State);

            bmi.bmi = 35;
            Assert.AreEqual(BmiState.肥満3度, bmi.State);

            bmi.bmi = 39.99999999999999999999999999999999999999999;
            Assert.AreEqual(BmiState.肥満4度, bmi.State);

            bmi.bmi = 40;
            Assert.AreEqual(BmiState.肥満4度, bmi.State);
        }

        [TestMethod]
        public void TestNinpu()
        {
            Assert.AreEqual("","");
        }
    }
}
```

実装コード

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SampleLibrary
{
    public class BmiCalc
    {
        public double bmi = 0d;

        public bool AreFat
        {
            get { return bmi >= 25; }
        }

        public virtual BmiState State
        {
            get
            {
                if (bmi < 18.5d)
                    return BmiState.低体重;
                else if (bmi < 25.0d)
                    return BmiState.普通;
                else if (bmi < 30)
                    return BmiState.肥満1度;
                else if (bmi < 35)
                    return BmiState.肥満2度;
                else if (bmi < 40)
                    return BmiState.肥満3度;
                else
                    return BmiState.肥満4度;
            }
        }

        public double Calc(double height, double weight)
        {
            return bmi = Math.Round(weight / (height * height), 1);
        }
    }

    public enum BmiState
    {
        低体重,
        普通,
        肥満,
        肥満1度,
        肥満2度,
        肥満3度,
        肥満4度
    }
}
```

妊婦と乳幼児は BMI 指数の扱いが代わるようでそこも実装しようと思ったのですが時間切れでした。最初からそういうものだとわかっていたら、Person クラスを作って身長、体重、種別（一般・乳児・妊婦）といったデータを保持させ、BMI 計算関連は static クラスにまとめたほうがスッキリしそうだったので反省。ただ実装コードで BmiState 列挙型をつかったあたりは良い設計だとエンジニアの方から褒めて頂けたのですごい嬉しかったです。結構褒められると嬉しい。

それと C#使いのペアの方がすごい優秀でいろいろ教えてもらいました。TDD の実践が終わる頃にはドミノ・ピザが会場に到着し、アサヒビールとともに充実した時間をすごせました。特にみんな自分の使った言語に愛着を凄い持ってて、みんな Python 使おうとか、Erlang を使おうとかいう話で盛り上がりました。勿論自分は C#を推しておきました。あと研究室にある 8 インチフロッピーとか 5 インチフロッピーの話をしたら若干盛り上がりました。まさかこんなところで役に立つとは...笑

非常にためになったので、コーディングする人は（次回がもしあったら）是非足を運んでみてください。
