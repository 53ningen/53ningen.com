---
title: ansible の vault を使う
category: programming
date: 2017-12-31 15:51:52
tags: [ansible]
pinned: false
---

この作業ひさびさにやると忘れてるので、自分用のメモ書き

- [公式ドキュメント](https://docs.ansible.com/ansible/2.4/vault.html)によると以下のような感じで string を encrypt できる

```
ansible-vault encrypt_string --vault-id a_password_file 'foobar' --name 'the_secret'
```

playbook 実行時に vault password file をいちいち指定するのはクソだるなので、`ansible.cfg` に設定しておくとよさげ。

```
[defaults]
vault_password_file = ../vault-password
```

この設定いれてるときは encrypt 時にも --valut-id を渡す必要がなくなる

```
 ansible-vault encrypt_string 'foobar' --name 'the_secret'
```

ベンリ
