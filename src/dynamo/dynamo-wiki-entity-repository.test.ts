
import test from 'ava';
import { launch, stop } from 'dynamodb-local';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { DynamoWikiEntityRepository } from './dynamo-wiki-entity-repository';
import { WikiEntityHelper, WikiEntity, WikiEntityType } from '@textactor/wikientity-domain';
import { delay } from '@textactor/domain';



test.before('start dynamo', async t => {
    await t.notThrows(launch(8000, null, ['-inMemory', '-sharedDb']));
})

test.after('top dynamo', async t => {
    t.notThrows(() => stop(8000));
})

const client = new DynamoDB.DocumentClient({
    region: "eu-central-1",
    endpoint: "http://localhost:8000",
    accessKeyId: 'ID',
    secretAccessKey: 'Key',
});

const repository = new DynamoWikiEntityRepository(client, 'test');

test.beforeEach('createStorage', async t => {
    await t.notThrows(repository.createStorage());
})

test.afterEach('deleteStorage', async t => {
    await t.notThrows(repository.deleteStorage());
})


test.serial('#create input=output', async t => {
    const inputItem1 = WikiEntityHelper.build({
        lang: 'en',
        countLinks: 10,
        name: 'Long Name',
        wikiDataId: 'Q123',
        wikiPageTitle: 'Long title'
    });

    const outputItem1 = await repository.create(inputItem1);

    t.is(inputItem1.id, outputItem1.id, 'same id');
    t.deepEqual(inputItem1, outputItem1, 'same object');
})

test.serial('#createOrUpdate', async t => {
    const inputItem1 = WikiEntityHelper.build({
        lang: 'en',
        countLinks: 10,
        name: 'Long Name',
        wikiDataId: 'Q123',
        wikiPageTitle: 'Long title'
    });

    let outputItem1 = await repository.create(inputItem1);

    await delay(1000);

    const inputItem2: WikiEntity = { ...inputItem1, type: WikiEntityType.PERSON };

    const outputItem2 = await repository.createOrUpdate(inputItem2);

    t.is(outputItem2.id, outputItem1.id, 'same id');
    t.is(outputItem2.type, WikiEntityType.PERSON, 'updated type');

    t.not(outputItem2.updatedAt, outputItem1.updatedAt, 'updated updatedAt');

    t.is(outputItem2.createdAt, outputItem1.createdAt, 'same createdAt');
})
