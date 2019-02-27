import Constant from '../../helpers/Constant';
export const taskID = {
    [Constant.TASK_GROUP_ID.ACTIVE_PROJECTS]: Constant.TASK_GROUP__ID.ACTIVE_PROJECTS,
    [Constant.TASK_GROUP_ID.COMPLETED_PROJECTS]: Constant.TASK_GROUP__ID.COMPLETED_PROJECTS,
    [Constant.TASK_GROUP_ID.ON_HOLD]: Constant.TASK_GROUP__ID.ON_HOLD,
    [Constant.TASK_GROUP_ID.TASKS]: Constant.TASK_GROUP__ID.TASKS,
    [Constant.TASK_GROUP_ID.BIDS]: Constant.TASK_GROUP__ID.BIDS
};
const activeOption = {
    key: Constant.TASK_GROUP_ID.ACTIVE_PROJECTS,
    value: Constant.TASK_GROUP_ID.ACTIVE_PROJECTS,
    // value: 'Active Projects',
    text: 'Active Projects'
};
const holdOption = {
    key: Constant.TASK_GROUP_ID.ON_HOLD,
    value: Constant.TASK_GROUP_ID.ON_HOLD,
    // value: 'On Hold or Potential Project',
    text: 'On Hold or Potential Project'
};
const completedOption = {
    key: Constant.TASK_GROUP_ID.COMPLETED_PROJECTS,
    value: Constant.TASK_GROUP_ID.COMPLETED_PROJECTS,
    // value: 'Completed Projects',
    text: 'Completed Projects'
};

export const options = {
    [Constant.TASK_GROUP_ID.ACTIVE_PROJECTS]: [holdOption, completedOption],
    [Constant.TASK_GROUP_ID.COMPLETED_PROJECTS]: [activeOption, holdOption],
    [Constant.TASK_GROUP_ID.ON_HOLD]: [activeOption, completedOption],
    [Constant.TASK_GROUP_ID.TASKS]: [completedOption],
    [Constant.TASK_GROUP_ID.BIDS]: [activeOption]
};

export const groupNames = {
    [Constant.TASK_GROUP_ID.ACTIVE_PROJECTS]: 'Active Group',
    [Constant.TASK_GROUP_ID.BIDS]: 'Bids Group',
    [Constant.TASK_GROUP_ID.COMPLETED_PROJECTS]: 'Completed Group',
    [Constant.TASK_GROUP_ID.ON_HOLD]: 'On Hold or Potential Group',
    [Constant.TASK_GROUP_ID.TASKS]: 'Task Group'

};
