import {Message} from '@app/classes/Message';
import {Service} from 'typedi';

@Service()
export class MessageService{

    messageCreator (username: string, messageContent: string): Message {
        const date = new Date();
        let minutes = String(date.getMinutes());
        let seconds = String(date.getSeconds());
        if (date.getMinutes() < 10) {
            minutes = '0' + date.getMinutes();
        }
        if (date.getSeconds() < 10) {
            seconds = '0' + date.getSeconds();
        }
        return {author: username, message: messageContent, deletedByEmails: [], date: date.getHours() + ':' + minutes + ':' + seconds, deletedGlobally: false};
    }
}
