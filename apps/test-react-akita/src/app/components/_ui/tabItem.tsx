import React from 'react';

const ROOT = 'https://github.com/ThomasBurleson/mindspace-utils/blob/master/apps/test-react-akita/src/app/components';

export interface TabItemProps {
  url : string,
}

export const TabItem: React.FC<TabItemProps> = ({url, children}) => {
  const name = url.match(/[^\/]+(?=$)/)[0]
  return (
    <div className="tabItem">
      <div className="sample-info">
        <a href={`${ROOT}/${url}`} target="_blank">
          {name}
        </a>
      </div>
      { children }
    </div>
      
  );
}