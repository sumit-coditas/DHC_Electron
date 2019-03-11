import React from 'react';
import { Image } from 'semantic-ui-react';
import user from '../../assets/images/user.jpg';

const Picture = (props) => (
    (<Image {...props} src={props.src ? props.src : user} />)
);

export default Picture;
