import { AuthRepository } from '../../domain/auth/AuthRepository';
import { AuthSession } from "../../domain/auth/User";

export class LoginUseCase {
    constructor(private authRepository: AuthRepository) {};

    async execute(email: string, password: string): Promise<AuthSession> {

        if(!email || !password){
            throw new Error('El correo y la contraseña son obligatorio.');
        }
    
        if(!email.includes('@')){
            throw new Error('El formato del correo electronico no es valido.');
        }
    
        const session= await this.authRepository.signIn(email, password);
    
        await this.authRepository.saveSession(session);
    
        return session;

    }

}