import React from 'react';
import { Dropdown as DropdownSemantic } from 'semantic-ui-react';


export default class Dropdown extends React.Component {
    render() {
        const {
            handleChange,
            options,
            placeholder,
            label,
            value,
            search,
            selection,
            loading,
            onSearchChange,
            disabled
        } = this.props;

        return (
            <div className='custom-dropdown'>
                <label>{label}</label>
                <DropdownSemantic
                    onChange={handleChange}
                    options={options}
                    placeholder={placeholder}
                    selection
                    value={value}
                    disabled={disabled || false}
                    search={search}
                    loading={loading}
                    onSearchChange={onSearchChange}
                />
            </div>
        );
    }
}
