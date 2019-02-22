import React, { PropTypes } from 'react';
import { Popup } from 'semantic-ui-react';

import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import Picture from '../widgets/Picture';

export class MemberProfileMenuIcon extends PLPPureComponent {

    render = () => <Popup
        on='click'
        trigger={<Picture avatar src={this.props.photo} />}
        style={{ padding: '5px', textAlign: 'center' }}
    >
        <div style={{ margin: '0 30px' }}>
            {this.props.name || 'Not Selected'}
        </div>
        {this.props.email && <a href={`mailto:${this.props.email}`}>email</a>}
    </Popup>;
}

MemberProfileMenuIcon.propTypes = {
    photo: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    email: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.null])
};

