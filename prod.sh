#!/bin/bash

yarn unlink @textactor/domain
yarn unlink @textactor/wikientity-domain

yarn upgrade --latest

yarn add @textactor/domain
yarn add @textactor/wikientity-domain

yarn test
