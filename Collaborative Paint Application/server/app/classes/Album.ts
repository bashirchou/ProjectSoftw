import {Drawing} from './Drawing';
export interface Album {
    id: number;
    name: string;
    description: string;
    ownerMail: string;
    userAccess: string[];
    drawings: Map<number, Drawing>;
    userRequestJoin: string[];
}

