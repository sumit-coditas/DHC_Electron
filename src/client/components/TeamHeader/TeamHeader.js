import './styles/teamHeaderStyle.scss';

import { Collapse, Icon, Modal, Form, Button} from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { AddIcon, RemoveIcon } from '../../baseComponents/button';

import dhcLogo from '../../assets//images/dhc_logo.png';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { RoleModel } from '../../model/AppModels/RoleModel';
import { WorkloadModel } from '../../model/AppModels/WorkloadModel';
import { UserModel } from '../../model/UserModel';
import UserAvatar from '../userAvatar/UserAvatar';
import { TeamRoleGroup } from './TeamRoleGroup';
import { HourTrackerModel } from '../../model/AppModels/HourTrackerModel';
import { getTodaysLoggedHoursOfUser } from '../../utils/promises/UserPromises';
import moment from 'moment';
import { SelectedUserModel } from '../../model/TaskModels/SelectedUserModel';
import { PLPCollapse } from '../../baseComponents/PLPCollapse';
import { PLPCollapsePanel } from '../../baseComponents/PLPCollapsePanel';
const { ipcRenderer } = require('electron');

const FormItem = Form.Item;
class TeamHeaderImpl extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            folderPath: '',
            folderList: JSON.parse(localStorage.getItem('folderList')) || [],
            visible: false,
            addFolder: false,
            groupType: 'role',
            filters: {
                locationDutation: true,
                dailyAvailability: true,
                urgentHours: true,
                nonUrgentHours: true
            }
        }
    }

    componentWillUnmount() {
        SelectedUserModel.deleteAll();
    }

    filtersList = [
        {
            title: ' Location / Duration',
            type: 'locationDutation'
        },
        {
            title: 'Daily Availability',
            type: 'dailyAvailability'
        },
        {
            title: 'Urgent Hours',
            type: 'urgentHours'
        },
        {
            title: 'Non - urgent Hours',
            type: 'nonUrgentHours'
        },
    ];

    updateFilter = (e) => {
        // e.stopPropagation();
        console.log(e.target.id);
        const { id } = e.target;
        this.setState({ filters: { ...this.state.filters, [id]: !this.state.filters[id] } }, () => console.log(this.state));
    }

    openModalToAddolder = (e) => {
        e.preventDefault();
        this.setState({
            visible: true,
          });
    }

    handleCancel = (e) => {
        this.setState({
          visible: false,
          addFolder: false,
        });
      }


    openFinder = (data) => {
        ipcRenderer.send('Open default directory', data.folderPath);
    }  

    handleChange = (e) => {
        if (e.target.name === 'folderPath') {
            this.setState({[e.target.name]: e.target.files[0].path});
        } else {
            this.setState({[e.target.name]: e.target.value});
        }
    }

    handleSubmit = () => {
        if (this.state.folderPath.trim() == '' || this.state.title.trim() == '') {
            return 
        }
        const folderList = [...this.state.folderList, {title: this.state.title, folderPath: this.state.folderPath}];
        this.setState({addFolder: false,
            folderList,
            folderPath: '',
            title: '',
            addFolder: false
          })
          localStorage.setItem('folderList',JSON.stringify(folderList) );
    }

    addNewFolder = () => {
        this.setState({addFolder: true})
    }  
    
    removeSelectedFolder = (index) => {
        const folderList = this.state.folderList.filter((_, i) => i !== index);
        console.log(folderList);
        this.setState({
            folderList: folderList
          });
          localStorage.setItem('folderList', JSON.stringify(folderList));
    }  

    renderFilters = () => <div className='filter-container'>
        {
            this.filtersList.map(item =>
                <div key={item.type} id={item.type} onClick={this.updateFilter} className={this.state.filters[item.type] ? '' : 'deselect'}>
                    {item.title}
                </div>
            )
        }
    </div>;

    addFolder = () => {
    return  <AddIcon style={{ marginLeft: 5}} className="color-primary icon-large"
            onClick={(e) => this.addNewFolder()} />
    }
    
    removeFolder = (key) => {
    return  <RemoveIcon style={{ marginLeft: 5 }} className="color-primary icon-large"
            onClick={(e) => this.removeSelectedFolder(key)} />
    }
        

    renderGroups = () => {
        const { roles, workLoads, loggedInUser } = this.props;
        return roles.map(role => <TeamRoleGroup
            key={role.id}
            workLoads={workLoads}
            role={role}
            loggedInUserId={loggedInUser._id}
            filters={this.state.filters}
            clickable={this.props.isClickable}
        />)
    }

    renderHeader = () => <div className='header'>
        <div className='title'>{'Team Status'}</div>
        <img src={dhcLogo} alt='DHC' />
        <Icon type="folder" onClick={this.openModalToAddolder} />
        <div onClick={(e) => e.stopPropagation()}>
            <UserAvatar
                className='user-avatar'
                loggedHours={this.props.loggedInUser.todaysHours}
                urgentHours={this.props.loggedInUser.urgentHours}
                nonUrgentHours={this.props.loggedInUser.nonUrgentHours}
            />
        </div>
        <div>
            <Modal
                title="Add Folders of your choice"
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={null}
                style={{paddingBottom: '20px'}}
                >
                <div className="margin-bottom10 text-align-right" >
                    {!this.state.addFolder && this.addFolder()}
                </div>
                <div className="clear"></div>
                {this.state.addFolder &&   
                        <form>
                            <div>
                                <label className="">Title</label>
                                <input type="text" className="ant-input" name="title" value={this.state.title} onChange={this.handleChange} placeholder="Add title" />
                                <label className="">Folder Path</label>
                                <input type="file" className="folder-file-select" value={this.state.folderPath} onChange={this.handleChange} name="folderPath" /> 
                                <Button type="primary" onClick={this.handleSubmit} className="login-form-button margin-top-10">Add Folder</Button>
                            </div>
                        </form>
                }
                { !this.state.addFolder && this.state.folderList.map((item, key) =>
                        <li className="folder-list">
                            <div>
                                <a onClick={() => this.openFinder(item)} key={key}>{item.title}</a>
                                <span>{item.folderPath}</span>
                            </div>
                            {item.folderPath && this.removeFolder(key)}
                        </li>                    
                )}
            </Modal>
        </div>

    </div>

    render = () => {
        return <PLPCollapse
            defaultActiveKey={['1']}
            className='team-header-container'
        >
            <PLPCollapsePanel
                header={this.renderHeader()}
                key="1"
                className='header-content-container'
            >
                {this.renderFilters()}
                <div className='team-group-container'>
                    {this.renderGroups()}
                </div>
            </PLPCollapsePanel>
        </PLPCollapse>
    }
}

function mapStateToProps() {
    const roles = RoleModel.list().map(item => item.props).filter(item => item.name !== 'Customer');
    const workLoads = WorkloadModel.list().map(item => item.props);
    const {todaysHours,urgentHours,nonUrgentHours, _id, id} = UserModel.last().props;

    return {
        roles,
        workLoads,
        loggedInUser: {todaysHours,urgentHours,nonUrgentHours, _id, id},
    }
}

export const TeamHeaderNew = connect(mapStateToProps)(TeamHeaderImpl);
