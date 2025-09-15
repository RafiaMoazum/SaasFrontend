import ApiService from './ApiService'


export async function apiCreateRole(data:any) {
    return ApiService.fetchData({
        url: 'role/addRole',
        method: 'post',
        data,
    })
}

export async function apiGetAllRoles() {
    return ApiService.fetchData({
        url: 'role/getAllRoles',
        method: 'get',
    })
}


export async function apiGetRolesById<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `role/getRoleById`,
        method: 'get',
        params,
    })
}



export async function apiUpdateRole(data:any) {
    console.log("apiUpdateRole data:", data);
    return ApiService.fetchData({
        url: 'role/updateRole',
        method: 'put',
        data,
    })
}

export async function apiDeleteRole<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `role/deleteRole`,
        method: 'delete',
        params,
    })
}