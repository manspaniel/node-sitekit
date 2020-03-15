export function fromEntries(entries: [string, any][]) {
  const result: { [key: string]: any } = {}
  for (const entry of entries) {
    result[entry[0]] = entry[1]
  }
  return result
}
