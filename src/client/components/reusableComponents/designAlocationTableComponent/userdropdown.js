import React from 'react';
import DropdownNew from '../../../baseComponents/DropdownNew';
import MemberProfilePic from '../../reusableComponents/MemberProfilePic';

const UserDropDown = (props) => {
    const { menuList, data, onMemberChange, userName, dropdownId, userImage } = props;
    return (
        <DropdownNew
            id={dropdownId}
            menuList={menuList}
            handleDropdownChange={onMemberChange}
            data={data}
        >
            <MemberProfilePic image={userImage} name={userName} />
        </DropdownNew>
    );
};

export default UserDropDown;
