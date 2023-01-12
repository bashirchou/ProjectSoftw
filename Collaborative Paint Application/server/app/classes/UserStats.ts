

export interface UserStats {
    numberCollaboratedDrawing: number,
    numberDrawingOwner: number,
    numberPrivateAlbumMember: number,
    averageTimeOfConnection: number,
    historicOfConnexion: string[][],
    historicDrawingModification: Map<number, string[]>,
}
