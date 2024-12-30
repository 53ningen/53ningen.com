'use server'

export type DataTableState = {
  message?: string
  error?: string
}

export type DataTablePayload = {
  targetRow?: number
  action: 'delete' | 'update' | 'add'
  formData: FormData
}

export type DataTableKey = { key: string; editable?: boolean; required?: boolean }

export type DataTableAction = (previousState: DataTableState, payload: DataTablePayload) => Promise<DataTableState>

export const dataTableNoOpAction = async (previousState: DataTableState): Promise<DataTableState> => {
  return previousState
}
