import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';
import map from 'lodash/map'
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import CommentBox from './Commentbox';
import { CommentForm } from './CommentSubComponents';
import './comment.scss';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { addComment, updateComment, deleteComment } from '../../../utils/promises/TaskPromises';
import LoginStore from '../../../stores/LoginStore';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { showConfirmationModal } from '../../../utils/cofirmationModal';

class CommentWrapperImpl extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            newComment: ''
        };
    }

    async callDeletecomment(comment) {
        const { taskId } = this.props;
        try {
            const result = await deleteComment(taskId, comment.id)
            SelectedTaskDetailModel.deleteComment(taskId, result)
            return new Promise((resolve) => resolve())
        } catch (error) {
            return new Promise((resolve, reject) => reject())
        }
    }

    handleDelete = (comment) => {
        const title = "Are you sure you want to delete below comment ?";
        const content = comment.comment;
        showConfirmationModal(title, content, () => this.callDeletecomment(comment));
    };

    handleEdit = (newValue, oldComment) => {
        const payload = {
            ...oldComment,
            date: new Date(),
            comment: newValue
        };
        const { taskId, user } = this.props;
        updateComment(taskId, payload)
            .then(result => SelectedTaskDetailModel.updateComment(taskId, result, user));
    };

    handlePostComment = (event, { formData }) => {
        event.preventDefault();
        const comment = this.state.newComment
        if (!comment.trim()) {   // form validation
            this.setState({ error: `Comment can't be empty` });
            return;
        }
        const { taskId, user } = this.props;
        const payload = {
            comment,
            date: new Date(),
            postedBy: user._id,
        };

        addComment(taskId, payload)
            .then(result => {
                this.setState({ newComment: '' }, () => SelectedTaskDetailModel.addComment(taskId, result, user));
            });
    };

    handleUserClick = (userId) => {
        hashHistory.push('/user-profile/' + userId);
    };

    handleCommentChange = (value, name) => {
        if (value && this.state.error) { this.setState({ error: null }); }
        this.setState({ [name]: value });
    }

    renderHeader = () => <div className='modal-content-wrap-top'>
        <div className='modal-section-title'>
            <span className='fa'>&#xf086;</span>
            <span className='modal-name-field'>
                Comments
        </span>
        </div>
    </div>;

    renderComments = () => this.props.comments.map((comment, index) => <CommentBox
        onUserClick={this.handleUserClick}
        key={index}
        onDelete={this.handleDelete}
        onEdit={this.handleEdit}
        user={this.props.user}
        comment={comment}
        index={index}
    />);

    renderCommentForm = () => <CommentForm
        newComment={this.state.newComment}
        onCommentChange={this.handleCommentChange}
        error={this.state.error}
        onSubmit={this.handlePostComment}
    />;

    render = () => <div className='attachment-row'>
        <div className="content-section">
            {this.renderHeader()}
            <Comment.Group>
                {this.renderComments()}
                {!this.props.unEditable && this.renderCommentForm()}
            </Comment.Group>
        </div>
    </div>;
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    return {
        comments: task.comments,
        taskId: task.id,
        user: LoginStore.getState().user
    };
}
export const CommentWrapper = connect(mapStateToProps)(CommentWrapperImpl);
