import DynamoDB = require('aws-sdk/clients/dynamodb');
import {
    DynamoItem, ItemUpdateData,
} from 'dynamo-item';

import { WikiEntity } from '@textactor/wikientity-domain';

export class DynamoWikiEntityItem extends DynamoItem<{ id: string }, WikiEntity> {
    constructor(client: DynamoDB.DocumentClient, tableSuffix: string) {
        super({
            hashKey: {
                name: 'id',
                type: 'S'
            },
            name: 'wiki_entities',
            tableName: `textactor_wiki_entities_${tableSuffix}`,
        }, client);
    }

    protected beforeCreate(data: WikiEntity) {
        data = super.beforeCreate(data);

        const ts = Math.round(Date.now() / 1000);
        data.createdAt = data.createdAt || ts;
        data.updatedAt = data.createdAt || ts;

        return data;
    }

    protected beforeUpdate(data: ItemUpdateData<WikiEntity>) {
        data = super.beforeUpdate(data);
        if (data.set) {
            data.set.updatedAt = data.set.updatedAt || Math.round(Date.now() / 1000);
        }

        return data;
    }

    async createOrUpdate(item: WikiEntity) {
        try {
            return this.create(item);
        }
        catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                return this.update({ key: { id: item.id }, set: item });
            }
            return Promise.reject(error);
        }
    }
}
