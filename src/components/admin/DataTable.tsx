'use client'

import { useActionState } from 'react'
import { BiEdit, BiEraser } from 'react-icons/bi'
import { CgAddR } from 'react-icons/cg'
import Banner from '../common/Banner'
import Button from '../form/Button'
import TextField from '../form/TextField'
import { DataTableAction, DataTableKey, dataTableNoOpAction } from './DataTableTypes'

type Props = {
  options?: {
    ediable?: boolean
    deletable?: boolean
    addable?: boolean
  }
  keys: DataTableKey[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  action?: DataTableAction
}

const defaultOptions = { ediable: false, deletable: false, addable: false }

const DataTable = ({ keys, data, action = dataTableNoOpAction, options = defaultOptions }: Props) => {
  const [state, dispatch, pending] = useActionState(action, {})
  return (
    <div className="flex flex-col gap-2">
      {state.error && <Banner type="error" message={state.error} />}
      {state.message && <Banner type="info" message={state.message} />}
      <form className="overflow-x-scroll text-sm">
        <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {keys.map(({ key }, index) => (
                <th key={index} className="px-1 py-2">
                  {key}
                </th>
              ))}
              {(options.ediable || options.deletable) && <th className="w-px" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {keys.map(({ key, editable }, keyIndex) => (
                  <td key={keyIndex} className="px-1 py-1">
                    <TextField
                      name={`${rowIndex}.${key}`}
                      defaultValue={row[key] as string}
                      readOnly={!editable}
                      className={`w-full ${!editable && 'bg-gray-100'}`}
                    />
                  </td>
                ))}
                {(options.ediable || options.deletable) && (
                  <td className="flex gap-2 py-1 px-2 justify-end">
                    {options.ediable && (
                      <Button formAction={(formData) => dispatch({ action: 'update', targetRow: rowIndex, formData })} disabled={pending}>
                        <BiEdit />
                      </Button>
                    )}
                    {options.deletable && (
                      <Button
                        formAction={(formData) => dispatch({ action: 'delete', targetRow: rowIndex, formData })}
                        disabled={pending}
                        theme="danger">
                        <BiEraser />
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {options.addable && (
              <tr>
                {keys.map(({ key, editable }, keyIndex) => (
                  <td key={keyIndex} className="px-1 py-1">
                    <TextField name={`new.${key}`} readOnly={!editable} className={`w-full ${!editable && 'bg-gray-100'}`} />
                  </td>
                ))}
                <td className="flex gap-2 py-1 px-2 justify-end">
                  <Button formAction={(formData) => dispatch({ action: 'create', formData })} disabled={pending}>
                    <CgAddR />
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </form>
    </div>
  )
}

export default DataTable
