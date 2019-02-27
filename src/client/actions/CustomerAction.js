import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';
import CustomerStore from '../stores/CustomerStore';
import AppAction from '../actions/AppAction';

class CustomerAction {
    constructor() {
        this.generateActions('getReportSuccess', 'setFilters',
            'getCustomerSuccess', 'setLoading', 'setFetchingCustomerList',
            'setDefaultCustomers', 'setError', 'resetError', 'setCancelSource', 'cancelRequest',
            'getCustomerImageSuccess', 'setLogo', 'setPoster',
            'setIsUploading', 'getCustomerImagesUploadSuccess');
    }

    getCustomers(query) {
        const url = `office/contractors/${query}`;
        this.resetError();
        this.setFetchingCustomerList(true);
        RequestHandler.get(url)
            .then(customers => this.getCustomerSuccess(customers))
            .catch(error => {
                this.setError(error);
            });
    }

    getCustomerImages(customer) {
        const url = 'customerImage/get-customer-image';
        this.resetError();
        RequestHandler.postNew(url, { name: customer }, {})
            .then(response => this.getCustomerImageSuccess(response.data))
            .catch(error => {
                this.setError(error);
            });
    }

    setDefaultCustomerList() {
        const customer = [];
        this.setDefaultCustomers(customer);
    }

    uploadFileToS3(file, customer, fileName) {
        let data = {
            fileName,
            fileType: file.type,
            bucketName: Constant.BUCKET_NAMES.PICTURE
        };
        return RequestHandler.uploadImage(data, file);
    }
    // checks if email is already exist or noe
    isEmailExist (payload, callback) {
        RequestHandler.post('users/is-exists', payload)
            .then(response => callback(response))
            .catch(error => callback(''));
    }

    // add customer user
    addCustomerUser(user, callback) {
        RequestHandler.post('users/add-customer', user)
            .then(response => {
                callback(response);
                if (!response) {
                    AppAction.showNotification({
                        message: 'Customer added successfully.',
                        level: Constant.NOTIFICATION_LEVELS.SUCCESS
                    });
                }
            })
            .catch(error => {
                callback('Something went wrong.');
                AppAction.showNotification({
                    message: 'Something went wrong.',
                    level: Constant.NOTIFICATION_LEVELS.ERROR
                });
            });
    }

    updateCustomer(user, callback) {
        RequestHandler.post('users/update-cutomer', user)
        .then(response => {
            callback(response);
            if (!response) {
                AppAction.showNotification({
                    message: 'Customer added successfully.',
                    level: Constant.NOTIFICATION_LEVELS.SUCCESS
                });
            }
        })
        .catch(error => {
            callback('Something went wrong.');
            AppAction.showNotification({
                message: 'Something went wrong.',
                level: Constant.NOTIFICATION_LEVELS.ERROR
            });
        });
    }

    saveCustomerImages(customer, logo, poster) {
        this.setIsUploading(true);
        const url = 'customerImage/save-customer-image';
        this.resetError();
        const promises = [];
        if (logo) {
            let fileName = `${(customer+ new Date().getTime()).split(' ').join('_').toLowerCase()}_logo`;
            promises.push(this.uploadFileToS3(logo, customer, fileName)
                .then((ImageUrl) => {
                    return {
                        type: 'logo',
                        url: ImageUrl
                    };
                })
            );
        }

        if (poster) {
            let fileName = `${(customer+ new Date().getTime()).split(' ').join('_').toLowerCase()}_poster`;
            promises.push(this.uploadFileToS3(poster, customer, fileName)
                .then((ImageUrl) => {
                    return {
                        type: 'poster',
                        url: ImageUrl
                    };
                })
            );
        }

        Promise.all(promises)
            .then(response => {
                const data = {
                    name: customer
                };
                response.forEach(item => {
                    data[item.type] = item.url;
                });

                if (!data.logo) {
                    data.logo = CustomerStore.getState().logo || '';
                }
                if (!data.poster) {
                    data.poster = CustomerStore.getState().poster || '';
                }

                RequestHandler.putNew(url, data, {})
                    .then((resp) => {
                        AppAction.showNotification({
                            message: 'Image uploaded successfully',
                            level: Constant.NOTIFICATION_LEVELS.SUCCESS
                        });
                        this.getCustomerImagesUploadSuccess(resp.data);
                    })
                    .catch(error => {
                        AppAction.showNotification({
                            message: 'Failed to upload image.',
                            level: Constant.NOTIFICATION_LEVELS.ERROR
                        });
                        this.setError(error);
                    });
            });
    }
}

export default alt.createActions(CustomerAction);
