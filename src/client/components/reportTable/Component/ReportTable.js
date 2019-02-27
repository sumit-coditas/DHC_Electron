import React from 'react';
import PropTypes from 'prop-types';
import { Header, Table, Dimmer, Loader } from 'semantic-ui-react';

import { getFormattedNumber } from '../../../utils/common';
import { ReportTableHeader, monthArray, Strings } from '../Constants';

class ReportTable extends React.Component {

    getTableHeader = () => <Table.Row>
        <Table.HeaderCell
            textAlign='center'
            key={this.props.title}>
            {this.props.title}
        </Table.HeaderCell>
        {this.props.header.map((header, key) => {
            return (
                <Table.HeaderCell
                    textAlign='center'
                    key={key}>
                    {header}
                </Table.HeaderCell>
            );
        })
        }</Table.Row>;

    getRow(item, index) {
        let total = 0;
        let count = 0;
        const isPerDollar = this.props.perDollar;
        return (
            <Table.Row key={index}>
                <Table.Cell
                    singleLine
                    textAlign='center'
                    key={index}
                >
                    {item.userName}
                </Table.Cell>
                {monthArray.map((month) => {
                    if (item.data[month] && item.data[month] !== 0) {
                        count += 1;
                        total += item.data[month];
                    }
                    return (
                        <Table.Cell
                            singleLine
                            textAlign='center'
                            key={month}
                        >
                            {this.props.type + getFormattedNumber(item.data[month] ? this.props.type === '$ ' || this.props.title === 'Role' ? item.data[month] : item.data[month].toFixed(2) : 0)}
                        </Table.Cell>
                    );
                })}

                <Table.Cell
                    textAlign='center'
                    key="avg"
                >
                    {this.props.type
                        + getFormattedNumber(
                            this.props.type === '$ ' || this.props.title === 'Role' ?
                                Math.round(total / (count === 0 ? 1 : count)) :
                                parseFloat(parseFloat(total).toFixed(2) / (count === 0 ? 1 : count)).toFixed(2)
                        || 0)}
                </Table.Cell>

                <Table.Cell
                    textAlign='center'
                    key="total">
                    {this.props.type + getFormattedNumber(total ? this.props.type === '$ ' || this.props.title === 'Role' ? Math.round(total) : parseFloat(total).toFixed(2) : 0)}
                </Table.Cell>
            </Table.Row>
        )
    }

    getPerDollarRow = (item, index) => <Table.Row key={index}>
        <Table.Cell
            singleLine
            textAlign='center'
            key={0}
        >
            {item.userName}
        </Table.Cell>
        <Table.Cell
            singleLine
            textAlign='center'
            key={1}
        >
            {'$' + item.data.billedAmount || 0}
        </Table.Cell>
        <Table.Cell
            singleLine
            textAlign='center'
            key={2}
        >
            {'$' + item.data.totalAmount || 0}
        </Table.Cell>
        <Table.Cell
            singleLine
            textAlign='center'
            key={3}
        >
            {'$' + item.data.totalAndHolidayAmount || 0}
        </Table.Cell>
    </Table.Row>;


    getLoader = () => <Dimmer active inverted >
        <Loader />
    </Dimmer>;

    showError = (error) => <div className="error">
        {error}
    </div>;


    render() {
        const { styleClass, data, isLoading, error, perDollar } = this.props;
        return (
            <div className={styleClass + ' ' + (window.location.pathname === '/reports' ? 'page-wrapper' : '')}>
                <Table celled padded fixed >
                    <Table.Header>
                        {this.getTableHeader()}
                    </Table.Header>
                    <Table.Body>
                        {isLoading ?
                            this.getLoader() :
                            error !== '' ?
                                this.showError(error) :
                                perDollar ? data.map((data, index) => this.getPerDollarRow(data, index))
                                    : data.map((data, index) => this.getRow(data, index))
                        }
                    </Table.Body>
                </Table>
            </div>
        );
    }
}

export default ReportTable;
