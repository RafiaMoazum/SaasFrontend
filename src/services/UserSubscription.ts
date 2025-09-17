import ApiService from './ApiService'


export async function apiCreateUserSubscription(data:any) {
    return ApiService.fetchData({
        url: 'subscription/createSubscription',
        method: 'post',
        data,
    })
}