import React from 'react';
import { PLPPureComponent } from '../../../../baseComponents/importer';
import { MemberProfileMenuIcon } from '../../../reusableComponents/MemberProfileMenuIcon';


export class DHCTeamPopup extends PLPPureComponent {
    render() {
        const { managerName, managerEmail, managerImage, engineerName, engineerEmail, engineerImage, drafterName, drafterEmail, drafterImage } = this.props.value;
        return (
            <div className='team-view'>
                <MemberProfileMenuIcon photo={managerImage} email={managerEmail} name={managerName} />
                <MemberProfileMenuIcon photo={engineerImage} email={engineerEmail} name={engineerName} />
                <MemberProfileMenuIcon photo={drafterImage} email={drafterEmail} name={drafterName} />
            </div>
        );
    }
}
