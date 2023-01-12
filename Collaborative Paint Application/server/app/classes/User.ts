export interface User {
    username: string;
    email: string;
    password: string;
    connected: boolean;
    socketId: string;
    avatarId: number;
    isHeavyClient: boolean;
    blockedEmails: string[];
    listDrawingCollaborated : Map<number, string[]>;
    historicConnexion: string[][];

}
