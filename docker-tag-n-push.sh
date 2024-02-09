#!/bin/bash

NAME=$(node -e "console.log(require('./package.json').name)")
VERSION=$(node -e "console.log(require('./package.json').version)")

docker tag ${NAME}:${VERSION} carvilsi/${NAME}:${VERSION}
docker push carvilsi/${NAME}:${VERSION}

