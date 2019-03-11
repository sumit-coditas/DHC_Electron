import React from 'react';
import { PLPPureComponent } from '../../../../baseComponents/importer';

class CostRenderer extends PLPPureComponent {
    render = () => <span>$ {this.props.value}</span>;

}

export default CostRenderer;