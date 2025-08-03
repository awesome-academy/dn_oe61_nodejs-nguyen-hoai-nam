export interface LoginResponse {
    user: {
        id: number,
        name: string,
        role: string,
    },
    token: string,
}

export interface RegisterResponse {
    id: number,
    email: string,
    name: string,
    role: string,
    status: string,
}

export interface UserProfileResponse {
    id: number,
    userName: string,
    email: string,
    role: string,
}
