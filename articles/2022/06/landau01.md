---
title: ランダウ=リフシッツ力学本第一章のまとめと行間
category: physics
date: 2022-06-23 08:00:00
tags: [力学]
pinned: false
---

2012 年ごろに参加していた [ランダウ＝リフシッツの「力学」](https://amzn.to/3QreO9r) 輪読会向けに作成した資料です。

主に本の「第１章：運動方程式」に関して要点のまとめと、本のなかではバッサリ省略されている（そこがランダウ本の良いところではあるけど）行間を補完している内容となります。

# 一般座標について

## 質点の概念

- 物体の運動を考えるときに、その「大きさ」を無視出来るとき、その物体を質点とよぶ
- 質点とみなせるかどうかはもちろんケースバイケースであり、現実に起こる運動と十分同じと見なせるかどうかで判断がわかれる

## 質点の運動を記述するための記号

時間発展に関する方程式には、時間微分がたくさん登場するので、物理量の上にドットをつけることにより、それを表現することにする。

- 空間における質点の記号: **位置ベクトル** $\boldsymbol{r} (t)$
- $\boldsymbol{r}$の$t$についての 1 階導関数: **速度ベクトル** $ \boldsymbol{v} (t) = \dfrac{d \boldsymbol{r} (t) }{dt} = \dot{\boldsymbol{r}} (t)$
- $\boldsymbol{r}$の$t$についての 2 階導関数: **加速度ベクトル** $ \boldsymbol{a} (t) = \dfrac{d^2 \boldsymbol{r} (t) }{dt^2} = \ddot{\boldsymbol{r}} (t)$

## 「力学的状態」が定まるとはどういうことか

系のある時刻以降の各質点の位置が予言できているとき、これを **「力学的状態」が定まっている** とよぶ

- 空間上で N 個の質点の位置を決めるためには、N 個のベクトル、3N 個の成分が必要であり、必要な成分の数を **自由度** とよぶ
- 逆に言えば、3N 個の成分がでそろえば、**系の位置** は一意に決まる
- しかし位置が定まっただけでは **「力学的状態」** は定まったといえない

## 一般座標の導入

位置を記述する際、デカルト座標系をとる必要はなく系の位置を決めるのに必要な任意の $s$ 個の量$q_1,q_2,\ldots,q_s$ を **系の一般座標** といい、その導関数 $\dot{q}_i$ を **一般運動量** という。

## 運動方程式とは何か

経験から座標と速度のすべてを同時に与えるならば『力学的状態』が定まることはわかるだろう。この事実から **運動方程式** を「加速度を速度、座標と結びつける関係式」と定義できる。

# 最小作用の原理

## 最小作用の原理とはなにか

> **【最小作用の原理】**
>
> 各々の力学系は関数 $ L \left( q_1, ... , q_s, \dot{q_1} , ... , \dot{q_s} , t \right) $ によって特徴付けられる。
> 時刻$t_1$から$t_2$において、座標$q^{(1)},q^{(2)}$で示される位置にある系は積分
>
> $$
> S   = \int_{t_1}^{t_2}    L \left( q_1, ...  , q_s, \dot{q_1} , ... , \dot{q_s} , t \right) dt
> $$
>
> が可能な最小の値をとるように運動する。

やさしく言い換えると $S$ が最小の値をとるように軌道 $\boldsymbol{q}(t)$ が定まる。これを **最小作用の原理** とよび、関数 $L$ を **ラグランジュ関数（ラグランジアン）**、積分 $S$ を **作用積分** とよぶ。

## 最小作用の原理から運動方程式を導く

- 最小作用の原理の要請のままでは、軌道を表す関数 $\boldsymbol{q} (t)$ がはっきり分からずに不便である
- 作用 $S$ が極値をとる条件を考えると $\boldsymbol{q} (t)$ が関わる微分方程式の形を導けるので、それを目指す
- この先簡単のため、自由度を 1 として式を書き下す
  - なお、自由度がより大きい場合でも、各成分ごとに同じ変形を行えばよいだけのことなので、自由度を 1 とすることにより一般性は失われない

まず、$q=q (t)$ がちょうど作用 $S$ を最小にするような関数と仮定する。

代わりに運動の始点と終点に影響を与えない任意関数 $Q=q (t)+\delta q(t)$ をもってくると $S$ は増加する。

ここで $\delta q(t)$は$t_1$ から $t_2$ 間で微小な関数とし $\delta q (t_1)=\delta q (t_2)=0$ であることに注意しよう。なぜならば、この先の議論で利用するからである。

さて、関数を取り替えたときに$S$は増加するのだが、どれだけ増加するのだろうか。その増分を $\delta S$ として書下すと、

$$
\delta S = \int_{t_1}^{t_2}   L \left( q(t) + \delta q(t) , \dot{q} (t) + \delta \dot{q} (t), t \right) dt -
\int_{t_1}^{t_2}  L \left( q(t) , \dot{q} (t) , t \right)  dt
$$

となる。

右辺第 1 項の被積分関数をべき級数展開すると

$$
\begin{aligned}
\delta S = \int_{t_1}^{t_2}   \left (
{  \cancel {L \left( q , \dot{q}  , t \right)}}  +
\dfrac{ \partial L \left( q , \dot{q} , t \right)}{\partial q } (\delta q) +
\dfrac{ \partial L \left( q, \dot{q}  , t \right)}{\partial \dot{q} } (\delta \dot{q}) +
\dfrac{1}{2} \dfrac{ {\partial}^2 L \left( q, \dot{q} , t \right)}{\partial q^2 } (\delta q)^2 + \right.  & \\
\dfrac{1}{2} \left. \dfrac{ {\partial}^2 L \left( q , \dot{q}  , t \right)}{\partial  q \partial \dot{q} } ( 2 \delta q \delta \dot{q}) +
\dfrac{1}{2} \dfrac{ {\partial}^2 L \left( q , \dot{q}  , t \right)}{\partial {\dot{q}}^2 } (\delta \dot{q})^2   + \cdots - \cancel{ {L \left( q, \dot{q}  , t \right) } } \right ) dt
\end{aligned}
$$

ここで $\delta q(t)$ は時刻 $t_1$ から $t_2$ の間において微小な関数であるという条件から、微少量について 1 次の項だけを残せば、

$$
\delta S    = \int_{t_1}^{t_2}   \left( \dfrac{\partial L}{\partial q}  \delta q - \dfrac{\partial L}{\partial \dot{q}} \delta \dot{q} \right) dt
$$

となる。

被積分関数の第 2 項について、変分記号 $\delta$ と微分演算子 $\dfrac{d}{dt}$ を交換した後に、部分積分すると、

$$
\begin{aligned}
\int_{t_1}^{t_2}   \left( \dfrac{\partial L}{\partial \dot{q}} \delta \dot{q}  \right) dt
&= \int_{t_1}^{t_2} \left(  \dfrac{\partial L}{\partial \dot{q}}  \dfrac{d}{dt} \delta q \right) dt \\
&= \left[ \dfrac{\partial L}{\partial \dot{q}}  \delta q(t) \right] {t_1}{t_2} - \int_{t_1}^{t_2} \left(  \dfrac{d}{dt}  \dfrac{\partial L}{\partial \dot{q}}  \delta q \right) dt　\\
&= \dfrac{\partial L}{\partial \dot{q}} \delta q(t_2) -\dfrac{\partial L}{\partial \dot{q}}\delta q(t_1)- \int_{t_1}^{t_2} \left(  \dfrac{d}{dt}  \dfrac{\partial L}{\partial \dot{q}}  \delta q \right) dt　\\
&= 0 - 0 - \int_{t_1}^{t_2} \left(  \dfrac{d}{dt}  \dfrac{\partial L}{\partial \dot{q}}  \delta q \right) dt
\end{aligned}
$$

を得る。

なお、ここで $\delta q (t_1)=\delta q (t_2)=0$ を用いた。再び $\delta S$ について考えると次のように書ける。

$$
\delta S = \int_{t_1}^{t_2}   \left( \dfrac{\partial L}{\partial q}  \delta q -  \dfrac{d}{dt}  \dfrac{\partial L}{\partial \dot{q}}  \delta q  \right) dt
= \int_{t_1}^{t_2}   \left( \dfrac{\partial L}{\partial q}  -  \dfrac{d}{dt}  \dfrac{\partial L}{\partial \dot{q}}    \right) \delta q   dt
$$

ある関数$q=q(t)+\delta q(t)$に対して$S$が極値をとるとすれば、$\delta S$はゼロであることが必要である。ところが$\delta q(t)$は任意の関数であるため、結局

$$
\dfrac{\partial L}{\partial q_i} - \dfrac{d}{dt} \left(\dfrac{\partial  L}{\partial \dot{q_i}} \right)= 0
$$

が必要となる。あるいは、両辺に $-1$ をかけて、

$$
\dfrac{d}{dt} \left(\dfrac{\partial  L}{\partial \dot{q_i}} \right) - \dfrac{\partial L}{\partial q_i} = 0
$$

ともできる。

これを **オイラー・ラグランジュ方程式** とよぶ。こうして、軌道 $\boldsymbol{q}(t)$ を含む運動方程式を導くことができた。

## ラグランジュ関数の任意性

ラグランジュ関数については重ね合わせの原理が成り立つ。

> **\[ラグランジュ関数の加法性]**
>
> 力学系が孤立した２つの部分 A,B から成り、それぞれのラグランジュ関数を $L_A$ , $L_B$ としよう。
> このとき A,B 間の相互作用が無視出来るほど遠く離れているという極限では
>
> $$
> L = L_A + L_B
> $$
>
> とできる。

- オイラー・ラグランジュ方程式の形を見てみると、ある力学系のラグランジュ関数に任意の定数をかけても、方程式から導かれる運動に何ら影響を与えないことは明らかである
- ただし、全体の系を考える場合は、物理量の単位の関係から同一の任意定数をそれぞれのラグランジュ関数にかけなくてはならない

作用積分は時間についての積分で書かれていることに着目して、座標 $q$ と時間 $t$ にのみ依存する任意関数 $f(q,t)$ の時間についての完全導関数をラグランジュ関数に加えてみよう。すなわち、

$$
L'(q,\dot{q},t) = L(q,\dot{q},t) + \dfrac{d}{dt} f(q,t)
$$

として $L'$ についての作用積分 $S'$ について考える。

$$
\begin{aligned}
S'
&= \int_{t_1}^{t_2} L' \left( q,\dot{q},t \right) dt \\
&= \int_{t_1}^{t_2} L \left( q, \dot{q} , t \right) dt + \int_{t_1}^{t_2} \dfrac{d}{\cancel{dt}} f(q, t) \cancel{dt} \\
&= S + f \left( q^{(2)} , t_2 \right) - f \left( q^{(1)} , t_1 \right) \\
&= S + const.
\end{aligned}
$$

したがって $S'$ と $S$ の差は、変分をとるときに消えてしまうので、運動方程式の形に影響を与えないことがわかった。

> **\[ラグランジュ関数の任意性]**
>
> 座標と時間に依存する任意関数の、時間についての完全導関数を付け加えてもよい

# ガリレイの相対性原理

ある床の上で静止している物体を考えよう。同じ床の上から物体を観測するとやはり静止している。

ところが、観測者が床の上でなく何か他の乗り物の中から観測を行うとすれば、物体を目で追わなければ観測できなくなる。また、観測者が床の上でなく何か他の乗り物の中から観測を行うとすれば、物体を目で追わなければ観測できなくなる。

これは、とる **基準系** によって運動が異なって観測される一例である。

- 逆に言えば力学系の現象を研究するためには、特定の基準系を選ぶ必要がある
- 一般的には基準系が異なれば、運動法則も違ったかたちをとる
  - 場合によってはきわめて複雑なかたちもとりうる
- したがって力学現象の法則が最も簡単な形を取るような基準系を見出すことが問題となる

## 慣性系と慣性の法則

ある系に関して空間が一様かつ等方的であり、時間も一様であるというような基準系をつねに見出すことができるとき、これを **慣性系** という。

一様であるというのは上下左右に対して均質であることをいう。また等方的であるというのは方向に依存しないということをいう。例えば、万有引力は等方的であるが一様ではない。

今、自由に運動している質点の慣性基準系におけるラグランジュ関数を考えてみる。空間と時間の一様性から、ラグランジュ関数には $\boldsymbol{q}$, $t$ をあらわに含まないことがわかる。

さらに空間の等方性から、ベクトル $\boldsymbol{\dot{q}}$ の方向には依存しないので、この関数は ${\dot{q}}^2$ にのみ依存することがわかる。

ラグランジュ関数が $\boldsymbol{q}$ に依存しないので、$\dfrac{\partial L( {\dot{q}}^2 )}{\partial \boldsymbol{q}} = 0$ となり、オイラー・ラグランジュ方程式より

$$
\begin{aligned}
\dfrac{d}{dt} \dfrac{\partial L( {\dot{q}}^2 )}{\partial \boldsymbol{\dot{q}}} = 0 & \Longrightarrow
\dfrac{\partial L ( {\dot{q}}^2 )}{\partial \boldsymbol{\dot{q}}} = const. \\
& \Longrightarrow
\boldsymbol{\dot{q}} = const.
\end{aligned}
$$

を得る。これより次のことがいえる。

> **[慣性の法則]**
>
> 慣性基準系においてすべての自由な運動は大きさも方向も一定の速度を持つ

## ガリレイの相対性原理

ある慣性基準系とならんで直線的にかつ等速度で運動している慣性基準系に関して経験から自由運動の法則が同一であるだけでなく、力学的関係もおなじになる。

> **[ガリレイの相対性原理]**
>
> ある慣性基準系と互いに等速直線運動をするどんな慣性基準系のなかでも、空間と時間の性質は同一であり、すべての力学的法則は同一である

## ガリレイ変換

- ガリレイの相対性原理から無限に多くの慣性系のすべてが力学的に等価であることがわかったが、これは同時に絶対的な基準系が存在しないということを意味している
- 異なる慣性基準系についての関係を表すのが **ガリレイ変換** である
- 相対性原理は、ガリレイ変換に対して運動が不変であることを要請することにより定式化できる。

> **[ガリレイ変換]**
>
> 基準系 $K'$ は基準系 $K$ に対して速度 $\boldsymbol{V}$ で運動している。
> このとき $K$ および $K'$ での同一の質点の座標 $\boldsymbol{r}$ , $\boldsymbol{r}'$ と時刻 $t$ , $t'$ について
>
> $$
> \begin{aligned}
> \boldsymbol{r} &= \boldsymbol{r}' + \boldsymbol{V}' t \\
>  t &= t'
> \end{aligned}
> $$
>
> なる関係で結ばれる。これを **ガリレイ変換** とよぶ。

後者の式は古典力学における絶対時間の仮定を意味する。

# 自由な質点のラグランジュ関数

- 運動に際してラグランジュ関数が満たす方程式は、最小作用の原理から導くことができた（オイラー・ラグランジュ方程式）。
  - しかしラグランジュ関数は一体どういったものなのか、まだ考えていない。
- そこで、まず慣性基準系における自由な質点のラグランジュ関数がどのような形になるか、考えてみよう。
  - その際、要請 3 のガリレイの相対性原理を利用してみることにする。

## 慣性系における自由な質点のラグランジュ関数の導出

系 $K'$ が系 $K$ に対して、微小速度 $\boldsymbol{\epsilon}$ で運動しているとすれば $\boldsymbol{v}' = \boldsymbol{v} + \boldsymbol{\epsilon}$ となる。

ガリレイの相対性原理によれば、すべての慣性系で運動方程式は同一の形を取らなければならないことを思い出してみよう

そのためには「ラグランジュ関数の任意性」で議論したように、2 系間のラグランジュ関数に認められる差は、座標と時間に依存する任意関数の、時間についての完全導関数となっていなければならない。

ラグランジュ関数はこの変換に際して $L'$ になったとすれば、

$$
L' = L({v'}^2)  = L(v^2 + 2 \boldsymbol{v}  \cdot \boldsymbol{\epsilon} + \epsilon^2)
$$

