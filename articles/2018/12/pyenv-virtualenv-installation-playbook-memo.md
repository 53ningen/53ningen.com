---
slug: pyenv-virtualenv-installation-playbook-memo
title: pyenv/virtualenv installation playbook
category: programming
date: 2018-12-06 19:01:30
tags: [virtualenv,python]
pinned: false
---

## pyenv

For RHEL

```
# pyenv/pyenv: Simple Python version management
# https://github.com/pyenv/pyenv#installation
sudo yum install git gcc zlib-devel bzip2-devel openssl-devel readline-devel sqlite sqlite-devel libffi-devel -y
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bash_profile
exec "$SHELL"
source ~/.bash_profile
pyenv install --list
pyenv install 3.5.0
pyenv global 3.5.0
```

## virtualenv

For RHEL

```
# see: Installation — pip 18.1 documentation
# https://pip.pypa.io/en/stable/installing/
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python get-pip.py

# Installation — virtualenv 16.1.0 documentation
# https://virtualenv.pypa.io/en/latest/installation/
sudo pip install virtualenv

cd /your/proj
virtualenv your_proj
source your_proj/bin/activate
```
