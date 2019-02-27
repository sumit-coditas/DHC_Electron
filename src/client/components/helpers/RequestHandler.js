import axios from 'axios';

import Constant from '../helpers/Constant.js';

import AppAction from '../../actions/AppAction.js';
import LoginAction from '../../actions/LoginAction.js';
let config = Constant.CONFIG;

export default class RequestHandler {

    static get(action) {
        let url = apiUrl + action;
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('AUTH_TOKEN');
        config.headers.socketID = localStorage.getItem('socketid');
        return new Promise((resolve, reject) => {
            axios.get(
                url,
                config
            ).then(
                function (response) {
                    resolve(response.data);
                }
            ).catch(
                function (error) {
                    if (error.response.status === 498) {
                        LoginAction.logout();
                    } else {
                        reject(error);
                        AppAction.showError({
                            code: error.response.status,
                            message: error.response.data
                        });
                    }
                }
            );
        });
    }

    static post(action, data) {
        let url = apiUrl + action;
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('AUTH_TOKEN');
        config.headers.socketID = localStorage.getItem('socketid');
        return new Promise((resolve, reject) => {
            axios.post(
                url,
                data,
                config
            ).then(
                function (response) {
                    resolve(response.data);
                }
            ).catch(
                function (error) {
                    if (error.response.status === 498) {
                        LoginAction.logout();
                    } else {
                        reject(error);
                        AppAction.showError({
                            code: error.response.status,
                            message: error.response.data
                        });
                    }
                }
            );
        });
    }

    static put(action, data) {
        let url = apiUrl + action;
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('AUTH_TOKEN');
        config.headers.socketID = localStorage.getItem('socketid');
        return new Promise((resolve, reject) => {
            axios.put(
                url,
                data,
                config
            ).then(
                function (response) {
                    resolve(response.data);
                }
            ).catch(
                function (error) {
                    if (error.response.status === 498) {
                        LoginAction.logout();
                    } else {
                        reject(error);
                        AppAction.showError({
                            code: error.response.status,
                            message: error.response.data
                        });
                    }
                }
            );
        });
    }

    static delete(action) {
        let url = apiUrl + action;
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('AUTH_TOKEN');
        config.headers.socketID = localStorage.getItem('socketid');
        return new Promise((resolve, reject) => {
            axios.delete(
                url,
                config
            ).then(
                function (response) {
                    resolve(response.data);
                }
            ).catch(
                function (error) {
                    if (error.response.status === 498) {
                        LoginAction.logout();
                    } else {
                        reject(error);
                        AppAction.showError({
                            code: error.response.status,
                            message: error.response.data
                        });
                    }
                }
            );
        });
    }

    static postNew(endPoint, payload, conf) {
        let url = apiUrl + endPoint;
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('AUTH_TOKEN');
        config.headers.socketID = localStorage.getItem('socketid');
        return axios.post(url, payload, { ...config, ...conf });
    }

    static putNew(endPoint, payload, conf) {
        let url = apiUrl + endPoint;
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('AUTH_TOKEN');
        config.headers.socketID = localStorage.getItem('socketid');
        return axios.put(url, payload, { ...config, ...conf });
    }

    static uploadImage(data, file) {
        let url = 'users/signedUrl';
        let config = {
            headers: {
                'Content-Type': file.type
            }
        };
        return RequestHandler.postNew(url, data, {})
            .then(response => {
                axios.put(response.data, file, config);
                return response.data.split('?')[0];
            });
    }
}
