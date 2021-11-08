---
slug: jakarta-commons-cli
title: Jakarta Commons CLI
category: programming
date: 2016-10-09 19:48:27
tags: [Java]
pinned: false
---

- [Jakarta Commons CLI](http://builder.japan.zdnet.com/tool/20362689/)
  - コマンドライン引数をパースしてという CLI(Command Line Interface)
  - Options: 受け取れるオプション
  - addOption で受け取れる引数を追加していく
  - parser.parse(options, args)とするとパースした結果を得られる

```java
import org.apache.commons.cli.base.*;

final Options options = new Options();
final Option helpOpt = OptionBuilder
                .hasArg(false)
                .withArgName("help")
                .isRequired(false)
                .withDescription("このヘルプ")
                .withLongOpt("help")
                .create(HELP_OPT);
options.addOption(helpOpt);
final CommandLineParser parser = new BasicParser();
final CommandLine commandLine = null;

try {
    commandLine = parser.parse(options, args);
} catch (ParseException e) {
    new HelpFormatter().printHelp("homura help", options)
    System.exit(1);
}
```
