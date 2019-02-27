import React from 'react';
import { connect } from 'react-redux';
import { Creatable } from 'react-select'
import isEqual from 'react-fast-compare';

import VirtualSelect from '../../../baseComponents/VirtualSelect';
import AppStore from '../../../stores/AppStore';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { updateTaskTags, addNewTag } from '../../../utils/promises/TaskPromises';
import { TagModel } from '../../../model/AppModels/TagModel';
import { PLPPureComponent } from '../../../baseComponents/importer';

class TagContainer extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedTags: null
        }
    }

    onChange = (selectedTags) => {
        const newTag = selectedTags.find(item => item.label === item.value);
        if (newTag) {
            addNewTag({ name: newTag.value })
                .then((result) => {
                    // TODO => save in task list
                    const tag = { label: result.name, value: result._id, id: result.id };
                    new TagModel(tag).$save();
                    this.updateTaskTags([
                        ...selectedTags.filter(item => item.value !== newTag.value),
                        tag
                    ]);
                })
        } else {
            this.updateTaskTags(selectedTags);
        }
    };

    updateTaskTags = (tags) => {
        const payload = {
            tags: tags.map(item => item.value)
        };
        updateTaskTags(this.props.taskId, payload)
            .then((result) => {
                // this.setState({ selectedTags: tags.map(item => item.value) })
                SelectedTaskDetailModel.updateTags(result, this.props.taskId)
            });
    };

    render = () => <div className="tag-container-section">
        <div className="title-section">
            <span className='fa'></span>
            <span className='modal-name-field'>Tags</span>
        </div>
        <VirtualSelect
            options={this.props.tags}
            onChange={this.onChange}
            value={this.state.selectedTags || this.props.selectedTags}
            multi
            valueKey='value'
            selectComponent={Creatable}
            disabled={this.props.disabled}
        />
    </div>;
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    return {
        selectedTags: task.tags,
        taskId: task.id,
        tags: TagModel.list().map(item => item.props)
    };
}

export default connect(mapStateToProps)(TagContainer);
