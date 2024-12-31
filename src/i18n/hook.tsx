'use client'

import React, { createContext, FC, ReactNode } from 'react'
import { getDictionary } from './dictionaries'

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>

const DictionaryContext = createContext<Dictionary | undefined>(undefined)

type Props = {
  dictionary: Dictionary
  children: ReactNode
}

export const DictionaryProvider: FC<Props> = ({ dictionary, children }) => {
  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>
}

export function useDictionary() {
  const dictionary = React.useContext(DictionaryContext)
  return dictionary!
}
