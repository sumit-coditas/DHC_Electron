import React from 'react';
import { Grid, Header } from 'semantic-ui-react';

import Location from './Location.js';
import Workload from './Workload.js';
import ItemType from './ItemType.js';

export default class PersonalUpdate extends React.PureComponent {
    render() {
        return (
            <div>
                <Grid centered columns='equal'>
                    <Grid.Row>
                        <Header as='h2'>Define Status Types</Header>
                    </Grid.Row>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Workload />
                        </Grid.Column>
                        <Grid.Column>
                            <Location />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <ItemType />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
