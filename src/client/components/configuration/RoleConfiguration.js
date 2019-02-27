import React from 'react';
import { Grid } from 'semantic-ui-react';

import Roles from './Roles.js';
import RoleLevel from './RoleLevel.js';
import Permission from './Permission.js';

export default class RoleConfiguration extends React.PureComponent {
    render() {
        return (
            <Grid centered>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Roles/>
                    </Grid.Column>
                    <Grid.Column>
                        <RoleLevel/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Permission/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}