となる。これを $\epsilon$ のべきで展開すると

$$
\begin{aligned}
L'
&= L(v^2) + \dfrac{\partial L}{\partial v^2} 2v \epsilon + \cdots \\
&\approx  L(v^2) + \dfrac{\partial L}{\partial v^2} 2v \epsilon.
\end{aligned}
$$

この等式の右辺第 2 項が時間についての完全導関数になるための条件を考えよう。

$$
\dfrac{\partial L}{\partial v^2} 2v \epsilon = \dfrac{\partial L}{\partial v^2} \dfrac{\mathrm{d} \left( 2 x \epsilon \right) }{\mathrm{d}t} .
$$

よって、$\dfrac{\partial L}{\partial v^2} = a = const.$が必要だと即座にわかる。以上より

$$
L = av^2 = \dfrac{m}{2} v^2
$$

というように、定数 $a$ や $m$ を用いてラグランジュ関数を表現することができた。実は、2 系間の速度の差が微小でなくても有限量 $V$ ならばこの形を用いることができる。なぜならば、

$$
L' = av'^2 = a(v + V)^2 = av^2 + 2avV + aV^2 = L + \dfrac{d}{dt}(2arV + aV^2t).
$$

となり、もとのラグランジュ関数と完全導関数に分けることが出来るからである。

