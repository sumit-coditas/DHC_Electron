import React, { Component } from 'react';
import { PLPPureComponent, Mem } from '../../../../baseComponents/importer';
import MemberProfilePic from '../../MemberProfilePic';

class InvoiceTeam extends PLPPureComponent {
    render() {
        const data = this.props.data
        return <div>
            <MemberProfilePic
                image={data.manager && data.manager.picture || null}
                name={`${data.manager && `${data.manager.firstName} ${data.manager.lastName}` || 'Inactive User'}`} />
            <MemberProfilePic
                image={data.creator && data.creator.picture ? data.creator.picture : null}
                name={`${data.manager && `${data.creator.firstName} ${data.creator.lastName}` || 'Inactive User'}`} />
        </div>
    }
}

export default InvoiceTeam;