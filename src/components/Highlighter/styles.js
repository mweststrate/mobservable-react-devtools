export const box = {
    display: 'block',
    position: 'fixed',
    zIndex: '64998',
    minWidth: '60px',
    outline: '3px solid',
    pointerEvents: 'none',
    transition: 'opacity 500ms ease-in',
};

export const text = {
    fontFamily: 'verdana, sans-serif',
    padding: '0 4px 2px',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '10px',
    lineHeight: '12px',
    pointerEvents: 'none',
    float: 'right',
    borderBottomRightRadius: '2px',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
};

export const rendering = {
    cheap: {
        outlineColor: 'rgba(182, 218, 146, 0.75)',
        text: {
            backgroundColor: 'rgba(182, 218, 146, 0.75)',
        },
    },
    acceptable: {
        outlineColor: 'rgba(228, 195, 66, 0.85)',
        text: {
            backgroundColor: 'rgba(228, 195, 66, 0.85)',
        },
    },
    expensive: {
        outlineColor: 'rgba(228, 171, 171, 0.95)',
        text: {
            backgroundColor: 'rgba(228, 171, 171, 0.95)',
        },
    },
};



export const hover = {
    outlineColor: 'rgba(128, 128, 255, 0.5)',
};
