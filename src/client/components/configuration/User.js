import React from 'react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';


import ReactDOM from 'react-dom';
import {
    Radio,
    Table,
    Icon,
    Header,
    Button,
    Form,
    Segment,
    Message,
    Modal,
    Grid,
    Popup,
    Dropdown,
    Input
} from 'semantic-ui-react';
import Cropper from 'react-cropper';
import alt from '../../alt.js';
import Picture from './../widgets/Picture.js';
import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import RoleAction from './../../actions/RoleAction.js';
import RoleLevelAction from './../../actions/RoleLevelAction.js';
import UserAction from './../../actions/UserAction.js';
import AppAction from './../../actions/AppAction.js';

import RoleStore from './../../stores/RoleStore.js';
import RoleLevelStore from './../../stores/RoleLevelStore.js';
import UserStore from './../../stores/UserStore.js';
import AppStore from './../../stores/AppStore.js';
import LoginStore from './../../stores/LoginStore.js';
import { PLPPureComponent } from '../../baseComponents/importer.js';

const imageFileTypes = ['jpeg', 'png', 'bmp', 'tiff', 'gif', 'jpg'];

export default class User extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            RoleStore: RoleStore.getState(),
            RoleLevelStore: RoleLevelStore.getState(),
            UserStore: UserStore.getState(),
            AppStore: AppStore.getState(),
            LoginStore: LoginStore.getState(),
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        RoleStore.listen(this.onChange);
        UserStore.listen(this.onChange);
        RoleLevelStore.listen(this.onChange);
        AppStore.listen(this.onChange);
        LoginStore.listen(this.onChange);
        RoleAction.getRoles();
        RoleLevelAction.getLevels();
        UserAction.getUsers();
    }

    componentWillUnmount() {
        RoleStore.unlisten(this.onChange);
        RoleLevelStore.unlisten(this.onChange);
        UserStore.unlisten(this.onChange);
        AppStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
        alt.recycle(UserStore);
    }

    _validateImage(fileObject, objectType) {
        let { type } = fileObject;
        let isImageFile;
        if (type && type.includes('image')) {
            isImageFile = true;
        } else {
            isImageFile = false;
        }

        if (!isImageFile) {
            switch (objectType) {
            case 'picture':
                UserAction.setError({ type: 'picture', errorMsg: 'Uploaded file is not an image file' });
                break;
            case 'signature':
                UserAction.setError({ type: 'signature', errorMsg: 'Uploaded file is not an image file' });
                break;
            case 'initials':
                UserAction.setError({ type: 'initials', errorMsg: 'Uploaded file is not an image file' });
                break;
            case 'titleBlock':
                UserAction.setError({ type: 'titleBlock', errorMsg: 'Uploaded file is not an image file' });
                break;
            }
            UserAction.toggleImageError('Uploaded file is not an image file');
        } else {
            UserAction.toggleImageError('');
        }
        return isImageFile;
    }

    _validateForm(user) {
        let self = this;
        let isFormValid = true;
        let employeeCode = user.employeeCode.replace(/[\s]+/g, '');
        employeeCode = employeeCode.trim();
        let duplicateEmployeeCode = find(self.state.UserStore.users, (existingUser) => {
            if (existingUser.id === user.id) {
                return false;
            }
            return existingUser.employeeCode.trim().toLowerCase().replace(/\b0+(?=\d)+/g, '').replace(/[\s]+/g, '') === user.employeeCode.trim().toLowerCase().replace(/\b0+(?=\d)+/g, '').replace(/\s+/g, '');
        });
        let firstName = user.firstName.replace(/[\s]+/g, '');
        let lastName = user.lastName.replace(/[\s]+/g, '');
        let email = user.email.replace(/[\s]+/g, '');
        let role = user.role;
        let roleLevel = user.roleLevel;
        let re = /^(([^<>()\[\]\.,;:\s@\']+(\.[^<>()\[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i;
        let isValidEmail = re.test(user.email);

        if (!employeeCode) {
            isFormValid = false;
            UserAction.setError({ type: 'employeeCode', errorMsg: 'Please enter employee code' });
        }

        if (duplicateEmployeeCode) {
            isFormValid = false;
            UserAction.setError({ type: 'employeeCode', errorMsg: 'Employee code already exists' });
        }

        if (employeeCode.length > 25) {
            isFormValid = false;
            UserAction.setError({ type: 'employeeCode', errorMsg: 'Employee code should be less than 25 characters' });
        }

        if (!firstName) {
            isFormValid = false;
            UserAction.setError({ type: 'firstName', errorMsg: 'Please enter first name' });
        }

        if (lastName.length > 25) {
            isFormValid = false;
            UserAction.setError({ type: 'lastName', errorMsg: 'Last name should be less than 25 characters' });
        }

        if (!lastName) {
            isFormValid = false;
            UserAction.setError({ type: 'lastName', errorMsg: 'Please enter last name' });
        }

        if (firstName.length > 25) {
            isFormValid = false;
            UserAction.setError({ type: 'firstName', errorMsg: 'First name should be less than 25 characters' });
        }

        if (!email) {
            isFormValid = false;
            UserAction.setError({ type: 'email', errorMsg: 'Please enter email address' });
        }

        if (!isValidEmail) {
            isFormValid = false;
            UserAction.setError({ type: 'email', errorMsg: 'Please enter valid email address' });
        }

        if (!role || !role.id) {
            isFormValid = false;
            UserAction.setError({ type: 'role', errorMsg: 'Please select role for the user' });
        }

        if (!roleLevel || !roleLevel.id) {
            isFormValid = false;
            UserAction.setError({ type: 'roleLevel', errorMsg: 'Please select role level for the user' });
        }
        return isFormValid;
    }

    _handleSubmit(event) {
        let self = this;
        let userState = self.state.UserStore;
        let loginState = self.state.LoginStore;
        event.preventDefault();
        let user = userState.user;
        user.title = user.title.trim();
        if (self._validateForm(user) && !userState.error.imageError) {
            user.email = user.email.trim();
            if (!user.isActive) {
                user.isActive = false;
            } else {
                user.isActive = true;
            }

            // if (!user.roleLevel || user.roleLevel.id === '') {
            //     user.roleLevel = null;
            // }

            if (userState.isAddUser) {
                UserAction.setLoader();
                let data = {
                    user: user,
                    picture: userState.picture,
                    signature: userState.signature,
                    initials: userState.initials,
                    titleBlock: userState.titleBlock
                };
                UserAction.addUser(data);
            } else if (userState.user.email !== user.email) {
                let data = {
                    user: user,
                    id: userState.user.id,
                    picture: userState.picture,
                    signature: userState.signature,
                    initials: userState.initials,
                    titleBlock: userState.titleBlock,
                    loggedInUserID: loginState.user.id
                };
                let emailExist = find(self.state.AppStore.users, (existingUser) => {
                    return existingUser.email === user.email;
                });
                if (emailExist) {
                    AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.USER.EMAIL_PRESENT, level: Constant.NOTIFICATION_LEVELS.ERROR });
                } else {
                    UserAction.setLoader();
                    UserAction.updateUser(data);
                }
            } else {
                let data = {
                    user: user,
                    id: userState.user.id,
                    picture: userState.picture,
                    signature: userState.signature,
                    initials: userState.initials,
                    titleBlock: userState.titleBlock,
                    loggedInUserID: loginState.user.id
                };
                UserAction.setLoader();
                UserAction.updateUser(data);
            }
        }
    }

    _onChangePicture(event) {
        let self = this;
        let reader = new FileReader();
        let file = event.target.files[0];

        if (self._validateImage(file, 'picture')) {

            reader.onloadend = () => {
                UserAction.setProfilePicture({ file: file, imagePreviewUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    }

    _onChangeSignature(event) {
        let self = this;
        let reader = new FileReader();
        let file = event.target.files[0];
        if (self._validateImage(file, 'signature')) {
            reader.onloadend = () => {
                UserAction.setSignature({ file: file, signaturePreviewUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    }

    _onChangeInitials(event) {
        let self = this;
        let reader = new FileReader();
        let file = event.target.files[0];
        if (self._validateImage(file, 'initials')) {
            reader.onloadend = () => {
                UserAction.setInitials({ file: file, initialsPreviewUrl: reader.result });
            };

            reader.readAsDataURL(file);
        }
    }

    _onChangeTitleBlock(event) {
        let self = this;
        let reader = new FileReader();
        let file = event.target.files[0];

        if (self._validateImage(file, 'titleBlock')) {
            reader.onloadend = () => {
                UserAction.setTitleBlock({ file: file, titleBlockPreviewUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    }

    _showUpdateUserForm(user) {
        UserAction.showUpdateUserForm(user);
        let self = this;
        ReactDOM.findDOMNode(self.refs.show_form).scrollIntoView();
    }

    _showAddUserForm() {
        UserAction.showAddUserForm();
    }

    _closeUserForm() {
        UserAction.closeUserForm();
    }

    // unused
    // _changeEmployeeCode(event) {
    //     let self = this;
    //     let employeeCode = event.target.value.replace(/\s/g, '');
    //     let user = cloneDeep(self.state.UserStore.user);
    //     user.employeeCode = employeeCode;
    //     UserAction.changeUser(user);
    // }

    _setEmployeeCode(event) {
        let self = this;
        let user = { ...self.state.UserStore.user };
        let employeeCode = event.target.value.replace(/\s/g, '');
        employeeCode = employeeCode.trim();
        let duplicateEmployeeCode = find(self.state.UserStore.users, (existingUser) => {
            if (existingUser.id === user.id) {
                return false;
            }
            return existingUser.employeeCode.trim().toLowerCase().replace(/\b0+(?=\d)+/g, '').replace(/[\s]+/g, '') === employeeCode.toLowerCase().replace(/\b0+(?=\d)+/g, '').replace(/\s+/g, '');
        });
        if (!employeeCode) {
            UserAction.setError({ type: 'employeeCode', errorMsg: 'Please enter employee code' });
        } else if (duplicateEmployeeCode) {
            UserAction.setError({ type: 'employeeCode', errorMsg: 'Employee code already exists' });
        } else {
            UserAction.setError({ type: 'employeeCode', errorMsg: '' });
            user.employeeCode = employeeCode;
            UserAction.changeUser(user);
        }
    }

    _setFirstName(event) {
        let self = this;
        let user = {...self.state.UserStore.user};
        let firstName = event.target.value.trim();
        if (!firstName) {
            UserAction.setError({ type: 'firstName', errorMsg: 'Please enter first name' });
        } else if (firstName.length > 25) {
            UserAction.setError({ type: 'firstName', errorMsg: 'First name should be less than 25 characters' });
        } else {
            UserAction.setError({ type: 'firstName', errorMsg: '' });
            user.firstName = firstName;
            UserAction.changeUser(user);
        }
    }

    _setLastName(event) {
        let self = this;
        let user = {...self.state.UserStore.user};
        let lastName = event.target.value.trim();
        if (!lastName) {
            UserAction.setError({ type: 'lastName', errorMsg: 'Please enter last name' });
        } else if (lastName.length > 25) {
            UserAction.setError({ type: 'lastName', errorMsg: 'Last name should be less than 25 characters' });
        } else {
            UserAction.setError({ type: 'lastName', errorMsg: '' });
            user.lastName = lastName;
            UserAction.changeUser(user);
        }
    }

    _setEmail(event) {
        let self = this;
        let user = {...self.state.UserStore.user};
        let email = event.target.value.replace(/[\s]+/g, '');
        let re = /^(([^<>()\[\]\.,;:\s@\']+(\.[^<>()\[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i;
        let isValidEmail = re.test(event.target.value);
        if (!email) {
            UserAction.setError({ type: 'email', errorMsg: 'Please enter email address' });
        } else if (!isValidEmail) {
            UserAction.setError({ type: 'email', errorMsg: 'Please enter valid email address' });
        } else {
            UserAction.setError({ type: 'email', errorMsg: '' });
            user.email = event.target.value.trim();
            UserAction.changeUser(user);
        }
    }

    _setRoleError() {
        let self = this;
        let user = {...self.state.UserStore.user};
        let role = user.role;

        if (!role || !role.id) {
            UserAction.setError({ type: 'role', errorMsg: 'Please select role for the user' });
        } else {
            UserAction.setError({ type: 'role', errorMsg: '' });
        }
    }

    _changeIsActive(event, isChecked) {
        let self = this;
        let user = {...self.state.UserStore.user};
        user.isActive = isChecked.checked;
        UserAction.changeUser(user);
    }

    // unused
    // _changeFirstName(event) {
    //     let self = this;
    //     let user = cloneDeep(self.state.UserStore.user);
    //     user.firstName = event.target.value.trim();
    //     UserAction.changeUser(user);
    // }

    // unused
    // _changeLastName(event) {
    //     let self = this;
    //     let user = cloneDeep(self.state.UserStore.user);
    //     user.lastName = event.target.value.trim();
    //     UserAction.changeUser(user);
    // }

    // unused
    // _changeEmail(event) {
    //     let self = this;
    //     let user = cloneDeep(self.state.UserStore.user);
    //     user.email = event.target.value.trim();
    //     UserAction.changeUser(user);
    // }

    _changeRole(event, { value }) {
        let self = this;
        let role = find(this.state.RoleStore.roles, (roleToFind) => {
            return roleToFind._id === value;
        });
        let user = cloneDeep(self.state.UserStore.user);
        if (!role) {
            role = { text: '', id: '' };
        }
        user.role = role;
        UserAction.changeUser(user);
    }

    _changeRoleLevel(event, { value }) {
        let self = this;
        let roleLevel = find(this.state.RoleLevelStore.levels, (roleLevelToFind) => {
            return roleLevelToFind._id === value;
        });
        let user = cloneDeep(self.state.UserStore.user);
        if (!roleLevel) {
            roleLevel = { id: '', text: '' };
        }
        user.roleLevel = roleLevel;
        UserAction.changeUser(user);
    }

    _changeCompanyTitle(event) {
        let self = this;
        let user = cloneDeep(self.state.UserStore.user);
        user.title = event.target.value;
        UserAction.changeUser(user);
    }

    _handleFocusOnButtons(event) {
        let target = event.target || event.srcElement;
        target.style.backgroundColor = 'red';
        event.stopPropagation();
    }

    _handleOnBlurOnButtons(event) {
        let target = event.target || event.srcElement;

        if (target.textContent === 'Add') {
            target.style.backgroundColor = '#2185D0';
        } else if (target.textContent === 'Cancel') {
            target.style.backgroundColor = '#1B1C1D';
        }
        event.stopPropagation();
    }

    _resetCroppingModal() {
        let self = this;
        if (self.state.UserStore.cropResult === '' && self.state.UserStore.uploadingType !== '') {
            self._cropImage();
        }
        UserAction.resetCroppingModal();
    }

    _showImage(imageType) {
        UserAction.showImage(imageType);
    }

    _capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    _cropImage() {
        if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
            return;
        }
        UserAction.setCropResult(this.cropper.getCroppedCanvas().toDataURL());
    }

    _naturalSorter(employeeCode1, employeeCode2) {
        let employeeCode1Match;
        let employeeCode2Match;
        let a1;
        let b1;
        let i = 0;
        let numReturnVal;
        let employeeCode1Length;
        let regexPattern = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
        if (employeeCode1 === employeeCode2) {
            return 0;
        }
        employeeCode1Match = employeeCode1.toLowerCase().match(regexPattern);
        employeeCode2Match = employeeCode2.toLowerCase().match(regexPattern);
        employeeCode1Length = employeeCode1Match.length;
        while (i < employeeCode1Length) {
            if (!employeeCode2Match[i]) {
                return 1;
            }
            a1 = employeeCode1Match[i];
            b1 = employeeCode2Match[i++];
            if (a1 !== b1) {
                numReturnVal = a1 - b1;
                if (!isNaN(numReturnVal)) {
                    return numReturnVal;
                }
                return a1 > b1 ? 1 : -1;
            }
        }
        return employeeCode2Match[i] ? -1 : 0;
    }

    _changeLocation = (user, location, event) => {
        let locationInfoObj = user.locationInfo;
        if (!locationInfoObj) {
            locationInfoObj = {
                extension: '',
                location: null
            };
        }
        let userLocationInfo = {
            locationInfo: {
                location: location.value,
                extension: locationInfoObj.extension
            }
        };
        const payload = {
            id: user.id,
            user: {
                locationInfo: userLocationInfo.locationInfo,
            }
        }
        UserAction.updateUser(payload);
    }

    handelUpdateAvailability = (event, user) => {
        const payload = {
            id: user.id,
            user: {
                availability: event.target.value
            }
        }
        UserAction.updateUser(payload);
    }

    stopPropagation = (event) => {
        event.stopPropagation();
    }

    changeZIndex = (event, id, value) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({[`userRef${id}`]: value});
    }

    _changeScopeVisibilityPermission = (user, permission, event) => {
        const payload = {
            id: user.id,
            user: {
                scopeVisibilityPermission: permission.value
            }
        };
        UserAction.updateUser(payload);
    }

    _handleViewPaydayReportChange = (value, user) => {
        const payload = {
            id: user.id,
            user: {
                canViewPaydayReport: value.checked
            }
        }
        UserAction.updateUser(payload);
    }

    render() {
        let self = this;
        let canViewUser = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_USER.NAME);
        let canWriteUser = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_USER.NAME);

        let roleData = [];
        let roleLevelData = [];
        let roleLevelDataDefault = [{ text: '', value: '' }];
        let userData = [];

        let roleState = self.state.RoleStore;
        let roleLevelState = self.state.RoleLevelStore;
        let userState = self.state.UserStore;
        const loginState = self.state.LoginStore;
        let users = cloneDeep(userState.users);

        let roleDataDefault = [{ text: '', value: '' }];
        roleData = map(roleState.roles, (role) => {
            return { text: role.name, value: role._id };
        });
        roleData = roleDataDefault.concat(roleData);

        roleLevelData = map(roleLevelState.levels, (level) => {
            return { text: level.name, value: level._id };
        });
        roleLevelData = roleLevelDataDefault.concat(roleLevelData);
        
        users = users.sort((e1, e2) => {
            return self._naturalSorter(e1.employeeCode, e2.employeeCode);
        });
        const locationOptions = map(self.state.AppStore.locations, (location) => {
            return {
                text: location.name,
                value: location._id,
                icon: {
                    name: location.icon,
                    color: location.iconColor
                }
            };
        });

        const scopePermissionOptions = Constant.SCOPE_PERMISSION_OPTIONS.map((option, index) => {
            return {value: option, text: option};
        })

        userData = map(users, (user, index) => {
            return (
                <Table.Row key={'user' + index} className='userData'>
                    <Table.Cell textAlign='center'>
                        <Picture src={user.picture} avatar />
                    </Table.Cell>
                    <Table.Cell textAlign='center' className='userData'>
                        {user.employeeCode}
                    </Table.Cell>
                    <Table.Cell className='userData'>
                        {user.firstName}
                    </Table.Cell>
                    <Table.Cell className='userData'>
                        {user.lastName}
                    </Table.Cell>
                    <Table.Cell className='userData'>
                        {user.email}
                    </Table.Cell>
                    <Table.Cell className='userData'>
                        {user.role
                            ? user.role.name
                            : null}
                    </Table.Cell>
                    <Table.Cell>
                        {user.roleLevel
                            ? user.roleLevel.name
                            : 'Not defined'}
                    </Table.Cell>
                    <Table.Cell>
                        {user.title
                            ? user.title
                            : 'Not defined'}
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                        <Picture src={user.signature} avatar />
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                        <Picture src={user.initials} avatar />
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                        <Picture src={user.titleBlock} avatar />
                    </Table.Cell>
                    <Table.Cell>
                        <Radio key={'toggle' + index} toggle checked={user.isActive} disabled />
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                        <Radio
                            key={`toggle-${user.id}` + index}
                            toggle
                            checked={user.canViewPaydayReport}
                            disabled={!canWriteUser}
                            // name='canViewPaydayReport'
                            onChange={(event, isChecked) => self._handleViewPaydayReportChange(isChecked, user)}
                        />
                    </Table.Cell>
                    <Table.Cell
                        textAlign='center'
                        style={{
                            overflow: 'visible',
                        }}
                    >
                        <Dropdown
                            key={user.id}
                            placeholder='Scope Visibility'
                            disabled={(loginState.user && user.id === loginState.user.id && loginState.user.roleLevel.name === 'President') || !canWriteUser}
                            selectOnBlur={false}
                            onChange={(event, permission) => self._changeScopeVisibilityPermission(user, permission, event)}
                            value={user.scopeVisibilityPermission}
                            options={scopePermissionOptions}
                            multiple
                            fluid
                            selection
                        />
                    </Table.Cell>
                    <Table.Cell style={{ overflow: 'visible' }}>
                        <div
                            className='profile-dropdown profile-dropdown-zindex w-dropdown'
                            style={{
                                overflow: 'visible',
                                border: 'none',
                                zIndex: this.state[`userRef${user.id}`] ? 990 : 930,
                            }}
                        >
                            <Dropdown
                                placeholder='Location'
                                disabled={!canWriteUser}
                                onClick={(event) => this.changeZIndex(event, user.id, true)}
                                selectOnBlur={false}
                                onChange={(event, location) => self._changeLocation(user, location, event)}
                                value={user.locationInfo && user.locationInfo.location && user.locationInfo.location._id}
                                options={locationOptions}
                                ref={userRef => { self[`userRef${user.id}`] = userRef; }}
                                icon={null}
                                onBlur={(event) => this.changeZIndex(event, user.id, false)}
                            />
                        </div>
                    </Table.Cell>
                    <Table.Cell>
                        <Input
                            className='user-availability'
                            defaultValue={user.availability}
                            onBlur={(event) => this.handelUpdateAvailability(event, user)}
                            disabled={!canWriteUser}
                        />
                    </Table.Cell>
                    {canWriteUser && <Table.Cell>
                        <Button icon onClick={self._showUpdateUserForm.bind(self, user)}>
                            <Icon name='edit' />
                        </Button>
                    </Table.Cell>
                    }
                </Table.Row>
            );
        });

        let aspectRatio = 1 / 1;
        let aspectRatioText = ' (Aspect Ratio - 1:1)';

        if (userState.uploadingType === 'titleBlock') {
            aspectRatio = 7 / 1;
            aspectRatioText = ' (Aspect Ratio - 7:1)';
        } else if (userState.uploadingType === 'initials') {
            aspectRatio = 1.5 / 1;
            aspectRatioText = ' (Aspect Ratio - 1.5:1)';
        } else if (userState.uploadingType === 'signature') {
            aspectRatio = 4 / 1;
            aspectRatioText = ' (Aspect Ratio - 4:1)';
        }

        let croppingTypeText = userState.uploadingType === 'titleBlock' ? 'Title Block' : self._capitalizeFirstLetter(userState.uploadingType);

        return (
            <Segment textAlign='center' disabled={userState.isLoading} loading={userState.isLoading}>
                {canViewUser
                    ? <div>
                        <div ref='show_form'><Header as='h3' content='Users' /></div>
                        {userState.showForm ?
                            <Segment stacked secondary>
                                <Form error onSubmit={self._handleSubmit.bind(self)}>
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <Form.Input label='Employee Code' defaultValue={userState.user.employeeCode}
                                                name='employeeCode' onBlur={self._setEmployeeCode.bind(self)} /* onChange={self._changeEmployeeCode.bind(self)} */ />
                                            {userState.error.employeeCode && <Message error content={userState.error.employeeCode} />}
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Radio key='toggleRadio' toggle name='isActive'
                                                checked={userState.user.isActive} onChange={self._changeIsActive.bind(self)} label='Active User' />
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <Form.Input label='First Name' defaultValue={userState.user.firstName} /* onChange={self._changeFirstName.bind(self)} */ name='firstName' onBlur={self._setFirstName.bind(self)} /> {userState.error.firstName && <Message error content={userState.error.firstName} />}
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Input label='Last Name' defaultValue={userState.user.lastName} /* onChange={self._changeLastName.bind(self)} */ name='lastName' onBlur={self._setLastName.bind(self)} />
                                            {userState.error.lastName && <Message error content={userState.error.lastName} />}
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <Form.Input label='Email' defaultValue={userState.user.email} /* onChange={self._changeEmail.bind(self)} */ name='email' onBlur={self._setEmail.bind(self)} />
                                            {userState.error.email && <Message error content={userState.error.email} />}
                                        </Form.Field>
                                        <Form.Field>
                                            <div className='field upload-picture'>
                                                <label>Upload Profile Picture</label>
                                                <div className='ui input'>
                                                    <input type='file' name='picture' accept='image/*'
                                                        onChange={self._onChangePicture.bind(self)} 
                                                        onClick={(event) => {
                                                            event.target.value = null;
                                                        }}/>
                                                </div>
                                            </div>
                                            <a className='preview-link' onClick={self._showImage.bind(self, 'picture')}>View Picture</a>
                                            {/* <img src={userState.imagePreviewUrl} className='preview-picture' />*/}
                                            {userState.error.picture && <Message error content={userState.error.picture} />}
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <Form.Select label='Select Role' value={userState.user.role._id} onChange={self._changeRole.bind(self)} name='role'
                                                options={roleData} onBlur={self._setRoleError.bind(self)} />
                                            {userState.error.role && <Message error content={userState.error.role} />}
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Select label='Select Role Level' value={userState.user.roleLevel ? userState.user.roleLevel._id : ''}
                                                onChange={self._changeRoleLevel.bind(self)} name='roleLevel'
                                                options={roleLevelData} onBlur={self._setRoleError.bind(self)} />
                                                {userState.error.roleLevel && <Message error content={userState.error.roleLevel} />}
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <Form.Input label='Company title' defaultValue={userState.user.title} onBlur={self._changeCompanyTitle.bind(self)} name='title' /> {userState.error.title && <Message error content={userState.error.title} />}
                                        </Form.Field>
                                        <Form.Field>
                                            <div className='field upload-picture'>
                                                <label>Upload Signature</label>
                                                <div className='ui input'>
                                                    <input type='file' name='signature' accept='image/*'
                                                        onChange={self._onChangeSignature.bind(self)}
                                                        onClick={(event) => {
                                                            event.target.value = null;
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <a className='preview-link' onClick={self._showImage.bind(self, 'signature')}>View Signature</a>
                                            {/* <img src={userState.signaturePreviewUrl} className='preview-picture' />*/}
                                            {userState.error.signature && <Message error content={userState.error.signature} />}
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Field>
                                            <div className='field upload-picture'>
                                                <label>Upload Initials</label>
                                                <div className='ui input'>
                                                    <input type='file' name='initials' accept='image/*'
                                                        onChange={self._onChangeInitials.bind(self)}
                                                        onClick={(event) => {
                                                            event.target.value = null;
                                                        }} />
                                                </div>
                                            </div>
                                            <a className='preview-link' onClick={self._showImage.bind(self, 'initials')}>View Initials</a>
                                            {/* <img src={userState.initialsPreviewUrl} className='preview-picture' />*/}
                                            {userState.error.initials && <Message error content={userState.error.initials} />}
                                        </Form.Field>
                                        <Form.Field>
                                            <div className='field upload-picture'>
                                                <label>Upload Title Block</label>
                                                <div className='ui input'>
                                                    <input type='file' name='titleBlock' accept='image/*'
                                                        onChange={self._onChangeTitleBlock.bind(self)}
                                                        onClick={(event) => {
                                                            event.target.value = null;
                                                        }} />
                                                </div>
                                            </div>
                                            <a className='preview-link' onClick={self._showImage.bind(self, 'titleBlock')}>View Title Block</a>
                                            {/* <img src={userState.titleBlockPreviewUrl} className='preview-picture' />*/}
                                            {userState.error.titleBlock && <Message error content={userState.error.titleBlock} />}
                                        </Form.Field>
                                    </Form.Group>
                                    <Button primary type='submit' onFocus={self._handleFocusOnButtons.bind(self)} onBlur={self._handleOnBlurOnButtons.bind(self)}>
                                        {userState.isAddUser
                                            ? 'Add'
                                            : 'Save'}
                                    </Button>
                                    <Button secondary type='reset' onClick={self._closeUserForm.bind(self)}
                                        onFocus={self._handleFocusOnButtons.bind(self)}
                                        onBlur={self._handleOnBlurOnButtons.bind(self)}>Cancel</Button>
                                </Form>
                            </Segment>
                            : canWriteUser && <Button primary={true} onClick={self._showAddUserForm.bind(self)}>Add new User</Button>
                        }
                        <Table celled structured>
                            <Table.Header>
                                <Table.Row textAlign='center'>
                                    <Table.HeaderCell>Profile Picture</Table.HeaderCell>
                                    <Table.HeaderCell>Employee Code</Table.HeaderCell>
                                    <Table.HeaderCell>First Name</Table.HeaderCell>
                                    <Table.HeaderCell>Last Name</Table.HeaderCell>
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Role</Table.HeaderCell>
                                    <Table.HeaderCell>Role Level</Table.HeaderCell>
                                    <Table.HeaderCell>Company Title</Table.HeaderCell>
                                    <Table.HeaderCell>Signature</Table.HeaderCell>
                                    <Table.HeaderCell>Initials</Table.HeaderCell>
                                    <Table.HeaderCell>Title Block</Table.HeaderCell>
                                    <Table.HeaderCell>IsActive</Table.HeaderCell>
                                    <Table.HeaderCell>Download Payday Report</Table.HeaderCell>
                                    <Table.HeaderCell>Scope Visibility Permission</Table.HeaderCell>
                                    <Table.HeaderCell>Location</Table.HeaderCell>
                                    <Table.HeaderCell>Availability</Table.HeaderCell>
                                    {canWriteUser && <Table.HeaderCell>Edit</Table.HeaderCell>}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {userData}
                            </Table.Body>
                        </Table>
                    </div>
                    : null
                }
                {userState.isCroppingImageModalOpen &&
                    <Modal closeOnEscape={false} closeOnDimmerClick={false} closeOnDocumentClick={false} open size='small' closeIcon onClose={self._resetCroppingModal.bind(self)}>
                        <Modal.Header>
                            {userState.uploadingType ? 'Crop ' + croppingTypeText + aspectRatioText : 'View Image'}
                        </Modal.Header>
                        <Modal.Content>
                            <div className='cropper-main'>
                                <Grid centered divided='vertically'>
                                    {userState.uploadingType &&
                                        <Grid.Row centered columns={1}>
                                            <Grid.Column>
                                                <div>
                                                    <Cropper
                                                        style={{ height: 400, width: '100%' }}
                                                        src={userState.uploadingImageURL}
                                                        ref={
                                                            cropper => {
                                                                this.cropper = cropper;
                                                            }
                                                        }
                                                        aspectRatio={aspectRatio}
                                                    />
                                                </div>
                                                {userState.error.imageError && <Message error content={userState.error.imageError} />}
                                                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    <Popup style={{ marginTop: '10px' }}
                                                        trigger={
                                                            <Button icon onClick={self._cropImage.bind(self)}>
                                                                <Icon name='crop' />
                                                            </Button>
                                                        }
                                                        content='Crop Image'
                                                    />
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                    }
                                    <Grid.Row centered columns={1}>
                                        <Grid.Column>
                                            <div>
                                                {userState.previewImage ? <img src={userState.previewImage} alt='Cropped Image' /> : <span className='helptext'>Nothing to display</span>}
                                            </div>
                                            <Button className='save-cropped' icon onClick={self._resetCroppingModal.bind(self)} primary floated='right'>
                                                {userState.uploadingType ? 'Save' : 'Close'}
                                            </Button>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </Modal.Content>
                    </Modal>
                }
            </Segment>
        );
    }
}
