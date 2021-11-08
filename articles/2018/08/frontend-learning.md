---
slug: frontend-learning
title: ウェブフロントエンドゆるメモ
category: programming
date: 2019-08-18 23:22:43
tags: []
pinned: false
---

- フロントエンドなにもわからないなりに試行錯誤する個人用メモ
- 第三者がみても得られるものは何もないと思いますが、自分自身がたまに参照するために公開してあります
- みなさんドキュメントをみるのがよい

## 開発環境整備（nvm, Node.js, npm, yarn, VSCode）

[nvm-sh/nvm](https://github.com/nvm-sh/nvm): POSIX-compliant bash script to manage multiple active node.js versions

### nvm の導入

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
$ source ~/.bash_profile
```

### Node.js, npm の導入

```
$ nvm install 8.10
$ nvm use 8.10
```

### yarn の導入

```
$ npm install -g yarn
```

### VSCode の導入

```
$ brew cask install visual-studio-code
$ code --install-extension joshpeng.sublime-babel-vscode
```

OR [Download Visual Studio Code - Mac, Linux, Windows](https://code.visualstudio.com/download)

## React チュートリアル

### [Hello World – React](https://ja.reactjs.org/docs/hello-world.html)

- 以下のような HTML ファイルにて Hello, World! の表示が可能

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      ReactDOM.render(<h1>Hello, world!</h1>, document.getElementById('root'))
    </script>
  </body>
</html>
```

### Hello, JSX

ReactDOM.render 内に HTML のようなものが直に含まれているが、これは JavaScript の構文拡張 JSX というものが含まれており、babel により[一般的な JavaScript コードにトランスパイルされている](https://ja.reactjs.org/docs/introducing-jsx.html#jsx-represents-objects)

たとえば以下のようにして、どのようにトランスパイルされているかを確認できる。これを見てわかるように React 要素はプレーンな JavaScript オブジェクトなため生成コストは安価。

```
$ yarn global add babel
$ yarn add --dev babel-plugin-transform-react-jsx
$
$ cat test.js
const name = 'Josh Perez';
const element = <h1>Hello, {name}</h1>;

$ babel --plugins transform-react-jsx test.js
const name = 'Josh Perez';
const element = React.createElement(
  'h1',
  null,
  'Hello, ',
  name
);
```

### [ReactDOM.render()](https://ja.reactjs.org/docs/rendering-elements.html)

- `ReactDOM.render()` は React 要素を DOM として描画する役割を持っている
- 以下のようなコードにより毎秒 DateTime が更新される
  - このとき必要な差分のみが更新される
  - 本例でいえば `DateTime: ` という文字列は常に同じなので、再描画されず、時刻のデータのみが再描画されるカシコイもの
  - アプリケーションを構成する際には、一般的に `ReactDOM.render()` は一度しか呼ばずに、State を持つコンポーネントへとカプセル化する

```
function tick() {
  const element = <div>DateTime: {new Date().toLocaleTimeString()}</div>;
  ReactDOM.render(element, document.getElementById('root'));
}
setInterval(tick, 1000);
```

### [コンポーネントと props](https://ja.reactjs.org/docs/components-and-props.html)

- UI を独立して再利用できる部品に分割する仕組みとして「コンポーネント」とよばれる概念がある
  - React では小文字始まりを DOM タグ、大文字始まりをコンポーネントとして扱う規約がある
- 例えば Hello, [name] を表示するような単純なものを複数個 UI として配置したい場合を考えると、ストレートに書くと次のような記述となる

```html
<div id="root">
  <h1>Hello, Cocoa</h1>
  <h1>Hello, Chino</h1>
  <h1>Hello, Megu</h1>
</div>
```

- `<h1>Hello, [name]</h1>` をコンポーネント化するには次のどちらかの記述をすれば良い（双方とも等価）
  - ここから `React.Component` は単純に props を引数として React 要素を返す関数オブジェクトであると考えて差し支えないことがわかる
  - さらに関数オブジェクトであるため props は不変であるという性質も理解できる
  - 状態を扱うには後述の state という概念を導入する必要がある

```
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// OR

class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

これを用いて次のような記述ができる

```
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}
const element = (
    <div>
        <Welcome name='Cocoa' />
        <Welcome name='Chino' />
        <Welcome name='Megu' />
    </div>
);
ReactDOM.render(element, document.getElementById('root'));
```

### [コンポーネントと state](https://ja.reactjs.org/docs/state-and-lifecycle.html)

- React を用いたアプリケーションでは一般的に `ReactDOM.render()` を一回のみよびだす
- たとえばこの状況で毎秒更新する時計をコンポーネント化するためにはどうしたらよいか考える
- 時計を刻む処理自体もカプセル化することを要件とする

Clock 自体を単純にコンポーネント化すると以下のようにできるが、 tick で毎回 `ReactDOM.render()` をよんでいるうえに、時計を刻む処理は Clock の外部にある

```
class Clock extends React.Component {
  render = () => <div>DateTime:  {this.props.date.toLocaleTimeString()}</div>;
}

function tick() {
  ReactDOM.render(
    <Clock date={new Date()}/>,
    document.getElementById('root')
  );
}

setInterval(tick, 1000);
```

Clock が自律的に時を刻むようにするためには React に用意されている次の 2 つの要素を利用する

- React 要素にはライフサイクルメソッドが用意されている
  - componentDidMount(): コンポーネントが DOM にレンダーされた後に実行される
  - componentWillUnmount(): コンポーネントが DOM から消え去るときに実行される
  - [React component ライフサイクル図 - Qiita](https://qiita.com/kawachi/items/092bfc281f88e3a6e456) が便利
- React 要素には state とよばれるプロパティが用意されている
  - this.setState() 関数にて状態更新したときに、差分を DOM に変更を反映してくれるもの

具体的にはコンポーネントが DOM にレンダーされるタイミングでタイマーをセットし、state: date を更新すれば良いということになる。これをコードで表現すると次のようになる。

```
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick = () => this.setState({
    date: new Date()
  })

  render = () => <div>DateTime:  {this.state.date.toLocaleTimeString()}</div>;
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
);
```

- state の利用にはいくつかの注意点がある
  - コンストラクタを除き `this.state.hoge = fuga` みたいな直接の代入をしてもレンダーされないため、必ず `this.setState()` を通す
- state の更新値が以前の state に依存するときには `this.state` を利用せず、`this.setState(state, props)` を利用する
- state の更新はマージされるため、複数の state のプロパティがある場合でも、気にせず `this.setState({someState = 'newValue'})` としてよい
- 子コンポーネントに props として state を渡しても良い

### [React におけるイベント処理](https://ja.reactjs.org/docs/handling-events.html)

トグルボタンの実装

```
class ToggleButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}

