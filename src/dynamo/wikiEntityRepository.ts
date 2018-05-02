import { DynamoRepository } from "./dynamoRepository";
import { WikiEntity, IWikiEntityRepository } from "@textactor/wikientity-domain";

export class WikiEntityRepository extends DynamoRepository<string, WikiEntity> implements IWikiEntityRepository {

}
