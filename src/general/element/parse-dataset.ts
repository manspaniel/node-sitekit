export function parseDataset(element: HTMLElement) {
  const result: { [k: string]: any } = {}
  const keys = Object.keys(element.dataset)
  for (let key of keys) {
    try {
      result[key] = JSON.parse(element.dataset[key])
    } catch (e) {
      result[key] = element.dataset[key]
    }
  }
  return result
}
