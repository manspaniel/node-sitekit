type Node<T> = {
  children: T[]
  parent: T | null
}

export function traverse<T extends Node<T>>(
  node: T,
  forEachNode: (node: T) => any
) {
  forEachNode(node)
  if (node.children.length) {
    node.children.forEach(node => traverse(node, forEachNode))
  }
}
