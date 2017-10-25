import React, { Component } from 'react';
import { connect } from 'react-redux';
import './dashboard.css';
import NewMenu from '../new-menu/new-menu';
import axios from 'axios';
import Table2 from '../analytics/table2';
import FirstTimeUser from '../first-time-user/FirstTimeUser'
import { addProjectUniqueKey, editUserFirstname, editUserLastname, getUserInfo, getCompanyInfo, getCompanyTeamInfo, getCompanyUsersInfo, getUserInfoAfter, getUserTasks } from '../../redux/reducers/main-reducer'
import { Link } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import AnalyticsIcon from './images/analytics.svg';
import CompanyIcon from './images/company.svg';
import ProjectIcon from './images/project.svg';
import TeamsIcon from './images/teams.svg';
import UserIcon from './images/user.svg';
import Calendar from 'react-calendar'
import UnstyledCalendar from 'react-calendar/build/entry.nostyle';
import _ from 'underscore-node';


let styles = {

    icon: {
        position: 'absolute',
        left: 0,
        top: 5,
        transform: 'translateX(-13.5vw)'
    }
}

class Dashboard extends Component {
    constructor() {
        super()

        this.state = {
            newMenu: false,
            missingEmployeeInfo: false,
            money: 0,
            tasktotal: 0,
            moneypertask: ''
        }
    }

    displayNewMenu() {
        this.setState({
            newMenu: !this.state.newMenu
        })
    }


    componentDidMount() {
        this.props.getUserInfo().then(res => {
            console.log('PROPS', res)
            if (this.props.user_firstname === '' && this.props.user.user_firstname === null) {
                this.editUserName()
                // this.setState({
                //     missingEmployeeInfo: true
                // })
                // console.log('BOOM')
            }
        })
        this.getMoney();
        this.getTaskTotal();
        
    }

    getMoney() {
        axios.get(`/api/getMoney/byTask/${this.props.user.user_company}`).then(res => {
            let x = res.data[0].sum.substring(1,10).split(',').join('')
            this.setState({
                money: x
            })
            console.log ('MOneys', this.state.money);
        })
    }
    getTaskTotal() {
        axios.get(`/api/getTaskTotal/${this.props.user.user_id}`).then(res => {
            this.setState({
                tasktotal: res.data[0].count
            })
            console.log('tasks', this.state.tasktotal)
        })
    }
    divide(){
       let  x = Math.ceil(this.state.money/this.state.tasktotal);
       console.log("this is", x);
       this.setState({
           moneypertask: x
       })
    }

    addUsersName() {
        let data = Object.assign({}, {
            user_firstname: this.props.user_firstname,
            user_lastname: this.props.user_lastname,
            user_email: this.props.user.user_email,
            user_id: this.props.user.user_id,
        })
        axios.post('/api/edituser', data)
            .then(() => {
                this.props.getUserInfo().then(res => {
                    console.log(res)
                    this.props.getCompanyInfo(this.props.user.user_company).then(res => {
                        this.props.getCompanyUsersInfo(this.props.user.user_company)
                    }).then(() => {
                        this.props.getUserInfoAfter(this.props.user.user_id)
                    })
                })
            }).then(() => {
                this.setState({
                    missingEmployeeInfo: false
                })
            })
    }

    editUserName() {
        confirmAlert({
            title: 'Update Personal Information',
            message: (
                <div className='dashboard-input-name-container'>
                    <div className='dashboard-all-input-sections'>
                        <div className='dashboard-input-names-cont'>
                            <input className='dashboard-input-names' placeholder='First Name' onChange={(e) => { this.props.editUserFirstname(e.target.value) }} />
                        </div>
                        <div className='dashboard-input-names-cont'>
                            <input className='dashboard-input-names' placeholder='Last Name' onChange={(e) => { this.props.editUserLastname(e.target.value) }} />
                        </div>
                    </div>
                </div>),
            confirmLabel: 'Save',
            onConfirm: () => {
                let data = Object.assign({}, {
                    user_firstname: this.props.user_firstname,
                    user_lastname: this.props.user_lastname,
                    user_email: this.props.user.user_email,
                    user_id: this.props.user.user_id,
                })
                axios.post('/api/edituser', data)
                    .then(() => {
                        this.props.getUserInfo().then(res => {
                            console.log(res)
                            this.props.getCompanyInfo(this.props.user.user_company).then(res => {
                                this.props.getCompanyUsersInfo(this.props.user.user_company)
                            }).then(() => {
                                this.props.getUserInfoAfter(this.props.user.user_id)
                            })
                        })
                    }).then(() => {
                        this.setState({
                            missingEmployeeInfo: false
                        })
                    })
            },
        })
    }


