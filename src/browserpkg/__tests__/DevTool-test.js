/* eslint-disable */

const { jsdomHelper } = require('../../_testHelpers');
jsdomHelper();

const unexpected = require('unexpected');
const unexpectedReact = require('unexpected-react');
const unexpectedSinon = require('unexpected-sinon');
const expect = unexpected
  .clone()
  .installPlugin(unexpectedReact)
  .installPlugin(unexpectedSinon);
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const sinon = require('sinon');

const { observable } = require('mobx');
const { observer } = require('mobx-react');

const {
  default: DevTool,
  GraphControl,
  LogControl,
  UpdatesControl,
  configureDevtool,
  setLogEnabled,
  setUpdatesEnabled,
  setGraphEnabled,
} = require('../../index');
const ContextProvider = require('../../ContextProvider').default;
const Graph = require('../../components/Graph').default;
const MiniBar = require('../../components/MiniBar').default;

class CustomButton extends React.Component {
  render() {
    const { active, onToggle, id } = this.props;
    return (
      <button onClick={onToggle} data-active={active} data-id={id} />
    );
  }
}

class CustomDevTool extends React.Component {
  render() {
    return (
      <div className="my-custom-devtools-panel-design">
        <GraphControl><CustomButton id="buttonGraph" /></GraphControl>
        <LogControl><CustomButton id="buttonConsoleLog" /></LogControl>
        <UpdatesControl><CustomButton id="buttonUpdates" /></UpdatesControl>
      </div>
    );
  }
}

describe('DevTool', () => {

  it('renders Graph & MiniBar', () => {
    const devtoolInstance = TestUtils.renderIntoDocument(<DevTool />);

    expect(devtoolInstance, 'to contain', <MiniBar />);
    expect(devtoolInstance, 'to contain', <Graph />);
  });

  it('renders Graph but no MiniBar if noPanel === true', () => {
    const devtoolInstance = TestUtils.renderIntoDocument(<DevTool noPanel />);

    expect(devtoolInstance, 'to contain', <Graph />);
    expect(devtoolInstance, 'not to contain', <MiniBar />);
  });

  it('Contains buttons', () => {
    const devtoolInstance = TestUtils.renderIntoDocument(<DevTool />);

    expect(
      devtoolInstance,
      'to contain',
      <button
        data-id="buttonUpdates"
        title="Visualize component re-renders"
        data-active={false}
      />
    );

    expect(
      devtoolInstance,
      'to contain',
      <button
        data-id="buttonGraph"
        title="Select a component and show its dependency tree"
        data-active={false}
      />
    );

    expect(
      devtoolInstance,
      'to contain',
      <button
        data-id="buttonConsoleLog"
        title="Log state changes to the browser console"
        data-active={false}
      />
    );
  });
});


describe('configureDevtool', () => {

  it('Enables / disables log', () => {
    const devtoolInstance = TestUtils.renderIntoDocument(<DevTool />);
    const customInstance = TestUtils.renderIntoDocument(<CustomDevTool />);
    const bothInstances = [devtoolInstance, customInstance];

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonConsoleLog" data-active />)
    );

    configureDevtool({ logEnabled: true });

    bothInstances.forEach(i =>
      expect(i, 'to contain', <button data-id="buttonConsoleLog" data-active />)
    );

    configureDevtool({ logEnabled: false });

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonConsoleLog" data-active />)
    );

    setLogEnabled(true);

    bothInstances.forEach(i =>
      expect(i, 'to contain', <button data-id="buttonConsoleLog" data-active />)
    );

    setLogEnabled(false);

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonConsoleLog" data-active />)
    );
  });

  it('Enables / disables graph', () => {
    const devtoolInstance = TestUtils.renderIntoDocument(<DevTool />);
    const customInstance = TestUtils.renderIntoDocument(<CustomDevTool />);
    const bothInstances = [devtoolInstance, customInstance];

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonGraph" data-active />)
    );

    configureDevtool({ graphEnabled: true });

    bothInstances.forEach(i =>
      expect(i, 'to contain', <button data-id="buttonGraph" data-active />)
    );

    configureDevtool({ graphEnabled: false });

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonGraph" data-active />)
    );

    setGraphEnabled(true);

    bothInstances.forEach(i =>
      expect(i, 'to contain', <button data-id="buttonGraph" data-active />)
    );

    setGraphEnabled(false);

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonGraph" data-active />)
    );
  });

  it('Enables / disables updates', () => {
    const devtoolInstance = TestUtils.renderIntoDocument(<DevTool />);
    const customInstance = TestUtils.renderIntoDocument(<CustomDevTool />);
    const bothInstances = [devtoolInstance, customInstance];

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonUpdates" data-active />)
    );

    configureDevtool({ updatesEnabled: true });

    bothInstances.forEach(i =>
      expect(i, 'to contain', <button data-id="buttonUpdates" data-active />)
    );

    configureDevtool({ updatesEnabled: false });

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonUpdates" data-active />)
    );

    setUpdatesEnabled(true);

    bothInstances.forEach(i =>
      expect(i, 'to contain', <button data-id="buttonUpdates" data-active />)
    );

    setUpdatesEnabled(false);

    bothInstances.forEach(i =>
      expect(i, 'not to contain', <button data-id="buttonUpdates" data-active />)
    );
  });

  it('Configures log filter', () => {
    sinon.stub(console, 'warn');
    sinon.stub(console, 'dir');
    sinon.stub(console, 'trace');

    const value = observable('a');

    configureDevtool({ logEnabled: true });

    value.set('b');

    expect(console.dir, 'was called times', 1);

    configureDevtool({ logFilter: ({ newValue, oldValue }) => newValue !== 'd' });

    value.set('c');
    value.set('d');

    expect(console.dir, 'was called times', 2);

    configureDevtool({ logFilter: () => true });

    value.set('e');

    expect(console.dir, 'was called times', 3);

    console.warn.restore();
    console.dir.restore();
    console.trace.restore();
  });
});
