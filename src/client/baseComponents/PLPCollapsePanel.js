import { Collapse } from 'antd';
import React from 'react';

import PLPPureComponent from './PLPPureComponent';

export class PLPCollapsePanel extends PLPPureComponent {

    render = () => {
        const { children, ...rest } = this.props;
        return <Collapse.Panel {...rest} >
            {children}
        </Collapse.Panel>
    }
}
