import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css'
import React from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import '../styles/custom.scss'
import PLPPureComponent from './PLPPureComponent';

export default class PLPVirtualSelect extends PLPPureComponent {
    render = () => <VirtualizedSelect {...this.props} />;
}

export class PLPVirtualSelectCustom extends PLPPureComponent {
    render = () => <VirtualizedSelect optionRenderer={(options) => <CustomOption {...options} />} {...this.props} />;
}

class CustomOption extends PLPPureComponent {
    handleSelection = () => {
        this.props.onSelect(this.props.option)
    }
    render() {
        console.log("props", this.props)
        return <div className='option-container' style={{ ...this.props.style, marginBottom: 10 }}>
            <div className='title' onClick={this.handleSelection} >
                {this.props.option.label}
            </div>
            <div className='company-name'>
                {this.props.option.companyName}
            </div>
        </div>
    }
}