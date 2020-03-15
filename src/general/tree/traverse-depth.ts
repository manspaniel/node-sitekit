type Node<T> = {
  children: T[]
  parent: T | null
}

export function traverseDepth<T extends Node<T>>(
  node: T,
  forEachNode: (node: T) => any
) {
  if (node.children.length) {
    node.children.forEach(node => traverseDepth(node, forEachNode))
  }
  forEachNode(node)
}
