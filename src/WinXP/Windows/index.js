import React, { useRef, memo } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import styled from 'styled-components';

import { useElementResize } from 'hooks';
import HeaderButtons from './HeaderButtons';

function Windows({
  apps,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  focusedAppId,
}) {
  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      {apps.map(app => (
        <StyledWindow
          show={!app.minimized}
          key={app.id}
          id={app.id}
          onMouseDown={onMouseDown}
          onMouseUpClose={onClose}
          onMouseUpMinimize={onMinimize}
          onMouseUpMaximize={onMaximize}
          isFocus={focusedAppId === app.id} // for styledWindow
          {...app}
        />
      ))}
    </div>
  );
}

const Window = memo(function({
  injectProps,
  id,
  onMouseDown,
  onMouseUpClose,
  onMouseUpMinimize,
  onMouseUpMaximize,
  header,
  defaultSize,
  defaultOffset,
  resizable,
  maximized,
  component,
  zIndex,
  isFocus,
  className,
}) {
  function _onMouseDown() {
    onMouseDown(id);
  }
  function _onMouseUpClose() {
    onMouseUpClose(id);
  }
  function _onMouseUpMinimize() {
    onMouseUpMinimize(id);
  }
  function _onMouseUpMaximize() {
    if (resizable) onMouseUpMaximize(id);
  }
  function onDoubleClickHeader(e) {
    if (e.target !== dragRef.current) return;
    _onMouseUpMaximize();
  }
  const dragRef = useRef(null);
  const ref = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { offset, size } = useElementResize(ref, {
    dragRef,
    defaultOffset,
    defaultSize,
    boundary: {
      top: 1,
      right: windowWidth - 1,
      bottom: windowHeight - 31,
      left: 1,
    },
    resizable,
    resizeThreshold: 10,
  });
  let width, height, x, y;
  if (maximized) {
    width = windowWidth + 6;
    height = windowHeight - 24;
    x = -3;
    y = -3;
  } else {
    width = size.width;
    height = size.height;
    x = offset.x;
    y = offset.y;
  }
  return (
    <div
      className={className}
      ref={ref}
      onMouseDown={_onMouseDown}
      style={{
        transform: `translate(${x}px,${y}px)`,
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        zIndex,
      }}
    >
      <div className="header__bg" />
      <header
        className="app__header"
        ref={dragRef}
        onDoubleClick={onDoubleClickHeader}
      >
        <img
          onDoubleClick={_onMouseUpClose}
          src={header.icon}
          alt={header.title}
          className="app__header__icon"
          draggable={false}
        />
        <div className="app__header__title">{header.title}</div>
        <HeaderButtons
          buttons={header.buttons}
          onMaximize={_onMouseUpMaximize}
          onMinimize={_onMouseUpMinimize}
          onClose={_onMouseUpClose}
          maximized={maximized}
          resizable={resizable}
          isFocus={isFocus}
        />
      </header>
      <div className="app__content">
        {component({
          onClose: _onMouseUpClose,
          onMinimize: _onMouseUpMinimize,
          isFocus,
          ...injectProps,
        })}
      </div>
    </div>
  );
});

const StyledWindow = styled(Window)`
  display: ${({ show }) => (show ? 'flex' : 'none')};
  position: absolute;
  padding: 3px;
  padding: ${({ header }) => (header.invisible ? 0 : 3)}px;
  background-color: ${({ isFocus }) => (isFocus ? '#1a1a1a' : '#2d2d2d')};
  flex-direction: column;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border: 1px solid #333;
  
  .header__bg {
    background: ${({ isFocus }) =>
      isFocus
        ? 'linear-gradient(to bottom, #2d2d2d 0%, #1a1a1a 100%)'
        : 'linear-gradient(to bottom, #3d3d3d 0%, #2d2d2d 100%)'};
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 28px;
    pointer-events: none;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    overflow: hidden;
  }
  .header__bg:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    opacity: ${({ isFocus }) => (isFocus ? 1 : 0.3)};
    background: linear-gradient(to right, #1638e6 0%, transparent 100%);
    top: 0;
    bottom: 0;
    width: 15px;
  }
  .header__bg:after {
    content: '';
    opacity: ${({ isFocus }) => (isFocus ? 1 : 0.4)};
    display: block;
    position: absolute;
    right: 0;
    background: linear-gradient(to left, #1638e6 0%, transparent 100%);
    top: 0;
    bottom: 0;
    width: 15px;
  }
  .app__header {
    display: ${({ header }) => (header.invisible ? 'none' : 'flex')};
    height: 25px;
    line-height: 25px;
    font-weight: 700;
    font-size: 12px;
    font-family: 'Noto Sans';
    text-shadow: 1px 1px #000;
    color: #fff;
    position: absolute;
    left: 3px;
    right: 3px;
    align-items: center;
  }
  .app__header__icon {
    width: 15px;
    height: 15px;
    margin-left: 1px;
    margin-right: 3px;
  }
  .app__header__title {
    flex: 1;
    pointer-events: none;
    padding-right: 5px;
    letter-spacing: 0.5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .app__content {
    flex: 1;
    position: relative;
    margin-top: 25px;
    height: calc(100% - 25px);
  }
`;

export default Windows;