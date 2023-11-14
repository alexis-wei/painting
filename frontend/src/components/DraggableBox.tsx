import React, { useState } from 'react';
import { DivPosition } from '@/components/types';

type Props = {
  initPosition: DivPosition;
};

const DraggableBox: React.FC<Props> = ({ initPosition }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: initPosition.x,
    y: initPosition.y,
  });
  const [rel, setRel] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button

    const box = (e.target as HTMLDivElement).getBoundingClientRect();
    setRel({
      x: e.pageX - box.left,
      y: e.pageY - box.top,
    });
    setIsDragging(true);
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.pageX - rel.x,
      y: e.pageY - rel.y,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className='absolute h-[512px] w-[512px] border border-purple-400 p-2 hover:cursor-move'
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    />
  );
};

export default DraggableBox;
