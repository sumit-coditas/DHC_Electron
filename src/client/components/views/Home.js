import React, { PropTypes } from 'react';
import cookie from 'react-cookie';

import Constant from '../helpers/Constant.js';
import { CustomerHome } from './CustomerHome/CustomerHome.js';
import LoginAction from '../../actions/LoginAction.js';

import HomePageTables from './HomePageTables/HomePageTables';
import { UserModel } from '../../model/UserModel';
import { connect } from 'react-redux';
import Constants from '../helpers/Constant.js';
import PayDayModalContainer from '../TimesheetPopUps/PopUpContainer';
import moment from 'moment';
import { TeamHeaderNew } from '../TeamHeader/TeamHeader';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import ScopeFilter from '../../components/filter/scopeFilter'


class Home extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = { showPayDayModal: true, showDailyPopUp: false }
    }

    getQueryStringValue(key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    componentDidMount() {

        if (!localStorage.getItem('OFFICE_REDIRECT_CODE')) {
            if (this.props.userRole !== 'Customer') {
                LoginAction.getOfficeAuthUrl();
                return;
            }
        }

        LoginAction.getOfficeAccessToken(localStorage.getItem('OFFICE_REDIRECT_CODE') || this.getQueryStringValue('code'));
    }

    getDateDifference() {
        const previousDate = new Date(1514764800000);
        previousDate.setHours(0, 0, 0, 0);
        const d = new Date();
        const todayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diff = todayDate.getTime() - previousDate.getTime();
        const daysDiff = diff / 86400000;
        const diffFlag = daysDiff % 14 <= 1;
        if (diffFlag) { // Check Sunday and show Dailypopup
            const isSunday = moment(todayDate).day();
            if (isSunday === 0) return false;
            return diffFlag
        }
        return diffFlag
    }

    isPopUpShownToday() {
        let previousDate = new Date(this.props.payDayFormDate)
        previousDate.setTime(previousDate.getTime() + previousDate.getTimezoneOffset() * 60 * 1000)
        return !moment().startOf('day').isAfter(previousDate, 'day')
    }

    closePopUp = () => {
        this.setState({ showPayDayModal: false });
    };

    getPayDayModal() {
        if (!this.state.showPayDayModal || !cookie.load(Constants.COOKIES.OFFICE_ACCESS_TOKEN)) {
            return <div />
        } else {
            if (this.isPopUpShownToday()) {
                return <div />
            }
            return <PayDayModalContainer
                showModal={true}
                tableType={this.getDateDifference() ? 'weekly' : 'daily'}
                closePopUp={this.closePopUp}
            />
        }
    }

    render() {
        return (
            <div className="main-page_wrapper">
                {this.props.userRole === 'Customer' ?
                    <CustomerHome />
                    :
                    <div>
                        {this.getPayDayModal()}
                        <TeamHeaderNew isClickable />
                        <HomePageTables updateAppState={this.props.updateAppState} />
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps() {
    const user = UserModel.last().props;
    return {
        userRole: user.role.name || '',
        payDayFormDate: user.payDayFormDate
    }
}

export default connect(mapStateToProps)(Home)

Home.propTypes = {
    location: PropTypes.object,
    socket: PropTypes.object
};
