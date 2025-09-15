import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface SessionState {
    signedIn: boolean
    accessToken: string | null
    refreshToken: string | null
}

const initialState: SessionState = {
    signedIn: false,
    accessToken: null,
    refreshToken: null,
}

const sessionSlice = createSlice({
    name: `${SLICE_BASE_NAME}/session`,
    initialState,
    reducers: {
        signInSuccess(
            state,
            action: PayloadAction<{ accessToken: string; refreshToken: string }>
        ) {
            state.signedIn = true
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },
        refreshTokenSuccess(
            state,
            action: PayloadAction<{ accessToken: string; refreshToken: string }>
        ) {
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
            state.signedIn = true
        },

        signOutSuccess(state) {
            state.signedIn = false
            state.accessToken = null
            state.refreshToken = null
        },
    },
})

export const { signInSuccess, refreshTokenSuccess, signOutSuccess } =
    sessionSlice.actions
export default sessionSlice.reducer
