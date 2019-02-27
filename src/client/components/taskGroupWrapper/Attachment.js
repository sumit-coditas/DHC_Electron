import React from 'react';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import find from 'lodash/find';

import Dropzone from 'react-dropzone';
import { Progress } from 'semantic-ui-react';

import Constant from './../helpers/Constant.js';

import TaskAction from './../../actions/TaskAction.js';
import AppAction from './../../actions/AppAction.js';

export default class Attachment extends React.PureComponent {
    _toggleAddAttachment(attachmentId) {
        this.props.toggleAttachment(attachmentId);
    }

    _onDrop(file) {
        if (this.props.disableClick) {
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK.ATTACHMENTS.UPLOADING_IN_PROCESS, level: Constant.NOTIFICATION_LEVELS.ERROR });
        } else {
            TaskAction.disableAttachfiles();
            TaskAction.attachTaskFile(this.props.user, file, this.props.attachment, this.props.task);
        }
    }

    render() {
        let self = this;
        let styles = {
            allowUpload: {
                cursor: 'pointer'
            },
            restrictUpload: {
                cursor: 'no-drop'
            },
            highlightDropZone: {
                border: '1px solid #2ca62c',
                background: 'rgba(80, 217, 23, 0.27)'
            },
            highlightForRejectDropZone: {
                border: '1px solid #a62c2c',
                background: 'rgba(217, 22, 22, 0.27)'
            }
        };

        let taskAttachment = find(self.props.task.attachments, { attachmentId: self.props.attachment._id });
        let isAttachmentFileEmpty = isEmpty(taskAttachment && taskAttachment.files);
        let attachmentLinks = '';
        let editMode = taskAttachment && !isAttachmentFileEmpty ? self.props.addAttachment.editMode : true;
        let taskYear = new Date(self.props.task.createdAt).getFullYear().toString();
        let taskNumber = self.props.task.isBidding ? 'B' + taskYear.substr(2, 2) + '-' + self.props.task.taskNumber :
            taskYear.substr(2, 2) + '-' + self.props.task.taskNumber;
        let contractorName = self.props.task.contractor.company ? self.props.task.contractor.company.trim() : self.props.task.contractor.name;
        let basePath = contractorName + '/' + taskYear + '/' + self.props.task.city + ', ' + self.props.task.state + ' - ' + self.props.task.title + ' - ' +
            taskNumber + '/' + self.props.attachment.name;
        
        if (editMode) {
            attachmentLinks = (
                <Dropzone multiple={false}
                    activeStyle={styles.highlightDropZone}
                    rejectStyle={styles.highlightForRejectDropZone}
                    key={'attachment' + self.props.attachment._id}
                    style={self.props.disableClick ? styles.restrictUpload : styles.allowUpload}
                    className='attachment-drop-area w-inline-block'
                    onDrop={self._onDrop.bind(self)}
                    disableClick={self.props.disableClick}>
                    {self.props.addAttachment.progressStatus > 0 && self.props.addAttachment.progressStatus < 100 ?
                        <Progress indicating percent={self.props.addAttachment.progressStatus} size='tiny' /> :
                        <div>
                            <div className='download-icon fa'>
                                
                            </div>
                            <div>
                                Drag file here or click here to browse
                            </div>
                        </div>
                    }
                </Dropzone>
            );
        } else if (taskAttachment) {
            attachmentLinks = map(taskAttachment.files, (file, index) => {
                return (
                    <div key={'attachment_file_link' + index} className='attachment-link-wrapper'>
                        <div className='attachment-link'>
                            <form action='/api/ftp/file/download' method='post'>
                                <input type='hidden' name='fileName' value={file.name} />
                                <input type='hidden' name='filePath' value={basePath + '/' + file.name} />
                                <input type='submit' className='button-link' value={file.name} />
                            </form>
                        </div>
                        <a href='#' className='fa' onClick={self.props.deleteAttachedFile.bind(self, basePath + '/' + file.name, file._id, self.props.attachment._id)}></a>
                    </div>
                );
            });
        }

        return (
            <div className='attachment-folder w-inline-block'>
                <div>
                    <span>
                        <a href={Constant.FTP_HOST_LINK + basePath} target='_blank'> {self.props.attachment.name} </a>
                    </span>
                    {taskAttachment && !isAttachmentFileEmpty &&
                        <a className='fa add-new-tag' href='#' onClick={self._toggleAddAttachment.bind(self, self.props.attachment._id)}>
                            {self.props.addAttachment.editMode ? '' : ''}
                        </a>
                    }
                </div>
                {attachmentLinks}
            </div>
        );
    }
}

Attachment.propTypes = {
    attachment: React.PropTypes.object,
    user: React.PropTypes.object,
    task: React.PropTypes.object,
    toggleAttachment: React.PropTypes.func,
    editMode: React.PropTypes.bool,
    disableClick: React.PropTypes.bool
};
