import {Discussion} from '@app/classes/Discussion';
import {Message} from '@app/classes/Message';
import {Service} from 'typedi';

@Service()
export class DiscussionService {

    discussionCreator (id: number, discussionName: string): Discussion {
        return {name: discussionName, id: id, messages: [], people: []};
    }
    addUser (user: string, discussion: Discussion): void {
        discussion.people.push(user);
    }

    findIndexUser (user: string, discussion: Discussion): number {
        let index = 0;
        for (;index < discussion.people.length; index++) {
            if (user === discussion.people[index]) {
                return index;
            }
        }
        return -1;
    }
    deleteUser (user: string, discussion: Discussion): boolean {
        const index = this.findIndexUser(user, discussion);
        if (index < 0) return false;
        discussion.people.splice(index, 1);
        return true;
    }

    addMessage (message: Message, discussion: Discussion): void {
        discussion.messages.push(message);
    }
}
