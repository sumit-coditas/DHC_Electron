import React from 'react';
import { PLPPureComponent } from '../../../../baseComponents/importer';
import { MemberProfileMenuIcon } from '../../../reusableComponents/MemberProfileMenuIcon';
import { connect } from 'react-redux';
import { sortContacts } from '../../../../utils/sortUtil';
import { CustomerHomeModel } from '../../../../model/CustomerHomeModels/CustomerHomeModel';

class CustomerTeamPopupComp extends PLPPureComponent {
    render() {
        const customerId = this.props.value;
        const customerContact = this.props && this.props.contacts.find(item => item.id === customerId) || null;
        return (
            <div className='team-view'>
                <MemberProfileMenuIcon
                    photo={customerContact && customerContact.photo}
                    email={customerContact && customerContact.email}
                    name={customerContact && customerContact.name} />
            </div>
        );
    }
}

function mapStateToProps() {
    return {
        contacts: CustomerHomeModel.list().map(item => item.props).sort(sortContacts)
    };
}

export const CustomerTeamPopup = connect(mapStateToProps)(CustomerTeamPopupComp)
    ;
