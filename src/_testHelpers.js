import { jsdom } from 'jsdom';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import unexpectedSinon from 'unexpected-sinon';

export const jsdomHelper = (html) => {
  if (typeof document !== 'undefined') {
    return;
  }
  global.document = jsdom(html || '');
  global.window = global.document.defaultView;
  global.navigator = { userAgent: 'JSDOM' };
};

export const getExpect = () =>
  unexpected.clone()
    .installPlugin(unexpectedReact)
    .installPlugin(unexpectedSinon);
