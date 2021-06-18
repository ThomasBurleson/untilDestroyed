#!/bin/echo USAGE: source 
#!/bin/bash

echo 'Building @mindspace-io/react'
nx build utils-react 
cp ./libs/utils/react/README.md ./dist/libs/utils/react/README.md
cp ./LICENSE ./dist/libs/utils/react/LICENSE
nx test utils-react
echo ''
echo 'Preparing to npm deploy updates to @mindspace-io/react'
echo ''
cd $(pwd)/dist/libs/utils/react && ls
echo ''
echo -e "\033[1;92m Publishing '@mindspace-io/react'!"
echo -e "\033[1;95m npm publish --access public" 