import React from 'react';
import { TimePicker, Row, Col } from 'antd';
import { PLPPureComponent } from '../../../baseComponents/importer';
import moment from 'moment';
import '../style.scss'


export const MenuItem = [
    { title: 'Time In', field: 'timeIn' },
    { title: 'Lunch In', field: 'lunchIn' },
    { title: 'Lunch Out', field: 'lunchOut' },
    { title: 'Time Out', field: 'timeOut' },
]
class TimeMenu extends PLPPureComponent {

    handleTimeChange = (time, formatedTime) => {
        time = moment(time).valueOf();
        this.props.onChange(time, this.props.data)
    }

    render() {
        return <div>
           { MenuItem.map((item, index) => {
                const value = this.props.timeValue[item.field]
                return (
                    <div className="flex-item" key={index}>
                        <label>
                            {item.title}
                        </label>
                        <TimePicker
                            minuteStep={15}
                            use12Hours
                            format={"h:mm a"}
                            data={item.field}
                            onChange={(time, formatedTime) => this.props.onChange(time, item.field)}
                            defaultValue={moment(value)} />
                    </div>
                );
            }) }
        </div>
    }
}

export default TimeMenu;