import { DynamoModel, DynamoModelOptions } from "./dynamoModel";
import { WikiEntity } from "@textactor/wikientity-domain";
import * as Joi from 'joi';
import { LANG_REG, WIKI_DATA_ID_REG } from "../helpers";
import { RepUpdateData } from "@textactor/domain";

export class WikiEntityModel extends DynamoModel<string, WikiEntity> {
    constructor(dynamodb?: any) {
        super(OPTIONS, dynamodb);
    }

    protected beforeCreating(data: WikiEntity): WikiEntity {
        data = super.beforeCreating(data);
        const ts = Math.round(Date.now() / 1000);
        data.createdAt = data.createdAt || ts;
        data.updatedAt = data.createdAt || ts;

        return data;
    }

    protected beforeUpdating(data: RepUpdateData<WikiEntity>): RepUpdateData<WikiEntity> {
        data = super.beforeUpdating(data);
        delete data.item.createdAt;
        delete data.item.lang;
        data.item.updatedAt = data.item.updatedAt || Math.round(Date.now() / 1000);

        return data;
    }

    protected transformData(data: any): WikiEntity {
        if (data) {
            delete data.locale;
        }
        return super.transformData(data);
    }
}

const OPTIONS: DynamoModelOptions = {
    name: 'textactor:WikiEntity',
    tableName: 'textactor_WikiEntities_v0',
    hashKey: 'id',
    schema: {
        id: Joi.string().regex(/^[A-Z]{2}Q\d+$/).required(),
        lang: Joi.string().regex(LANG_REG).required(),
        name: Joi.string().min(2).max(200).required(),
        aliases: Joi.array().items(Joi.string().min(2).max(200).required()).unique().max(10),
        abbr: Joi.string().min(1).max(50),
        wikiDataId: Joi.string().regex(WIKI_DATA_ID_REG).required(),
        wikiPageId: Joi.number().integer(),
        wikiPageTitle: Joi.string().min(2).max(200),
        type: Joi.valid('EVENT', 'ORG', 'PERSON', 'PLACE', 'PRODUCT'),
        types: Joi.array().items(Joi.string().min(2).max(50).required()).unique().max(20),
        description: Joi.string().max(200),
        about: Joi.string().max(800),
        categories: Joi.array().items(Joi.string().min(2).max(200).required()).unique().max(10),
        rank: Joi.number().integer().required(),
        data: Joi.object().pattern(/^P\d+$/, Joi.array().items(Joi.string().min(1).max(500).required()).min(1).max(10)),

        createdAt: Joi.number().integer().required(),
        updatedAt: Joi.number().integer().required(),
    }
}
