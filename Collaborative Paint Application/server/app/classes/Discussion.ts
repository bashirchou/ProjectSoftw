import {Message} from '@app/classes/Message';

export interface Discussion {
    people : string[];
    messages: Message[];
    name: string;
    id: number;
}
