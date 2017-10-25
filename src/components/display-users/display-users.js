import React, { Component } from 'react';
import './display-users.css';
// import RaisedButton from 'material-ui/RaisedButton';
import { getUserInfo, getCompanyInfo, getCompanyUsersInfo } from '../../redux/reducers/main-reducer';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import 'semantic-ui-css/semantic.min.css'
import { Button, Icon } from 'semantic-ui-react'
// let style = {
//     margin: 12,
// };

class DisplayUsers extends Component {


    deleteUser(id) {
        confirmAlert({
            title: 'Delete User',
            message: 'Are you sure you want to do this.',
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            onConfirm: () => {
                axios.delete(`/api/delete/user/${id}`)
                    .then(() => {
                        this.props.getUserInfo().then(res => {
                            this.props.getCompanyInfo(this.props.user.user_company).then(res => {
                                this.props.getCompanyUsersInfo(this.props.user.user_company)
                            })
                        })
                    })
            },    // Action after Confirm
            onCancel: () => null,
        })
    }

    editUser(first, last, email, id) {

        let data = {
            user_firstname: first,
            user_lastname: last,
            user_email: email,
            user_id: id
        }
        function firstNameFunction(e) {
            console.log(e.target.value)
            data.user_firstname = e.target.value
        }
        function lastNameFunction(e) {
            console.log(e.target.value)
            data.user_lastname = e.target.value
        }
        function emailFunction(e) {
            console.log(e.target.value)
            data.user_email = e.target.value
        }
        confirmAlert({
            title: 'Edit User',
            message: (
                <div className='dashboard-input-name-container'>
                    <div className='dashboard-all-input-sections'>
                        <div className='dashboard-input-names-cont'>
                            <input maxLength={30} className='dashboard-input-names' defaultValue={first} onChange={(e) => { firstNameFunction(e) }} required />
                        </div>
                        <div className='dashboard-input-names-cont'>
                            <input className='dashboard-input-names' defaultValue={last} onChange={(e) => { lastNameFunction(e) }} required />
                        </div>
                        <div className='dashboard-input-names-cont'>
                            <input className='dashboard-input-names' defaultValue={email} onChange={(e) => { emailFunction(e) }} required />
                        </div>
                    </div>
                </div>),
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            onConfirm: () => {
                var post = Object.assign({}, {
                    user_firstname: data.user_firstname && data.user_firstname,
                    user_lastname: data.user_lastname && data.user_lastname,
                    user_email: data.user_email && data.user_email,
                    user_id: data.user_id
                })
                axios.post('/api/edituser', post)
                    .then(() => {
                        this.props.getUserInfo().then(res => {
                            this.props.getCompanyInfo(this.props.user.user_company).then(res => {
                                this.props.getCompanyUsersInfo(this.props.user.user_company)
                            })
                        })
                    })
            },

            onCancel: () => null,
        })

    }


    getTeamName(id) {
        // console.log('id', id)
        // console.log("COMPANY PROPS", this.props.company_team[0].team_id)
        var teamId = this.props.company_team
        for (let i = 0; i < teamId.length; i++) {
            if (teamId[i].team_id === id) {
                return teamId[i].team_name
            }
        }
    }


    render() {
        let userInfo = this.props.company_users.map((e, i) => {
            return (
                <div key={i} className="display-users-user-container">
                    <div className="display-users-name-email" >
                        <div className="display-users-name">
                            {e.user_firstname} {e.user_lastname}
                        </div>
                        <div className="display-users-email">
                            <Button href={`mailto:${e.user_email}`} circular icon='mail outline' className="users-email-button" /> <span className="users-email-span">{e.user_email}</span>
                        </div>
                    </div>
                    <div className="users-team-name">
                        {this.getTeamName(e.user_team)}
                    </div>
                    <div className="users-buttons-div">
                        <Button onClick={() => this.editUser(e.user_firstname, e.user_lastname, e.user_email, e.user_id)} size="big" className="team-settings-button">
                            <Icon name='setting' />
                        </Button>
                        <Button onClick={() => this.deleteUser(e.user_id)} size="big" className="team-delete-button">
                            <Icon name='trash' />
                        </Button>
                    </div>

                </div>
            )
        })



        return (
            <div className="display-users-container">

                <div className="charts-container">
                    <div className="charts-main">
                        <div className="charts-left-navbar">
                            <span className="display-users-navbar-title">Users</span>
                            <span><Link to="/create-user">Create User</Link></span>
                            <span><Link to="/dashboard">Tasks</Link></span>
                            {/* <span><Link to="/there-is-no-productivity-here-gandalf-stormcrow">Productivity</Link></span> */}
                        </div>

                        <div className="users-table-container">
                            <div className="users-top-table">
                                <div className="users-top-table-text">
                                    <span className="display-users-name-header">Name</span>
                                    <span>Team</span>
                                </div>
                            </div>
                            {userInfo}
                        </div>
                        {/* <div className="table-container">
                        <Table2 />
                        </div> */}
                        <div className="charts-right-navbar">
                            <span className="right-navbar-title">Stay Updated</span>
                            <span>Setup Alerts to stay up to date.</span>
                            <button className="alert-button">Get Alerts</button>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return state;
}

export default connect(mapStateToProps, { getUserInfo, getCompanyInfo, getCompanyUsersInfo })(DisplayUsers)
