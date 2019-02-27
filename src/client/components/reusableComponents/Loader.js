import React from 'react';
import { Spin, Icon } from 'antd';

export class Loader extends React.PureComponent {
    render() {
        const antIcon = <Icon type='loading' style={{ fontSize: 36 }} spin />;
        return (
            <div style={{ textAlign: 'center', margin: 'auto' }}>
                <Spin indicator={antIcon} />
            </div>
        );
    }
}