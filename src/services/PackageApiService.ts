import ApiService from './ApiService'


export async function apiCreatePackage(data:any) {
    return ApiService.fetchData({
        url: 'package/createPackage',
        method: 'post',
        data,
    })
}

export async function apiGetAllPackages() {
    return ApiService.fetchData({
        url: 'package/getAllPackages',
        method: 'get',
    })
}


export async function apiGetPackagesById<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `package/getPackageById`,
        method: 'get',
        params,
    })
}



export async function apiUpdatePackage(data:any) {
    console.log("apiUpdatePackage data:", data);
    return ApiService.fetchData({
        url: 'package/updatePackage',
        method: 'put',
        data,
    })
}

export async function apiDeletePackage<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `package/deletePackage`,
        method: 'delete',
        params,
    })
}

// Package Features Api Calls
export async function apiCreatePackageFeature(data:any) {
    return ApiService.fetchData({
        url: 'packageFeature/createPackageFeature',
        method: 'post',
        data,
    })
}

export async function apiGetAllPackageFeatures() {
    return ApiService.fetchData({
        url: 'packageFeature/getAllPackageFeatures',
        method: 'get',
    })
}


export async function apiGetPackageFeaturesById<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: `packageFeature/getPackageFeatureById`,
        method: 'get',
        params,
    })
}



export async function apiUpdatePackageFeature(data:any) {
    console.log("apiUpdatePackageFeature data:", data);
    return ApiService.fetchData({
        url: 'packageFeature/updatePackageFeature',
        method: 'put',
        data,
    })
}

export async function apiDeletePackageFeature<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `packageFeature/deletePackageFeature`,
        method: 'delete',
        params,
    })
}


//Package Badges API Calls
export async function apiCreatePackageBadge(data:any) {
    return ApiService.fetchData({
        url: 'packageBadge/createPackageBadge',
        method: 'post',
        data,
    })
}

export async function apiGetAllPackageBadges() {
    return ApiService.fetchData({
        url: 'packageBadge/getAllPackageBadges',
        method: 'get',
    })
}


export async function apiGetPackageBadgesById<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `packageBadge/getPackageBadgeById`,
        method: 'get',
        params,
    })
}



export async function apiUpdatePackageBadges(data:any) {
    console.log("apiUpdatePackageBadges data:", data);
    return ApiService.fetchData({
        url: 'packageBadge/updatePackageBadge',
        method: 'put',
        data,
    })
}

export async function apiDeletePackageBadge<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `packageBadge/deletePackageBadge`,
        method: 'delete',
        params,
    })
}