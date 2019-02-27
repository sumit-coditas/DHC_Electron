import React from 'react';
import { debounce } from 'lodash';
import {
    Button,
    Modal,
    Icon,
    Grid,
    Input,
    Popup,
    Checkbox,
    Radio
} from 'semantic-ui-react';
import Cropper from 'react-cropper';

import defaultImage from '../../assets/images/demo_image.png'
import FileUpload from '../../baseComponents/FileUpload'
import { CustomerUserTable } from './CustomerUserTable.js';
import Dropdown from '../../baseComponents/Dropdown';
import CustomerStore from '../../stores/CustomerStore';
import CustomerAction from '../../actions/CustomerAction';
import { isEmail } from '../../utils/Validation.js';
export default class CustomerProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            CustomerStore: CustomerStore.getState(),
            customerDropdownValue: '',
            newLogo: '',
            newPoster: '',
            newLogoFile: '',
            newPosterFile: '',
            showImageCropper: false,
            cropImage: null,
            previewImage: null,
            isImage: true,
            isCustomerPage: true,
            isValidEmail: true,
            loadingIsExistEmail: false,
            addingCustomer: false,
            isActive: true,
            errorMsg: '',
            addCustomer: false,
            isEditing: false,
            editModeOptions: null,
        };
    }

    componentDidMount() {
        CustomerStore.listen(this.onChange);
    }

    componentWillUnmount() {
        CustomerStore.unlisten(this.onChange);
    }

    onChange = (state) => {
        const obj = {};
        obj[state.displayName] = state;
        this.setState(obj);
    };

    getCustomers = debounce((e, value) => {
        if (this.state.isEditing && this.state.editModeOptions) {
            this.setState({ editModeOptions: null, customerDropdownValue: '' })
        }

        if (value === '') {
            CustomerAction.setDefaultCustomerList();
            return;
        }
        CustomerAction.getCustomers(value);

    }, 500);

    handleCustomerChange = (e, { value }) => {
        this.resetLogo ? this.resetLogo.value = '' : null;
        this.resetPoster ? this.resetPoster.value = '' : null;
        this.setState({
            newLogo: '',
            newPoster: '',
            newLogoFile: '',
            newPosterFile: '',
            customerDropdownValue: value,
            isImage: true,
            showImageCropper: false,
            cropImage: null,
            previewImage: null
        }, () => CustomerAction.getCustomerImages(value));
    };

    isImage = ({ type }) => {
        if (type && type.includes('image')) {
            return true;
        }
        return false;
    };

    uploadImage = (event, imageType) => {
        let reader = new FileReader();
        let file = event.target.files[0];
        if (this.isImage(file)) {
            reader.onload = (e) => {
                const obj = {};
                if (imageType === 'logo') {
                    obj.newLogo = e.target.result;
                    obj.newLogoFile = file;
                    obj.showImageCropper = true;
                    obj.cropImage = reader.result;
                    obj.cropperFor = 'logo';
                    obj.isImage = true;
                } else if (imageType === 'poster') {
                    obj.newPoster = e.target.result;
                    obj.newPosterFile = file;
                    obj.cropImage = reader.result;
                    obj.showImageCropper = true;
                    obj.cropperFor = 'poster';
                    obj.isImage = true;
                }
                this.setState({ ...obj })
            };
            reader.readAsDataURL(file);
        } else {
            this.setState({ isImage: false })
        }


    };

    saveCustomerImages = () => {
        const {
            newLogoFile,
            newPosterFile,
            customerDropdownValue
        } = this.state;
        CustomerAction.saveCustomerImages(customerDropdownValue, newLogoFile, newPosterFile);
    };

    openCropper = () => {
        this.setState({
            showImageCropper: true,
        })
    };

    _cropImage = () => {
        if (typeof this.refs.cropper.getCroppedCanvas() === 'undefined') {
            return;
        }
        const dataURI = this.refs.cropper.getCroppedCanvas().toDataURL();
        const blob = this.dataURItoBlob(dataURI);

        if (this.state.cropperFor === 'logo') {
            this.setState({
                previewImage: dataURI,
                newLogoFile: blob
            });
        } else if (this.state.cropperFor === 'poster') {
            this.setState({
                previewImage: dataURI,
                newPosterFile: blob
            });
        }
    };

    resetCropImage = () => {
        if (this.state.cropperFor === 'logo') {
            this.setState({
                previewImage: this.state.newLogo
            })
        } else if (this.state.cropperFor === 'poster') {
            this.setState({
                previewImage: this.state.newPoster
            });
        }
    };

    saveCroppedImage = () => {
        if (this.state.cropperFor === 'logo') {
            this.setState({
                newLogo: this.state.previewImage,
                showImageCropper: false,
                previewImage: null
            })
        } else if (this.state.cropperFor === 'poster') {
            this.setState({
                newPoster: this.state.previewImage,
                showImageCropper: false,
                previewImage: null
            });
        }
    };

    dataURItoBlob(dataURI) {
        let byteString;
        let mimestring;

        if (dataURI.split(',')[0].indexOf('base64') !== -1) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = decodeURI(dataURI.split(',')[1]);
        }

        mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

        let content = [];
        for (let i = 0; i < byteString.length; i += 1) {
            content[i] = byteString.charCodeAt(i);
        }
        return new Blob([new Uint8Array(content)], { type: mimestring }, { name: 'tempFile.png' });
    }

    getImageContainer = () => {
        const {
            logo,
            poster,
            isUploading,
            error
        } = this.state.CustomerStore;
        const {
            newLogo,
            newPoster,
            isImage
        } = this.state;
        return (
            <div>
                <div className="image-container">
                    <FileUpload
                        label="Logo"
                        style="image-section"
                        size="medium"
                        accept="image/x-png,image/gif,image/jpeg, image/jpg, image/gfif, image/bmp"
                        onChange={(event) => this.uploadImage(event, 'logo')}
                        onClick={(event) => {
                            event.target.value = null;
                        }}
                        src={newLogo || logo || defaultImage}
                        fileInput={el => this.resetLogo = el}
                    />

                    <div
                        className="divider" />

                    <FileUpload
                        label="Poster"
                        style="image-section"
                        size="medium"
                        accept="image/*"
                        onChange={(event) => this.uploadImage(event, 'poster')}
                        onClick={(event) => {
                            event.target.value = null;
                        }}
                        src={newPoster || poster || defaultImage}
                        fileInput={el => this.resetPoster = el}
                    />
                </div>
                <div className="upload-button-wrapper">
                    {
                        error.msg &&
                        <label className="error" >{error.msg}</label>
                    }
                    {
                        !isImage && !error.msg &&
                        <label className="error" >Seems like uploaded file type is not an image. Please try again.</label>
                    }
                    <Button
                        onClick={this.saveCustomerImages}
                        primary
                        loading={isUploading}
                    >
                        Upload
                    </Button>
                </div>
            </div>
        );
    };

    getBrowseImageModal = () => {
        const {
            cropImage,
            cropperFor,
            previewImage,
        } = this.state;

        return (
            <Modal closeOnEscape={false} closeOnDimmerClick={false} closeOnDocumentClick={false} open size='small' closeIcon onClose={this.saveCroppedImage}>
                <Modal.Header>
                    Crop {cropperFor}
                </Modal.Header>
                <Modal.Content>
                    <div className='cropper-main'>
                        <Grid centered divided='vertically'>
                            <Grid.Row centered columns={1}>
                                <Grid.Column>
                                    <div>
                                        <Cropper
                                            style={{ height: 400, width: '100%' }}
                                            src={cropImage}
                                            ref='cropper'
                                            aspectRatio={cropperFor === 'poster' ? 2 : NaN}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                        <Popup style={{ marginTop: '10px' }}
                                            trigger={
                                                <Button icon onClick={this._cropImage}>
                                                    <Icon name='crop' />
                                                </Button>
                                            }
                                            content='Crop Image'
                                        />
                                        <Popup style={{ marginTop: '10px' }}
                                            trigger={
                                                <Button icon onClick={this.resetCropImage}>
                                                    <i className="reply icon"></i>
                                                </Button>
                                            }
                                            content='Reset Image'
                                        />
                                    </div>

                                </Grid.Column>
                            </Grid.Row>

                            <Grid.Row centered columns={1}>
                                <Grid.Column>
                                    <div>
                                        {previewImage ? <img src={previewImage} alt='Cropped Image' /> : <span className='helptext'>Please click on crop button to see preview</span>}
                                    </div>
                                    <Button className='save-cropped' onClick={this.saveCroppedImage} icon primary floated='right'>
                                        Save
                                    </Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                </Modal.Content>
            </Modal>
        );
    };

    // Add user API call
    addCustomerUser = () => {
        let {
            firstName,
            lastName,
            email,
            customerDropdownValue,
            isActive,
            isEditing,
            editModeOptions,
            companyId,
            id,
            _id
        } = this.state;
        let key = companyId;
        if (!editModeOptions) {
            this.state.CustomerStore.customers.map(customer => {
                if (customerDropdownValue == customer.value) {
                    key = customer.key;
                }
            });
        }
        let User;
        if (isEditing) {
            User = {
                firstName,
                lastName,
                email,
                isActive,
                companyId: key,
                companyName: customerDropdownValue,
                id,
                _id
            };
            CustomerAction.updateCustomer(User, this.addUserAPISuccess);
        } else {
            User = {
                firstName,
                lastName,
                email,
                isActive,
                companyId: key,
                companyName: customerDropdownValue
            };
            CustomerAction.addCustomerUser(User, this.addUserAPISuccess);
        }
        this.setState({
            addingCustomer: true
        });
    };

    // add user API success
    addUserAPISuccess = (errorMsg) => {
        if (!errorMsg) {
            this.cancelAddUserForm();
        }
        this.setState({
            addingCustomer: false,
            errorMsg
        });
    };

    // returns customer image management UI
    getCustomerImageManagement = () => {
        const {
            customers,
            fetchingCustomerList
        } = this.state.CustomerStore;
        const {
            customerDropdownValue,
            showImageCropper,
        } = this.state;

        return (
            <div>
                <Dropdown
                    options={customers}
                    placeholder="Customer"
                    handleChange={this.handleCustomerChange}
                    value={customerDropdownValue}
                    search
                    loading={fetchingCustomerList}
                    onSearchChange={this.getCustomers}
                    label="Search Customer"
                />
                {customerDropdownValue && this.getImageContainer()}
                {showImageCropper && this.getBrowseImageModal()}
            </div>
        );
    };

    // handle customer form value change
    handleValueChange = (value, type) => {
        let data = value.trim();
        switch (type) {
            case 'firstName':
                this.setState({ firstName: data });
                break;
            case 'lastName':
                this.setState({ lastName: data });
                break;
            case 'email':
                let isValidEmail = data ? isEmail(data) : true;
                // if email address is correct check whether it is already exist or not
                if (isValidEmail && data) {
                    CustomerAction.isEmailExist({ email: data }, this.isEmailExistSuccess);
                }
                this.setState({ email: data, isValidEmail });
                break;
        }
    };

    // check whether email address is already exist or not
    isEmailExistSuccess = (response) => {
        this.setState({
            errorMsg: response
        })
    };

    // checks if all field in customer field are valid
    isValidForm = () => {
        const {
            firstName,
            lastName,
            email,
            customerDropdownValue,
            errorMsg
        } = this.state;
        return !(firstName && lastName && customerDropdownValue && isEmail(email) && errorMsg === '');
    };

    // return add customer UI
    getAddCustomerForm = () => {
        const {
            allCustomers,
            fetchingCustomerList
        } = this.state.CustomerStore;
        const {
            customerDropdownValue,
            firstName,
            lastName,
            email,
            isActive,
            isValidEmail,
            addingCustomer,
            errorMsg,
            isEditing,
            editModeOptions
        } = this.state;
        return (
            <Grid.Column className='form-container'>
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <div><lable>First Name</lable></div>
                            <Input
                                style={{ width: '100%' }}
                                placeholder='first'
                                value={firstName}
                                onChange={(e, { value }) => this.handleValueChange(value, 'firstName')} />
                        </Grid.Column>
                        <Grid.Column>
                            <div><lable>Last Name</lable></div>
                            <Input
                                style={{ width: '100%' }}
                                placeholder='last'
                                value={lastName}
                                onChange={(e, { value }) => this.handleValueChange(value, 'lastName')} />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <div><lable>Email Address</lable></div>
                            <Input
                                style={{ width: '100%' }}
                                placeholder='user@email.com'
                                value={email}
                                error={!isValidEmail}
                                onChange={(e, { value }) => this.handleValueChange(value, 'email')} />
                        </Grid.Column>
                        <Grid.Column>
                            <div><lable>Contractor Name</lable></div>
                            <Dropdown
                                options={editModeOptions || allCustomers}
                                placeholder="Customer"
                                handleChange={this.handleCustomerChange}
                                value={customerDropdownValue}
                                search
                                loading={fetchingCustomerList}
                                onSearchChange={this.getCustomers}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1} style={{ textAlign: 'center' }}>
                        <Grid.Column>
                            <div><lable>Active User</lable></div>
                            <Checkbox checked={isActive} toggle onChange={() => { this.setState({ isActive: !this.state.isActive }) }} />
                        </Grid.Column>
                    </Grid.Row>
                    {errorMsg &&
                        <Grid.Row columns={1} style={{ textAlign: 'center', color: 'red' }}>
                            <Grid.Column>
                                {errorMsg}
                            </Grid.Column>
                        </Grid.Row>
                    }
                    <Grid.Row colSpan={3} centered>
                        <Button
                            disabled={this.isValidForm()}
                            loading={addingCustomer}
                            color='blue'
                            content={isEditing ? 'Update' : 'Add User'}
                            onClick={this.addCustomerUser} />
                        <Button
                            color='black'
                            content='Cancel'
                            onClick={this.cancelAddUserForm} />

                    </Grid.Row>
                </Grid>
            </Grid.Column>
        )
    };

    handleEditButtonClick = (payload) => {
        const {
            id,
            _id,
            email,
            firstName,
            lastName,
            companyName,
            isActive,
            companyId
        } = payload;
        let editModeOptions = [{
            key: companyId,
            text: companyName,
            value: companyName
        }];
        this.setState({
            addCustomer: true,
            isEditing: true,
            id,
            _id,
            email,
            firstName,
            lastName,
            companyName,
            customerDropdownValue: companyName,
            companyId,
            isActive,
            editModeOptions
        });
        window.scrollTo(0, 120);
    };

    cancelAddUserForm = () => {
        this.setState({
            addCustomer: !this.state.addCustomer,
            firstName: '',
            lastName: '',
            email: '',
            isActive: false,
            customerDropdownValue: '',
            addingCustomer: false,
            errorMsg: '',
            isEditing: false,
            isValidEmail: true,
            editModeOptions: null
        });
    };

    // show Add user button
    getAddUserButton = (addCustomer) => <div style={{ textAlign: 'right' }}>
        <Button onClick={() => { this.setState({ addCustomer: !addCustomer }) }} primary icon labelPosition='right'>
            <Icon name='plus' />
            Add new customer
        </Button>
    </div>;

    // Add customer screen
    getCustomerUserManagement = () => {
        const { addCustomer } = this.state;
        return (
            <div>
                {!addCustomer && this.getAddUserButton(addCustomer)}
                {addCustomer &&
                    <div className='customer-form-container'>
                        <Grid>
                            <Grid.Row columns={1} className='title-row'>
                                <Grid.Column>
                                    Add New Customer
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={1} >
                                {this.getAddCustomerForm()}
                            </Grid.Row>
                        </Grid>
                    </div>
                }
                <div>
                    {/* show customer user table */}
                    <CustomerUserTable
                        update={addCustomer}
                        handleEditButtonClick={this.handleEditButtonClick} />
                </div>

            </div>
        );
    };

    render() {
        const { isCustomerPage } = this.state;
        return (
            <div className="view-customer-configuration">
                <div className='radio-button-container'>
                    <div className={isCustomerPage ? 'span-lable-active' : 'span-lable'}>
                        Customer Image Management
                    </div>
                    <div className='radio-container'>
                        <Radio slider value={isCustomerPage} onChange={() => { this.setState({ isCustomerPage: !this.state.isCustomerPage }) }} />
                    </div>
                    <div className={!isCustomerPage ? 'span-lable-active' : 'span-lable'}>
                        Customer Management
                    </div>
                </div>
                <div className='data-container'>
                    <div className='data-title'>{isCustomerPage ? 'Customer Image Management' : 'Customer Management'}</div>
                    {isCustomerPage && this.getCustomerImageManagement()}
                    {!isCustomerPage && this.getCustomerUserManagement()}
                </div>
            </div>
        );
    }
}
