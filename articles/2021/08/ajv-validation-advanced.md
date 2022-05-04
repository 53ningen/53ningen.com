---
title: Ajv の JTDSchemaType で複雑な JSON オブジェクトをバリデーションする
category: programming
date: 2021-08-22 02:31:41
tags: [TypeScript, Ajv]
pinned: false
---

Ajv の JTDSchemaType で複雑な JSON オブジェクトをバリデーションする際の記述方法がわからなくて 30 分くらい溶けたのでメモっておきます。

## 配列

```
export interface AppParameters {
    items: string[]
}

const AppParametersSchema: JTDSchemaType<AppParameters> = {
    properties: {
        items: { elements: { type: 'string' } },
    },
    optionalProperties: {
    },
    additionalProperties: false
}
```

## マップ

```
export interface AppParameters {
    map: { id: string }
}

const AppParametersSchema: JTDSchemaType<AppParameters> = {
    properties: {
        map: { properties: { id: { type: 'string' } } },
    },
    optionalProperties: {
    },
    additionalProperties: false
}
```

## ネストされたマップ

```
export interface AppParameters {
    nestedMap: { childMap: { id: string } }
}

const AppParametersSchema: JTDSchemaType<AppParameters> = {
    properties: {
        nestedMap: { properties: { childMap: { properties: { id: { type: 'string' } } } } }
    },
    optionalProperties: {
    },
    additionalProperties: false
}
```

## Enum

```
export interface AppParameters {
    abc?: 'A' | 'B' | 'C'
}

const AppParametersSchema: JTDSchemaType<AppParameters> = {
    properties: {
    },
    optionalProperties: {
        abc: { enum: ['A', 'B', 'C'] }
    },
    additionalProperties: false
}
```

## 色々まとめ

```
import Ajv, { JTDSchemaType } from "ajv/dist/jtd"

export interface AppParameters {
    str: string
    items: string[]
    map: { id: string }
    nestedMap: { childMap: { id: string } }
    optionalNestedMap?: { childMap: { id: string } },
    abc?: 'A' | 'B' | 'C'
}

const AppParametersSchema: JTDSchemaType<AppParameters> = {
    properties: {
        str: { type: 'string' },
        items: { elements: { type: 'string' } },
        map: { properties: { id: { type: 'string' } } },
        nestedMap: { properties: { childMap: { properties: { id: { type: 'string' } } } } }
    },
    optionalProperties: {
        optionalNestedMap: { properties: { childMap: { properties: { id: { type: 'string' } } } } },
        abc: { enum: ['A', 'B', 'C'] }
    },
    additionalProperties: false
}

const validateAppSecrets = new Ajv().compile(AppParametersSchema)

const objects: object[] = [
    {},
    {
        str: '1',
        items: [],
        map: { id: '2' },
        nestedMap: { childMap: { id: '3' } }
    } as AppParameters,
    {
        str: '1',
        items: [],
        map: { id: '2' },
        nestedMap: { childMap: { id: '3' } },
        abc: 'A'
    } as AppParameters,
    {
        str: '1',
        items: [],
        map: { id: '2' },
        nestedMap: { childMap: { id: '3' } },
        abc: 'D'
    },
    {
        str: '1',
        items: [],
        map: { id: '2' },
        nestedMap: { childMap: { id: '3' } },
        optionalNestedMap: { childMap: { id: '4' } },
    } as AppParameters,
    {
        str: '1',
        items: [],
        map: { id: '2' },
        nestedMap: { childMap: { id: '3' } },
        gomi: {}
    } as AppParameters
]

for (const obj of objects) {
    const res = validateAppSecrets(obj)
    console.log(`${JSON.stringify(obj)} is valid: ${res}`)
}

```