ReactDOM.render(<ToggleButton />, document.getElementById('root'));
```

### [条件付きレンダー](https://ja.reactjs.org/docs/conditional-rendering.html)

- ある条件のときにレンダリングしないという表現は単に if 文を使えば良い
- render から null を返したとき、コンポーネント自体はレンダリングされないが、ライフサイクルメソッドは通常通りよびだされる点に注意

```
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: true
    }
  }
  render() {
    return this.state.loggedIn ?
      <Message body='ログイン済み' />:
      null;
  }
}

class Message extends React.Component {
  render = () => <div>{this.props.body}</div>;
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### [複数のコンポーネントのレンダリング](https://ja.reactjs.org/docs/lists-and-keys.html)

- 複数のコンポーネントを返す

```
class App extends React.Component {
  render() {
    const messages = this.props.messages.map(x => <Message body={x} key={x} />);
    return (
      <div>
        {messages}
      </div>
    );
  }
}

class Message extends React.Component {
  render = () => <div>{this.props.body}</div>;
}

messages = ['hoge', 'fuga', 'piyo']
ReactDOM.render(<App messages={messages} />, document.getElementById('root'));
```

### [フォーム](https://ja.reactjs.org/docs/forms.html)

- HTML フォームはデフォルトでは submit 時にページ遷移をする
- submit 時に関数をよびだす形のふるまいにすることも可能で、これを Controlled Component とよぶ
  - 基本的には単に form タグの onSubmit で関数を呼び出し、内部で `event.preventDefault()` をよぶというもの

```
class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value})
  }

  handleSubmit(event) {
    alert('value: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Name: <input type="text" value={this.state.value} onChange={this.handleChange} /></label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

ReactDOM.render(<Form />, document.getElementById('root'));
```

- 各 state の変化に対するイベントハンドラの記述は面倒
- これを回避するために非制御コンポーネントという仕組みがある

```
class Form extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.input = React.createRef();
  }

  handleSubmit(event) {
    alert('value: ' + this.input.current.value);
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Name: <input type="text" defaultValue="default" ref={this.input} /></label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

ReactDOM.render(<Form />, document.getElementById('root'));
```

## [🙆‍♂️🙅 ゲームの作成](https://ja.reactjs.org/tutorial/tutorial.html#adding-time-travel)

チュートリアルに沿って ox ゲームを作成する

### プロジェクトの作成

```
$ npx create-react-app react-tutorial
$ cd react-tutorial
$ yarn start  # index.html が開く
```

### es-lint と prettier の導入

[Getting Started with ESLint](https://eslint.org/docs/user-guide/getting-started) を参照

```
$ # ES Lint の導入
$ yarn global add eslint
$ yarn add --dev eslint-plugin-react
$ yarn add --dev babel-eslint
$ code --install-extension dbaeumer.vscode-eslint
$ eslint --init
$
$ # prettier の導入
$ yarn global add prettier
$ code --install-extension esbenp.prettier-vscode
```

多分このままだと複数箇所エラーがでるので `.eslintrc.js` を以下のように設定

```
module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {}
};
```

### スターターコードの内容に合わせる

[チュートリアル：React の導入 – React](https://ja.reactjs.org/tutorial/tutorial.html#inspecting-the-starter-code) をみて `index.css` の中身を揃える

`index.js` は次のようにする

```
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

`App.js` は次のようなもの

```
import React, { Component } from 'react';
import './App.css';

class Square extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }
  render = () => (
    <button className='square' onClick={() => this.setState({ value: 'X' })}>
      {this.state.value}
    </button>
  );
}

class Board extends Component {
  renderSquare = i => <Square i={i.toString()} key={i} />;
  render() {
    const status = 'Next player: X';
    return (
      <div>
        <div className='status'>{status}</div>
        <div className='board-row'>
          {[0, 1, 2].map(i => this.renderSquare(i))}
        </div>
        <div className='board-row'>
          {[3, 4, 5].map(i => this.renderSquare(i))}
        </div>
        <div className='board-row'>
          {[6, 7, 8].map(i => this.renderSquare(i))}
        </div>
      </div>
    );
  }
}

class App extends Component {
  render = () => (
    <div className='game'>
      <div className='game-board'>
        <Board />
      </div>
    </div>
  );
}

export default App;
```

この状態にてひとまずクリックすると `X` がフィルインされる盤面ができあがったことになる

### ゲームのロジック実装

- 現在 `Square` が value ステートを持っているが、親コンポーネントがすべての `Square` の state を管理していないとゲームの勝敗判定ができない
  - `Square` の　 state を `Board` にリフトアップする必要がある

`Square` が持つ value を `Board` 側に values という形で持たせるようにリフトアップした形が以下のようなもの

```
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

class Square extends Component {
  static propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func.isRequired
  };
  render = () => (
    <button className='square' onClick={() => this.props.onClick()}>
      {this.props.value}
    </button>
  );
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: Array(9).fill(null)
    };
  }
  handleClick = i => {
    const newValues = this.state.values.slice();
    newValues[i] = 'X';
    this.setState({ values: newValues });
  };
  renderSquare = i => (
    <Square value={this.state.values[i]} onClick={() => this.handleClick(i)} />
  );
  render() {
    const status = 'Next player: X';
    return (
      <div>
        <div className='status'>{status}</div>
        <div className='board-row'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='board-row'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='board-row'>
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class App extends Component {
  render = () => (
    <div className='game'>
      <div className='game-board'>
        <Board />
      </div>
    </div>
  );
}

export default App;
```

- 先手・後手によるコマの違いは、Board に isFirstHand というステートを追加し、それに応じてロジックを書き換えれば OK
- すでにコマのおいてある箇所のイベント判定の無効化も実装

```
class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: Array(9).fill(null),
      isFirstHand: true
    };
  }
  handleClick = i => {
    if (this.state.values[i]) return;
    const newValues = this.state.values.slice();
    newValues[i] = this.state.isFirstHand ? 'O' : 'X';
    this.setState({ values: newValues, isFirstHand: !this.state.isFirstHand });
  };
  renderSquare = i => (
    <Square value={this.state.values[i]} onClick={() => this.handleClick(i)} />
  );
  render() {
    const status = 'Next player: ' + (this.state.isFirstHand ? 'O' : 'X');

...（以下略）
```

### リセットボタンを設置したもの

```
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

class ResetButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired
  };
  render = () => <button onClick={() => this.props.onClick()}>Reset</button>;
}

