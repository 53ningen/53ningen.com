export const emptyToNull = (value: string | null | undefined): string | null => {
  return value === '' || value === undefined ? null : value
}
