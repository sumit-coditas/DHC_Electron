import React from 'react';
import { HoursInput, TextAreaAntd, PriceInput, TextInput, SelectOption, CustomDatePicker, CustomVirtualSelect, CustomFormItem } from '../formComponents/inputs';
import { STATUS_OPTIONS_SEMANTIC, STATUS_OPTIONS } from '../../../helpers/Constant';
import isEqual from 'react-fast-compare';
import { getDrafterHours, getEngineerHours } from '../../../reusableComponents/scopeTableNew/ScopeTableUtils';
import { Row, Divider, Col, Icon } from 'antd';
import moment from 'moment';
import '../styles.scss';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';


class ScopeForm extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCustomerContact: undefined,
            engineer: null, 
            drafter: null,
            itemType: null, 
            selectedItemType: null,
            engineerStatus: null, 
            drafterStatus: null
        }
    }

    handleScopeChange = (value, name) => {
        if (name === 'itemType') {
            this.setState({ selectedItemType: value });
            // value = value.value
        }
        const { _id, id, isNewScope } = this.props.scope
        const scope = { id, _id, [name]: value, isNewScope: isNewScope || false }
        if (name === 'customerContact') {
            scope[name] = { id: value.id, name: value.label }
            this.setState({ selectedCustomerContact: value });
        }
        this.props.handleScopeChange(scope, name);
    };

    handleRoleChangeNew = (value, name, role) => {
        const roleDetails = role === 'engineer' ? 'engineerDetails' : 'drafterDetails';
        const isFromVirtualSelect = ['engineer', 'drafter', 'status'].includes(name);
        const { isNewScope } = this.props.scope
        const scope = {
            id: this.props.scope.id,
            _id: this.props.scope._id,
            [name]: isFromVirtualSelect ? value.value : value,
            isNewScope: isNewScope || false

        }
        if (isFromVirtualSelect) {
            const field = name === 'status' ? role === 'engineer' ? 'engineerStatus' : 'drafterStatus' : name;
            this.setState({ [field]: value });
        }
        this.props.handleScopeChange(scope, roleDetails)
    }

    handleScopeRemove = () => {
        const { isNewScope, id, childScopes } = this.props.scope;
        this.props.onRemoveScope(id, !isNewScope, childScopes)
    };

    render() {
        const {
            id, note, number, price, dueDate, itemType, isNewScope,
            customerContact, definition, engineerDetails, drafterDetails, hourTrackers
        } = this.props.scope;
        const { itemTypesOptions, engineerList, drafterList } = this.props.optionList;
        let { getCustomerContacts, customerContactOptions, error, isLastScope, onAddNewScope, maxScopeError } = this.props;
        error = error && error.error;
        // const value = _.filter(itemTypesOptions, function(list) { return list._id === "59cac2d594d0000012f60414"; });
        // {this.props.isTask && this.handleScopeChange(value[0], 'itemType')}
        const selectedItemType = this.state.selectedItemType || itemType || { label: '-', value: '-' }

        return (
            <div id={id} key={id} >
                <Divider>Scope {number}</Divider>
                <Row gutter={16}>
                    <TextAreaAntd error={error && error.definitionError} required rows={5} offset={1} span={7} label="Scope" onBlur={(e) => this.handleScopeChange(e.target.value, e.target.name)} name="definition" defaultValue={definition} />
                    <Col offset={1} span={7}>
                        <Row>
                            <TextInput error={error && error.noteError} maxLength={16} required name="note" span={24} label="Scope Note" defaultValue={note} onBlur={(e) => this.handleScopeChange(e.target.value, e.target.name)} />
                        </Row>
                        <Row gutter={16}>
                        {!this.props.isTask && <PriceInput error={error && error.priceError} required span={12}
                                label={"Cost"} name="price" defaultValue={price || 0}
                                onChange={this.handleScopeChange}
                            />}
                            <CustomDatePicker error={error && error.dueDateError}
                                disabledDate={(current) => current && current.valueOf() < moment().subtract(1, 'day')}
                                required span={12} label={"Due Date"} onChange={this.handleScopeChange}
                                data="dueDate" label="Due Date" defaultValue={dueDate ? dueDate : moment()} />
                        </Row>
                    </Col>
                    <Col offset={1} span={7}>
                        <Row>
                            <CustomVirtualSelect
                                error={error && error.itemTypeError}
                                required span={24} label={"Item Type"} name="itemType"
                                data={"itemType"} options={itemTypesOptions}
                                // handleChange={this.handleScopeChange} defaultValue={itemType && itemType.name || '-'} 
                                onChange={(selectedItem) => this.handleScopeChange(selectedItem, 'itemType')} value={selectedItemType}
                            />
                            <CustomVirtualSelect
                                custom
                                span={24} label={"Customer Contact"}
                                onChange={(contact) => this.handleScopeChange(contact, "customerContact")}
                                options={customerContactOptions} value={this.state.selectedCustomerContact || customerContact} />
                        </Row>
                    </Col>
                </Row>
                <Row gutter={4}>
                    <RoleDetails error={error} onChange={this.handleRoleChangeNew}
                        label = {this.props.isTask && 'PM' || 'Engineer'}
                        roleKey="engineer" 
                        id={id} 
                        optionsList={engineerList}
                        selectedStatus={this.state.engineerStatus}
                        roleData={engineerDetails} 
                        selectedUser={this.state.engineer} />
                    <RoleDetails 
                    onChange={this.handleRoleChangeNew} 
                    roleKey="drafter"
                        id={id} 
                        label = {this.props.isTask && 'AE' || 'Drafter'}
                        optionsList={drafterList} 
                        selectedUser={this.state.drafter}
                        roleData={drafterDetails}
                         selectedStatus={this.state.drafterStatus}
                          />
                    <Col offset={1} span={7}>
                        <Row>
                            <TextInput span={24} disabled value={getEngineerHours(hourTrackers)} label="Final Engineering Hours" />
                            <TextInput span={24} disabled value={getDrafterHours(hourTrackers)} label="Final Drafter Hours" />
                        </Row>
                    </Col>
                </Row>
                <Row style={{ marginTop: 5, marginBottom: 5 }} type="flex">
                    <Col offset={1} span={12}>
                        {
                            !maxScopeError && isLastScope
                            && <Icon className="color-priamry icon-large cursor-pointer" onClick={onAddNewScope} style={{ height: 25, width: 25 }} type="plus-circle" />
                            || <p className="ant-form-explain">{maxScopeError}</p>
                        }
                    </Col>
                    <Col offset={4} span={7}>
                        {number != "A" && <Icon className="color-warning icon-large cursor-pointer" onClick={this.handleScopeRemove} style={{ height: 25, width: 25, float: 'right' }} type="minus-circle" />}
                    </Col>
                </Row>
            </div>
        );
    }
}

