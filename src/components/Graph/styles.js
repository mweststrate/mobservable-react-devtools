export const graph = {
  background: 'white',
  padding: '4%',
};

export const close = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '36px',
  position: 'absolute',
  top: '5px',
  right: '5px',
  width: '40px',
  height: '40px',
  lineHeight: '34px',
  textAlign: 'center',
  cursor: 'pointer',
  zIndex: 1,
};

/* TREE */

export const tree = {
  position: 'relative',
  paddingLeft: '20px',
};

export const rootThree = Object.assign({}, tree, { paddingLeft: 0 });

export const item = {
  position: 'relative',
};

export const box = {
  padding: '4px 10px',
  background: 'rgba(0, 0, 0, 0.05)',
  display: 'inline-block',
  marginBottom: '8px',
  color: '#000',
  root: {
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '6px 13px',
  },
};

export const itemHorisontalDash = {
  position: 'absolute',
  left: '-12px',
  borderTop: '1px solid rgba(0, 0, 0, 0.2)',
  top: '14px',
  width: '12px',
  height: '0',
};

export const itemVericalStick = {
  position: 'absolute',
  left: '-12px',
  borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
  height: '100%',
  width: 0,
  top: '-8px',
  short: {
    height: '23px',
  },
};
