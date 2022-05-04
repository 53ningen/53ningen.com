---
title: phax/ph-cssを使う
category: programming
date: 2016-10-09 19:43:08
tags: [Java, CSS]
pinned: false
---

[phax/ph-css](https://github.com/phax/ph-css) の使い方

```
// parsing css and get CSSOM
final CascadingStyleSheet css = CSSReader.readFromString(
                ".index h1,\n" +
                ".index h2,\n" +
                ".index h3,\n" +
                ".index h4,\n" +
                ".index h5,\n" +
                ".index h6 {\n" +
                "    font-family: \"ヒラギノ明朝 ProN W3\", \"HiraMinProN-W3\", serif;\n" +
                "    font-size: large;\n" +
                "}", ECSSVersion.CSS30);

// writing css
final String writtenCss = new CSSWriter(ECSSVersion.CSS30).getCSSAsString(css);
```

<img src="http://53ningen.com/wp-content/uploads/2016/10/b080e264-d67f-11e4-845e-c1f3fdff6678.png" alt="b080e264-d67f-11e4-845e-c1f3fdff6678" width="828" height="490" class="aligncenter size-full wp-image-670" />

便利
