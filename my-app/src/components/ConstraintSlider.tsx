import React from 'react';
import { CarOutlined, SlidersOutlined } from '@ant-design/icons';

type Props = {
    iconType: string;
    value: number;
    onChange: (value: any) => void;
    text: string
}
const ConstraintSlider = (({ iconType, value, onChange, text }: Props) => {
  return (
    < section className="d-flex flex-column" >
      <div className="d-flex w-100 align-items-center">
        <CarOutlined style={{fontSize:"1.5rem"}}/>
        <SlidersOutlined className="w-100" value={value} min={0} max={60} onChange={onChange}/>
      </div>
      <span className="text-center">{text}</span>
    </section >
  );
});

export default ConstraintSlider;