import ApiService from "./ApiService"
import { User } from "@/@types/user"


export async function apiAddUser(data: User) {
    return ApiService.fetchData<{ message: string; data: User }>({
        url: '/user/addUser',
        method: 'post',
        data,
    })
}


export async function apiUpdateUser(id: string, data: Partial<User>) {
    return ApiService.fetchData<{ message: string; data: User }>({
        url: '/user/updateUser',
        method: 'put',
        params: { id },
        data,
    })
}


export async function apiGetAllUsers() {
    return ApiService.fetchData<{ data: User[] }>({
        url: '/user/getAllUsers',
        method: 'get',
    })
}


export async function apiGetUserById(id: string) {
    return ApiService.fetchData<{ data: User }>({
        url: '/user/getUserById',
        method: 'get',
        params: { id },
    })
}


export async function apiDeleteUser(id: string) {
    return ApiService.fetchData<{ message: string }>({
        url: '/user/deleteUser',
        method: 'delete',
        params: { id },
    })
}