class Square extends Component {
  static propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func.isRequired
  };
  render = () => (
    <button className='square' onClick={() => this.props.onClick()}>
      {this.props.value}
    </button>
  );
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: Array(9).fill(null),
      isFirstHand: true
    };
  }
  reset = () => {
    this.setState({
      values: Array(9).fill(null),
      isFirstHand: true
    });
  };
  handleClick = i => {
    if (this.state.values[i]) return;
    const newValues = this.state.values.slice();
    newValues[i] = this.state.isFirstHand ? 'O' : 'X';
    this.setState({ values: newValues, isFirstHand: !this.state.isFirstHand });
  };
  renderSquare = i => (
    <Square value={this.state.values[i]} onClick={() => this.handleClick(i)} />
  );
  render() {
    const status = 'Next player: ' + (this.state.isFirstHand ? 'O' : 'X');
    return (
      <div>
        <div className='status'>{status}</div>
        <div className='board-row'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='board-row'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='board-row'>
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <div>
          <ResetButton onClick={() => this.reset()} />
        </div>
      </div>
    );
  }
}

class App extends Component {
  render = () => (
    <div className='game'>
      <div className='game-board'>
        <Board />
      </div>
    </div>
  );
}

export default App;
```

## フォームアプリケーションの作成

### プロジェクトの作成

create-react-app でプロジェクトを作った後 `yarn eject` で `webpack.config.js` とかを吐き出させてる

```
$ npx create-react-app react-form-app
$ cd react-form-app
$ yarn eject
$ eslint --init
$ yarn add --dev eslint-plugin-react
$ yarn add --dev babel-eslint
```

`.eslintrc.js` を以下のように変更

```
module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {}
};
```
