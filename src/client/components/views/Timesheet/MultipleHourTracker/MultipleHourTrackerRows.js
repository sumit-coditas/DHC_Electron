import React from 'react';

import { PLPPureComponent } from '../../../../baseComponents/importer';

import { MultipleHourTrackerRow} from './MultipleHourTrackerRow';

export class MultipleHourTrackerRows extends PLPPureComponent {
    constructor(props) {
        super(props);
    }

    getSumOfSection = () => {
        const sumOfSection = this.props.sectionedRows.reduce((sum, ele) => {
            sum+=parseFloat(ele.hoursSpent);
            return sum;
        }, 0);
        return <div className='section-sum'>
            <span>Total Hours: {sumOfSection}</span>
        </div>
    }

    renderRows = () => {
        const hourTrackerRows = this.props.sectionedRows.map(row => {
            return <MultipleHourTrackerRow key={row.id}
                {...row}
                addRow={() => this.props.addRow(row)}
                removeRow={() => this.props.removeRow(row)}
                handleChange={this.props.handleChange}
                handleTaskChange={this.props.handleTaskChange}
                handleDateChange = {this.props.handleDateChange}
            />
        });
        return hourTrackerRows;
    }
    
    render() {
        return(
            <div className='section-wrapper'>
                {this.renderRows()}
                {this.getSumOfSection()}
            </div>    
        );
    }
}
