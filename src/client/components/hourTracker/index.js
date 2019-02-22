import React, { Component } from 'react';
import HourTrackerTable from './hourTrackerTable';
import { PLPPureComponent } from '../../baseComponents/importer';

class HourTrackerContainer extends PLPPureComponent {

    handleHourDelete = (scope) => {
        console.log('hour delete',scope)
    }

    handleHourUpdate = (scope) => {
        console.log('hour update',scope)
    }

    render = () => <HourTrackerTable 
            onHourDelete={this.handleHourDelete} 
            onHourUpdate={this.handleHourUpdate} />
}

export default HourTrackerContainer;