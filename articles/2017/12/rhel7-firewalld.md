---
title: RHEL7 系の Firewall 設定
category: programming
date: 2017-12-28 22:51:00
tags: [RHEL7, CentOS7, network, firewalld]
pinned: false
---

RHEL7 系のネットワーク設定全般については [RHEL7 系のネットワーク設定](https://53ningen.com/rhel7-networking/) にまとめた

## firewalld とは

- RHEL6 系までは `iptables` が利用されていた
- RHEL7 系では `firewalld` がデフォルトとなった
- `firewalld` は、デフォルトで `iptables`、`ip6tables`、`ebtables` のリストアコマンドを使用し、ルールセットを変更する全ファイアウォールアクションを高速化する
- CLI ツールとして `firewall-cmd`、GUI ツールとして `firewall-config` が用意されている
- firewalld が提供するファイアウォールのサービスは、設定の変更はいつでも可能で即座に実行される
  - 変更は保存したり適用したりする必要がない
- firewalld の設定は `/usr/lib/firewalld/` と `/etc/firewalld/` に保存される

```
# Firewall 設定の起動/終了/再起動/確認
$ systemctl start firewalld
$ systemctl stop firewalld
$ systemctl restart firewalld
$ systemctl status firewalld

# Firewall の有効化/無効化
$ systemctl enable firewalld
$ systemctl disable firewalld

# Firewall 設定の確認
$ firewall-cmd --list-service
dhcpv6-client ssh
```

### 情報ソース

- [ファイアウォールの使用](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/security_guide/sec-using_firewalls)

## firewalld と system-config-firewall および iptables との比較

`firewalld` と `iptables`(`ip6tables`) の本質的な違いは以下の 2 つ

- 設定ファイルの場所が違う
  - `iptables` は設定を `/etc/sysconfig/iptables` と `/etc/sysconfig/ip6tables` に保存する
  - `firewalld` は設定を `/usr/lib/firewalld/` と `/etc/firewalld/` に保存する
  - RHEL7 の初期状態では `firewalld` がデフォルトでインストールされるので `/etc/sysconfig/iptables` ファイルが存在しない
- 設定追加に iptables は全て再読み込みを行うが、firewalld は差分更新のみを行う
  - firewalld では既存の接続が瞬断されることなく設定追加が可能

### 情報ソース

- [firewalld と system-config-firewall および iptables との比較](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/security_guide/sec-using_firewalls)

## firewall-cmd コマンドラインツールを使用したファイアウォールの設定

### ゾーンの設定

- firewalld には典型的な設定のテンプレートである**ゾーン**が用意されている
- ゾーンの種類は以下のとおり
  - drop
  - block
  - public
  - external
  - dmz
  - work
  - home
  - internal
  - trusted

ゾーンの設定と確認方法は以下のとおり

```
# 確認
$ firewall-cmd --get-active-zones
public
  interfaces: ens192 ens224

# 設定変更
$ firewall-cmd --zone=trusted --add-interface=ens192
The interface is under control of NetworkManager, setting zone to 'trusted'.
success
$ firewall-cmd --get-active-zones
public
  interfaces: ens224
trusted
  interfaces: ens192
```

### ポート開放

- dmz ゾーンに対して、ポート 8080 への TCP トラフィックを許可する場合は以下のようなかたち
- かならず `--parmanent` で永続化する

```
$ firewall-cmd --zone=dmz --add-port=8080/tcp
$ firewall-cmd --zone=dmz --add-port=8080/tcp --permanent
```

サービスを追加する場合は以下のようにできる

```
# 80 を開放
$ firewall-cmd --zone=work --add-service=http
$ firewall-cmd --zone=work --add-service=http --parmanent

# 443 を開放
$ firewall-cmd --zone=work --add-service=https
$ firewall-cmd --zone=work --add-service=https --parmanent

# 確認
$ firewall-cmd --zone=public --list-all
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: ens192 ens224
  sources:
  services: dhcpv6-client ssh http https
  ports:
  protocols:
  masquerade: no
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
```

### 情報ソース

- [firewall-cmd コマンドラインツールを使用したファイアウォールの設定](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/security_guide/sec-using_firewalls)

[amazon template=wishlist&asin=4774184268]
