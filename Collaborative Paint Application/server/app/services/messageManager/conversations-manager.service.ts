import {Discussion} from '@app/classes/Discussion';
import {Service} from 'typedi';
import {DatabaseService} from '@app/services/database.service';
import {DiscussionService} from '../discussionService/discussion.service';

@Service()
export class ConversationsManager {
    discussions: Map<number, Discussion>;
    constructor (private database: DatabaseService, private discussionService: DiscussionService) {
        this.discussions = new Map();
    }

    async populateFromDB () {
        for (const discussion of await this.database.getAllDiscussions()) {
            this.discussions.set(discussion.id, discussion);
        }
    }
    getDiscussion (id: number){
        if (!this.discussions.has(id)) {
            throw Error('discussion unexisting..');
        }
        return this.discussions.get(id) as Discussion;
    }

    async addConversation (name: string, user: string): Promise<number> {
        const index = await this.database.getNextDiscussionId();
        const discussion = this.discussionService.discussionCreator(index, name);
        this.discussionService.addUser(user, discussion);
        this.discussions.set(index, discussion);
        //add on mongo
        await this.database.addDiscussion(discussion);
        return index;
    }
    async deleteConversation (index: number) {
        if (index < 1) {
            throw Error('cannot delete the main discussion...');
        }
        this.discussions.delete(index);
        return await this.database.deleteDiscussion(index);
    }
    async updateConversationOnMongo (discussion: Discussion) {
        return await this.database.updateDiscussion(discussion);
    }
    async removeUserInDiscussion (messageId: number, email: string) {
        this.discussionService.deleteUser(email, this.getDiscussion(messageId));
        return await this.updateConversationOnMongo(this.getDiscussion(messageId));
    }
    async addUserInDiscussion (messageId: number, email: string) {
        const discussion = this.getDiscussion(messageId) as Discussion;
        this.discussionService.addUser(email, discussion);
        return await this.updateConversationOnMongo(this.getDiscussion(messageId));
    }
    getListOfDiscussionActiveMember (email: string) {
        const listDiscussionId = [];
        for (const discussion of this.discussions.values()) {
            if (email in discussion.people) {
                listDiscussionId.push(discussion.id);
            }
        }
        return listDiscussionId;
    }
}
