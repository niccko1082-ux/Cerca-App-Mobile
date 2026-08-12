export interface BiometricAvailability {
    hasHardware: boolean;
    isEnrolled: boolean;
}

export interface BiometricRepository {
    getAvailability(): Promise<BiometricAvailability>;
    authenticate(promptMessage: string): Promise<boolean>;
}