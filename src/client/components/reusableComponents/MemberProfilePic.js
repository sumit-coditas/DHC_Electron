import React, { PropTypes } from 'react';
import Picture from '../widgets/Picture';
import { Popup } from 'semantic-ui-react';
import { PLPPureComponent } from '../../baseComponents/importer';

export default class MemberProfilePic extends PLPPureComponent {
    render() {
        const { name, image } = this.props;
        return (
            <Popup
                trigger={<Picture src={image} avatar href='' />}
                content={name}
            />
        );
    }
}

MemberProfilePic.propTypes = {
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.null])
};
