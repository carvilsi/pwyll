#!/bin/bash

CHNGLG=CHANGELOG.md
DCKCMPS=devops/docker-compose.yml
NAME=$(node -e "console.log(require('./package.json').name)")
VERSION=$(node -e "console.log(require('./package.json').version)")
today=$(date +%Y-%m-%d)
line="# [v${VERSION}](https:\/\/github.com\/carvilsi\/${NAME}\/releases\/tag\/v${VERSION}) (${today})"
commit_message=$(git log -1 --format=%s)

sed -i "s/pwyll:[0-9]*.[0-9]*.[0-9]*/pwyll:${VERSION}/g" $DCKCMPS
sed -i '2s/^/\nnewchangelogentry\n/' $CHNGLG
sed -i "s/newchangelogentry/${line}\n\n- ${commit_message}/g" $CHNGLG

