import '../reusableComponents/scopeTableNew/scopeTableNew.scss';

import React from 'react';

import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { referenceGridHeader } from '../../utils/constants/ScopeTableHeaders';
import { PLPDataGrid } from '../reusableComponents/PLPDataGrid';
import { scopeDataConvertor } from '../reusableComponents/scopeTableNew/ScopeTableUtils';
import { ReferenceGridScopesModel } from '../../model/CustomerHomeModels/ReferenceGridScopesModel';
import { UtilModel } from '../../model/AppModels/UtilModel';
import { connect } from 'react-redux';
import { PLPButton } from '../../baseComponents/PLPButton';
import { FIELDS } from '../../utils/constants/ScopeTableFields';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';

class ProjectReferenceGridImpl extends PLPPureComponent {

    openTaskPage = (scope) => {
        const data = UtilModel.getUtilsData();
        data.title = `${scope[FIELDS.JOB_WITH_SCOPE_NUMBER]} - ${scope[FIELDS.PROJECT]}`;
        data.taskId = scope.taskId;
        data.newTask = null;
        SelectedTaskDetailModel.deleteAll();
        new UtilModel(data).$save();
    };

    openTaskRenderer = (params) => <PLPButton onClick={() => this.openTaskPage(params.data)}> {params.value} </PLPButton>;

    render() {
        return (
            <PLPDataGrid
                columnDefs={referenceGridHeader}
                rowData={this.props.scopes}
                onCellValueChanged={this.handleCellValueChanged}
                frameworkComponents={{
                    openTaskRenderer: this.openTaskRenderer
                }}
            />
        );
    }
}
function mapStateToProps(state, ownProps) {
    const scopes = ReferenceGridScopesModel.list().map(({ props }) => scopeDataConvertor(props, referenceGridHeader));
    return {
        scopes
    };
}

export const ProjectReferenceGrid = connect(mapStateToProps)(ProjectReferenceGridImpl);
