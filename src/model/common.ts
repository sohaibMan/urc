import {CustomError} from "./CustomError";

export const AUTHENT_HEADER = "Authentication";
export const BEARER = "Bearer ";

export interface User {
    user_id: number;
    username: string;
    email?: string;
    password: string;
    last_login?: string;
    external_id?: string;
}

export interface UserPublic {
    user_id: number;
    username: string;
    last_login?: string;
}

export interface Room {
    room_id: number;
    name: string;
    created_on: string; // ISO 8601 format for timestamps
    created_by: number;
}

export interface Message {
    id?: number;
    sender_id: number;
    receiver_id: number;
    message_text?: string;
    img_url?: string;
    timestamp?: string;
}

export interface Session {
    token: string;
    username?: string;
    id?: number;
    externalId: string;
}


export interface EmptyCallback {
    (): void;
}

export interface SessionCallback {
    (session: Session): void;
}


export interface ErrorCallback {
    (error: CustomError): void;
}

export interface SessionState {
    session: Session;
}

export interface RootState {
    session: SessionState;
}

export interface UsersState {
    users: UserPublic[]
}

export interface RootUsersState {
    users: UsersState
}
