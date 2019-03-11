import React from 'react';
import { connect } from 'react-redux';

import { isEmpty } from '../../utils/utils';
import { executePromiseAction } from '../../actions/loadingActions';

export class AsyncImpl extends React.Component {
    componentWillMount() {
        this.executePromise();
    }

    executePromise = () => {
        const { identifier, promise } = this.props;
        if (promise instanceof Function) {
            executePromiseAction(
                promise(),
                identifier
            );
        }
    }

    renderChildren = () => {
        const { content, loader, error, identifier, loadingState } = this.props;
        const { isLoading, hasError } = loadingState;
        if ((isLoading || isEmpty(loadingState)) && loader) {
            return React.Children.only(loader);
        }

        if (!isLoading && !hasError) {
            return React.Children.only(content);
        }

        if (hasError && Error) {
            return React.Children.only(error);
        }
        return null;
    }

    render() {
        return this.renderChildren();
    }
}

export function mapStateToProps(state, ownProps) {
    return {
        loadingState: state.loading.get(ownProps.identifier) || ownProps.initialState || {}
    };
}

export const Async = connect(mapStateToProps)(AsyncImpl);
