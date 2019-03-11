import React from 'react';
import * as PropTypes from 'prop-types';
import {
    Dropdown
} from 'semantic-ui-react';
const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;

// cell renderer for the proficiency column. this is a very basic cell editor,
export default class ScopeTableDropDown extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.createInitialState(props);
    }

    createInitialState(props) {

        let startValue;
        const putCursorAtEndOnFocus = false;
        const highlightAllOnFocus = false;

        if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
            startValue = '';
        } else if (props.charPress) {
            startValue = props.charPress;
        } else {
            startValue = props.value;
            if (props.keyPress === KEY_F2) {
                this.putCursorAtEndOnFocus = true;
            } else {
                this.highlightAllOnFocus = true;
            }
        }

        return {
            value: startValue,
            putCursorAtEndOnFocus: putCursorAtEndOnFocus,
            highlightAllOnFocus: highlightAllOnFocus
        }
    }

    render() {
        // return (
        //     <input ref="textField" value={this.state.value} onChange={this.onChangeListener.bind(this)}/>
        // );

        return (<Dropdown
            options={[{ key: 'asd', value: 'asd', name: 'asd' }, { key: 'asdasd', value: 'asdasd', name: 'asdasd' } ]}
            // onClick={self._stopPropagation.bind(self)}
            onChange={this.onChangeListener.bind(this)}
            // trigger={triggerDropDown}
            selectOnBlur={false}
            pointing='top left'
            // disabled={!haveWriteAccess}
        />);
    }

    onChangeListener(event) {
        const newState = {
            value: event.target.value,
            putCursorAtEndOnFocus: this.state.putCursorAtEndOnFocus,
            highlightAllOnFocus: this.state.highlightAllOnFocus
        };
        this.setState(newState);
    }

    getValue() {
        return this.state.value;
    }

    afterGuiAttached() {
        const eInput = this.refs.textField;
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        } else {
            const length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
                eInput.setSelectionRange(length, length);
            }
        }
    }

    isPopup() {
        return false;
    }

    isCancelBeforeStart() {
        return false;
    }

    isCancelAfterEnd() {
        if (this.state.value && this.state.value.toUpperCase() === 'CANCEL') {
            return true;
        }
        return false;
    }
}

ScopeTableDropDown.propTypes = {
    params: PropTypes.object
};
