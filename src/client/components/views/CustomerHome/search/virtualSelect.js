import React, { Component } from 'react';
import { debounce } from 'lodash';
import VirtualSelect from '../../../../baseComponents/VirtualSelect';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { getContractors } from '../../../../utils/promises/TaskPromises';
import { getContractorOptions } from '../../../taskGroupWrapper/projectDetailNew/util';


class Search extends PLPPureComponent {
    state = { selected:null }
    handleSelection = (selected) => {
        this.setState({selected});
        this.props.getDetails(selected.companyName || selected.label)
    }

    handleContractorSearch = async (query) => {
        if(query) {
            let searchResult = await getContractors(query)
            const options = getContractorOptions(searchResult, null, true)
            return { options: options }
        }
    }

    render() {
        return (
            <VirtualSelect
                async
                options={[{label:'GME, Inc',value:'GME, Inc'}]}
                value={ this.state.selected || {label:'GME, Inc',value:'GME, Inc'}}
                loadOptions={this.handleContractorSearch}
                onChange={this.handleSelection}
            />
        );
    }
}

export default Search;