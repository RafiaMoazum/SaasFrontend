import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'user-management',
        path: '/userManagement',
        component: lazy(() => import('@/views/UserManagement/UserList')),
        authority: [],
    },
    {
        key: 'add-user',
        path: '/addUser',
        component: lazy(() => import('@/views/UserManagement/AddEditUser')),
        authority: [],
    },
    {
        key: 'edit-user',
        path: '/editUser',
        component: lazy(() => import('@/views/UserManagement/AddEditUser')),
        authority: [],
    },

    {
        key: 'role-management',
        path: '/roleManagement',
        component: lazy(() => import('@/views/RoleManagement/RoleManagement')),
        authority: [],
    },
    {
        key: 'add-role',
        path: '/addRole',
        component: lazy(() => import('@/views/RoleManagement/AddRole')),
        authority: [],
    },
    {
        key: 'edit-role',
        path: '/editRole/:roleId',
        component: lazy(() => import('@/views/RoleManagement/AddRole')),
        authority: [],
    },
    {
        key: 'permissions-management',
        path: '/permissionsList',
        component: lazy(() => import('@/views/Permissions/PermissionsList')),
        authority: [],
    },
    {
        key: 'add-permission',
        path: '/addPermission',
        component: lazy(() => import('@/views/Permissions/AddPermissions')),
        authority: [],
    },
    {
        key: 'edit-permission',
        path: '/editPermission/:id',
        component: lazy(() => import('@/views/Permissions/AddPermissions')),
        authority: [],
    },
    {
        key: 'promo-codes',
        path: '/promoCodesList',
        component: lazy(() => import('@/views/PromoCodes/PromoCodesList')),
        authority: [],
    },
    {
        key: 'add-promoCode',
        path: '/addPromoCode',
        component: lazy(() => import('@/views/PromoCodes/AddEditPromoCodes')),
        authority: [],
    },
    {
        key: 'edit-promoCode',
        path: '/editPromoCode/:id',
        component: lazy(() => import('@/views/PromoCodes/AddEditPromoCodes')),
        authority: [],
    },
    {
        key: 'PackageManagement.item1',
        path: '/packageList',
        component: lazy(() => import('@/views/PackageManagement/PackageList')),
        authority: [],
    },

    {
        key: 'PackageManagement.item1.1',
        path: '/addPackage',
        component: lazy(
            () => import('@/views/PackageManagement/AddEditPackage')
        ),
        authority: [],
    },

    {
        key: 'PackageManagement.item1.2',
        path: '/editPackage/:packageId',
        component: lazy(
            () => import('@/views/PackageManagement/AddEditPackage')
        ),
        authority: [],
    },

    //**************************Package Features************************************* */
    {
        key: 'PackageManagement.item2',
        path: '/packageFeaturesList',
        component: lazy(
            () => import('@/views/PackageFeatures/PackageFeaturesList')
        ),
        authority: [],
    },

    {
        key: 'PackageManagement.item2.1',
        path: '/addPackageFeature',
        component: lazy(
            () => import('@/views/PackageFeatures/AddEditPackageFeaturesList')
        ),
        authority: [],
    },

    {
        key: 'PackageManagement.item2.2',
        path: '/editPackageFeature/:id',
        component: lazy(
            () => import('@/views/PackageFeatures/AddEditPackageFeaturesList')
        ),
        authority: [],
    },

    //**************************Package Badge************************************* */
    {
        key: 'PackageManagement.item3',
        path: '/packageBadgesList',
        component: lazy(
            () => import('@/views/PackageBadges/PackageBadgesList')
        ),
        authority: [],
    },

    {
        key: 'PackageManagement.item3.1',
        path: '/addPackageBadge',
        component: lazy(
            () => import('@/views/PackageBadges/AddEditPackageBadge')
        ),
        authority: [],
    },

    {
        key: 'PackageManagement.item3.2',
        path: '/editPackageBadge/:id',
        component: lazy(
            () => import('@/views/PackageBadges/AddEditPackageBadge')
        ),
        authority: [],
    },

    {
        key: 'account',
        path: '/account/settings/:tab',
        component: lazy(() => import('@/views/account/Settings')),
        authority: [],
        
    },
    


]


export const sharedRoutes = [
  {
    key: 'subscriptionPage',
    path: '/subscription',
component: lazy(() => import('@/views/LandingPages/SubscriptionPage')),
  },
  
]
