import React, { Component } from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { UserModel } from '../../../../model/UserModel';
import { showFaliureNotification } from '../../../../utils/notifications';
import { getUninvoicedScopes } from '../../../../utils/promises/invoicePromises';
import UninvoicedPageComponent from '../components/uninvoicedPageComponent';
import { UtilModel } from '../../../../model/AppModels/UtilModel';

class UinvoicedPageContainer extends PLPPureComponent {
    state = { showLoader: true }

    componentWillMount() {
        UtilModel.isUninvoicedPageOpen(true);
        this.handleLoader(true)
        this.getUninvoicedScopes();
    }

    handleLoader(flag) {
        UtilModel.updateLoaderValue(flag)
    }

    componentWillUnmount() {
        ScopeModel.deleteAll();
        UtilModel.isUninvoicedPageOpen(false);
    }

    getUninvoicedScopes = () => {
        getUninvoicedScopes({ userID: this.props.userId })
            .then(response => {
                const scopeModelsArray = [];
                response.map(scope => scopeModelsArray.push(new ScopeModel({ ...scope, invoiceType: { _id: 1 } })));
                this.handleLoader(false);
                ScopeModel.saveAll(scopeModelsArray);
                this.setState({ showLoader: false });
            }).catch(e => {
                this.handleLoader(false)
                this.setState({ showLoader: false });
                showFaliureNotification('Something went wrong while fetching scopes from server. Please try after some time.')
            });
    };

    render = () => <UninvoicedPageComponent
        showLoader={this.state.showLoader}
        employees={this.props.employees}
    />;
}

function mapStateToProps() {
    return {
        userId: UserModel.last().props._id,
        employees: EmployeeModel.list().map(item => item.props)
    };
}

export default connect(mapStateToProps)(UinvoicedPageContainer);
