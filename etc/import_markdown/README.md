# markdown file 取り込み用スクリプト

あらかじめ ./tmp 下に `*.md` ファイルを配置したうえで下記を実行するとローカルの DynamoDB に記事データを取り込める

```
$ amplify mock api
$ cd ./etc/import_markdown
$ yarn dev
```