## 質量の定義とその意味

$L = \dfrac{mv^2}{2}$ なる $m$ を質量とよぶ。これはラグランジュ関数の加法性を考えにいれたときに意味をなす。

なぜならば、ラグランジュ関数には任意定数をかけることは質量の単位を変更することと変わりがないからである。また、質量が負の値を取らないことも容易に導くことができるので、それを確認しておくことにする。

最小作用の原理より空間内の点 1 から点 2 への運動に対して作用積分

$$
S = \int_{1}^{2} \dfrac{mv^2}{2} dt
$$

は極小値をもつ。ここで質量が負の値をとると仮定しよう。

すると点 1 から急激に遠ざかり 2 に急激に近づく経路をとると作用積分は絶対値のいくらでも大きな負の値をとり極小値を持つことができない。

## 各座標系におけるラグランジュ関数の導出に関するヒント

次のことに注目すると便利である

$$

v^2 = \left( \dfrac{dl}{dt} \right) ^2 = \dfrac{dl^2}{dt^2}


$$

デカルト座標では $\mathrm{d}l^2 = \mathrm{d}x^2 + \mathrm{d}y^2 + \mathrm{d}z^2$ であるから

$$

L = \dfrac{m}{2} ( \dot{x}^2 + \dot{y}^2 + \dot{z}^2 )


