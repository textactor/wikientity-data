import DynamoDB = require('aws-sdk/clients/dynamodb');
import {
    DynamoItem,
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
}
