#!/bin/bash

yarn remove @textactor/domain
yarn remove @textactor/wikientity-domain

yarn link @textactor/domain
yarn link @textactor/wikientity-domain

yarn test
