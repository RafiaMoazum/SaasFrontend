export interface NavigationTree {
    key: string
    path: string
    isExternalLink?: boolean
    title: string
    icon: string
    type: 'title' | 'collapse' | 'item'
    authority: string[]
    subMenu: NavigationTree[]
}
