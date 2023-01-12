import {Comment} from './Comment';
import {PathInfo} from '@app/classes/PathInfo';
import {Status} from './Status';
export interface Drawing {
    id: number;
    discussionId: number;
    name: string;
    color: string;// change for Color type
    size: number[];// [length, height]
    elements: Map<number, PathInfo>;
    nextElementNumber: number;
    selectedElements: Map<number, string>;
    creationDate: string;
    ownerMail: string;
    comments: Comment[];
    collaboratorMails: string[];
    status: Status;
    password: string;

}
