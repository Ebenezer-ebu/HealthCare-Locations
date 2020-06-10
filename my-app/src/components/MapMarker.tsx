import React from 'react';
import { EnvironmentOutlined } from '@ant-design/icons';

const MapMarker = (({ name, key }) => {
  return (
    <div key={key}>
      <span className="brand-red">{name}</span>
      <EnvironmentOutlined font-size="1.5rem" twoToneColor="#fd0000"/> 
    </div>
  );
});

export default MapMarker;