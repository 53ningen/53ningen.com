---
slug: python-zatsumu-cheat
title: python 定型処理チートシート
category: programming
date: 2019-02-01 02:44:13
tags: [python]
pinned: false
---

- bash より python のほうがベンリだったり、FaaS で動かせたりするので、ちょっとした雑務を bash から python, ruby あたりを使うようにしていきたい
- 同じ内容を二度ググらないよう、ググったらここにまとめる
- 環境により python のバージョン問題があるので確認したい

## 統計処理

### 最大値・最小値・平均値・中央値

Python 3.x

```python
$ cat ./stat_py3.py
from statistics import mean, median

values = input()

print(f"max: {max(values)}")
print(f"min: {min(values)}")
print(f"average: {mean(values)}")
print(f"median: {median(values)}")

$ python3 ./stat_py3.py "[1,2,2,3,3,3,4,4,4,4,5,5,5,5,5]"
max: 5
min: 1
average: 3.6666666666666665
median: 4
```

### http request

python 3 標準ライブラリ: `urllib.request`

```python
import json
import urllib.request

def lambda_handler(event, context):
    url = 'http://example.com'
    response = urllib.request.urlopen(url)
    print(response.getcode())
    html = response.read()
    print(html.decode('utf-8'))
```
