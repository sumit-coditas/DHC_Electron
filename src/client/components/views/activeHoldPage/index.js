import React  from 'react';
import AcitveHold from './container/activeHoldPage';
import { PLPPureComponent } from '../../../baseComponents/importer';

export default class ActiveHoldPage extends PLPPureComponent {
    render = () => <AcitveHold {...this.props}/>;
}
