import React from 'react';
import { Icon } from 'antd';
import PLPPureComponent from './PLPPureComponent';

export class AddIcon extends PLPPureComponent {
    render = () => <Icon className="icon-large cursor-pointer" type="plus-circle" {...this.props} />
}
export class RemoveIcon extends PLPPureComponent {
    render = () => <Icon className="icon-large cursor-pointer" type="minus-circle" {...this.props} />
}
export class CrossIcon extends PLPPureComponent {
    render = () => <Icon className="icon-large cursor-pointer" type="close" {...this.props} />
}
export class DeleteIcon extends PLPPureComponent {
    handleClick = (e) => {
        if (this.props.disabled) { return }
        this.props.onClick(this.props.data)
    }
    render = () => {
        const className = this.props.disabled ? 'cursor-pointer-not-allowed' : 'cursor-pointer'
        return <Icon className={className} type="delete" {...this.props} onClick={this.handleClick} />
    }
}
