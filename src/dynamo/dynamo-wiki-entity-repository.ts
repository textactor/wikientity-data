import DynamoDB = require('aws-sdk/clients/dynamodb');

import { DynamoRepository } from './dynamo-repository';
import { WikiEntity, WikiEntityValidator, WikiEntityRepository } from '@textactor/wikientity-domain';
import { DynamoWikiEntityItem } from './dynamo-wiki-entity';
import { RepositoryUpdateData, unixTime } from '@textactor/domain';


export class DynamoWikiEntityRepository extends DynamoRepository<WikiEntity> implements WikiEntityRepository {
    constructor(client: DynamoDB.DocumentClient, tableSuffix: string) {
        super(new DynamoWikiEntityItem(client, tableSuffix), new WikiEntityValidator());
    }

    async createOrUpdate(data: WikiEntity) {
        try {
            return await this.create(data);
        } catch (e) {
            if (e.code === 'ConditionalCheckFailedException') {
                const dbData = await this.getById(data.id);
                if (!dbData) {
                    throw new Error(`Not found wiki entity on updating: ${data.id}`);
                }

                data = { ...data };
                data.createdAt = dbData.createdAt;
                data.updatedAt = unixTime();

                return this.put(data);
            }
            return Promise.reject(e);
        }
    }

    protected beforeCreate(data: WikiEntity) {
        data.createdAt = data.createdAt || unixTime();
        data.updatedAt = data.updatedAt || data.createdAt;

        return super.beforeCreate(data);
    }

    protected beforeUpdate(data: RepositoryUpdateData<WikiEntity>) {
        data.set = data.set || {};
        data.set.updatedAt = data.set.updatedAt || unixTime();

        return super.beforeUpdate(data);
    }
}
