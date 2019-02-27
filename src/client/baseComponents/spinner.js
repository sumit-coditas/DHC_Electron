import React from 'react';
import PLPPureComponent from './PLPPureComponent';
import { Spin, Icon } from 'antd';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class Spinner extends PLPPureComponent {
    render = () => <Spin {...this.props} />
}

export default Spinner;

export class CustomSpinner extends PLPPureComponent {
    render = () => <Spin indicator={antIcon} />
}
