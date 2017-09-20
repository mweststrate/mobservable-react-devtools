/**
 * Turns a React component or stateless render function into a reactive component.
 */
import React = require('react');

export interface IDevToolProps {
    highlightTimeout?: number;
    position?: {
        top?:    number | string;
        right?:  number | string;
        bottom?: number | string;
        left?:   number | string;
    };
    noPanel?: boolean;
}

export default class DevTools extends React.Component<IDevToolProps, {}> { }
export class GraphControl extends React.Component<{}, {}> { }
export class LogControl extends React.Component<{}, {}> { }
export class UpdatesControl extends React.Component<{ highlightTimeout?: number }, {}> { }

export function configureDevtool(options: {
    logEnabled?: boolean,
    updatesEnabled?: boolean,
    graphEnabled?: boolean,
    logFilter?: (p: any) => boolean,
}): void;

export function setUpdatesEnabled(enabled: boolean): void;
export function setGraphEnabled(enabled: boolean): void;
export function setLogEnabled(enabled: boolean): void;
