import React from 'react';
import { Divider, Form, Select } from 'semantic-ui-react';
import Constant from '../../../helpers/Constant';
import RequiredLabel from '../../../../baseComponents/RequiredLabel';
import { DatePicker } from 'material-ui';

export default class ScopeDetails extends React.PureComponent {

    render() {
        const { scope } = this.props;
        return (
            <div key={scope.id}>
                <Divider horizontal>{'Scope ' + 'A'}</Divider>
                <Form.Group widths='2'>
                    <Form.Field width='11'>
                        <Form.TextArea
                            required
                            label='Scope'
                            autoHeight
                            name={'scope' + scope.id}
                            defaultValue={scope.definition}
                            onBlur={(event) => self._changeDefinition(scope, event)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <RequiredLabel label='Scope Note' />
                        <div className='field'>
                            <div className='ui input'>
                                <input
                                    type='text'
                                    defaultValue={scope.note}
                                    required
                                    maxLength='16'
                                    name={'scopeNote' + scope.id}
                                    onBlur={(event) => self._changeScopeNote(scope, event)}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <RequiredLabel label='Cost' />
                            <div className='field'>
                                <div className='ui input left icon'>
                                    <i aria-hidden='true' className='dollar icon'/>
                                    <input
                                        type='number'
                                        defaultValue={scope.price}
                                        required
                                        name={'price' + scope.id}
                                        onBlur={(event) => self._changeScopePrice(scope, event)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <RequiredLabel label='Due Date' />
                            <DatePicker
                                firstDayOfWeek={0}
                                hintText='Due Date'
                                name={'dueDate' + scope.id}
                                className='date'
                                minDate={new Date()}
                                defaultDate={new Date(scope.dueDate)}
                                formatDate={self._formatDate}
                                mode='landscape'
                                ref={'datePicker' + scope.id}
                                onFocus={(event) => self._handleFocusOnDatePicker(scope.id, event)}
                                onBlur={(event, date) => self._changeDueDate(scope, event, date)}/>
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <RequiredLabel label='Item Type' />
                        <Select
                            name={'itemType' + scope.id}
                            autosize={false}
                            clearable={false}
                            value={scope.itemType && scope.itemType._id}
                            options={[]}
                            onChange={(option) => self._changeItemType(scope, option)}
                        />

                        <div style={{ marginTop: '10px' }}>
                            <label>Customer Contact</label>
                            <Select
                                name={'customerContact' + scope.id}
                                searchable
                                autosize={false}
                                clearable={false}
                                // disabled={taskState.isFetchingContacts}
                                // isLoading={taskState.isFetchingContacts}
                                value={scope.customerContact && scope.customerContact.name ? scope.customerContact.id : ''}
                                // options={contactOptions}
                                optionRenderer={self._renderCustomerContact}
                                onOpen={self._getOffice365Contacts}
                                onChange={(option) => self._changeCustomerContact(scope, option)}
                            />
                        </div>
                    </Form.Field>
                </Form.Group>
                <Form.Group widths='2'>
                    <Form.Field width='11' className='engineer-differential'>
                        <RequiredLabel label='Engineer' />
                        <Select
                            name={'engineer' + scope.id}
                            autosize={false}
                            clearable={false}
                            // options={engineerOptions}
                            onChange={(option) => self._changeEngineer(scope, option)}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <RequiredLabel label='Status' />
                            <Select
                                name={'engineerStatus' + scope.id}
                                autosize={false}
                                clearable={false}
                                value={[]}
                                options={Constant.STATUS_OPTIONS}
                                onChange={(option) => self._changeStatus(scope, false, option)}
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <RequiredLabel label='Urgent hours' />
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='number'
                                        defaultValue={scope.engineerDetails ? scope.engineerDetails.urgentHours : 0}
                                        required
                                        name={'engineeringUrgentHours' + scope.id}
                                        onBlur={(event) => self._changeUrgentHours(scope, false, event)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <RequiredLabel label='Non-Urgent hours' />
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='number'
                                        defaultValue={scope.engineerDetails ? scope.engineerDetails.nonUrgentHours : 0}
                                        required
                                        name={'engineeringNonUrgentHours' + scope.id}
                                        onBlur={(event) => self._changeNonUrgentHours(scope, false, event)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Form.Field>
                    <Form.Field className='drafter-differential'>
                        <label>
                            Drafter
                        </label>
                        <Select
                            name={'drafter' + scope.id}
                            autosize={false}
                            clearable={false}
                            value={scope.drafterDetails && scope.drafterDetails.drafter ? scope.drafterDetails.drafter._id : ''}
                            options={[]}
                            onChange={(option) => self._changeDrafter(scope, option)}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <label>
                                Status
                            </label>
                            <Select
                                name={'drafterStatus' + scope.id}
                                autosize={false}
                                clearable={false}
                                value={scope.drafterDetails && scope.drafterDetails.status !== '' ? scope.drafterDetails.status : Constant.STATUS_OPTIONS[0].value}
                                options={Constant.STATUS_OPTIONS}
                                onChange={(option) => self._changeStatus(scope, true, option)}
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <label>
                                Urgent hours
                            </label>
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='number'
                                        defaultValue={scope.drafterDetails ? scope.drafterDetails.urgentHours : 0}
                                        required
                                        name={'draftingUrgentHours' + scope.id}
                                        onBlur={(event) => self._changeUrgentHours(scope, true, event)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <label>
                                Non-Urgent hours
                            </label>
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='number'
                                        defaultValue={scope.drafterDetails ? scope.drafterDetails.nonUrgentHours : 0}
                                        required
                                        name={'draftingNonUrgentHours' + scope.id}
                                        onBlur={(event) => self._changeNonUrgentHours(scope, true, event)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <div style={{ marginTop: '10px' }}>
                            <label>Final Engineering Hours</label>
                            <div className='disabled field'>
                                <div className='ui input'>
                                    <input type='text' name={'finalEngineeringHours' + scope.id} value={scope.finalEngineeringHours} disabled/>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <label>Final Drafting Hours</label>
                            <div className='disabled field'>
                                <div className='ui input'>
                                    <input type='text' name={'finalDraftingHours' + scope.id} value={scope.finalDraftingHours} disabled/>
                                </div>
                            </div>
                        </div>
                    </Form.Field>
                </Form.Group>
                <div className='clear'/>
            </div>
        );
    }
}
