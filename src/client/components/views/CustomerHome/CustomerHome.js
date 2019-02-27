import './styles/customerHomeStyle.scss';
import 'perfect-scrollbar-react/dist/style.min.css';

import { Col, Collapse, Row } from 'antd';
import moment from 'moment';
import Scrollbar from 'perfect-scrollbar-react';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import defaultImage from '../../../assets/images/demo_image.png';
import { CustomerHomeModel } from '../../../model/CustomerHomeModels/CustomerHomeModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { UserModel } from '../../../model/UserModel';
import { sortByNameAsc } from '../../../utils/common';
import { FIELDS } from '../../../utils/constants/ScopeTableFields';
import { customerTableHeader } from '../../../utils/constants/ScopeTableHeaders';
import {
    fetchCompanyDetails,
    getAccessToken,
    getCustomerScopesAndContacts,
} from '../../../utils/promises/customerHomePagePromises';
import Constant from '../../helpers/Constant';
import { ScopeTableFilter } from '../../reusableComponents/ScopeTableFilter/ScopeTableFilter';
import { ScopeTableNew } from '../../reusableComponents/scopeTableNew/ScopeTableNew';
import { TaskPage } from '../TaskPage/TaskPage.js';
import { Strings } from './Constants';
import { ContactList } from './containers/ContactList';
import SearchContractor from './search/virtualSelect';
import { UtilModel } from '../../../model/AppModels/UtilModel';

