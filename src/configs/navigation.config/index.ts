import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'user-management',
        path: '/userManagement',
        title: 'Users',
        icon: 'User',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'role-management',
        path: '/roleManagement',
        title: 'Roles',
        icon: 'Role',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'permissions-management',
        path: '/permissionsList',
        title: 'Permissions',
        icon: 'Permission',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },

    {
        key: 'promo-codes',
        path: '/promoCodesList',
        title: 'Promo Codes',

        icon: 'Promo',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },

    {
        key: 'PackageManagement',
        path: '',
        title: 'Packages',
        icon: 'Package',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'PackageManagement.item1',
                path: '/packageList',
                title: 'Package List',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'PackageManagement.item2',
                path: '/packageFeaturesList',
                title: 'Package Features',

                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'PackageManagement.item3',
                path: '/packageBadgesList',
                title: 'Package Badges',

                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
