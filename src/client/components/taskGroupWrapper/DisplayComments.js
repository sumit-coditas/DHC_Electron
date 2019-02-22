import React from 'react';
import { Comment, TextArea, Form, Button, Message } from 'semantic-ui-react';

import moment from 'moment';
import indexOf from 'lodash/indexOf';
import map from 'lodash/map';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import user from '../../assets/images/user.jpg';

import { hashHistory } from 'react-router';

import Constant from './../helpers/Constant.js';

import TaskAction from './../../actions/TaskAction.js';

export default class DisplayComments extends React.Component {
    shouldComponentUpdate(nextProps) {
        return !isEqual(this.props, nextProps);
    }

    _editComment(comment) {
        this.props.editComment(comment);
    }

    _submitComment(event, { formData }) {
        event.preventDefault();
        let self = this;
        let task = cloneDeep(self.props.task);
        let editedComment = cloneDeep(self.props.editedComment);
        editedComment.isEdited = true;
        editedComment.comment = formData.comment;
        editedComment.date = new Date();
        editedComment.postedBy = self.props.user._id;
        let updateTask = {
            comments: task.comments,
            id: task.id
        };

        let index = indexOf(updateTask.comments, find(updateTask.comments, { id: editedComment.id }));
        updateTask.comments.splice(index, 1, editedComment);
        if (!formData.comment) {
            TaskAction.setError({ errorMsg: 'Please add comment', type: 'editComment' });
        } else if (!formData.comment.trim() === '') {
            TaskAction.setError({ errorMsg: 'Please add comment', type: 'editComment' });
        } else {
            TaskAction.updateTask(updateTask, Constant.NOTIFICATION_MESSAGES.TASK_COMMENT.UPDATE_SUCCESS);
            TaskAction.addLoader('editComment');
        }
    }

    _closeEditComment() {
        TaskAction.resetData();
    }

    _deleteComment(comment) {
        TaskAction.setDeleteMode({ isDelete: true, itemName: 'Comment', item: comment });
    }

    _goToUserProfile(userId) {
        hashHistory.push('/user-profile/' + userId);
    }

    render() {
        let self = this;
        let comments = map(self.props.task.comments, (comment, index) => {
            let duration = moment.duration(moment(new Date()).diff(moment(comment.date)));
            let commentDate;
            if (duration.asDays() < 1) {
                if (parseInt(duration.asMinutes()) === 0) {
                    commentDate = 'just now';
                } else if (parseInt(duration.asHours()) === 0) {
                    commentDate = parseInt(duration.asMinutes()) + ' minutes ago';
                } else {
                    commentDate = parseInt(duration.asHours()) + ' hours ago';
                }
            } else if (duration.asDays() < 2) {
                commentDate = 'yesterday';
            } else {
                commentDate = moment(comment.date).format('M/D/YY');
            }
            return (
                <Comment key={'comment' + index}>
                    <Comment.Avatar src={comment.postedBy.picture
                        ? comment.postedBy.picture
                        : user} />
                    <Comment.Content>
                        <Comment.Author as='a' onClick={self._goToUserProfile.bind(self, comment.postedBy.id)}>{comment.postedBy.firstName + ' ' + comment.postedBy.lastName}</Comment.Author>
                        <Comment.Metadata>
                            {comment.isEdited
                                ? 'Edited:' + ' '
                                : 'Posted:' + ' '}
                            {commentDate}
                        </Comment.Metadata>
                        <Comment.Text>
                            {self.props.editedComment && self.props.editedComment.id === comment.id
                                ? <Form onSubmit={self._submitComment.bind(self)} loading={self.props.isLoading && self.props.editedComment.id}>
                                    <Form.Field>
                                        {self.props.error && <Message negative>
                                            <Message.Header>
                                                {self.props.error}
                                            </Message.Header>
                                        </Message>}
                                        <TextArea name='comment' placeholder='Write a comment' defaultValue={self.props.editedComment.comment} autoHeight />
                                    </Form.Field>
                                    <div className='text-align-right'>
                                        <Button primary type='submit'>Post</Button>
                                        <Button secondary onClick={self._closeEditComment.bind(self)}>Cancel</Button>
                                    </div>
                                </Form>
                                : comment.comment
                            }
                        </Comment.Text>
                        {self.props.user.id === comment.postedBy.id && <Comment.Actions>
                            <Comment.Action onClick={self._editComment.bind(self, comment)}>Edit</Comment.Action>
                            <Comment.Action onClick={self._deleteComment.bind(self, comment)}>Delete</Comment.Action>
                        </Comment.Actions>
                        }
                    </Comment.Content>
                </Comment>
            );
        });

        return (
            <div className='attachment-row'>
                <Comment.Group>
                    <div className='modal-content-wrap-top'>
                        <div className='modal-section-title'>
                            <span className='fa'>&#xf086;</span>
                            <span className='modal-name-field'>
                                Comments
                            </span>
                        </div>
                    </div>
                    {comments}
                </Comment.Group>
            </div>
        );
    }
}