$$

円筒座標では $\mathrm{d}l^2 = \mathrm{d}r^2 + r\mathrm{d}\varphi^2 + \mathrm{d}z^2$ であるから

$$

L = \dfrac{m}{2} ( \dot{r}^2 + r^2\dot{\varphi }^2 + \dot{z}^2 )


$$

球座標では $\mathrm{d}l^2 = \mathrm{d} r^2 + r^2 \mathrm{d}\theta ^2 + r^2 \mathrm{sin}\theta \mathrm{d}\varphi ^2$ であるから

$$

L = \dfrac{m}{2} ( \dot{r}^2 + r^2\dot{\theta }^2 + r^2 \mathrm{sin}^2 \theta \dot{\varphi }^2 )


$$

# 補足

## べき級数展開について

多変数関数のべき級数展開についてとりあえずの公式を書いておく。より厳密なものは微分積分学の書籍を参照されたい。

### 1 変数関数の場合

$$
f(x) = \sum_{k=0}^{n}{ \dfrac{f^{(k)}(a) }{k!} (x-a)^k } + R_{n+1} (\theta ) \\
f(x+\delta x) = \sum_{k=0}^{n} \dfrac{f^{(k)}(x)}{k!} (\delta x)^k + R'_{n+1}(\theta )
$$

