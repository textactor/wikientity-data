#!/bin/bash

yarn unlink @textactor/domain
yarn unlink @textactor/wikientity-domain

yarn add @textactor/domain
yarn add @textactor/wikientity-domain

yarn test
