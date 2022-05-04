---
title: ansible で git clone と remote add upstream を行う
category: programming
date: 2018-02-20 00:21:19
tags: [ansible, Git]
pinned: false
---

GitHub リポジトリをクローンして、 `git remote add upstream` した状態にしたいときは、 `remote: upstream` を指定すれば良い。例えば、 `git@github.com:example/example.git` を clone することを考えると、 ansible を次のように書けば OK。

```yaml
---
- name: clone repository
  become: yes
  become_user: maintainer
  git:
    repo: git@github.com:example/example.git
    dest: /path/to/repos
    remote: upstream
    accept_hostkey: yes
  when: not check_repos.stat.exists
```

詳細は [Ansible 公式ドキュメント `git module`](http://docs.ansible.com/ansible/latest/git_module.html) を参照してください。
