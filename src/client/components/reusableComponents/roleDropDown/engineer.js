import React from 'react';
import AppStore from '../../../stores/AppStore';
import { connect } from 'react-redux';
import { VirtualSelect, PLPPureComponent } from '../../../baseComponents/importer';
import { getManagersAndEngineers, getDrafters, getOtherEmployees } from '../scopeTableNew/ScopeTableUtils';
import { EmployeeModel } from '../../../model/AppModels/EmployeeModel';


class EngineerList extends PLPPureComponent {
    state = { selectedItem: { label: '', value: '' } }

    handleSelected = (selectedItem) => {
        this.setState({ selectedItem });
        this.props.onChange(selectedItem.value, this.props.data)
    }

    render() {
        const engineerList = this.props.options || getOptions(this.props.engineerList);
        const defaultValue = this.props.defaultValue || this.state.selectedItem;
        const { label, containerClassName, required, ...props } = this.props;
        return (
            <div className={containerClassName}>
                {label && <label className={'ant-form-item' + `${required ? '-required' : ''}`} style={{ marginBottom: 10 }}>{label}</label>}
                <VirtualSelect value={defaultValue} options={engineerList} onChange={this.handleSelected} />
            </div>
        )
    }
}

export function getOptions(userList = []) {
    return userList.map(element => {
        const obj = { ...element, label: element.name, value: element.id }
        return obj
    })
}

function mapStateToProps() {
    return {
        engineerList: getOtherEmployees(EmployeeModel.list().map(({ props }) => props))
    }
}
export default connect(mapStateToProps)(EngineerList)