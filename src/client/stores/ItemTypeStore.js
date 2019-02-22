import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import indexOf from 'lodash/indexOf';
import alt from '../alt.js';

import ItemTypeAction from '../actions/ItemTypeAction.js';

class ItemTypeStore {
    constructor() {
        this.bindActions(ItemTypeAction);
        this.clearStore();
    }

    clearStore() {
        this.itemTypes = [];
        this.itemType = {
            name: ''
        };
        this.viewForm = false;
        this.isLoading = true;
        this.isAddItemType = false;
        this.error = {
            name: ''
        };
    }

    getItemTypesSuccess(itemTypes) {
        this.itemTypes = itemTypes;
        this.isLoading = false;
    }

    addItemTypeSuccess(itemType) {
        this.itemTypes.push(itemType);
        this.toggleItemTypeForm(false);
        this.resetData();
    }

    addItemTypeBySocketSuccess(itemType) {
        let index = indexOf(this.itemTypes, find(this.itemTypes, { id: itemType.id }));
        if (index === -1 && itemType) {
            this.itemTypes.push(itemType);
        }
    }

    resetData() {
        this.error = {
            name: ''
        };
        this.itemType = {
            name: ''
        };
        this.isLoading = false;
    }

    setLoader() {
        this.isLoading = true;
    }

    setItemTypeName(name) {
        this.itemType.name = name;
    }

    setItemTypekeyword(obj) {
        const keywords = this.itemType.keywords || [];
        // for (let index = 1; index < 7; index++) {
        // if(keywords[index].title !== 'All Customers' ) {
        //     if (obj.index === index) {
        //     keywords[index] = {
        //         ...keywords[index],
        //         ['title']: obj.value
        //     }
        //     } else {
        //         keywords[index] = {
        //             ...keywords[index],
        //             title: keywords[index] && keywords[index]['title'] || ''
        //         }
        //     }
        // }            

        // }
        // this.itemType.keywords && this.itemType.keywords || [];
        keywords[obj.index] = {
            ...keywords[obj.index],
            title: obj.value
        };
        this.itemType.keywords = keywords
    }

    toggleItemTypeForm(value) {
        this.viewForm = value;
        this.isAddItemType = value;
        this.resetData();
    }

    showUpdateItemTypeForm(itemType) {
        this.viewForm = true;
        this.isAddItemType = false;
        this.itemType = cloneDeep(itemType);
    }

    updateItemTypeSuccess(updatedItemType) {
        let index = indexOf(this.itemTypes, find(this.itemTypes, { id: updatedItemType.id }));
        this.itemTypes.splice(index, 1, updatedItemType);
        this.viewForm = false;
        this.resetData();
    }

    updateItemTypeBySocketSuccess(updatedItemType) {
        let index = indexOf(this.itemTypes, find(this.itemTypes, { id: updatedItemType.id }));
        this.itemTypes.splice(index, 1, updatedItemType);
    }

    setError(error) {
        this.error = error;
        this.isLoading = false;
    }

    resetLoaderAndError() {
        this.isLoading = false;
        this.error = {
            name: ''
        };
    }
}

export default alt.createStore(ItemTypeStore, 'ItemTypeStore');
