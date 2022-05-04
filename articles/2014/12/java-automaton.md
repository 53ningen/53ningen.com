---
title: Javaでオートマトンを作ろう
category: programming
date: 2014-12-30 19:45:27
tags: [Java]
pinned: false
---

<h1>「機械」は何をしているのだろうか</h1>

<p>　たとえば照明のスイッチについて、消えている状態に対してOFFボタンを押しても何も起こりません。ONボタンを押すと点灯状態になります。逆に照明がついている状態に対して、OFFボタンを押すと消え、ONボタンを押しても何も起こりません。図にまとめるとこんな感じです。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton.png" alt="automaton" width="424" height="180" class="aligncenter size-full wp-image-45" /></p>

<p>　このように「ある状態に対して入力を与えたとき、どんなふうに振る舞うかということ」は、様々な機械のしていることの本質のひとつであると言うことができると思います。このモデルのことを状態機械(State Machine)、あるいはオートマトン(automaton)と呼びます。</p>

<p>　現在私たちが用いているパソコンやモバイル端末などは、尋常でない数のシステムがくみ合わさって実現されています。しかしながら上記の図くらい機械というものを抽象化すれば、人間の脳みそでも全容を理解しながら追っていくことができます。</p>

<p>[amazon template=wishlist&asin=4320122070]</p>

<h1>機械とオートマトン</h1>

<p>　様々な機械は、ほとんどの場合ある目的のために作られていると思います。その目的に達した状態を終了状態(end state)、あるいは受容状態(accept state)と呼ぶことにしましょう。逆に機械を動かす前の状態を開始状態(start state)と呼ぶことにしましょう。機械は、開始状態か受容状態を区別できる1ビットの出力を生成できるものとします。</p>

<p>　たとえば先ほどの照明の例では、最初の状態は消灯している状態でしょう。機械になんらかの入力を与えて、照明が点灯している状態が終了状態になると思います。これを図で表現すると以下のようになります。開始状態には矢印をつけ、終了状態には二重の円を用います。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton-1.png" alt="automaton-1" width="424" height="244" class="aligncenter size-full wp-image-47" /></p>

<p>　さて、このオートマトンは有限個の状態と遷移の組み合わせからなっていることは分かると思います。この場合、有限オートマトン(Finite Automaton)と呼ぶことができます。さらに次にどの状態になるか確実に決まっていることもわかります。これを決定性有限オートマトン(DFA: Deterministic Finite Automaton)と言います。</p>

<h1>Javaで決定性有限オートマトン</h1>

<p>　まずはこの決定性有限オートマトンをJavaで書いてみましょう。今回作るオートマトンが取りうる状態は {ON, OFF} の2つ、受け付ける入力は {0, 1} の2つにします。0 が入力されたら必ず OFF に 1 が入力されたら必ず ON の状態に遷移することにします。まとめると次の図のようになります。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton-2.png" alt="automaton-2" width="424" height="244" class="aligncenter size-full wp-image-48" /></p>

<p>　このオートマトンは 1 が入力されると受容状態に達する、つまり受理されて、 0 が入力されると受理されないという代物です。</p>

<p>　さてコーディングにとりかかります。今回は凝ったことはやらずに、状態を列挙体State、状態から状態への遷移規則をRuleクラス、遷移規則をまとめたものをRuleBookクラス、オートマトンをDFAクラスとして以下のように書き下してみました。</p>

```java
public class DFA {

    private State state;
    final private Set<State> acceptState;
    final private RuleBook rules;
    public DFA(State startState, Set<State> acceptState, RuleBook rules) {
        this.state = startState;
        this.acceptState = acceptState;
        this.rules = rules;
    }

    public DFA input(char character) {
        state = rules.next(state, character).orElseThrow(IllegalArgumentException::new);
        return this;
    }

    public State getState() {
        return state;
    }

    public boolean isAcceptState() {
        return acceptState.contains(state);
    }

    static class RuleBook {

        Set<Rule> rules = new HashSet<>();
        public RuleBook setRule(Rule rule) {
            rules.add(rule);
            return this;
        }

        public Optional<State> next(State state, char character) {
            return rules.stream().filter(r -> r.isApplicableTo(state, character)).map(Rule::next).findFirst();
        }

    }

    static class Rule {
        final private State state;
        final private char character;
        final private State nextState;

        public Rule(State state, char character, State nextState) {
            this.state = state;
            this.character = character;
            this.nextState = nextState;
        }

        public State next() {
            return nextState;
        }

        public boolean isApplicableTo(State state, char character) {
            return this.state.equals(state) && this.character == character;
        }

        @Override
        public String toString() {
            return String.format("{Rule: %s -- %s --> %s}", state, character, nextState);
        }
    }

    static enum State {
        ON,
        OFF
    }
}
```

