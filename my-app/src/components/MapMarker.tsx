import React from 'react';
import { EnvironmentOutlined } from '@ant-design/icons';

type Props = {
    name: string;
    key: string | number;
    lat?: any;
    lng?: any
}

const MapMarker = (({ name, key }: Props) => {
  return (
    <div key={key}>
      <span className="brand-red">{name}</span>
      <EnvironmentOutlined font-size="1.5rem" twoToneColor="#fd0000"/> 
    </div>
  );
});

export default MapMarker;