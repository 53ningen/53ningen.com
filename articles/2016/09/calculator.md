---
title: 電卓を作る
category: programming
date: 2016-09-22 15:45:50
tags: [C++, プログラミング言語, yacc, lex]
pinned: false
---

[プログラミング言語を作る](http://amzn.to/2d2mXPY)の 2 章を読み進めた記録。興味があったけど手を出せずにいた自作プログラミング言語ですが、[この記事](http://blog.sigbus.info/2014/11/blog-post.html)を読んでまあつべこべ言わず手を動かそうと決心して、コードを書き始めた。成果物は[ここ](https://github.com/53ningen/dentaku)にあります。

# 処理系のうごき

プログラミング言語の処理系は通常以下のような流れで動く

1. **字句解析**: ソースコードをトークンの並びに分割する。字句解析を行うプログラムのことをレキシカルアナライザと呼ぶ。
2. **構文解析**: トークンの並びから抽象構文木を構築する。構文解析を行うプログラムのことをパーサと呼ぶ。
3. **意味解析**: 抽象構文木に対して、データ型などの意味的な解釈を行う。
4. **コード生成**: 機械語やバイトコードなどを吐き出す

# 電卓プログラムの字句解析

lex というレキシカルアナライザを自動生成してくれるツールを使う。UNIX 系の OS であれば最初から入っていることが多い。定義には正規表現を使う。

```
# 定義部: 必要なヘッダファイルや関数などを定義できる
%{
#include <stdio.h>

# 後ほど yacc によって生成されるヘッダファイルを include する
#include "y.tab.h"

# いまはおまじない的な理解でok
int yywrap(void) {
    return 1;
}
%}

# 規則部: 正規表現でマッチした場所の後ろのCコードが実行される
#     return で返されている書くシンボルは
#     yacc によって生成された y.tab.h の中で定義したものトークンに対応する
%%
"+"     return ADD;
"-"     return SUB;
"*"     return MUL;
"/"     return DIV;
"("     return LP;
")"     return RP;
"\n"    return CR;
([1-9][0-9]*)|0|([0-9]+\.[0-9]+) {
    double temp;
    sscanf(yytext, "%lf", &temp);
    yylval.double_value = temp;
    return DOUBLE_LITERAL;
}
[ \t]|[\s];
. {
    fprintf(stderr, "lexical error.\n");
    exit(1);
}
%%
```

# 電卓プログラムの構文解析

yacc というパーサを自動生成してくれるツールを使う。

```
# 定義部: いろいろと自由に定義できる場所
%{
#include <stdio.h>
#include <stdlib.h>
#define YYDEBUG 1
%}
# トークンと非終端子のとりうる型を共用体で表現している
# いまのところ double_value しかつかわれる見込みがないが、まあ例として...
%union {
    int     int_value;
    double  double_value;
}
# トークンの宣言： %token <TYPE> SYMBOL1, SYMBOL2...
%token <double_value>       DOUBLE_LITERAL
%token ADD SUB MUL DIV LP RP CR
%type <double_value> expression term primary_expression # 非終端子の型を定義している

# 規則部: 構文規則とCで書かれたアクション
%%
line_list
    : line
    | line_list line
    ;
line
    : expression CR
    {
        printf(">>%lf\n", $1);
    }
expression
    : term
    | expression ADD term
    {
        $$ = $1 + $3;
    }
    | expression SUB term
    {
        $$ = $1 - $3;
    }
    ;
term
    : primary_expression
    | term MUL primary_expression
    {
        $$ = $1 * $3;
    }
    | term DIV primary_expression
    {
        $$ = $1 / $3;
    }
    ;
primary_expression
    : DOUBLE_LITERAL
    | LP expression RP
    {
        $$ = $2;
    }
    | SUB DOUBLE_LITERAL
    {
        $$ = -$2;
    }
    ;
%%
int
yyerror(char const *str)
{
    extern char *yytext;
    fprintf(stderr, "parser error near %s\n", yytext);
    return 0;
}

int main(void)
{
    extern int yyparse(void);
    extern FILE *yyin;

    yyin = stdin;
    if (yyparse()) {
        fprintf(stderr, "Error ! Error ! Error !\n");
        exit(1);
    }
}
```

構文規則だけを抜き出すと以下のような感じ？

```
line_list  := line | line_list line
line       := expression CR
expression := term | expression AND term | expression SUB term
term       := primary_expression | term MUL primary_expression | term DIV primary_expression
primary_expression := DOUBLE_LITERAL | LP expression RP | SUB DOUBLE_LITERAL
```

# 動かす

Makefile を書いた

```
all: calc
y.tab.c: calc.y
 yacc -dv $<
lex.yy.c: calc.l
 lex $<
calc: y.tab.c lex.yy.c
 $(CC) -o $@ $^
```

以下のような感じ

```
$ make
$ ./calc
1+2
>>3.000000
1+2*3
>>7.000000
```

コマンドラインから、温かみのある手動ビルドをしたいときは以下のような具合

```
$ yacc -dv calc.y
$ lex calc.l
$ cc -o calc y.tab.c lex.yy.c
```

# shift と reduce

パーサーのうごきをちゃんと押さえておく。1 + 2 \* 3 という入力があったときの動きは以下の通り。

1. `1` (shift) next: `AND`
1. `primary_expression` (reduce) next: `AND`
1. `term` (reduce) next: `AND`
1. `expression` (reduce) next: `AND`
1. `expression` `AND` (shift) next: `2`
1. `expression` `AND` `2` (shift) next: `MUL`
1. `expression` `AND` `primary_expression` (reduce) next: `MUL`
1. `expression` `AND` `term` (reduce) next: `MUL`
1. `expression` `AND` `term` `MUL` (shift) next `3`
1. `expression` `AND` `term` `MUL` `3` (shift) next `CR`
1. `expression` `AND` `term` `MUL` `primary_expression` (reduce) next `CR`
1. `expression` `AND` `term` (reduce) next `CR`
1. `expression` (reduce) next `CR`
1. `expression` `CR` (shift)
1. `line` (reduce)
1. `line_list` (reduce)

# スタックの動き

- `2 * 3` を reduce する際は、 `term := term MUL primary_expression { $$ = $1 * $3; }` の規則に従う
- `$1 = 2`, `$2 = *`, `$3 = 3` として、 新しい `term` には `$$ = 2 * 3` が格納される
- `{}` を書かなかった場合は `$$ = $1` が補われる
- つまり `1` => `primary_expression($$ = 1)` => `term($$ = 1)` => `expression($$ = 1)` みたいな感じになっている
