import React from 'react';
import {
    Menu,
    Table,
    Icon,
    Grid,
    Input,
    Header,
    Button,
    Segment,
    Message
} from 'semantic-ui-react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';

import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import ItemTypeAction from './../../actions/ItemTypeAction.js';

import ItemTypeStore from './../../stores/ItemTypeStore.js';

export default class ItemType extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            ItemTypeStore: ItemTypeStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        ItemTypeStore.listen(this.onChange);
        ItemTypeAction.getItemTypes();

        if (this.state.LoginStore && this.state.LoginStore.socket) {
            this.state.LoginStore.socket.on(Constant.SOCKET_EVENTS.ITEM_TYPE_CREATE, (itemType) => {
                ItemTypeAction.addItemTypeBySocketSuccess(itemType.newItemType);
            });

            this.state.LoginStore.socket.on(Constant.SOCKET_EVENTS.ITEM_TYPE_UPDATE, (itemType) => {
                ItemTypeAction.updateItemTypeBySocketSuccess(itemType.newItemType);
            });
        }
    }

    componentWillUnmount() {
        ItemTypeStore.unlisten(this.onChange);
        this._toggleItemTypeForm();
    }

    _showUpdateItemTypeForm(itemType) {
        ItemTypeAction.showUpdateItemTypeForm(itemType);
    }

    _setItemTypeName(event) {
        ItemTypeAction.setItemTypeName(event.target.value);
    }
    _setItemTypeKeyWord(index, event) {
        ItemTypeAction.setItemTypekeyword({ index: 0, value: 'All Customers' })
        const obj = {
            index: index,
            value: event.target.value
        }
        ItemTypeAction.setItemTypekeyword(obj);
    }

    _toggleItemTypeForm(value) {
        ItemTypeAction.toggleItemTypeForm(value);
    }

    _validateForm() {
        let self = this;
        let itemState = self.state.ItemTypeStore;

        let duplicateName = find(itemState.itemTypes, (itemType) => {
            if (itemType.id === itemState.itemType.id) {
                return false;
            }
            return itemType.name.trim().toLowerCase().replace(/\s+/g, '') === itemState.itemType.name.trim().toLowerCase().replace(/\s+/g, '');
        });
        if (!itemState.itemType.name.replace(/\s+/g, '')) {
            let error = {
                name: 'Item type name cannot be empty'
            };
            ItemTypeAction.setError(error);
            return false;
        } else if (duplicateName) {
            let error = {
                name: 'Name already exists'
            };
            ItemTypeAction.setError(error);
            return false;
        } else if (itemState.itemType.name.length > 50) {
            let error = {
                name: 'Name should be less than 50 characters'
            };
            ItemTypeAction.setError(error);
            return false;
        }
        let isEmptyKeyword = undefined
        if (itemState.itemType.keywords && itemState.itemType.keywords.length > 0) {
            isEmptyKeyword = itemState.itemType.keywords.find(item => !item.title)
            if (isEmptyKeyword) {
                let error = {
                    name: 'Keywords can not empty'
                };
                ItemTypeAction.setError(error);
                return false
            }
        } else {
            let error = {
                name: 'Keywords can not empty'
            };
            ItemTypeAction.setError(error);
            return false
        }
        return true;
    }

    renderKeywords = () => {
        let itemState = this.state.ItemTypeStore;
        var keywords = [];
        var keyword = null;
        let lastPos = 6;
        // itemState.itemType.keywords && itemState.itemType.keywords.find(item => item.title === 'All Customers') && lastPos++;
        for (let index = 1; index < 7; index++) {
            let keyValue = itemState.itemType.keywords && itemState.itemType.keywords[index] || null;
            let title = keyValue && keyValue.title || ''

            // if (title !== 'All Customers') {
            keyword = <Input name='keyword' label='Keyword'
                placeholder='Enter Keyword' value={title}
                onChange={this._setItemTypeKeyWord.bind(self, index)} />;
            keywords.push(keyword)
            // };
        }
        return keywords
    }

    _addItemType() {
        ItemTypeAction.setLoader();
        if (this._validateForm()) {
            ItemTypeAction.addItemType(this.state.ItemTypeStore.itemType);
        }
    }

    _updateItemType() {
        ItemTypeAction.setLoader();
        if (this._validateForm()) {
            ItemTypeAction.updateItemTypeWithKeywords(this.state.ItemTypeStore.itemType);
        }
    }

    render() {
        let self = this;
        let itemState = self.state.ItemTypeStore;
        let canViewItemType = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_PERSONAL_UPDATE.NAME);
        let canWriteItemType = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_PERSONAL_UPDATE.NAME);

        let itemTypeData = [];
        map(itemState.itemTypes, (itemType, index) => {
            itemTypeData.push(
                <Table.Row key={'item_type' + index}>
                    <Table.Cell>{itemType.name}</Table.Cell>
                    {canWriteItemType ?
                        <Table.Cell textAlign='center'>
                            <Button icon onClick={self._showUpdateItemTypeForm.bind(self, itemType)}>
                                <Icon name='edit' />
                            </Button>
                        </Table.Cell> :
                        null
                    }
                </Table.Row>
            );
        });

        return (
            <Grid centered>
                {canViewItemType ?
                    <Grid.Column width={16}>
                        <Segment size='large' loading={itemState.isLoading} disabled={itemState.isLoading}>
                            <Header as='h2' content='Item Types' subheader='Manage item types here.' />
                            {itemState.viewForm
                                ? <div>
                                    <Header as='h2' content={itemState.isAddItemType
                                        ? 'Add new item type'
                                        : 'Update item type'} />
                                    <Segment stacked secondary>
                                        <Menu fluid vertical>
                                            <Menu.Item>
                                                <Input name='itemType' label='Item type name'
                                                    placeholder='Enter item type' value={itemState.itemType.name}
                                                    onChange={self._setItemTypeName.bind(self)} />
                                                {itemState.error.name && <Message error content={itemState.error.name} />}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {this.renderKeywords()}
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Button primary={true} onClick={itemState.isAddItemType
                                                    ? self._addItemType.bind(self)
                                                    : self._updateItemType.bind(self)}>{itemState.isAddItemType
                                                        ? 'Add'
                                                        : 'Update'}</Button>
                                                <Button secondary={true} onClick={self._toggleItemTypeForm.bind(self, false)}>Cancel</Button>
                                            </Menu.Item>
                                        </Menu>
                                    </Segment>
                                </div>
                                :
                                canWriteItemType ?
                                    <Button primary={true} onClick={self._toggleItemTypeForm.bind(self, true)}>Add new item type</Button> :
                                    null

                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        {canWriteItemType ?
                                            <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell> :
                                            null
                                        }
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {itemTypeData}
                                </Table.Body>
                            </Table>
                        </Segment>
                    </Grid.Column> :
                    null
                }
            </Grid>
        );
    }
}