### 2 変数関数の場合

$$
f(x+\delta x , y + \delta y) = \sum_{k=0}^{n} \dfrac{f(x,y)}{k!} (\delta x D_1 + \delta y D_2)^k + R_{n+1}(\theta )
$$

ただし

$$
D_1 = \dfrac{\partial }{\partial x}, D_2 = \dfrac{\partial }{\partial y}
$$

## 変分記号と微分演算子の交換について

微分記号 $\delta$ と微分演算子 $\dfrac{d}{dx}$ が交換可能な理由について考えてみよう。これは簡単に導くことができる。

$$
\delta \dot{q} = \dfrac{ \mathrm{d}}{\mathrm{d}t} Q - \dfrac{\mathrm{d}}{\mathrm{d}t} q = \dfrac{\mathrm{d}}{\mathrm{d}t} ( Q - q ) = \dfrac{\mathrm{d}}{\mathrm{d}t} ( \delta q ) .
$$

## べき級数展開について その 2

まず $v$ を固定して $\epsilon$ のみの関数 $f(\epsilon)$ にしている。

$$
\begin{aligned}
f(\epsilon)  &= L ( v^2 + 2v\epsilon + \epsilon^2 ) \\
f'(\epsilon) &= 2 ( v + \epsilon ) L ( v^2 + 2v\epsilon + \epsilon^2 )
\end{aligned}
$$

