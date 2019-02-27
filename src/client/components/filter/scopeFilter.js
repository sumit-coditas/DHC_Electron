import React from 'react';
import { PLPPureComponent, VirtualSelect, CustomRangePicker } from '../../baseComponents/importer';
import { connect } from 'react-redux';
import { EmployeeModel } from '../../model/AppModels/EmployeeModel';
import { getContractors, getCitiesStates } from '../../utils/promises/TaskPromises';
import moment from 'moment';
import { getContractorOptions, getOptions } from '../taskGroupWrapper/projectDetailNew/util';
import { ItemTypeModel } from '../../model/AppModels/ItemTypeModel';
import Constants from '../../components/helpers/Constant';
import { Creatable } from 'react-select'
import { getDrafters, getManagersAndEngineers } from '../reusableComponents/scopeTableNew/ScopeTableUtils';
import { AdvanceFilter } from '../../model/AppModels/FilterModel';
import { Button, Row, Col, Collapse } from 'antd';
import { searchKeywords } from '../../utils/promises/itemTypePromise';
import { getFilterScopes } from '../../utils/promises/ScopePromises';
import { ScopeModel } from '../../model/CustomerHomeModels/ScopeModel';
import { UserModel } from '../../model/UserModel';
import { PLPCollapse } from '../../baseComponents/PLPCollapse';
import { PLPCollapsePanel } from '../../baseComponents/PLPCollapsePanel';
import './filterStyle.scss';
import uniqBy from 'lodash/uniqBy';
import { STATE_OPTIONS } from './stateList';
import { UtilModel } from '../../model/AppModels/UtilModel';
import { sortEmployee } from '../../utils/common';
import { changeSubmitButtonStyle } from '../../utils/changeBackgroundOfSubmit';

const defaultStartYear = moment().subtract(1, 'year');
const currentYear = moment();

const fields = [
    { title: 'Status', field: 'status', optionsKey: 'SEMNTIC_OPTIONDS', valueKey: 'status', creatable: false },
    { title: 'City', field: 'city', optionsKey: 'cityOptions', valueKey: 'city', creatable: true },
    { title: 'State', field: 'state', optionsKey: 'stateOptions', valueKey: 'state', creatable: true },
    { title: 'Project Manager', field: 'status', optionsKey: 'engineerList', valueKey: 'managers', creatable: false },
    { title: 'Engineer', field: 'engineers', optionsKey: 'engineerList', valueKey: 'engineers', creatable: false },
    { title: 'Drafter', field: 'drafters', optionsKey: 'drafterList', valueKey: 'drafters', creatable: false },
    { title: 'Contractor', field: 'contractors', async: true, optionsKey: 'contractorsOptions', valueKey: 'drafters', creatable: false },
    { title: 'Item Types', field: 'itemType', async: false, optionsKey: 'itemTypesOptions', valueKey: 'contractors', creatable: false },
];
class ScopesFilter extends PLPPureComponent {
    state = {
        contractorsOptions: [],
        keywordOptions: [],
        loading: false
    };

    async componentWillMount() {
        getCitiesStates()
            .then(response => {
                if (Array.isArray(response) && response[0]) {
                    AdvanceFilter.saveFilter('cityOptions', response[0].uniqueCities);
                    AdvanceFilter.saveFilter('stateOptions', response[0].uniqueStates);
                    AdvanceFilter.saveFilter('isPanelCollapsed', true);
                }
                // const { user } = this.props;
                // const isDrafter = user.role.name === 'Drafter';
                // const defaultUser = { label: user.firstName + " " + user.lastName, value: user._id };
                // if (!isDrafter) {
                //     AdvanceFilter.saveFilter('managers', [defaultUser]);
                //     AdvanceFilter.saveFilter('engineers', [defaultUser])
                // } else {
                //     AdvanceFilter.saveFilter('drafter', [defaultUser])
                // }
            })
            .catch(err => console.log("error in fetching city state", err))
    }

    handlePanelChange = (value, mode) => {
        AdvanceFilter.saveFilter('range', value)
    };

    handleSelection = (selected, field) => {
        AdvanceFilter.saveFilter(field, selected)
    };

