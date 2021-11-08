---
slug: ansible-source-exec
title: ansible のソースコードを実行する
category: programming
date: 2016-11-14 17:17:00
tags: [ansible]
pinned: false
---

ansible のソースコードを直接実行したい

- 頻繁にバージョンを切り替えたり、なんなり色々したい

```
git clone git://github.com/ansible/ansible.git --recursive
cd ./ansible
source ./hacking/env-setup
# sudo easy_install pip    #=> まだ pip がはいっていないとき
sudo pip install paramiko PyYAML Jinja2 httplib2 six
git checkout #お好きなコミット#
ansible --version #=> コミットに対応するバージョンが用いられる

# 起動時に ansible にパスを通す
echo 'source (ansible_working_dir)/hacking/env-setup -q' >> ~/.bash_profile
```