その後 $\epsilon$ についてのマクローリン展開を行うと本文のような変形になる。

$$
\begin{aligned}
f(\epsilon)
&= f(0) + f'(0) \epsilon + \dfrac12 f''(0) \epsilon^2 + \cdots \\
&= L(v^2) + 2( v + \epsilon ) L'(v^2) \epsilon + \cdots \\
&= L(v^2) + 2 v \epsilon L' (v^2) + 2 \epsilon^2 L(v^2) + \cdots \\
&= L(v^2) + 2 v \epsilon L' (v^2) + \cdots
\end{aligned}
$$

## べき級数展開について その 3

セミナー中にべき級数展開について（２）の別の方法が出てきたので、それを記しておく。

まず $x=v^2$, $\epsilon ' ~= 2\boldsymbol{v} \cdot \boldsymbol{\epsilon} + \epsilon^2$ という置き換えをすれば、

$$
L ( v^2 + 2v\epsilon + \epsilon^2 ) = L (x +\epsilon ')
$$

となる。これを$\epsilon '$でべき級数展開をしてあげれば

$$
L ( x + \epsilon ' ) = L (x) + \dfrac{\partial L}{\partial x} \epsilon ' + \dfrac12 \dfrac{\partial^2 L}{\partial x^2} \epsilon'^2 + \cdots
$$

とできる。この状態で $\epsilon'$ と $x$ をもとに戻してあげれば前述の式と同じ形になる。

べき級数展開で特に１次のものと２次のものは非常に重要であるが、しばしば専門書では省略されている。各自が一度はどうなるか手順を確認して、いつでも再現できるようにしておくことが大切である。

# セミナー後のまとめ

第 1 回セミナー後に気付いた点を記しておく

- 口頭発表の際には思いの外、式番号がないと不便である。少し邪魔なくらいにあったほうが良い
- 資料だけだと発表しづらいので、ある程度黒板に何を書くと便利かを考えておくとスムーズに進む
- ラグランジュ関数がなぜ $q$ と $\dot{q}$ に依存するかという点は、1.5 の運動方程式に関する仮定から来ている。
- 慣性基準系の部分については「ユークリッド空間内においての運動を考える」とするともう少し分かりやすい
  - 空間に歪みがないという部分が重要
- 慣性基準系における自由粒子の観測は逆さまに見ても、反対側から見ても同じであり、これが等方性である

# 参考文献

1.  [L.D.ランダウ・E.M.リフシッツ, 『力学（増訂第３版）』, 東京図書(1983)](https://amzn.to/3n33ums)
2.  [大貫義郎・古田春夫,『岩波講座　現代の物理学１　力学』,岩波書店(1994)](https://amzn.to/3tN3ZVf)
3.  [吉田春夫,『キーポイント力学』,岩波書店(1996)](https://amzn.to/3O2ledo)
4.  [齋藤正彦,『微分積分学』,東京図書(2006)](https://amzn.to/3y54cpv)
