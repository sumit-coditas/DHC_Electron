import React from 'react';
import Constant from '../helpers/Constant';
import { Select } from '../../baseComponents/Select';
import { PLPPureComponent } from '../../baseComponents/importer';

export class ScopeNumberDropdown extends PLPPureComponent {

    handleColorChange = (value, d) => {
        const { loggedInUserId, id } = this.props.params.data;
        const data = {
            scopeId: id,
            // highlight,
            userId: loggedInUserId
        }
        this.props.handleColorChange(value, data)
    }

    render = () => <Select
        value={this.props.params.value}
        handleChange={this.handleColorChange}
        className='table-select'
        dropdownClassName='select-options'
        options={Constant.SCOPE_HIGHLIGHTERS}
    />;

}