    handleSearch = async (query, field) => {
        if (!query) return;
        try {
            switch (field) {
                case 'contractorsOptions':
                    let contractors = await getContractors(query);
                    const options = getContractorOptions(contractors, null, true)
                    // const contractorsOptions = uniqBy(contractors, (contractor) => contractor.companyName).map((contractor) => {
                    //     return {
                    //         id: contractor.id, label: contractor.companyName, value: contractor.id,
                    //     }
                    // });
                    // this.setState({ [field]: contractorsOptions });
                    return { options };
                case 'keywordOptions':
                    let keys = await searchKeywords({ keyword: query });
                    let keywordOptions = getOptions(keys, '_id', 'title'); 
                    keywordOptions = uniqBy(keywordOptions,'label')
                    return { options: keywordOptions };

            }
        } catch (error) {
            console.log('error', error)
        }
    };

    handlePopulate = () => {
        let { drafters, managers, engineers, city, state, keywords, range, status, itemType, contractors } = this.props.filter;
        const rangeValue = range || [defaultStartYear, currentYear];
        const payload = {
            drafters: drafters && drafters.map(item => item.value && item.value || item) || [],
            managers: managers && managers.map(item => item.value && item.value || item) || [],
            engineers: engineers && engineers.map(item => item.value && item.value || item) || [],
            cities: city && city.map(item => item.value && item.value || item) || [],
            states: state && state.map(item => item.value && item.value || item) || [],
            scopeKeywords: keywords && keywords.map(item => {
                return { id: item.value, title: item.label }
            }) || [],
            fromYear: moment(rangeValue[0]).format('YYYY'),
            toYear: moment(rangeValue[1]).format('YYYY'),
            status: status && status.map(item => item.value && item.value || item) || [],
            itemTypes: itemType && itemType.map(item => item.value && item.value || item) || [],
            contractors: contractors && contractors.map(item => item.label && item.label || item) || [],
        };
        payload.group = this.props.isCompletedScopes ? [Constants.TASK_GROUP_ARRAY[4]] : Constants.TASK_GROUP_ARRAY.slice(0, 5);
        UtilModel.updateLoaderValue(true);
        this.setState({ loading: true });
        getFilterScopes(payload)
            .then(result => {
                ScopeModel.deleteAll();
                UtilModel.updateLoaderValue(false);
                this.setState({ loading: false });
                AdvanceFilter.saveFilter('applyFilter', true);
                ScopeModel.saveAll(result.map(scope => new ScopeModel(scope)))
            })
            .catch(err => {
                UtilModel.updateLoaderValue(false);
                this.setState({ loading: false });
                console.log("error", err)
            })
    };

    handleResetPopulation = () => {
        console.log("Reset Population Filter");
        AdvanceFilter.removeFilter()
    };

    handleVisibilityChange = (val) => {
        AdvanceFilter.saveFilter('isPanelCollapsed', val.length === 0)
    };

