import React, { PropTypes } from 'react';
import { TextArea, Form, Button, Popup, Message } from 'semantic-ui-react';
import cloneDeep from 'lodash/cloneDeep';
import shortid from 'shortid';

import Picture from './../widgets/Picture.js';
import Constant from './../helpers/Constant.js';
import { compareData } from './../helpers/Utility.js';

import TaskAction from './../../actions/TaskAction.js';

export default class AddComment extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        const shouldRender = compareData(this.props, nextProps,
            [
                'commentText',
                'error',
                'isLoading',
                'user'
            ]);
        return shouldRender;
    }

    _addComment(event, { formData }) {
        event.preventDefault();
        let self = this;
        let task = cloneDeep(self.props.task);
        formData.date = new Date();
        formData.postedBy = self.props.user._id;
        formData.id = shortid.generate() + shortid.generate();
        let updateTask = {
            comments: task.comments,
            id: task.id
        };

        if (!formData.comment) {
            TaskAction.setError({ errorMsg: 'Please add comment', type: 'comment' });
        } else if (formData.comment.trim() === '') {
            TaskAction.setError({ errorMsg: 'Please add comment', type: 'comment' });
        } else {
            formData.comment = formData.comment.trim();
            updateTask.comments.push(formData);
            TaskAction.addLoader('addComment');
            TaskAction.updateTask(updateTask, Constant.NOTIFICATION_MESSAGES.TASK_COMMENT.ADD_SUCCESS);
        }
    }

    _changeCommentText(event) {
        TaskAction.changeCommentText(event.target.value);
    }

    render() {
        let self = this;
        return (
            <div className='modal-message-wrap w-clearfix'>
                <div className='team-role-pic'>
                    <Popup trigger={<Picture href='#' src={self.props.user.picture} />} content={self.props.user.firstName + ' ' + self.props.user.lastName} />
                </div>
                <div className='message-title modal-section-title'>Add Comment</div>
                <div className='message-field'>
                    <Form loading={self.props.isLoading} onSubmit={self._addComment.bind(self)}>
                        {self.props.error && <Message negative>
                            <Message.Header>
                                {self.props.error}
                            </Message.Header>
                        </Message>}
                        <Form.Field>
                            <TextArea name='comment' defaultValue='' key={'user-comment' + self.props.task.comments} placeholder='Write a comment' autoHeight />
                        </Form.Field>
                        <div className='text-align-right'>
                            <Button primary type='submit'>Post</Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}

AddComment.propTypes = {
    commentText: PropTypes.string,
    error: PropTypes.string,
    isLoading: PropTypes.bool.isRequired
};
