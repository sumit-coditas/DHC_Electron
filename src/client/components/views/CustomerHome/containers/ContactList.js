import React, { PropTypes } from 'react';
import { Grid } from 'semantic-ui-react';

import { MemberProfileMenuIcon } from '../../../reusableComponents/MemberProfileMenuIcon';

export const ContactList = ({ klass, label, value, photo, email, showPhoto }) => (<Grid.Row className={klass}>
    <Grid.Column className='label'>
        {label} :
    </Grid.Column>
    <Grid.Column className='value'>
        {showPhoto && <MemberProfileMenuIcon photo={photo} email={email} name={value} />}
        {value}
    </Grid.Column>
</Grid.Row>);

ContactList.propTypes = {
    klass: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    label: PropTypes.string.isRequired,
    photo: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    email: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    showPhoto: PropTypes.oneOfType([PropTypes.bool, PropTypes.null]),
    value: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired])
};
