import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    id?: string
    profileImage?: string
    firstName?: string
    lastName?: string
    email?: string
    role?: string
    permissions?: string[]
    authority?: string[]
}

const initialState: UserState = {
    id: undefined,
    profileImage: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    permissions: [],
    authority: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload?.id 
            state.profileImage = action.payload?.profileImage
            state.email = action.payload?.email
            state.firstName = action.payload.firstName
            state.lastName = action.payload.lastName
            state.role = action.payload.role
            state.permissions = action.payload.permissions || []
            state.authority = action.payload.authority || [action.payload.role || 'USER']
        },
        clearUser(state) {
            return initialState
        },
    },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer