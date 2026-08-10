import { AuthSession } from "./User";

export interface AuthRepository {

    login(email: string, password: string): Promise<AuthSession>;

    saveSession(session: AuthSession): Promise<void>;

    getStoredSession(): Promise<AuthSession | null>;

    logout(): Promise<void>;
}