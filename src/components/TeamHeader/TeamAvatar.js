import React from 'react';
import moment from 'moment'
import UserAvatar from '../userAvatar/UserAvatar';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import user from '../../assets/images/user.jpg';
import { connect } from 'react-redux';
import './styles/teamAvatarStyle.scss';
import Location from '../configuration/Location';
import { Icon } from 'semantic-ui-react';
import { getUserScopesByGroup } from '../../utils/promises/UserPromises';
import { ScopeModel } from '../../model/CustomerHomeModels/ScopeModel';
import { SelectedUserModel } from '../../model/TaskModels/SelectedUserModel';
import { getGroupTypes } from '../../utils/common';
import Constants from '../helpers/Constant';
import { UserModel } from '../../model/UserModel';
import { UtilModel } from '../../model/AppModels/UtilModel';
import { getDefaultDateRangeForGroups } from '../../utils/DateUtils';

class TeamAvatarImpl extends PLPPureComponent {

    renderBottomBar = (user) => {
        const { availability, firstName, lastName, locationInfo } = user;
        const { filters: { locationDutation, dailyAvailability } } = this.props;
        return <div className='bottom-wrap'>
            {
                locationInfo && locationDutation && <div>
                    <Icon className='transition'
                        color={locationInfo.location.iconColor}
                        name={locationInfo.location.icon === 'mobile' ? 'tablet' : locationInfo.location.icon}
                    />
                    : {locationInfo.extension || '-'}
                </div> || null
            }
            {
                dailyAvailability && availability && <div style={availability.startsWith('F') || availability.startsWith('f') ? { backgroundColor: '#8cc341', color: '#000' } : {}}>
                    {availability}
                </div> || null
            }
        </div>
    }

    checkPermissionToViewScopes = () => {
        if (this.props.loggedInUserRole.id === Constants.ROLE_ID.MANAGER && this.props.loggedInUserRoleLevel.name === 'President') return true;
        return this.props.permissionToViewScopes && this.props.permissionToViewScopes.includes(this.props.employee.role.name);
    }

    getUsersScopes = () => {
        if (this.props.clickable && this.checkPermissionToViewScopes()) {
            // UtilModel.updateLoaderValue(true);
            SelectedUserModel.deleteAll();
            // ScopeModel.deleteAll();
            new SelectedUserModel(this.props.employee).$save();
            // Promise.all(getGroupTypes().map(item => {
            //     let defaultRange = getDefaultDateRangeForGroups();
            //     if (item.title === 'Bids') {
            //         defaultRange = getDefaultDateRangeForGroups(0)
            //     }
            //     const startYear = moment(defaultRange[0]).year();
            //     const endYear = moment(defaultRange[1]).year();
            //     return getUserScopesByGroup(this.props.employee._id, item.id, startYear, endYear)
            // }))
            //     .then(response => {
            //         const scopes = response.map(res => res.data);
            //         ScopeModel.saveAll(scopes.reduce((scopeList, scope) => [...scopeList, ...scope]).map(scope => new ScopeModel(scope)));
                    UtilModel.updateManualSort(true);
            //         UtilModel.updateLoaderValue(false)
            //     })
            //     .catch(e => {
            //         console.error(e);
            //         UtilModel.updateLoaderValue(false)
            //     })
        }
    }

    renderHours = (user) => {
        const { filters: { urgentHours, nonUrgentHours } } = this.props;
        return <div className='hours-wrap'>
            {urgentHours && <div className='urgent-hours'> {user.urgentHours} </div>}
            {nonUrgentHours && <div> {user.nonUrgentHours} </div>}
        </div>
    }

    render = () => {
        const { employee, isSelectedUser } = this.props;
        let selectedUserClassName = isSelectedUser ? 'selected' : '';
        let imgContainerstyle = '';
        let locationName = '';
        if (employee.locationInfo) {
            locationName = employee.locationInfo.location.name;
        }
        if (locationName.match(/^(Lunch|Meeting|Off)$/) || !employee.isOnline) {
            imgContainerstyle = 'img-grayscaled';
        }
        return <div className='team-avatar-container' onClick={this.getUsersScopes}>
            <div className={selectedUserClassName}>
                <div className={imgContainerstyle}>
                    <img src={employee.picture || user} />
                    {/* <img src={'https://dhc-pictures.s3.amazonaws.com/SkX8vHnZz.png'} /> */}
                </div>
                <div className="overlay">
                    <div className="name"> {`${employee.firstName} ${employee.lastName}`}</div>
                </div>
                {this.renderHours(employee)}
                {this.renderBottomBar(employee)}
            </div>
        </div>
    }
}

function mapStateToProps(state, ownProps) {
    const user = SelectedUserModel.last();
    const loggedInUser = UserModel.last().props;
    return {
        isSelectedUser: user && user.props._id === ownProps.employee._id || false,
        employee: ownProps.employee,
        filters: ownProps.filters,
        loggedInUserRole: loggedInUser.role,
        loggedInUserRoleLevel: loggedInUser.roleLevel,
        permissionToViewScopes: loggedInUser.scopeVisibilityPermission
    }
}

export const TeamAvatar = connect(mapStateToProps)(TeamAvatarImpl);