<p>　ここまでできたら利用側のコードを書いて動かしてみます。まずは状態の遷移規則を表すRuleをまとめたRuleBookのインスタンスを用意。次に受容状態を表すセットを準備します。最後にDFAクラスに開始状態と受容状態のセットと遷移規則集を渡してインスタンス生成をしたら、inputメソッドでいろんな入力を与えて挙動を確認できます。</p>

```java
public class DFATest {
    @Test
    public void DFASampleTest() {
        final DFA.RuleBook rules = new DFA.RuleBook();
        rules.setRule(new DFA.Rule(DFA.State.OFF, '1', DFA.State.ON)).setRule(new DFA.Rule(DFA.State.OFF, '0', DFA.State.OFF));
        rules.setRule(new DFA.Rule(DFA.State.ON, '1', DFA.State.ON)).setRule(new DFA.Rule(DFA.State.ON, '0', DFA.State.OFF));

        final Set<DFA.State> acceptStates = new HashSet<>();
        acceptStates.add(DFA.State.ON);
        final DFA automaton = new DFA(DFA.State.OFF, acceptStates, rules);

        automaton.input('0');
        assertThat(automaton.getState(), is(DFA.State.OFF));
        assertThat(automaton.isAcceptState(), is(false));

        automaton.input('1');
        assertThat(automaton.getState(), is(DFA.State.ON));
        assertThat(automaton.isAcceptState(), is(true));
    }
}
```

<p>　残念ながらこのコードは汎用的ではありませんが、何となく有限オートマトンの雰囲気はつかめたのではないでしょうか。</p>

<h1>非決定性有限オートマトンの導入</h1>

<p>　実際の機械は遷移が必ずしも成功するとは限りません。あるいは何も入力していなくても遷移してしまうことがあるかもしれません。こうしたことをモデルに組み込むためには、「次にどの状態に遷移するか確実に決まっている性質」である決定性を捨てる必要があります。これを非決定性有限オートマトン(NFA: Nondeterministic Finite Automaton)と言います。</p>

<p>　たとえば先ほどの照明の例に対して、消灯状態から 1 を与えたとき、点灯するかもしれないし、しないかもしれないということが表現できるようになります。図にすると以下のような具合です。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton-3.png" alt="automaton-3" width="424" height="244" class="aligncenter size-full wp-image-50" /></p>

<p>　このとき、受理状態になるなんらかのパスがあれば、その入力は受理されると考えることにしましょう。つまり、1 や 11 や 011 などは全て受理されます。 0 や 000 や 000000 は受理されません。</p>

<p>　これができると何が嬉しいのか、少し考えてみることにします。今回は「最後から2番目の入力が 1 である数字の列を受理する機械」を考えてみましょう。これを決定性有限オートマトンの枠組みで考えるのは難しいと思います（実際に考えてみてください）。これがもし「最初から2番目の入力が 1 である数字の列を受理する機械」であれば以下のように決定性有限オートマトンとして簡単に表現が思いつくでしょう。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton3-1.png" alt="automaton3-1" width="424" height="244" class="aligncenter size-full wp-image-49" /></p>

<p>　では、先ほど導入した非決定性有限オートマトンの枠組みで「最後から2番目の入力が 1 である数字の列を受理する機械」を表現するとどうなるのでしょうか。以下の図のようになります。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton4-2.png" alt="automaton4-2" width="590" height="244" class="aligncenter size-full wp-image-51" /></p>

<p>　例えば 10, 00010, 01010101010 などは受理される（＝受容状態へのパスが存在する）ことがわかります。 01 や 1001 などは受理されないことも分かります。</p>

<h1>Javaで非決定性オートマトン</h1>

<p>　さて、実際にJavaで実装してみましょう。先ほどよりやや汎用的に使えるように、状態をState、遷移規則をRule、遷移規則集をRuleBookとして以下のようなコードを用意します。</p>

```java
public interface State {
    default boolean isAcceptState() {
        return false;
    }
}

public class Rule<T> {
    final private State state;
    final private T input;
    final private State nextState;
    public Rule(State state, T input, State nextState) {
        this.state = state;
        this.input = input;
        this.nextState = nextState;
    }

    public State next() {
        return nextState;
    }

    public boolean isApplicableTo(State state, T input) {
        return this.state.equals(state) && this.input.equals(input);
    }

    @Override
    public String toString() {
        return String.format("{Rule: %s -- %s --> %s}", state, input, nextState);
    }
}

public class RuleBook<T> {
    Set<Rule<T>> rules = new HashSet<>();
    public RuleBook setRule(Rule<T> rule) {
        rules.add(rule);
        return this;
    }

    public Set<State> next(State state, T input) {
        return rules.stream()
                .filter(rules -> rules.isApplicableTo(state, input))
                .map(Rule::next)
                .collect(Collectors.toSet());
    }
}
```

