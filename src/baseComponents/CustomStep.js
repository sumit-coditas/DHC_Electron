import React from 'react';
import { Step } from 'semantic-ui-react';
import isEqual from 'react-fast-compare';

export default class CustomStep extends React.PureComponent {
    shouldComponentUpdate(nextProps) {
        return !isEqual(this.props, nextProps);
    }

    render = () => <Step {...this.props} />;
}
