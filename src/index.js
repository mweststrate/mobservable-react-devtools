import ObjectAssign from 'es6-object-assign';
import { configureDevtool } from './browserpkg/DevTool';

export { default, configureDevtool } from './browserpkg/DevTool';
export { default as GraphControl } from './browserpkg/Controls/GraphControl';
export { default as LogControl } from './browserpkg/Controls/LogControl';
export { default as UpdatesControl } from './browserpkg/Controls/UpdatesControl';

export const setUpdatesEnabled = updatesEnabled => configureDevtool({ updatesEnabled });
export const setGraphEnabled = graphEnabled => configureDevtool({ graphEnabled });
export const setLogEnabled = logEnabled => configureDevtool({ logEnabled });

ObjectAssign.polyfill();

