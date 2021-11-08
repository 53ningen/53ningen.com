---
slug: 2036-year-old-agape
title: 2036年問題とは... 何...
category: programming
date: 2018-12-21 00:00:51
tags: [NTP]
pinned: false
---

<p><style>
<!--
    .alert-info {
        text-align: center;
        border: 1px solid;
        padding: 15px;
        border-radius: 4px;
        color: #31708f;
        background-color: #d9edf7;
        border-color: #bce8f1;
        margin-bottom: 60px;
    }
-->
</style></p>
<div class="alert alert-info text-center">この記事は <a href="https://qiita.com/advent-calendar/2018/ex-dwango">「元ドワンゴ Advent Calendar 2018」</a> 17日目の記事です。</div>

D 社のみなさん、こんばんみのる〜。
ゆいかおりです〜。

さて、Red Hat Enterprise Linux 7 のドキュメントにこんな記述がありました。

> NTP が示すのは、1900 年 1 月 1 日の GMT 午前 0 時 00 分からの積算秒数です。秒数のカウントには 32 ビットが使われているので、時間は 2036 年に 「ロールオーバー」 してしまいます。しかし、NTP はタイムスタンプ間の差異で機能するため、タイムプロトコルの他の実装ほどの問題はもたらされません。誤差が 68 年以内のハードウェアクロックが起動時に利用可能であれば、NTP は正確に現在の日時を解釈します。NTP4 仕様は、 「Era Number」 および 「Era Offset」 を提供します。これらは、68 年を超える長さの時間を処理する際に、ソフトウェアをより堅牢にするために使用できます。この問題を Unix の 2038 年問題と混同しないように注意してください。([16.3. NTP の概要 - Red Hat Customer Portal](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/system_administrators_guide/s1-understanding_ntp))

ほうほう、なにやら「2036 年問題」というものがあるのですね。無知な私は初めて知りました。

良い機会（？）なので実際に計算して内容を確認してみました。

素人がなんとなくまとめたものなので、間違い・見当違いがあったら鋭いマサカリをよろしくお願いします???

また、関連する仕様実装はざっくり調べただけなので間違ってたらコメントください...

はてブでなんか悪口かかれると傷いちゃう...

## ロールオーバー時期についての確認計算

