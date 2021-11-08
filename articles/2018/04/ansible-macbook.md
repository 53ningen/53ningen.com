---
slug: ansible-macbook
title: 寝てる間に MacBook の環境構築を終わらせる
category: programming
date: 2018-04-20 23:25:14
tags: [ansible, mac]
pinned: false
---

開発にメインで使っている MacBook Pro がいつ壊れても良いように環境構築の 9 割程度を Anisble 化している。どんな感じにやっているのかをご紹介 + 自分用のメモとして書き下します。

Windows 環境も構築を自動化したいけど面倒でやっていない。Windows 自体は普段使い（だらだらネットを巡回）とかでは好きだけど、最近あまりその上で開発をゴリゴリやることはないので、ひとまず macOS について。

## MacBook 初回起動時の儀式

このあたりは完全に自動化できてないけどまあ 3 分で終わるので...

- Command Line Tool のインストール
  - 最初に git ほにゃらら っていれるとインストールしろよ〜って言われるので指示に従う
- homebrew, Ansible のインストール
  - 2 行で終わる & 構築自動化のファンダメンタルな部分なので、サクッと手打ちしている
- MacBook 　環境構築用 Ansible リポジトリの clone

```sh
# homebrew のインストール
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Ansible のインストール
brew install ansible

# 環境構築用 Ansible の clone
git clone ......
cd ......
```

## Ansible

- アプリのインストールや、設定ファイルの変更はほぼ Ansible 化済み
- だいたい以下のようなことを自動で行う（わりとみんなが使いそうな部分を抜粋）
  - `brew install`, `brew cask install`
  - atom と atom パッケージのインストールと
  - 「英かな」のインストールと設定
  - `better touch tool` のインストールと設定
  - `sudoer` の設定
  - `bash` の設定
  - `git` の設定
  - `ssh_config` の設定
  - apple の plist 系書き換え

### 必要なアプリケーションのインストール

- コマンドラインツールは `homebrew` で管理
  - jq, tmux, tree とかいろんなものを入れている
  - BSD grep などを GNU grep などに差し替えたりもしている
- Mac アプリケーションも `homebrew cask` で管理

```yaml
---

- name: brew update
  homebrew:
    update_homebrew: yes

- name: brew install
  homebrew:
    name: "{{ item }}"
    state: present
  with_items: "{{ homebrew_packages }}"

- name: brew install with options
  homebrew:
    name: "{{ item.name }}"
    state: present
    install_options: "{{ item.options }}"
  with_items: "{{ homebrew_packages_with_options }}"

- name: add homebrew tap repos
  homebrew_tap:
    tap: "{{ item }}"
    state: present
  with_items:
    - caskroom/cask
    - caskroom/versions

- name: brew cask install
  homebrew_cask:
    name: "{{ item }}"
    state: present
  with_items: "{{ homebrew_cask_packages }}"
  ignore_errors: yes

 # var file
 ---

homebrew_packages:
  - ansible
  - awscli
  - bash-completion
  - binutils
  - boost
  - coreutils
  - ...

homebrew_packages_with_options:
  - name: findutils
    options: with-default-names
  - name: grep
    options: with-default-names
  - name: gnu-sed
    options: with-default-names
  - name: gnu-tar
    options: with-default-names
  - name: gzip
    options: with-default-names
  - name: gawk
    options: with-default-names

homebrew_cask_packages:
  - google-chrome
  - iterm2
  - slack
  - xquartz
  - bettertouchtool
  - ...
```

### atom のインストールとプラグインの導入

- atom のプラグインを入れるのがクソ面倒なので、自動化した
- 裏側で apm 使ってる

```yaml
---
- name: brew cask install atom
  homebrew_cask:
    name: atom
    state: present
  ignore_errors: yes
  when: ansible_os_family == 'Darwin'

- name: apm login
  command: 'apm login --token {{ apm_token }}'
  changed_when: no

- name: apm stars --install
  command: 'apm stars --install'
  changed_when: no
```

### 英かなのインストールと設定

- hjkl で移動したいだけ
- 設定ファイルをまるまる配置している

```yaml
--

- name: brew install
  homebrew_cask:
    name: cmd-eikana
    state: present

- name: create config file
  copy:
    src: io.github.imasanari.cmd-eikana.plist
    dest: "{{ user_home_dir }}/Library/Preferences/io.github.imasanari.cmd-eikana.plist"
```

### Better Touch Tool の設定

- three finger tap を middle click に差し替え
- マウスポインタの移動速度を超速にしている
  - 遅いと指が疲れる

```yaml
---
- name: create .bttconfig.json
  template:
    src: .bttconfig.json.j2
    dest: '{{ user_home_dir }}/.bttconfig.json'
  tags: config_btt
```

### sudoer の設定

```yaml
---
- name: config sudoers
  become: yes
  become_user: root
  lineinfile:
    path: /etc/sudoers
    state: present
    regexp: '^%admin\s+ALL'
    line: '%admin ALL = (ALL) NOPASSWD: ALL'
    validate: 'visudo -cf %s'
```

### bash の設定

- 自分の `.bash_profile` とかを置いてる

