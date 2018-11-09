import DynamoDB = require('aws-sdk/clients/dynamodb');
import { DynamoWikiEntityRepository } from './dynamo/dynamo-wiki-entity-repository';
import { WikiEntityRepository } from '@textactor/wikientity-domain';


export class WikiEntityRepositoryBuilder {
    static build(client: DynamoDB.DocumentClient, tableSuffix: string = 'v1'): WikiEntityRepository {
        return new DynamoWikiEntityRepository(client, tableSuffix);
    }
}