`NTPv3` での定義では NTP タイムスタンプは 64 bit 符号なし固定小数点数型であり、最初の 32 bit は整数部、残りの 32 bit は小数部で表現されます。また NTP タイムスタンプは `1900/01/01 00:00` からの積算時間を表します[[^1]](#1)。

したがって `2^31 = 2147483648` 後である `1968/01/20 03:14:08` には MSB が立ち、`2^32 - 1 = 4294967295` 秒後である `2036/02/07 06:28:15` を刻むと NTP タイムスタンプはオーバーフローします[[^2]](#2)。1900 年から 136 年の月日が経つまで一応問題なく動くデータ型ではありました。

```
$ echo $((2#10000000000000000000000000000000))
2147483648
$ date -d '1900/01/01 00:00:00 UTC 2147483648 sec' -u
Sat Jan 20 03:14:08 UTC 1968
$
$ echo $((0xFFFFFFFF))
4294967295
$ date -d '1900/01/01 00:00:00 UTC 4294967295 sec' -u
Thu Feb  7 06:28:15 UTC 2036
```

ここまで RHEL7 のドキュメントに書かれていた以下の部分を確認できました。

> NTP が示すのは、1900 年 1 月 1 日の GMT 午前 0 時 00 分からの積算秒数です。秒数のカウントには 32 ビットが使われているので、時間は 2036 年に 「ロールオーバー」 してしまいます。

情報処理技術者試験のエントリーレベルの問題でした。

### 脚注

<a name="1">[^1]</a> Since NTP timestamps are cherished data and, in fact, represent the main product of the protocol, a special timestamp format has been established. NTP timestamps are represented as a 64-bit unsigned fixed-point number, in seconds relative to 0h on 1 January 1900. The integer part is in the first 32 bits and the fraction part in the last 32 bits.([RFC1305](https://tools.ietf.org/html/rfc1305))
<a name="2">[^2]</a> Note that since some time in 1968 the most significant bit (bit 0 of the integer part) has been set and that the 64-bit field will overflow some time in 2036. Should NTP be in use in 2036, some external means will be necessary to qualify time relative to 1900 and time relative to 2036 (and other multiples of 136 years). Timestamped data requiring such qualification will be so precious that appropriate means should be readily available. There will exist an 200-picosecond interval, henceforth ignored, every 136 years when the 64-bit field will be zero and thus considered invalid.([RFC1305](https://tools.ietf.org/html/rfc1305))

## NTP が許容しうるハードウェアクロックの誤差

RHEL7 のドキュメントには続いて次のような記述があります。

> しかし、NTP はタイムスタンプ間の差異で機能するため、タイムプロトコルの他の実装ほどの問題はもたらされません。誤差が 68 年以内のハードウェアクロックが起動時に利用可能であれば、NTP は正確に現在の日時を解釈します。

この部分について確認しておきましょう。

### 同期の仕組みの概要

NTP の同期はサーバーがクライアントに時刻情報を送り込むという単純なものではなく、差分計算が行われるらしいです。

ある基準時刻において NTP サーバーが **T**, NTP クライアントが **t** の NTP タイムスタンプを保持していたとして、2 つの NTP タイムスタンプのオフセット **Δ = T -　 t** となります。

そのような環境において、下記のようなやりとりを考えます:

1. NTP クライアントは、自身のその時点での NTP タイムスタンプ **t1** (Originate Timestamp) を記したパケットを NTP サーバーへ送信する
2. NTP サーバーはパケットを受け取り、自身のその時点での NTP タイムスタンプ **T1** (Receive Timestamp) を記したパケットを作る
3. NTP サーバーはその後さらに自身のその時点での NTP タイムスタンプ **T2** (Transmit Timestamp) を記したパケット NTP クライアントへ送り戻す
4. NTP クライアントはパケットを受け取り、自身のその時点での NTP タイムスタンプ **t2** を記したデータを作成する

```
左: NTP server
右: NTP client

T   ===== t = T - Δ
    |   |
    |  /|-------- t1 = (T1 - Δ) - R1
    | / |   R1
T1  |/  |-------- (T1 - Δ)
    |   |
    |   |
    |   |
T2  |\  |-------- (T2 - Δ)
    | \ |   R2
    |  \|-------- t2 = (T2 - Δ) + R2
    |   |
    |   |
    =====
```

ここで R1, R2 はそれぞれ行き・かえりの経路をパケットが移動するまでの時間となります。このとき次の 2 つの式が成立します。

```
(1) R1 = (T1 - Δ) - t1
(2) R2 = t2 - (T2 - Δ)
```

つづいて **(1) - (2)** を変形していくことにより **Δ** の式にできます。

```
(1) - (2) <=>
R1 - R2 = (T1 - Δ) - t1 - (t2 - (T2 - Δ)) <=>
R1 - R2 = T1 - Δ - t1 - t2 + T2 - Δ <=>
R1 - R2 = T1 - t1 + T2 - t2 - 2Δ <=>
2Δ = T1 + T2 - (t1 + t2) - (R1 - R2) <=>
Δ = (T1 + T2 - (t1 + t2) - (R1 - R2)) / 2
```

ここで NTP サーバーと NTP クライアントの経路が安定したネットワークであり、行きとかえりで転送時間に差がない、つまり **R1 - R2 ~ 0** とみなせる場合、

```
(3) Δ ~ (T1 + T2 - t1 - t2) / 2
```

とできます。こうして NTP は時刻を配信するのではなく、NTP タイムスタンプの差分によりお互いのホスト間で刻む時刻の差を計算します。

### オーバーフローした場合のタイムスタンプ差分同期のふるまい

続いて NTP タイムスタンプがオーバーフローした場合のふるまいについて検討します。

まずは具体例を見てみます。下図のように NTP サーバー と NTP クライアント の NTP タイムスタンプのオフセット **Δ = 95** であると仮定します。ちょうど NTP サーバーの NTP タイムスタンプがオーバーフローしたタイミング、つまり **T = 0** のときにクライアントがパケットを送信したと仮定すると、ざっくりと以下のような流れになるかと思います（実際にパケットのやりとりに 10 秒かかってたらアレですが思考実験として...）。

```
左: NTP server
右: NTP client

T   ===== t = T - Δ (Δ = 95)
    |   |
0   |  /|-------- 4294967200
    | / |   R1
10  |/  |-------- 4294967210
    |   |
20  |\  |-------- 4294967220
    | \ |   R2
    |  \|-------- 4294967230
    |   |
    |   |
    =====
```

このとき (3) 式で正しい **Δ** の値が得られるかを使って計算を進めます。なお NTP タイムスタンプは符号なしの 32 bit 整数である点に注意が必要です。

```
Δ = (10 + 20 - 4294967200 - 4294967230) / 2
  = (30 - 4294967200 - 4294967230) / 2

※ 30 - 4294967200 - 4294967230 は 32bit 符号なし整数の計算としてはオーバーフローしてしまうので正剰余をとると 190

  = 190 / 2
  = 95
```

NTP タイムスタンプがオーバーフローしても **Δ = 95** 程度であれば時刻のズレの値が問題なく計算できました。
つまり (3) 式を 32 bit 符号なし整数で計算する場合は、**(T1 + T2 - t1 - t2)** の計算は正剰余をとって以下のような形となる。

```
(4) Δ ~ (T1 + T2 - t1 - t2) mod 2^32 / 2 (a mod b は正剰余)
```

(3) 式 と (4) 式の計算結果が一致する条件は以下のようになり、

```
T1 + T2 - t1 - t2 = (T1 + T2 - t1 - t2) mod 2^32 =>
T1 + T2 - t1 - t2 < 2^32 - 1
```

これより同期する条件は

```
Δ ~ (T1 + T2 - t1 - t2) / 2 < (2^32 - 1) / 2 = 2147483647.5
```

2147483647.5 秒は 68.0963 年であり、RTC がおよそ 68 年までのズレであれば NTPv3 で同期できるということがなんとなくわかった。数学できないので間違っているかもしれない。信じるか信じないかはあなた次第（間違い見つけたら教えて下さい）。

## SNTPv4: RFC4330 での改善

[SNTPv4](https://www.ietf.org/rfc/rfc4330.txt) では、ワークアラウンドとして NTP タイムスタンプの MSB が 1 である場合、1968 年〜2036 年 であるとみなし、0 である場合 2036 年〜2104 年と解釈し、2036/02/07 06:28:16 を起点として NTP タイムスタンプを加算するという仕様が盛り込まれた。

[^3] As the NTP timestamp format has been in use for over 20 years, it is possible that it will be in use 32 years from now, when the seconds field overflows. As it is probably inappropriate to archive NTP timestamps before bit 0 was set in 1968, a convenient way to extend the useful life of NTP timestamps is the following convention: If bit 0 is set, the UTC time is in the range 1968-2036, and UTC time is reckoned from 0h 0m 0s UTC on 1 January 1900. If bit 0 is not set, the time is in the range 2036-2104 and UTC time is reckoned from 6h 28m 16s UTC on 7 February 2036. Note that when calculating the correspondence, 2000 is a leap year, and leap seconds are not included in the reckoning.([RFC4330](https://www.ietf.org/rfc/rfc4330.txt))

### さいごに

半分くらい自分の頭の整理の目的で書き出した内容ではありますが、誤った情報をインターネットに撒き散らすのは本位ではないため、誤りを見つけましたらご連絡いただけると嬉しいです。書いたのはなんの専門家でもない素人です。内容は疑ってかかってください。

関連する RFC 分量が多く、まだまだ全然読みきれてない...。

### 参考文献

- [NTP プロトコルの概要・仕組み（時間補正の計算・仕様・シーケンス） | SE の道標](https://milestone-of-se.nesuke.com/l7protocol/ntp/ntp-summary/)
- [NTP の仕組みを調べてみた - 車輪の再発明](https://ebi216.hateblo.jp/entry/2018/03/18/014313)
- [Powershell で NTP サーバを書く - 車輪の再発明](https://ebi216.hateblo.jp/entry/2018/03/18/011725)
- [実験プログラムの組み込み](http://www.net.c.dendai.ac.jp/~ochi/chapter3/top.html)
- 各種 RFC
- [ドワンゴ採用サイト](http://dwango.co.jp/recruit/)