class RoleDetails extends PLPPureComponent {
    render() {
        const { optionsList, id, roleData, roleKey, onChange, error, selectedStatus, selectedUser } = this.props;
        const roleDetails = roleData[roleKey];
        // const label = roleKey === 'drafter' ? "Drafter" : "Engineer";
        const optional = roleKey === 'drafter' ? false : true;
        const statusValue = selectedStatus || roleData && { label: roleData.status, value: roleData.status } || { label: 'ASAP', value: 'ASAP' }
        const userValue = selectedUser || roleDetails && { label: `${roleDetails.firstName} ${roleDetails.lastName}`, value: roleDetails._id } || { label: '-', value: '-' }

        return (
            <Col offset={1} className="page-wrapper" span={7} style={{ backgroundColor: roleKey !== 'drafter' ? '#F2F2F2' : '#F2FAFC', padding: '24px', borderRadius: '4px' }}>
                <Row>
                    <CustomVirtualSelect error={error && error.engineerError} required={optional} span={24} options={optionsList} label={this.props.label} data={{}}
                        value={userValue} onChange={(value) => onChange(value, roleKey, roleKey)}
                    />
                </Row>
                <Row>
                    <CustomVirtualSelect required={optional} span={24} data={id} label="Status"
                        options={STATUS_OPTIONS}
                        value={statusValue} onChange={(value) => onChange(value, "status", roleKey)}
                    />
                </Row>
                <Row gutter={16}>
                    <HoursInput name="urgentHours" required={optional} error={error && error.engineerUrgentHourError} defaultValue={roleData.urgentHours || 0} label="Urgent Hour"
                        onBlur={(e) => onChange(e.target.value, "urgentHours", roleKey)} span={12} />
                    <HoursInput name="nonUrgentHours" required={optional} defaultValue={roleData.nonUrgentHours || 0} label="Non Urgent Hour"
                        onBlur={(e) => onChange(e.target.value, "nonUrgentHours", roleKey)} span={12} error={error && error.engineerNonUrgentHoursError} />
                </Row>
            </Col>
        )
    }
}
export default ScopeForm;
