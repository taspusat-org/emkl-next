import React, { useState } from 'react';
import ReactDOM from 'react-dom';

export const Tooltip = (props: any) => {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const showTip = (e: React.MouseEvent<HTMLDivElement>) => {
    const tooltip = e.currentTarget.getBoundingClientRect();
    const direction = props.direction || 'bottom';

    const offsets = {
      top: { top: tooltip.top - 10, left: tooltip.left + tooltip.width / 2 },
      bottom: {
        top: tooltip.top + tooltip.height + 10,
        left: tooltip.left + tooltip.width / 2
      },
      left: { top: tooltip.top + tooltip.height / 2, left: tooltip.left - 10 },
      right: {
        top: tooltip.top + tooltip.height + 2,
        left: tooltip.left + tooltip.width + 10
      }
    };

    setPosition(offsets[direction]);
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };

  const tooltipContent = active && (
    <div
      className={`${props.direction || 'bottom'}`}
      style={{
        position: 'absolute',
        top: position.top + window.scrollY,
        left: position.left + window.scrollX,
        transform:
          props.direction === 'left' || props.direction === 'right'
            ? 'translateY(-50%)'
            : 'translateX(-50%)',
        zIndex: 9999
      }}
    >
      {props.content}
    </div>
  );

  return (
    <div
      className="Tooltip-Wrapper"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {props.children}
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </div>
  );
};
