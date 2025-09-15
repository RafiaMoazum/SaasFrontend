export type User = {
    id?: string
    firstName: string
    lastName: string
    email: string
    password?: string
    roleId: string
    country?: string
    profileImage?: File | string
}