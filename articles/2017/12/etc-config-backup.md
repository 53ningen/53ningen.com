---
slug: etc-config-backup
title: /etc 下には設定のバックアップファイルを置かない方が良い
category: programming
date: 2017-12-25 23:38:08
tags: [RHEL,ネットワーク,OS]
pinned: false
---

というふうに [RHEL7 のマニュアル](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-network_configuration_using_sysconfig_files)に書いてあった。このオペレーションやったことはないと思うけど、ふとした時にやってしまいそうなのでメモ。


> ifcfg のバックアップファイルは、使用中のファイルと別の場所に保存することが推奨されます。このスクリプトは、 .old、.orig、.rpmnew、.rpmorig、および .rpmsave の拡張子のみを ifcfg-* で exclude を文字通り実行します。/etc/ ディレクトリー内にはバックアップファイルを保存しないことが最善の方法になります。

微妙に翻訳が怪しいので、[英語版](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/sec-network_configuration_using_sysconfig_files)も引用しておこう。

> It is recommended not to store backup ifcfg files in the same location as the live ones. The script literally does ifcfg-* with an exclude only for these extensions: .old, .orig, .rpmnew, .rpmorig, and .rpmsave. The best way is not to store backup files anywhere within the /etc directory.


ifcfg の設定を変えようとして ifcfg-eth0.bak というファイルなんて名前でバックアップ取ったものを /etc/sysconfig/network-scripts 以下においておくとそれも読まれてしまうというような意味に見える。ひとまず、/etc 下には余計なバックアップファイルを置かないように気をつける。それが best way って書いてあるし...。
