#!/bin/bash

echo 'Building @mindspace-io/react-akita'
nx build utils-react-akita 
cp ./libs/utils/react-akita/README.md ./dist/libs/utils/react-akita/README.md
nx test utils-react-akita
echo ''
echo 'Preparing to npm deploy updates to @mindspace-io/react-akita'
echo ''
cd $(pwd)/dist/libs/utils/react-akita && ls
echo ''
echo -e "\033[1;92m Publishing!"
echo -e "\033[1;95m npm publish --access public" 