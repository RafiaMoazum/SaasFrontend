import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
     {
        key: 'user-management',
        path: '/userManagement',
        title: 'User',
        translateKey: 'nav.userManagement',
        icon: 'User',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'role-management',
        path: '/roleManagement',
        title: 'Role',
        translateKey: 'nav.role',
        icon: 'singleMenu',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'permissions-management',
        path: '/permissionsList',
        title: 'Permission',
        translateKey: 'nav.permissions-management',
        icon: 'singleMenu',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },

    {
        key: 'promo-codes',
        path: '/promoCodesList',
        title: 'Promo Codes',
        translateKey: 'nav.promoCodes',
        icon: 'singleMenu',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },

    {
        key: 'PackageManagement',
        path: '',
        title: 'Package Management',
        translateKey: 'nav.PackageManagement.PackageManagement',
        icon: 'collapseMenu',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'PackageManagement.item1',
                path: '/packageList',
                title: 'Package List',
                translateKey: 'nav.PackageManagement.item1',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
             {
                key: 'PackageManagement.item2',
                path: '/packageFeaturesList',
                title: 'Package Features',
                translateKey: 'nav.PackageManagement.item2',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
             {
                key: 'PackageManagement.item3',
                path: '/packageBadgesList',
                title: 'Package Badges',
                translateKey: 'nav.PackageManagement.item3',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
           
        ],
    },
    
   
]

export default navigationConfig