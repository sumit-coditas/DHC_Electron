import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import Calendar from './../widgets/calendar/Calendar.js';

import LoginStore from './../../stores/LoginStore.js';

export default class UserAvatarHeader extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            LoginStore: LoginStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        LoginStore.listen(this.onChange);
    }

    componentWillUnmount() {
        LoginStore.unlisten(this.onChange);
    }

    render() {
        let self = this;
        let loginState = self.state.LoginStore;

        return (
            <div>
                {loginState.calendarVisible && <Calendar />}
            </div>
        );
    }
}
