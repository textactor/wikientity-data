#!/bin/bash

yarn remove @textactor/domain
yarn remove @textactor/wikientity-domain
yarn remove dynamo-item

yarn link @textactor/domain
yarn link @textactor/wikientity-domain
yarn link dynamo-item

yarn test
