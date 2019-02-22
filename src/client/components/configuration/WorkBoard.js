import React from 'react';
import { hashHistory } from 'react-router';
import { Step } from 'semantic-ui-react';

export default class WorkBoard extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    _setActiveStep(transitionRoute) {
        hashHistory.push('/' + transitionRoute);
    }

    getActiveStep = () => {
        let activeSteps = {
            roleConfiguration: false,
            userManagement: false,
            personalUpdate: false,
            communication: false,
            appSetting: false,
            customerProfile: false
        };

        switch (this.props.location.pathname) {
        case '/app-setting':
            activeSteps.appSetting = true;
            break;
        case '/personal-update':
            activeSteps.personalUpdate = true;
            break;
        case '/customer-configuration':
            activeSteps.customerProfile = true;
            break;
        case '/user-management':
            activeSteps.userManagement = true;
            break;
        case '/role-configuration':
            activeSteps.roleConfiguration = true;
            break;

        default:
            activeSteps.roleConfiguration = true;
        }

        let steps = [
            {
                active: activeSteps.roleConfiguration,
                title: 'Role Configuration',
                onClick: this._setActiveStep.bind(this, 'role-configuration')
            }, {
                active: activeSteps.userManagement,
                title: 'User Management',
                onClick: this._setActiveStep.bind(this, 'user-management')
            },
            {
                active: activeSteps.customerProfile,
                title: 'Customer Configuration',
                onClick: this._setActiveStep.bind(this, 'customer-configuration')
            },
            {
                active: activeSteps.personalUpdate,
                title: 'Personal Updates',
                onClick: this._setActiveStep.bind(this, 'personal-update')
            }, {
                active: activeSteps.appSetting,
                title: 'Settings',
                onClick: this._setActiveStep.bind(this, 'app-setting')
            }
        ];
        return steps;
    };

    render() {
        let self = this;
        let steps = this.getActiveStep();
        return (
            <div>
                <div className='container w-container'>
                    <Step.Group items={steps} />
                    {self.props.children}
                </div>
            </div>
        );
    }
}
