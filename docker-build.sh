#!/bin/bash

docker build -t $(node -e "console.log(require('./package.json').name)"):$(node -e "console.log(require('./package.json').version)") .
