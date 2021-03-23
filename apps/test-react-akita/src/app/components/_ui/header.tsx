import React from 'react';

export const Header: React.FC = () => {
  return <div>
    <img
        src="https://user-images.githubusercontent.com/210413/111729764-d4d45580-883d-11eb-8284-3f38f8963df2.png"
        width="305px" height="182px"
      />
    <div>
    <h1>Mindspace-io/React-Akita</h1>

    <p style={{ margin: '5px', lineHeight: '25px' }}>
      See how state can be easily managed using this new library.
      <br />
        Each of the tests below interact with their own stores!
      <br />
    </p>
    <p style={{ marginTop: '10px', marginLeft: '50px' }}>
        @see
        <a href="https://github.com/ThomasBurleson/mindspace-utils/tree/master/libs/utils/react-akita" target="_blank">
          <span style={{paddingLeft:'10px'}}>React-Akita Readme</span>
        </a>
      </p>

    </div>

  </div>
}