class CustomerHomeImpl extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            logo: '',
            poster: '',
            title: '',
            taskId: null,
            state: '',
            city: '',
            jobNumber: '',
            dateRange: [],
            companyName: 'GME, Inc',
            showLoader: true,
            // companyName: 'Trench Plate  [1 - Pittsburg]'
        };
    }

    handleLoader(flag) {
        UtilModel.updateLoaderValue(flag)
    }

    componentWillMount() {
        this.handleLoader(true)
        if (this.props.unEditable) {
            getAccessToken()
                .then(() => {
                    this.getCustomerScopesAndContacts(this.props.loggedInUserId)
                })
        } else {
            this.getCompanyDetails(this.state.companyName)
        }
    }

    componentWillUnmount() {
        this.clearData();
    }

    clearData() {
        ScopeModel.deleteAll();
        CustomerHomeModel.deleteAll();
        this.setState({ logo: null, poster: null });
    }

    populateData(response) {
        this.clearData();
        response.contacts && CustomerHomeModel.saveAll(response.contacts.map(contact => new CustomerHomeModel({
            id: contact.id,
            position: contact['jobTitle'] || '-',
            name: contact.displayName,
            photo: contact.photo ? 'data:image/png;base64,' + contact.photo : null,
            email: contact.emailAddresses[0] && contact.emailAddresses[0].address || ''
        })));
        response.customerScopes && ScopeModel.saveAll(response.customerScopes.map(scope => new ScopeModel(scope)));
        response.images && this.setState({ logo: response.images.logo || '', poster: response.images.poster || '' });
        this.setState({ showLoader: false });
        this.handleLoader(false);
    }

    async getCustomerScopesAndContacts(userId) {
        const response = await getCustomerScopesAndContacts(userId);
        this.populateData(response)
    }

    getCompanyDetails = async (query) => {
        const response = await fetchCompanyDetails({ companyName: query.split(' [All]')[0] });
        this.populateData(response)
    };

    getContactRows = (contacts) => contacts.map((contact, index) => <ContactList
        key={index}
        label={contact.position}
        value={contact.name}
        photo={contact.photo}
        email={contact.email}
        klass='contact-row'
        showPhoto
    />);

    getProjectDetailRow = (label, value) => <ContactList
        label={label}
        value={value}
        klass='contact-row text-right'
    />;

    getHeaderSection = () => <div className="header">
        <Grid columns={4} className="customer-header-container">
            <Grid.Column className="customer-logo-layout">
                <img src={this.state.logo || defaultImage} />
            </Grid.Column>
            <Grid.Column className="customer-poster-layout">
                <img src={this.state.poster || defaultImage} />
            </Grid.Column>
            <Scrollbar>
                <Grid.Column className="customer-contacts-layout">
                    <Grid columns={2}>
                        {this.props.contacts.length === 0 ?
                            <Grid.Row className='contact-row'>
                                No Contacts
                             </Grid.Row> :
                            this.getContactRows(this.props.contacts)
                        }
                    </Grid>
                </Grid.Column>
            </Scrollbar>
            <Grid.Column className="customer-contacts-layout">
                <Grid columns={2}>
                    {this.getProjectDetailRow(Strings.totalActiveProjects, this.props.activeScopes.length)}
                    {this.getProjectDetailRow(new Date().getFullYear() + ' ' + Strings.totalCompletedProject,
                        this.props.completedScopes.filter(scope => new Date(scope.dueDate).getFullYear() === new Date().getFullYear()).length)}
                    {this.getProjectDetailRow((new Date().getFullYear() - 1) + ' ' + Strings.totalCompletedProject,
                        this.props.completedScopes.filter(scope => new Date(scope.dueDate).getFullYear() === new Date().getFullYear() - 1).length)}

                    {this.getProjectDetailRow(new Date().getFullYear() + ' ' + Strings.bids,
                        this.props.bidScopes.filter(scope => new Date(scope.dueDate).getFullYear() === new Date().getFullYear()).length)}

                    {this.getProjectDetailRow((new Date().getFullYear() - 1) + ' ' + Strings.bids,
                        this.props.bidScopes.filter(scope => new Date(scope.dueDate).getFullYear() === new Date().getFullYear() - 1).length)}
                </Grid>
            </Grid.Column>
        </Grid>
    </div>;

    getTaskModal = () => <TaskPage
        taskId={this.state.taskId}
        title={this.state.title}
        onClose={this.closeTaskModal}
        unEditable={this.props.unEditable}
    />;

    openTaskModal = ({ data }) => {
        this.setState({
            taskId: data.taskId,
            title: `${data[FIELDS.JOB]} - ${data[FIELDS.PROJECT]} - ${data[FIELDS.CITY]}, ${data[FIELDS.STATE]}`
        });
    };

    closeTaskModal = () => {
        this.setState({
            taskId: null,
            title: ''
        });
    };

    onGridReady = (params, groupId) => {
        this.setState({
            [`gridAPI${groupId}`]: params.api
        });
        this.applyFilter();
    };

    resetFilterValues = () => {
        this.setState({
            jobNumber: '',
            state: '',
            city: '',
            dateRange: [null, null]
        });
    };

    clearFilter = () => {
        Constant.TASK_GROUP_ARRAY.map(groupId => {
            if (this.state[`gridAPI${groupId}`]) {
                this.state[`gridAPI${groupId}`].destroyFilter('state');
                this.state[`gridAPI${groupId}`].destroyFilter('city');
                this.state[`gridAPI${groupId}`].destroyFilter('jobNumber');
                this.state[`gridAPI${groupId}`].destroyFilter('dueDate');
            }
        });
        this.resetFilterValues();
    };

    applyFilter = () => {
        const {
            state,
            city,
            jobNumber,
            dateRange
        } = this.state;

        Constant.TASK_GROUP_ARRAY.map(taskGroupID => {
            if (!this.state[`gridAPI${taskGroupID}`]) {
                return;
            }

            this.setContainsFilter(taskGroupID, 'state', state);
            this.setContainsFilter(taskGroupID, 'city', city);
            this.setContainsFilter(taskGroupID, 'jobNumber', jobNumber);
            if (dateRange[0]) {
                this.setRangeFilter(taskGroupID, 'dueDate', dateRange)
            } else {
                this.state[`gridAPI${taskGroupID}`].destroyFilter('dueDate');
            }
            this.state[`gridAPI${taskGroupID}`].onFilterChanged();
        });
    };

    setContainsFilter = (taskGroupID, type, query) => {
        const filter = this.state[`gridAPI${taskGroupID}`].getFilterInstance(type);
        filter.setModel({
            type: 'contains',
            filter: query
        });
    };

    setRangeFilter = (taskGroupID, type, dateRange) => {
        const filter = this.state[`gridAPI${taskGroupID}`].getFilterInstance(type);
        filter.setModel({
            type: 'inRange',
            dateFrom: moment(dateRange[0]).format('YYYY-MM-DD'),
            dateTo: moment(dateRange[1]).format('YYYY-MM-DD')
        });
    };

    handleDateChange = (e, value) => {
        this.setState({
            dateRange: value
        });
    };

    handleChange = (event) => {
        this.setState({ [event.target.id]: event.target.value })
    };

    getFilterRow = () => <ScopeTableFilter
        clearFilter={this.clearFilter}
        applyFilter={this.applyFilter}
        handleDateChange={this.handleDateChange}
        handleChange={this.handleChange}
        data={this.state}
    />;

    getScopeTables = (title, groupId) => {
        return <Collapse.Panel header={title} key={title}>
            <ScopeTableNew
                groupId={groupId}
                selector='group'
                showLoader={this.state.showLoader}
                openTaskPage={this.openTaskModal}
                header={customerTableHeader}
                contacts={this.props.contacts}
                onGridReady={this.onGridReady}
                parent='customerPage'
            />
        </Collapse.Panel>;
    };

    renderSearch = () => <Row style={{ margin: 5 }}>
        <Col span={5} offset={10} style={{ float: 'right' }}>
            <SearchContractor unEditable={this.props.unEditable} getDetails={this.getCompanyDetails} />
        </Col>
    </Row>;

    render = () => <div className="customer-home-container main-page_wrapper">
        {this.state.taskId && this.getTaskModal()}
        {!this.props.unEditable && this.renderSearch()}
        {this.getHeaderSection()}
        {this.getFilterRow()}
        <Collapse defaultActiveKey={'Active Projects'} >
            {this.getScopeTables('Active Projects', Constant.TASK_GROUP__ID.ACTIVE_PROJECTS)}
            {this.getScopeTables('Bids', Constant.TASK_GROUP__ID.BIDS)}
            {this.getScopeTables('Completed Projects', Constant.TASK_GROUP__ID.COMPLETED_PROJECTS)}
            {this.getScopeTables('Tasks', Constant.TASK_GROUP__ID.TASKS)}
            {this.getScopeTables('On Hold', Constant.TASK_GROUP__ID.ON_HOLD)}
        </Collapse>
    </div>;
}

