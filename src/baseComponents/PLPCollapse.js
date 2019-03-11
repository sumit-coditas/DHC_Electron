import { Collapse } from 'antd';
import React from 'react';

import PLPPureComponent from './PLPPureComponent';

export class PLPCollapse extends PLPPureComponent {

    render() {
        const { children, ...rest } = this.props;
        return <Collapse {...rest}>
            {children}
        </Collapse>;
    }
}
