import React from 'react';
import { Table, Loader, Button, Icon, Checkbox } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { getAllCustomers } from '../../utils/promises/customerHomePagePromises';
import { CustomerUserModel } from '../../model/CustomerHomeModels/CustomerUserModel';

class CustomerTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            update: this.props.update
        }
    }

    componentDidMount() {
        getAllCustomers().then((payload)=> this.getAllCustomerUserCallback(payload))
    }

    componentDidUpdate(prevProps, prevState) {
        // fetch data again if any user is added or modified
        if (prevProps.update !== prevState.update) {
            getAllCustomers().then((payload)=> this.getAllCustomerUserCallback(payload))
        }
    }

    // handle get all customer user api call back
    // save data in modal
    getAllCustomerUserCallback = (payload) => {
        if (payload.status === 200) {
            CustomerUserModel.saveAll(payload.data.map(user=> new CustomerUserModel({
                id: user.id,
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                companyName: user.companyName,
                isActive: user.isActive,
                companyId: user.companyId
            })));
        }
    };

    // return table rows
    getRows = (users) => {
       return users.map((user, index) => <Table.Row key={user._id} textAlign='center'>
           {this.getTableCell(index+1)}
           {this.getTableCell(user.firstName)}
           {this.getTableCell(user.lastName)}
           {this.getTableCell(user.email)}
            <Table.Cell>
                <Checkbox checked={user.isActive} toggle disabled/>
            </Table.Cell>
           {this.getTableCell(user.companyName)}
            <Table.Cell>
                <Button onClick={()=> this.props.handleEditButtonClick(user)} style={{paddingTop:'7px', paddingBottom:'7px'}} >
                    <Icon name='edit'/>
                    Edit
                </Button>
            </Table.Cell>
        </Table.Row>
       )
    };

    getTableCell = (val) => <Table.Cell>
        {val}
    </Table.Cell>;

    // return headers
    getHeaders = () =>  <Table.Header>
            <Table.Row textAlign='center'>
            <Table.HeaderCell>No</Table.HeaderCell>
            <Table.HeaderCell>First Name</Table.HeaderCell>
            <Table.HeaderCell>Last Name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Company</Table.HeaderCell>
            <Table.HeaderCell>Edit</Table.HeaderCell>
            </Table.Row>
        </Table.Header>;

    // return Table
    getUserTable = (users) => <Table celled>
            {this.getHeaders()}
            <Table.Body>
                {this.getRows(users)}
                {users.length === 0 && this.getEmptyRow()}
            </Table.Body>
        </Table>;

    getEmptyRow = () => <Table.Row>
        <Table.Cell colSpan={7} style={{textAlign: 'center'}}>
            No record found
        </Table.Cell>
    </Table.Row>;

    render() {
        return (
            <div className='customer-table-container'>
                {this.getUserTable(this.props.users)}
            </div>
        );
    }
}

function mapStateToProps() {
    return {
        users: CustomerUserModel.list().map(item => item.props).sort(item => item.firstName)|| []
    };
}

export const CustomerUserTable = connect(mapStateToProps)(CustomerTable);

