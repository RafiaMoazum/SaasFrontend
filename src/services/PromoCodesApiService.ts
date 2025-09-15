import ApiService from './ApiService'


export async function apiCreatePromoCode(data:any) {
    return ApiService.fetchData({
        url: 'cart/createPromoCode',
        method: 'post',
        data,
    })
}


export async function apiGetAllPromoCodes() {
    return ApiService.fetchData({
        url: 'cart/getAllPromoCodes',
        method: 'get',
    })
}

export async function apiGetPromoCodeById<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `cart/getPromoCodeById`,
        method: 'get',
        params,
    })
}


export async function apiDeletePromoCode<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
            url: `cart/deletePromoCode`,
        method: 'delete',
        params,
    })
}


export async function apiUpdatePromoCode(data:any) {
    return ApiService.fetchData({
        url: 'cart/updatePromoCode',
        method: 'put',
        data,
    })
}