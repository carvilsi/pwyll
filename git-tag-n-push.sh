#!/bin/bash

tag=$(node -e \"console.log(require('./package.json').version)\")
git tag v${tag}
git push origin v${tag} 