<p>　そして非決定性有限オートマトンをNFAクラスとして次のように定義します。isAcceptableメソッドは入力から得られる可能性のある全ての状態のSetを作って、その中に受容状態があるかどうかを返します。こうすることにより、受容状態へのパスがあるかどうかを調べています。</p>

```java
public class NFA<T> {
    final private State state;
    final private RuleBook<T> ruleBook;
    public NFA(State startState, RuleBook<T> ruleBook) {
        this.state = startState;
        this.ruleBook = ruleBook;
    }

    public boolean isAcceptable(List<T> inputs) {
        Set<State> states = new HashSet<>();
        states.add(state);
        for(T i: inputs)
            states = getNextStates(states, i);
        return states.stream().anyMatch(State::isAcceptState);
    }

    public Set<State> getNextStates(final Set<State> states, final T input) {
        return states.stream().map(s -> ruleBook.next(s, input)).reduce((x, y) -> {x.addAll(y); return x;}).get();
    }
}
```

<p>　最後に利用側のクラスの例として、テストコードを掲載しておきます。</p>

```java
public class NFATest {
    static enum NFAState implements State {
        ONE,
        TWO,
        THREE {
            @Override
            public boolean isAcceptState() {
                return true;
            }
        }
    }
    final RuleBook<Character> rules = new RuleBook<>();
    final NFA<Character> nfa = new NFA<>(NFAState.ONE, rules);
    @Before
    public void before() {
        rules.setRule(new Rule<>(NFAState.ONE, '0', NFAState.ONE));
        rules.setRule(new Rule<>(NFAState.ONE, '1', NFAState.ONE));
        rules.setRule(new Rule<>(NFAState.ONE, '1', NFAState.TWO));
        rules.setRule(new Rule<>(NFAState.TWO, '0', NFAState.THREE));
        rules.setRule(new Rule<>(NFAState.TWO, '1', NFAState.THREE));
    }

    @Test
    public void NFASample10Test() {
        final List<Character> input = Stream.of('1', '0').collect(Collectors.toList());
        assertThat(nfa.isAcceptable(input), is(true));
    }
    @Test
    public void NFASample00010Test() {
        final List<Character> input = Stream.of('0', '0', '0', '1', '0').collect(Collectors.toList());
        assertThat(nfa.isAcceptable(input), is(true));
    }
    @Test
    public void NFASample01010101010Test() {
        final List<Character> input = Stream.of('0', '1', '0', '1', '0', '1', '0', '1', '0', '1', '0').collect(Collectors.toList());
        assertThat(nfa.isAcceptable(input), is(true));
    }
    @Test
    public void NFASample01Test() {
        final List<Character> input = Stream.of('0', '1').collect(Collectors.toList());
        assertThat(nfa.isAcceptable(input), is(false));
    }
    @Test
    public void NFASample1001Test() {
        final List<Character> input = Stream.of('1', '0', '0', '1').collect(Collectors.toList());
        assertThat(nfa.isAcceptable(input), is(false));
    }
}
```

<p>　実装的に雑な部分は目立つと思いますが、おおむね非決定性有限オートマトンと入力を受容するかどうかを判定するアルゴリズムについては理解頂けたかと思います。</p>

<h1>自由移動</h1>

<p>　長さが2の倍数の文字列を受理する機械は次のように簡単に表現できます。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton4-4.png" alt="automaton4-4" width="530" height="284" class="aligncenter size-full wp-image-52" /></p>

<p>　では、長さが2か3の倍数の文字列を受理する機械は果たしてどうしたら良いでしょうか。ここで自由移動(free move)という規則を導入すると簡単に表現ができます。これは何の入力もなしに従うことができる規則です。これを用いると以下のように表現できます。</p>

<p><img src="http://53ningen.com/wp-content/uploads/2015/12/automaton4-3.png" alt="automaton4-3" width="540" height="430" class="aligncenter size-full wp-image-53" /></p>

<p>　図中の1 -> 2，1 -> 3 は何の入力もなしに遷移が可能です。こうすることにより 00, 000, 0000, 000000 などは受理され、0, 00000などは受理されないことが分かると思います。</p>

<p>　一見、オートマトンは単純で何の役にも立たなそうにみえますが、身近でかつ重要なところでは正規表現などに使われています。また、生物や人工知能の分野では神経系をオートマトンを応用した形でモデル化して様々な研究が行われていたりします。</p>

<p>[amazon template=wishlist&asin=4781910262]</p>
