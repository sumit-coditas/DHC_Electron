import React from 'react';
import { Comment, TextArea, Form, Button, Message } from 'semantic-ui-react';
import isEqual from 'lodash/isEqual';
import user from '../../../assets/images/user.jpg';
import { CommentActions, getFormattedDate, CommentDisplayEditBox, CommentForm } from './CommentSubComponents';


class Commentbox extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showEdit: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
    }

    handleToggleEdit = () => {
        this.setState({ showEdit: !this.state.showEdit });
    };

    handleUpdateComment = (event, { formData }) => {
        event.preventDefault();
        const { onEdit, comment } = this.props;
        const newComment = formData.comment;
        onEdit(newComment, comment);
        this.handleToggleEdit();
    };

    handleDelete = (e) => {
        const { onDelete, comment } = this.props;
        onDelete(comment)
    };

    render() {
        const { comment, onUserClick } = this.props;
        return (
            <Comment key={comment.id}>
                <Comment.Avatar src={comment.postedBy.picture ? comment.postedBy.picture : user} />
                <Comment.Content>
                    <Comment.Author as='a' onClick={() => onUserClick(comment.postedBy.id)}>{comment.postedBy.firstName + ' ' + comment.postedBy.lastName}</Comment.Author>
                    <Comment.Metadata>
                        {comment.isEdited ? 'Edited:' + ' ' : 'Posted:' + ' '}
                        {getFormattedDate(comment.date)}
                    </Comment.Metadata>
                    <CommentDisplayEditBox
                        comment={comment}
                        onCancel={this.handleToggleEdit}
                        showEdit={this.state.showEdit}
                        onSubmit={this.handleUpdateComment} />
                    <CommentActions {...this.props} onDeleteComment={this.handleDelete} toggleEdit={this.handleToggleEdit} />
                </Comment.Content>
            </Comment>
        );
    }
}


export default Commentbox;
