import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LogItem from './LogItem';

const renderStyle = () => (
  <style>
    {`
      .mobxdevtool__Log {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        overflow-x: auto;
        padding: 10px 0;
      }
      .mobxdevtool__LogItem {
        cursor: default;
      }
      .mobxdevtool__LogItem .mobxdevtool__LogItem {
        padding-left: 10px;
      }
      .mobxdevtool__LogItem:not(:last-child) {
        border-bottom: 1px solid #ddd;
      }
      .mobxdevtool__LogItem__body {
         position: relative;
         padding: 4px 0 4px 12px;
      }
      .mobxdevtool__LogItem__body--has-children:hover {
        background-color: rgba(0, 0, 0, 0.09);
      }
      .mobxdevtool__LogItem__body--has-children::before {
        content: "";
        display:block;
        position: absolute;
        top: 50%;
        left: 7px;
        width: 0;
        height: 0;
        border-style: solid;
      }
      .mobxdevtool__LogItem__body--closed::before {
        border-width: 3px 0 3px 4px;
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        margin: -3px -2px;
      }
      .mobxdevtool__LogItem__body--open::before {
        border-width: 4px 3px 0 3px;
        border-left-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        margin: -2px -3px;
      }
      .mobxdevtool__LogItem__body--type-action {
        color: dodgerblue;
      }
      .mobxdevtool__LogItem__body--type-transaction {
        color: gray;
      }
      .mobxdevtool__LogItem__body--type-scheduled-reaction {
        color: #10a210;
      }
      .mobxdevtool__LogItem__body--type-reaction {
        color: #10a210;
      }
      .mobxdevtool__LogItem__body--type-compute {
        color: #10a210;
      }
      .mobxdevtool__LogItem__body--type-error {
        color: tomato;
      }
    `}
  </style>
);

export default class Log extends Component {

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.$unsubscribe = this.context.store.subscibeUpdates(() => this.setState({}));
  }

  componentDidUpdate() {
    if (this.scrollEnd && this.containerEl) {
      this.containerEl.scrollTop = this.containerEl.scrollHeight;
    }
  }

  componentWillUnmount() {
    this.$unsubscribe();
  }

  scrollEnd = true;

  handleScroll = () => {
    if (this.containerEl) {
      const { scrollTop, offsetHeight, scrollHeight } = this.containerEl;
      this.scrollEnd = ((scrollTop + offsetHeight) - scrollHeight) > -11; /* padding is 10px */
    }
  };

  render() {
    const { log } = this.context.store.state;
    return (
      <div className="mobxdevtool__Log" onScroll={this.handleScroll} ref={(el) => { this.containerEl = el; }}>
        {renderStyle()}
        {log.map(change => <LogItem change={change} key={change.id} />)}
      </div>
    );
  }
}
