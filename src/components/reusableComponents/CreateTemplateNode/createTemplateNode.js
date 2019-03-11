import React from 'react';

import { Button, Modal } from 'antd';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';

class CreateTemplateNodeImpl extends PLPPureComponent {

    state = {
        nodeTitle: ''
    }

    onChange = ({target}) => {
        this.setState({nodeTitle: target.value});
    }

    addTemplateNode = () => {
        this.props.addTemplateNode(this.state.nodeTitle);
    }

    render = () => <Modal
        title="Add Template"
        visible
        centered
        id='add_template_modal'
        cancelButtonProps={{ className: 'cancel-btn-right' }}
        bodyStyle={{ overflow: 'auto', maxHeight: 400 }}
        okButtonProps={{ disabled: this.state.nodeTitle === '' }}
        onCancel={this.toggleCreateNodePopup}
        onOk={this.addTemplateNode}
    >
        <input 
        type="text"
        className="ant-input" 
        onChange={this.onChange} 
        name="title" 
        value={this.state.nodeTitle} 
        required
        />
    </Modal>

}

export const CreateTemplateNode = CreateTemplateNodeImpl;

