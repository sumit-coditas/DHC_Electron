import { PureComponent } from 'react';
import isEqual from 'react-fast-compare';


export default class PLPPureComponent extends PureComponent {
    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
    }
}
