import ApiService from './ApiService'


export async function apiCreatePermission(data:any) {
    return ApiService.fetchData({
        url: 'permission/addPermission',
        method: 'post',
        data,
    })
}


export async function apiGetAllPermissions() {
    return ApiService.fetchData({
        url: 'permission/getAllPermissions',
        method: 'get',
    })
}

export async function apiGetPermissionById<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `permission/getPermissionById`,
        method: 'get',
        params,
    })
}


export async function apiDeletePermission<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `permission/deletePermission`,
        method: 'delete',
        params,
    })
}


export async function apiUpdatePermission(data:any) {
    return ApiService.fetchData({
        url: 'permission/updatePermission',
        method: 'put',
        data,
    })
}