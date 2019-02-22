import React from 'react';
import AppStore from '../../../stores/AppStore';
import { connect } from 'react-redux';
import { VirtualSelect, PLPPureComponent } from '../../../baseComponents/importer';
import { getDrafters } from '../scopeTableNew/ScopeTableUtils';
import { getOptions } from './engineer';


class DrafterList extends PLPPureComponent {
    state = { selectedItem: { label: '', value: '' } }

    handleSelected = (selectedItem) => {
        this.setState({selectedItem});
        this.props.onChange(selectedItem)
    }

    render() {
        const drafterList = this.props.options || getOptions(this.props.drafterList);
        const defaultValue = this.props.defaultValue || this.state.selectedItem
        return (
            <VirtualSelect value={defaultValue} options={drafterList} onChange={this.handleSelected} />
        );
    }
}

function mapStateToProps() {
    return {
        drafterList: getDrafters(AppStore.getState().users),
    }
}
export default connect(mapStateToProps)(DrafterList)