    renderFilter = (filter) => <div> <Row gutter={16} className="margin-bottom10">
        <Col className="gutter-row" span={4}>
            <label className="ant-form-item"> Due Year </label>
            <CustomRangePicker
                value={filter && filter.range || [defaultStartYear, currentYear]}
                mode={['year', 'year']}
                format={'YYYY'}
                onPanelChange={this.handlePanelChange}
            />
        </Col>
        <Col className="gutter-row" span={5}>
            <label className="ant-form-item"> Contractor </label>
            <VirtualSelect async onChange={(selected) => this.handleSelection(selected, 'contractors')} multi
                loadOptions={(query) => this.handleSearch(query, 'contractorsOptions')}
                value={filter && filter.contractors || []}
            />
        </Col>
        <Col className="gutter-row" span={5}>
            <label className="ant-form-item"> Item Types </label>
            <VirtualSelect multi options={this.props.itemTypesOptions} value={filter && filter.itemType || []}
                onChange={(selected) => this.handleSelection(selected, 'itemType')}
            />
        </Col>
        <Col className="gutter-row" span={5}>
            <label className="ant-form-item"> Keywords </label>
            <VirtualSelect async onChange={(selected) => this.handleSelection(selected, 'keywords')} multi
                // options={this.state.keywordOptions}
                loadOptions={(query) => this.handleSearch(query, 'keywordOptions')}
                value={filter && filter.keywords || []}
            />
        </Col>
        <Col className="gutter-row" span={5}>
            <label className="ant-form-item"> Status </label>
            <VirtualSelect multi options={Constants.STATUS_OPTIONS} value={filter && filter.status || []}
                onChange={(selected) => this.handleSelection(selected, 'status')}
            />
        </Col>
    </Row>
        <Row gutter={16} className="margin-bottom10">
            <Col className="gutter-row ant-col-4" span={4}>
                <label className="ant-form-item"> City </label>
                <VirtualSelect multi options={this.props.cityOptions} value={filter && filter.city || []}
                    onChange={(selected) => this.handleSelection(selected, 'city')}
                    selectComponent={Creatable}
                />
            </Col>
            <Col className="gutter-row" span={5}>
                <label className="ant-form-item"> State </label>
                <VirtualSelect multi options={STATE_OPTIONS} value={filter && filter.state || []}
                    onChange={(selected) => this.handleSelection(selected, 'state')}
                // selectComponent={Creatable}
                />
            </Col>
            <Col className="gutter-row" span={5}>
                <label className="ant-form-item"> Project Manager </label>
                <VirtualSelect multi options={this.props.engineerOptions} value={filter && filter.managers || []}
                    onChange={(selected) => this.handleSelection(selected, 'managers')}
                />
            </Col>
            <Col className="gutter-row" span={5}>
                <label className="ant-form-item"> Engineer </label>
                <VirtualSelect multi options={this.props.engineerOptions} value={filter && filter.engineers || []}
                    onChange={(selected) => this.handleSelection(selected, 'engineers')}
                />
            </Col>
            <Col className="gutter-row" span={5}>
                <label className="ant-form-item"> Drafter </label>
                <VirtualSelect multi options={this.props.drafterOptions} value={filter && filter.drafters || []}
                    onChange={(selected) => this.handleSelection(selected, 'drafters')}
                />
            </Col>
        </Row>
        <Row className="pull-right footer-buttons">
            <Button style={changeSubmitButtonStyle(this.state.loading)} loading={this.state.loading} type='primary' onClick={this.handlePopulate}>Populate</Button>
            <Button style={{ marginLeft: 10 }} onClick={this.handleResetPopulation}>Reset</Button>
        </Row>
    </div>;

    renderHeader = () => <div className="accordian--title"> <h5 className="text-center">Advanced Search</h5> </div>;

    render() {
        const { filter } = this.props;
        return (
            <div style={{ marginTop: 20 }}>
                <PLPCollapse
                    defaultActiveKey={this.props.isAdvanceSearchApplied && ["0"] || []}
                    className='filter-header-container'
                    onChange={this.handleVisibilityChange}
                >
                    <PLPCollapsePanel
                        key={"0"}
                        header={this.renderHeader()}
                        className='header-content-container'
                    >
                        {this.renderFilter(filter)}
                    </PLPCollapsePanel>
                </PLPCollapse>
            </div>
        );
    }

}

function mapStateToProps() {
    const employees = EmployeeModel.list().map(item => item.props);
    const itemTypes = ItemTypeModel.list().map(item => item.props);
    const user = UserModel.last().props;
    const filter = AdvanceFilter.last();
    const employeeOptionList = sortEmployee(employees).map((employee) => {
        return {
            value: employee._id,
            label: employee && employee.firstName + " " + employee.lastName || ''
        }
    })
    const drafterList = getOptions(getDrafters(employees), 'id', 'name');
    const engineerList = getOptions(getManagersAndEngineers(employees), 'id', 'name');
    return {
        itemTypesOptions: getOptions(itemTypes, '_id', 'name'),
        drafterOptions: employeeOptionList, engineerOptions: employeeOptionList,
        cityOptions: filter && filter.props.cityOptions && filter.props.cityOptions.map((item) => ({ label: item, value: item })) || [],
        stateOptions: filter && filter.props.stateOptions && filter.props.stateOptions.map((item) => ({ label: item, value: item })) || [],
        filter: filter && filter.props || undefined,
        user: user
    }
}
export default connect(mapStateToProps)(ScopesFilter);
