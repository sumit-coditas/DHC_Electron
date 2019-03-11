import React from 'react';
import isEqual from 'react-fast-compare';
import { Comment, TextArea, Form, Button, Message } from 'semantic-ui-react';
import moment from 'moment';


export class CommentDisplayEditBox extends React.PureComponent {
    shouldComponentUpdate(nextProps, nextState) {
        return isEqual(nextProps, this.props) || isEqual(nextState, this.state);
    }

    render() {
        const props = this.props;
        return (<Comment.Text>
            {props.showEdit && <CommentForm {...props} showEdit comment={props.comment} /> || props.comment.comment}
        </Comment.Text>);
    }
}

export class CommentForm extends React.PureComponent {
    shouldComponentUpdate(nextProps, nextState) {
        return isEqual(nextProps, this.props) || isEqual(nextState, this.state);
    }

    handleCommentChange = (e) => {
        this.props.onCommentChange(e.target.value, 'newComment')
    }

    renderError = () => <Message negative>
        <Message.Header>
            {this.props.error}
        </Message.Header>
    </Message>;

    render() {
        const props = this.props;
        const textField = !props.comment && <TextArea onChange={this.handleCommentChange} value={props.newComment} name='comment' placeholder='Write a comment' autoHeight />
            || <TextArea defaultValue={props.comment && props.comment.comment || ''} name='comment' placeholder='Write a comment' autoHeight />
        return (
            <Form onSubmit={props.onSubmit}>
                <Form.Field>
                    {props.error && this.renderError()}
                    {textField}
                </Form.Field>
                <div className='text-align-right'>
                    <Button primary type='submit'>{props.showEdit && 'Update' || 'Post'}</Button>
                    <Button secondary type='reset' onClick={props.onCancel}>Cancel</Button>
                </div>
            </Form>
        );
    }
}

export class CommentActions extends React.PureComponent {
    shouldComponentUpdate(nextProps, nextState) {
        return isEqual(nextProps, this.props) || isEqual(nextState, this.state);
    }
    render() {
        const props = this.props;
        return (
            props.user.id === props.comment.postedBy.id && <Comment.Actions>
                <Comment.Action onClick={props.toggleEdit}>Edit</Comment.Action>
                <Comment.Action onClick={props.onDeleteComment}>Delete</Comment.Action>
            </Comment.Actions>
        );
    }
}

export function getFormattedDate(commentDate) {
    let duration = moment.duration(moment(new Date()).diff(moment(commentDate)));
    let commentedAt;
    if (duration.asDays() < 1) {
        if (parseInt(duration.asMinutes()) === 0) {
            commentedAt = 'just now';
        } else if (parseInt(duration.asHours()) === 0) {
            commentedAt = parseInt(duration.asMinutes()) + ' minutes ago';
        } else {
            commentedAt = parseInt(duration.asHours()) + ' hours ago';
        }
    } else if (duration.asDays() < 2) {
        commentedAt = 'yesterday';
    } else {
        commentedAt = moment(commentDate).format('M/D/YY');
    }
    return commentedAt;
}