function sortContacts(contact1, contact2) {
    const position1 = contact1.position.toLowerCase();
    const position2 = contact2.position.toLowerCase();
    return sortByNameAsc(position1, position2);
}

function mapStateToProps() {
    const user = UserModel.last().props;
    const unEditable = user.role.name === 'Customer';
    return {
        unEditable,
        loggedInUserId: user._id,
        contacts: CustomerHomeModel.list().map(item => item.props).sort(sortContacts),
        activeScopes: ScopeModel.list().map(item => item.props).filter(item => item.group._id === Constant.TASK_GROUP__ID.ACTIVE_PROJECTS),
        completedScopes: ScopeModel.list().map(item => item.props).filter(item => item.group._id === Constant.TASK_GROUP__ID.COMPLETED_PROJECTS),
        bidScopes: ScopeModel.list().map(item => item.props).filter(item => item.group._id === Constant.TASK_GROUP__ID.BIDS),
        taskScopes: ScopeModel.list().map(item => item.props).filter(item => item.group._id === Constant.TASK_GROUP__ID.TASKS),
        onHoldScopes: ScopeModel.list().map(item => item.props).filter(item => item.group._id === Constant.TASK_GROUP__ID.ON_HOLD),
    };
}

export const CustomerHome = connect(mapStateToProps)(CustomerHomeImpl);
