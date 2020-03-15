function createAPI(base: string = `${window.location.host}/api/`) {
  const api = {
    base,
    async get(path: string) {
      const url = new URL(path, this.base)
      const response = await fetch(url.href, { method: 'POST' })
      return response.json()
    },
  }

  return api
}

export class Site {
  static api = createAPI()

  static containerQuery = `#site`

  static container(el: Element | Document = document) {
    return el.querySelector(this.containerQuery) as Element
  }

  static isContainer(el: any): el is Element {
    return el && el.matches(this.containerQuery)
  }

  static async ready() {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('document is ready. I can sleep now')
    })
  }
}

window.Site = Site
