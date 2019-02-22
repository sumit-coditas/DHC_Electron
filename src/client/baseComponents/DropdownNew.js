import React from 'react';
import { Dropdown, Menu } from 'antd';
import Scrollbar from 'perfect-scrollbar-react';
import 'perfect-scrollbar-react/dist/style.min.css';
import PLPPureComponent from './PLPPureComponent';

export default class DropdownNew extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        };
    }

    handleMenuClick = (event) => {
        this.setState({ visible: false });
        this.props.handleDropdownChange(event, this.props.id, this.props.data)
    };

    handleVisibleChange = (flag) => {
        this.setState({ visible: flag });
    };

    getMenu = (items) => <Scrollbar>
        <div style={{ maxHeight: '200px' }} >
            <Menu onClick={this.handleMenuClick}>
                {items.map((item, key) =>
                    <Menu.Item key={key} id={item.id || key} selectable>
                        {item.name}
                    </Menu.Item>
                )}
            </Menu >
        </div>
    </Scrollbar>;

    render() {
        const {
            menuList,
            children
        } = this.props;

        return (
            <Dropdown
                overlay={this.getMenu(menuList)}
                trigger={['click']}
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.visible}
            >
                <div className='ant-dropdown-link'>
                    {children}
                </div>
            </Dropdown>
        );
    }
}
