import React from 'react';
import isEqual from 'react-fast-compare';

import TemplateNew from './Template/TemplateNew';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';

export class MilestoneWrapper extends PLPPureComponent {

    renderMilestoneTemplate = (index, item) => <TemplateNew
        key={index}
        type={this.props.type}
        headerTitle={`${this.props.title} ${item.number}`}
        headerWidth={this.props.headerWidth}
        stepWidth={this.props.stepWidth}
        data={item}
        handleArchive={this.props.handleArchive}
        editableMode
        scopes={this.props.scopes}
        saveTemplateData={this.props.saveTemplateData}
        unEditable={this.props.unEditable}
    />;

    render = () => <div className='milestone-group'>
        {this.props.milestoneList && this.props.milestoneList.map((item, index) => this.renderMilestoneTemplate(index, item))}
    </div>;
}