```yaml
---
- homebrew:
    name: bash
    path: /usr/local/bin/
    state: present
  when: ansible_os_family == 'Darwin'

- name: check if exists bash on macOS
  command: /usr/local/bin/bash --version
  register: check_bash_version
  when: ansible_os_family == 'Darwin'
  changed_when: no

- name: change shell
  become: yes
  command: 'chsh -s '/usr/local/bin/bash' {{ login_user_name }}'
  when: ansible_os_family == 'Darwin' and check_bash_version.rc == 0

- name: create .inputrc
  template:
    src: .inputrc.j2
    dest: '{{ user_home_dir }}/.inputrc'

- name: create .bash_alias
  template:
    src: .bash_alias.j2
    dest: '{{ user_home_dir }}/.bash_alias'

- name: create .bash_profile
  template:
    src: .bash_profile.j2
    dest: '{{ user_home_dir }}/.bash_profile'
```

### git の設定

- `.gitconfig` の配置

```yaml
---
- name: create .gitconfig
  template:
    src: .gitconfig.j2
    dest: '{{ user_home_dir }}/.gitconfig'

- name: create .gitignore_global
  template:
    src: .gitignore_global.j2
    dest: '{{ user_home_dir }}/.gitignore_global'
```

### /etc/hosts の設定

- 配置するだけ

```yaml
---
- name: create /etc/hosts
  become: yes
  template:
    src: hosts.j2
    dest: /etc/hosts
```

### ~/.ssh/config の設定

- これも設定を配置するだけ
  - ssh セッションを維持したり、特定のホスト向けの設定とか、多段 SSH 設定などを書いてる

```yaml
---
- name: create ~/.ssh/config
  template:
    src: .ssh_config.j2
    dest: '{{ user_home_dir }}/.ssh/config'
    mode: 0644
```

- こっちが config

```yaml
Host *
UseKeychain yes
AddKeysToAgent yes

ServerAliveInterval 30

Host *.*.compute.amazonaws.com
User ec2-user

Host piyo-kuso
HostName piyo-kuso
ProxyCommand ssh -W %h:%p hoge-fuga
```

### apple の plist 系書き換え

macOS のバージョンによって結構変わるかも。アップグレードする際は要注意。Sierra, Hight Sierra 間で動くもの、動かないものが別れるけど、両方で動いてるっぽいものを中心に掲載。自己責任で使ってください。いじる前にバックアップとったほうがいいよ（`defaults read > ~/Desktop/defaults.plist`）。

- キーリピートの速度を爆速にしたり、判定待ち時間を短くしたりしてる
  - 遅いとダルい
  - キーボードは push より pull の動作が大切、実質打楽器

```
---

- name: キーリピート検知待ち時間
  osx_defaults:
    key: InitialKeyRepeat
    type: int
    value: 10
    state: present

- name: キーリピート間隔時間
  osx_defaults:
    key: KeyRepeat
    type: int
    value: 1
    state: present
```

- Dock の要らない奴らを一層する
- Dock autohide 設定

```
- name: Dock autohide
  osx_defaults:
    domain: com.apple.dock
    key: autohide
    type: bool
    value: true
    state: present
```

- 各種表示フォーマット設定

```
- name: バッテリー残量設定
  osx_defaults:
    domain: com.apple.menuextra.battery
    key: ShowPercent
    type: string
    value: YES
    state: present

- name: 時刻表示設定
  osx_defaults:
    domain: com.apple.menuextra.clock
    key: DateFormat
    type: string
    value: "M\\U6708d\\U65e5(EEE)  H:mm:ss"
    state: present
```

- トラックパッド系

```
- name: トラックパッド右クリックの有効化
  osx_defaults:
    domain: com.apple.AppleMultitouchTrackpad
    key: TrackpadCornerSecondaryClick
    type: int
    value: 2
    state: present

- name: トラックパッドタップの有効化
  osx_defaults:
    domain: com.apple.AppleMultitouchTrackpad
    key: Clicking
    type: int
    value: 1
    state: present

- name: ライブ変換の無効化
  osx_defaults:
    domain: com.apple.inputmethod.Kotoeri
    key: JIMPrefLiveConversionKey
    type: int
    value: 0
    state: present
```

他にも色々あるけど、好みの色が激しくなってきそうなのでこのあたりで...。

## PC 間で同期しておきたいファイル

- Dropbox（雑多な色々）, Amazon Drive（写真系）, Amazon WorkDocs（文書系） を併用している
- 基本、文書などローカルだけにおいておかないようにする
- コードは WIP でもブランチ切ってこまめにリモートにプッシュ

## ブラウザのブックマークやプラグイン

- Ansible が入れてくれた Chrome を立ち上げ、ログインして、同期をかけるとブックマークとかプラグインが共有されているのでベンリ

## Dock の設定

- Sierra 環境で作った Ansible が High Sierra でうまい具合に動かなかったっぽいので、掲載は見送った
- Sierra では基本は `com.apple.Dock` に入ってるので以下のようなコマンドで邪魔な初期で Dock に設定されている諸々を一掃できる
  - dash はひとつであることに注意

```
defaults write com.apple.Dock persistent-apps -array
```

## さいごに

- 再起動
- 細かなことはまだまだたくさんあるけど、ここまでやっておけば、だいたいストレスなく使えるようになっているのでは
- 寝てる間とか書いておきながら実際はこの記事書いてて寝てないので、そんな人間はなにをやってもダメ

以下、みなさんのベストプラクティスをコメントする大喜利会場
