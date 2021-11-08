---
slug: articles-2018-03
title: 最近読んだ記事（2018/03）
category: blog
date: 2018-03-27 01:34:17
tags: [メモ]
pinned: false
---

#### ?[Netlify's AWS Lambda functions bring the backend to your frontend workflow](https://www.netlify.com/blog/2018/03/20/netlifys-aws-lambda-functions-bring-the-backend-to-your-frontend-workflow/)

ラムダをいい感じに扱えるサービスが爆誕した

> Today we’re officially releasing Functions, which make deploying AWS Lambda functions on Netlify as simple as adding a file to your Git repository. 

よさそう。
そういえばラムダがらみでは [AWS Serverless Application Repository](https://aws.amazon.com/jp/blogs/news/get-ready-for-the-aws-serverless-application-repository/) なるものもでましたね。

> AWS Serverless Application Repository の登場を紹介できることを嬉しく思います。サーバレスアプリケーションの提供者とその利用者は、このAWS コンソールの新機能により、サーバレスアプリケーションを公開し、検索し、デプロイを行うことができるようになります。

いいっすね

#### ?[zshが無いと死ぬ人がbashでなんとかする](http://d.hatena.ne.jp/ozuma/20141219/1418915137)

新しい MacBook Pro を買ったついでに mac の環境構築を Ansible 化して、zsh から bash に戻したときに参考にした。わりと bash でも不満がない感じにカスタマイズできたので、このままやっていきたい。

#### ?[良い感じにログを収集するライブラリ、Puree-Swiftをリリースしました](http://techlife.cookpad.com/entry/2018/02/28/113000)

> この仕組みを使い、公開している多くのモバイルアプリからも、1つのログ基盤にさまざまなログを集積させています。
> しかし、モバイルアプリからのログ送信には、さまざまな状態を考慮する必要があります。 ログを送りたいタイミングに安定した通信が確保されているとは限らないですし、闇雲に送りすぎてしまうと、ユーザーさんのギガを圧迫してしまうかもしれません。

わかる。
こういうネイティブクライアントアプリのロギングシステム作る仕事やってみたいなぁ...。

#### ?[pixivにおけるMySQL運用の実際](https://speakerdeck.com/konoiz/pixivniokerumysqlyun-yong-falseshi-ji)

こういうお話聞ける勉強会が一番有益っぽい...。現地でお話聞きたかったなぁ...。

#### ?[memcached のアクセス制御に関する注意喚起](http://www.jpcert.or.jp/at/2018/at180009.html)

> JPCERT/CC では、2018年2月21日ごろから 11211/udp の通信ポートに対するアクセスが増加していることを、外部組織からの情報提供、およびインターネット定点観測システム (TSUBAME) の観測データから確認しています。TSUBAME にて観測されたスキャンは、当該通信ポートへのスキャンパケットから、memcachedに対して行われている可能性が考えられます。memcached の設定によっては、意図せずインターネットからアクセス可能な状態になっており、スキャンに応答している可能性があります。このような場合に攻撃の踏み台にされたり、memcached が保持する情報へアクセスされたりする可能性があります。JPCERT/CCでは、memcached を踏み台として悪用したとみられる DDoS 攻撃の報告を受け取っています。

はい

#### ?[Google社員18,000人が受講した機械学習入門トレーニング、MLCCを無償公開](https://twitter.com/kazunori_279/status/968952363733184520?s=21)

おお〜って思ったけど、思っただけで自分の手を動かさないとなんの身にもならないのでやっていきたい（っていう意思表明だけしてやらない自分がいるのよ）

#### ?[osctk18 「オープンソースソフトウェアで構築する安全で便利なDNSサーバ (PowerDNS, dnsdist, Unbound)」まとめ](https://togetter.com/li/1202912)

読んだ


#### ?[Future内でThread.sleepはするな](http://mashi.hatenablog.com/entry/2014/12/08/000149)

> ExecutionContext.Implicits.global は共用トイレと考えると…
> 個室の数(= Thread数 = 同時に処理できる数)には限りがある。先着順で処理する
> 空いてるときは100歩譲って寝てようと何してようと問題にならない
> 待ち行列ができてるにも関わらずトイレ(ExecutionContext)で寝てるのは許せない。本当に用を足してるならしょうがない
> 待ち行列ができることに何も問題ないと言い切れるなら別に構わない
> 自分で作った自分専用のトイレ(ExecutionContext)なら自由にしてくれ

わかりやすいw

#### ?[SlackとElasticsearchを連携し、使いやすい検索システムを作成する](https://codezine.jp/article/detail/10005)

よさそう


#### ?[Kyash iOSアプリの大規模リファクタリングの話](http://blog.kyash.co/entry/2018/03/20/150238)

だいたい設計に関する考え方、自分と一緒だった。ただ最近は（Web APIに頻繁に変更が入らないことが想定される場合） Repository 層いるのかな？みたいな思考になりつつある。

#### ?[ニートのIPV6普及率 IPV6のメリットとデメリットは？](https://blog.neet.co.jp/2018/03/%E3%83%8B%E3%83%BC%E3%83%88%E3%81%AEipv6%E6%99%AE%E5%8F%8A%E7%8E%87-ipv6%E3%81%AE%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%A8%E3%83%87%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%AF%EF%BC%9F/)

> NEET株式会社では、Webサーバーをこっそりと、今年の1月14日に
> 正式にIPV6に対応しました。
> ...
> サーバー的には実は2014/07/25 から対応していたのですが


#### ?[Kent Beck氏、ごく短期のプロジェクトではテストを省略することを提案](https://www.infoq.com/jp/news/2009/06/test-or-not)

> Maxを始めたとき、最初の1か月間は自動テストを一切やりませんでした。すべて手動でテストしていました。最初の数名の契約者を得てからは、立ち戻って、既存機能のためのテストを書きました。もう一度言いますが、このような順番にしたおかげで、単位時間当たりに実行できる有効な実験の数を最大化できたと思っています。コードをほとんど、あるいはまったく書かず、テストを書かないことで、ずっとすばやく立ち上げることができたのです（最初に書いたテストにはほぼ一週間かかった）。最初のコードに価値があることがわかってからは（友達の何人かがそれにお金を払ってくれるという意味で）、テストを書くことで、コードに自信を持ち、すばやく実験することができたのです。

バランスとって必要な状況で必要なテストやエンジニアリングが能力的にも権限的にもできる現場だったら有効だろうなぁ...。

#### ?[COMING SOON: NETWORKING FEATURES IN ANSIBLE 2.5](https://www.ansible.com/blog/coming-soon-networking-features-in-ansible-2.5)

Ansible 2.5 のネットワーク関連の新機能について

#### ?[「科学」に裏付けされた英語勉強法をご紹介](http://globalbiz.hatenablog.com/entry/2018/01/05/235409)

> 分野をしぼってインプット
> インプットのポイントは背景知識を知っていて理解できること。なので、自分の専門分野（例 ビジネス）や興味のある分野（例 音楽や映画）について、「徹底的に読んだり、聞いたり」することが推奨されている。

なるほ

> 動機づけを高める
> 動機づけは学習にとってきわめて重要。授業をとる、仲間と一緒に勉強する、好きな内容の教材を使う、資格試験を受験する、外国語でブログを書く、など自分に合った、動機を高めてくれる工夫が重要。

これは何をやるでも重要ですよねー


#### ?[奥野香耶さんソロイベント参加した雑感。＞あのね](https://gamp.ameblo.jp/aka-uakari/entry-12363247695.html)

なるほど。当日 AJNight に行っていて、流れてくるツイートを見ても状況が全くわからなかったけど1%くらいわかった。

#### ?[Wake Up, Girls!にハマった](http://koteijing.hatenablog.com/entry/2017/07/29/225040)

こういうふうにハマったということをきちっとまとめられる能力が欲しい。読んでて面白い記事だった。

#### ?[Wake Up, Girls!を応援する中で思ってきたこと。](http://no3no.blog110.fc2.com/blog-entry-170.html)

熱が伝わってくる
