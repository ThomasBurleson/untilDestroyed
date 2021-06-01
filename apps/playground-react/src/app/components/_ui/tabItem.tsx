import React from 'react';

const ROOT = 'https://github.com/ThomasBurleson/mindspace-utils/blob/master/apps/test-react-akita/src/app/components';

export interface TabItemProps {
  url?: string;
  description?: string;
}

export const TabItem: React.FC<TabItemProps> = ({ url, description, children }) => {
  const matches = (url || '').match(/[^/]+(?=$)/);
  const name = matches ? matches[0] : '';
  return (
    <div className="tabItem">
      <div className="sample-info">
        <a href={`${ROOT}/${url}`} target="_blank">
          {name}
        </a>
      </div>
      <div className="description"> {description} </div>
      {children}
    </div>
  );
};
