import React from 'react';
import { connect } from 'react-redux';
import { MemberProfileMenuIcon, PLPPureComponent } from '../../../baseComponents/importer';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { getTeamMembers } from '../../reusableComponents/scopeTableNew/ScopeTableUtils';
import { CustomerHomeModel } from '../../../model/CustomerHomeModels/CustomerHomeModel';

class TeamMembers extends PLPPureComponent {
    getCustomer = () => {
        let customerContacts = [];
        let customers = [];

        this.props.scopes
            .forEach(scope => {
                if (scope.customerContact) {
                    customerContacts.push(scope.customerContact.id);
                }
            });
        customerContacts = customerContacts
            .filter((customer, pos, arr) => arr.indexOf(customer) === pos)
            .forEach(customerId => {
                const customer = this.props.contacts.find(item => item.id === customerId);
                if (customer) {
                    customers.push(customer);
                }
            });
        return customers.map((customer, index) => <MemberProfileMenuIcon
            email={customer.email}
            photo={customer.photo || null}
            name={customer.name}
            key={'customer' + index}
        />);
    };

    render = () => {
        if (this.props.loading) {
            return <div />;
        }

        return <div className="team-layout">
            <div className="title">Team Members: </div>
            <div className='member-section'>
                {this.props.teamMembers.map((member, index) => <MemberProfileMenuIcon
                    email={member.email}
                    photo={member.picture}
                    name={member.name}
                    key={index}
                />)
                }
                {this.getCustomer()}
            </div>
        </div>
    };
}
function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    if (!task) {
        return {
            loading: true
        }
    }
    return {
        scopes: task.scopes,
        teamMembers: getTeamMembers(task),
        contacts: CustomerHomeModel.list().map(item => item.props),
    }
}
export default connect(mapStateToProps)(TeamMembers);