    markTaskAsCompleted( taskId, taskNumber, taskKey ) {
        console.log( 'button hit' )

        taskNumber++

        axios.put( `/api/completeTask/${taskId}/${taskNumber}/${taskKey}` )
            .then( () => this.props.getUserTasks( this.props.user.user_id ) )
    }




    render() {
        console.log(this.props)
        let sortedTasks = _.sortBy( this.props.user_tasks, sorted => sorted )

        let taskMapper = this.props.user_tasks.map((task, i) => {
            return (
                task.task_show && !task.task_completed ?
                    <section className='dash-task' key={i} >
                        <div className='dash-task-title' >
                            {task.task_name}
                        </div>
                        <div className='dash-task-details' >
                            <div>{task.task_start_date}</div>
                            <div>{task.task_finished_date}</div>
                            <div>{task.task_description}</div>
                            <div>{task.task_link}</div>
                            <div className='dash-check' onClick={() => this.markTaskAsCompleted(task.task_id * 1, task.task_number, task.task_unique_key)} >&#10003;</div>
                        </div>
                    </section>
                    : null
            )
        })

        return (

            (
                <div className="dashboard-view">
                    <div className="button-span">
                        {/* <div className='dashboard-main-title'>Dashboard</div> */}
                        <button className='dashboard_new_items_buttons' onClick={() => { this.displayNewMenu() }}>+ New</button>
                    </div>
                    {this.state.newMenu === true ?
                        <div className='dashboard_new_menu_container'>
                            <a href='/#/create-project'>
                                <div className='dashboard_menu_item_selection' onClick={() => { this.props.addProjectUniqueKey(this.props.company[0].company_name, this.props.user.user_id) }}>Project</div></a>


                            <div className='dashboard_menu_item_selection'>Team</div>
                            <div className='dashboard_menu_item_selection'>User</div>
                        </div>
                        : null}
                    <div className="content-wrapper">
                        <div className='dashboard-side-nav-body'>
                            <div className='dashboard-sidenav-title'>Home</div>
                            <div className='dashboard-sidenav-title-divider'></div>
                            <div className='dashboard-sidenav-links-all'>
                            <a href='/#/display-users' className='dashboard-side-nav-selections-cont'>
                                <img src={UserIcon} className='dashboard-icon-sidenav'/>
                                <div className='dashboard-text-sidenav'>Users</div>
                            </a>

                            <a href='/#/display-teams' className='dashboard-side-nav-selections-cont'>
                                <img src={TeamsIcon} className='dashboard-icon-sidenav'/>
                                <div className='dashboard-text-sidenav'>Teams</div>
                            </a>

                            <a href='#' className='dashboard-side-nav-selections-cont'>
                                <img src={CompanyIcon} className='dashboard-icon-sidenav'/>
                                <div className='dashboard-text-sidenav'>Company</div>
                            </a>

                            <a href='/#/display-projects' className='dashboard-side-nav-selections-cont'>
                                <img src={ProjectIcon} className='dashboard-icon-sidenav'/>
                                <div className='dashboard-text-sidenav'>Projects</div>
                            </a>

                            <a href='/#/analytics' className='dashboard-side-nav-selections-cont'>
                                <img src={AnalyticsIcon} className='dashboard-icon-sidenav'/>
                                <div className='dashboard-text-sidenav'>Analytics</div>
                            </a>

                            </div>

                        </div>
                        <div className="task-list">
                            <div className='dashboard-titles'>Tasks</div>
                            <div className='dashboard-task-container'>
                                <div className='dashboard-tasks' >
                                    {taskMapper}
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    <div className='dashnoard-second-section-layout'>
                        <UnstyledCalendar className='dashboard-calendar' />
                        <div className='dashboard-second-section-cont2'>Tasks Due Today:</div>
                        <div className='dashboard-second-section-cont1'>Money Made per Task:
                            <div className="number">$ {this.state.moneypertask}</div>
                            <div className='money'><button className="calculator" onClick={() => this.divide()}>Calculate</button></div>
                        
                        </div>

                    </div>



{/* 
                    <div className="current-stats-wrapper">
                        <div className='dashboard-titles'>Analytics</div>
                        <div>
                            <Table2 />
                        </div>
                    </div> */}
                    <div >
                        <Link className="chat" to="/chat">Chat</Link>
                    </div>
                </div>
            )

        )
    }
}
function mapStateToProps(state) {
    return state
}

export default connect(mapStateToProps, { addProjectUniqueKey, editUserFirstname, editUserLastname, getCompanyInfo, getCompanyTeamInfo, getUserInfo, getCompanyUsersInfo, getUserInfoAfter, getUserTasks })(Dashboard)
