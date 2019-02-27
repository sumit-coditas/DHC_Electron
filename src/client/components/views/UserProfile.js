import React, { PropTypes } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';

import {
    Grid,
    Menu,
    Segment,
    Item,
    Icon,
    Form,
    Button,
    Loader,
    Dimmer,
    Message,
    Popup,
    Modal
} from 'semantic-ui-react';

import Cropper from 'react-cropper';

import Picture from '../widgets/Picture.js';
import Constant from '../helpers/Constant.js';

import UserAction from '../../actions/UserAction.js';

import LoginStore from '../../stores/LoginStore.js';
import UserStore from '../../stores/UserStore.js';

import { changeSubmitButtonStyle } from '../../utils/changeBackgroundOfSubmit';

const imageFileTypes = ['jpeg', 'png', 'bmp', 'tiff', 'gif', 'jpg'];

export default class UserProfile extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            UserStore: UserStore.getState(),
            LoginStore: LoginStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        UserStore.listen(this.onChange);
        LoginStore.listen(this.onChange);
        UserAction.getUser(this.props.params.userId);
    }

    componentWillUnmount() {
        UserStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
        UserAction.resetUser();
    }

    _toggleEditMode() {
        UserAction.toggleEditMode();
    }

    _onChangePicture(event) {
        let self = this;
        let reader = new FileReader();
        let file = event.target.files[0];
        if (self._validateImage(file, 'picture')) {
            reader.onloadend = () => {
                UserAction.setProfilePicture({
                    file: file,
                    imagePreviewUrl: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    }

    _validateImage({ type }) {
        let isImageFile = false;
        if (type && type.includes('image')) {
            isImageFile = true;
        }
        if (!isImageFile) {
            UserAction.setError({ type: 'picture', errorMsg: 'Seems like selected file is not an image, Please try again.' });
        }
        return isImageFile;
    }

    _validateForm({ formData }) {
        let isFormValid = true;
        if (!formData.firstName) {
            isFormValid = false;
            UserAction.setError({ type: 'firstName', errorMsg: 'Please enter first name' });
        }

        if (formData.lastName.length > 25) {
            isFormValid = false;
            UserAction.setError({ type: 'lastName', errorMsg: 'First name should be less than 25 characters' });
        }

        if (!formData.lastName) {
            isFormValid = false;
            UserAction.setError({ type: 'lastName', errorMsg: 'Please enter last name' });
        }

        if (formData.firstName.length > 25) {
            isFormValid = false;
            UserAction.setError({ type: 'firstName', errorMsg: 'First name should be less than 25 characters' });
        }

        if (this.state.UserStore.error.picture.length > 0) {
            isFormValid = false;
        }
        return isFormValid;
    }

    _handleSubmit(event, { formData }) {
        let self = this;
        event.preventDefault();
        let userState = self.state.UserStore;
        if (self._validateForm({ formData }) && !userState.error.imageError) {
            let data = {
                user: formData,
                id: userState.profilePageUser.id,
                picture: userState.picture
            };
            UserAction.updateUser(data);
            UserAction.setLoader();
        }
    }

    _handleMenuItem(event, { name }) {
        UserAction.handleMenuItem(name);
    }

    _getUser(userID) {
        UserAction.getUser(userID);
    }

    _resetCroppingModal() {
        UserAction.resetCroppingModal();
    }

    _cropImage() {
        if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
            return;
        }
        UserAction.setCropResult(this.cropper.getCroppedCanvas().toDataURL());
    }

    render() {
        let self = this;
        let userState = self.state.UserStore;
        let loginState = self.state.LoginStore;
        let location ='';
        if (userState.profilePageUser && userState.profilePageUser.locationInfo && userState.profilePageUser.locationInfo.location) {
            location = userState.profilePageUser.locationInfo.location.name;
        }
        if (userState.profilePageUser && userState.profilePageUser.id !== self.props.params.userId) {
            self._getUser(self.props.params.userId);
        }

        return (
            <div className='user-profile-wrapper'>
                {!userState.profilePageUser ?
                    <Dimmer active inverted>
                        <Loader />
                    </Dimmer> :
                    <Grid>
                        <Grid.Column width={2}>
                            <Menu secondary vertical>
                                <Menu.Item name={Constant.USER_PROFILE.MENU_ITEMS.DETAILS}
                                    active={userState.activeItem === Constant.USER_PROFILE.MENU_ITEMS.DETAILS}
                                    onClick={self._handleMenuItem.bind(self)} />
                            </Menu>
                        </Grid.Column>
                        <Grid.Column stretched width={12}>
                            <Segment loading={userState.isLoading}>
                                <Item.Group>
                                    <Item>
                                        <Picture src={userState.profilePageUser.picture} style={{ height: '8%', width: '8%' }} size='tiny' />
                                        <Item.Content>
                                            {loginState.user && loginState.user.id === self.props.params.userId &&
                                                <a className='dogood-links float-right-link' href='#' onClick={self._toggleEditMode.bind(self)}>
                                                    <Icon name='edit' />
                                                    Edit Profile
                                                </a>
                                            }
                                            <Item.Header>
                                                {userState.profilePageUser.firstName + ' ' + userState.profilePageUser.lastName}
                                            </Item.Header>
                                            <Item.Meta>
                                                <span>
                                                    Employee Code:
                                                </span>
                                                <span>
                                                    {userState.profilePageUser.employeeCode}
                                                </span>
                                            </Item.Meta>
                                            <Item.Description>
                                                {userState.isEditProfile ?
                                                    <Form error onSubmit={self._handleSubmit.bind(self)}>
                                                        <Form.Group widths='equal'>
                                                            <Form.Field>
                                                                <Form.Input label='First Name' name='firstName' defaultValue={userState.profilePageUser.firstName} />
                                                                {userState.error.firstName && <Message error content={userState.error.firstName} />}
                                                            </Form.Field>
                                                            <Form.Field>
                                                                <Form.Input label='Last Name' name='lastName' defaultValue={userState.profilePageUser.lastName} />
                                                                {userState.error.lastName && <Message error content={userState.error.lastName} />}
                                                            </Form.Field>
                                                        </Form.Group>
                                                        <Form.Group widths='equal'>
                                                            <Form.Input type='text' label='Skype Id' name='skypeId' defaultValue={userState.profilePageUser.skypeId} />
                                                            <div className='field'>
                                                                <label>Upload Profile Picture</label>
                                                                <div className='ui input'>
                                                                    <input
                                                                        type='file'
                                                                        name='picture'
                                                                        accept={imageFileTypes}
                                                                        onChange={self._onChangePicture.bind(self)} />
                                                                </div>
                                                                {userState.error.picture && <Message error content={userState.error.picture} />}
                                                            </div>
                                                        </Form.Group>
                                                        <div className='text-align-right'>
                                                            <Button style={changeSubmitButtonStyle(userState.isLoading)} primary type='submit'>Save</Button>
                                                            <Button secondary type='reset' onClick={self._toggleEditMode.bind(self)}>Cancel</Button>
                                                        </div>
                                                    </Form>
                                                    : <div className='user-description-wrapper'>
                                                        <div className='user-description-data-wrapper'>
                                                            <div className='user-description-data w-inline-block'>
                                                                <span>
                                                                    Email Id:
                                                                </span>
                                                                <span>
                                                                    {userState.profilePageUser.email}
                                                                </span>
                                                            </div>
                                                            <div className='user-description-data user-description-data-float'>
                                                                <span>
                                                                    skype Id:
                                                                </span>
                                                                <span>
                                                                    {userState.profilePageUser.skypeId}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className='user-description-data-wrapper'>
                                                            <div className='user-description-data w-inline-block'>
                                                                <span>
                                                                    Role:
                                                                </span>
                                                                <span>
                                                                    {userState.profilePageUser.role && userState.profilePageUser.role.name}
                                                                </span>
                                                            </div>
                                                            <div className='user-description-data user-description-data-float'>
                                                                <span>
                                                                    Role Level:
                                                                </span>
                                                                <span>
                                                                    {userState.profilePageUser.roleLevel ? userState.profilePageUser.roleLevel.name : '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className='user-description-data-wrapper'>
                                                            <div className='user-description-data w-inline-block'>
                                                                <span>
                                                                    Location:
                                                                </span>
                                                                <span>
                                                                    {location || ""}
                                                                </span>
                                                            </div>
                                                            <div className='user-description-data user-description-data-float'>
                                                                <span>
                                                                    Availability:
                                                                </span>
                                                                <span>
                                                                    {userState.profilePageUser.availability}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </Item.Description>
                                        </Item.Content>
                                    </Item>
                                </Item.Group>
                            </Segment>
                            {userState.isCroppingImageModalOpen &&
                                <Modal closeOnEscape={false} closeOnDimmerClick={false} closeOnDocumentClick={false} open size='small' closeIcon onClose={self._resetCroppingModal}>
                                    <Modal.Header>
                                        Crop Picture
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
                                                                    aspectRatio={1/1}
                                                                />
                                                            </div>
                                                            {userState.error.picture && <Message error content={userState.error.picture} />}
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
                                                        <Button className='save-cropped' icon onClick={self._resetCroppingModal} primary floated='right'>
                                                            {userState.uploadingType ? 'Save' : 'Close'}
                                                        </Button>
                                                    </Grid.Column>
                                                </Grid.Row>
                                            </Grid>
                                        </div>
                                    </Modal.Content>
                                </Modal>
                            }
                        </Grid.Column>
                    </Grid>
                }
            </div>
        );
    }
}

UserProfile.propTypes = {
    params: PropTypes.object
};
