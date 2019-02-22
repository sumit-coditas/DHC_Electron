import React from 'react';
import { PLPPureComponent } from '../../baseComponents/importer';
import DailyPopUp from './daily/DailyPopUp';
import WeeklyPopUp from './payday/weekPopup';

class PopUpContainer extends PLPPureComponent {
    render = () =>
        this.props.tableType === 'weekly'
            ? <WeeklyPopUp closePopUp={this.props.closePopUp} />
            : <DailyPopUp closePopUp={this.props.closePopUp} />
}

export default PopUpContainer;