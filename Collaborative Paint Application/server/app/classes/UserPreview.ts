export interface UserPreview {
    username: string;
    email: string;
    connected: boolean;
    socketId: string;
    avatarId: number;
    isHeavyClient: boolean;
    historicConnexion: string[][];
}
