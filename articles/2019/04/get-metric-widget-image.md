---
title: CloudWatch メトリクスのグラフを AWS CLI から取得する
category: programming
date: 2019-04-02 23:28:40
tags: [CloudWatch]
pinned: false
---

CloudWatch メトリクスでいい感じに表示したグラフは、そのままそっくり AWS CLI からも（もちろん各 SDK からも）取得できます。

AWS CLI からは [get-metric-widget-image](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-widget-image.html) を利用しますが、パラメータの `--metric-widget` を自力で組み立てるのはかなり面倒です。

CloudWatch メトリクスでグラフを表示したまま "ソース" タブを開いてイメージ API ボタンを選択すると、この `--metric-widget` にて指定する JSON がまるまる取得できるので、これをそのままローカルに保存。

次のようなコマンドでグラフが取得できます

```
$ aws cloudwatch get-metric-widget-image --metric-widget file://widget.json | jq -r '.MetricWidgetImage' | base64 --decode > ./graph.png
$ open ./graph.png
```

とても便利。
