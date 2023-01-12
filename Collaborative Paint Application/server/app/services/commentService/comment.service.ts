import {Service} from 'typedi';
import {Comment} from '@app/classes/Comment';

@Service()
export class CommentService {

    commentCreator (author: string, grade: number, comment: string, isAnonymous: boolean): Comment {
        const date = new Date();
        let minutes = '' + date.getMinutes();
        let seconds = '' + date.getSeconds();
        if (date.getMinutes() < 10) {
            minutes = '0' + date.getMinutes();
        }
        if (date.getSeconds() < 10) {
            seconds = '0' + date.getSeconds();
        }
        const hours = '' + date.getHours();
        return {date: hours + ':' + minutes + ':' + seconds, authorName: author, grade: grade, comment: comment, isAnonymous: isAnonymous};
    }
}
