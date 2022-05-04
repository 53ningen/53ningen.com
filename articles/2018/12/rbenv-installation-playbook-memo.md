---
title: rbenv installation playbook
category: programming
date: 2018-12-06 14:16:38
tags: [Ruby, rbenv]
pinned: false
---

for RHEL

```
# see: rbenv/rbenv: Groom your app’s Ruby environment
# https://github.com/rbenv/rbenv
sudo yum update -y
sudo yum install git gcc openssl-devel readline-devel zlib-devel -y
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src
echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile

# see: rbenv/ruby-build: Compile and install Ruby
# https://github.com/rbenv/ruby-build#installation
cd /tmp
git clone https://github.com/rbenv/ruby-build.git
sudo PREFIX=/usr/local ./ruby-build/install.sh

# doctor
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash

# install ruby & bundler
rbenv install --list
rbenv install 2.3.8
rbenv exec gem install bundler
```
