import React from 'react';
import { CarOutlined, SlidersOutlined } from '@ant-design/icons';


const ConstraintSlider = (({ iconType, value, onChange, text }) => {
  return (
    < section className="d-flex flex-column" >
      <div className="d-flex w-100 align-items-center">
        <CarOutlined font-size="1.5rem"/>
        <SlidersOutlined className="w-100" value={value} min={0} max={60} onChange={onChange}/>
      </div>
      <span className="text-center">{text}</span>
    </section >
  );
});

export default ConstraintSlider;