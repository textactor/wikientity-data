import DynamoDB = require('aws-sdk/clients/dynamodb');

import { DynamoRepository } from './dynamo-repository';
import { WikiEntity, WikiEntityValidator, WikiEntityRepository } from '@textactor/wikientity-domain';
import { DynamoWikiEntityItem } from './dynamo-wiki-entity';


export class DynamoWikiEntityRepository extends DynamoRepository<WikiEntity> implements WikiEntityRepository {
    constructor(client: DynamoDB.DocumentClient, tableSuffix: string) {
        super(new DynamoWikiEntityItem(client, tableSuffix), new WikiEntityValidator());
    }

    createOrUpdate(item: WikiEntity) {
        return (<DynamoWikiEntityItem>this.item).createOrUpdate(item);
    }
}
