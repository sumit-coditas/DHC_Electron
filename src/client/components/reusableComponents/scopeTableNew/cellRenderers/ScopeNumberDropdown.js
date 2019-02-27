import React from 'react';
import Constant from '../../../helpers/Constant';
import { Select } from '../../../../baseComponents/Select';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { updateScopeHighlightService } from '../../../../service/scopeService';
import { PLPPureComponent } from '../../../../baseComponents/importer';

export class ScopeNumberDropdown extends PLPPureComponent {

    handleColorChange = (value, d) => {
        const { loggedInUser, id } = this.props.data;
        const data = {
            scopeId: id,
            userId: loggedInUser._id
        }
        this.handleColorChangeCall(value, data)
    }

    handleColorChangeCall = (value, data) => {
        const { userId, scopeId } = data;
        const scopeInstance = ScopeModel.getScopeId(scopeId);
        if (!scopeInstance) return;

        const { highlights } = scopeInstance.props;
        let highlight = highlights.find(item => item.user === userId);

        if (!value || (highlight && value === highlight.color)) {
            return;
        }
        if (!highlight) {
            highlight = {
                user: userId,
                color: value
            }
        } else {
            highlight.color = value;
        
        }
        updateScopeHighlightService(scopeId, highlight)
    }

    render = () => <Select
        value={this.props.value}
        handleChange={this.handleColorChange}
        className='table-select'
        dropdownClassName='select-options'
        options={Constant.SCOPE_HIGHLIGHTERS}
    />;

}
