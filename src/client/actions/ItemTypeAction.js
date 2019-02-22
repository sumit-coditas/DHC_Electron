import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';
import { addKeyword, updateItemKeyword, addItemType, updateItemType, getAllItemTypes } from '../utils/promises/itemTypePromise';
import AppAction from '../actions/AppAction.js';
import { ItemTypeModel } from '../model/AppModels/ItemTypeModel.js';
import { sortByDateAsc } from '../utils/DateUtils.js';
import { sortItemTypes } from '../utils/sortUtil.js';

class ItemTypeAction {
    constructor() {
        this.generateActions(
            'clearStore',
            'setLoader',
            'getItemTypesSuccess',
            'addItemTypeSuccess',
            'setItemTypeName',
            'toggleItemTypeForm',
            'showUpdateItemTypeForm',
            'updateItemTypeSuccess',
            'setError',
            'resetLoaderAndError',
            'addItemTypeBySocketSuccess',
            'updateItemTypeBySocketSuccess',
            'setItemTypekeyword'
        );
    }

    getItemTypes() {
        let url = 'itemTypes';

        getAllItemTypes().then((itemTypes) => {
            itemTypes = sortItemTypes(itemTypes);
            this.getItemTypesSuccess(itemTypes);
        });
    }

    addItemType(itemType) {
        let url = 'itemTypes';
        
        addItemType(itemType).then((savedItemType) => {
            new ItemTypeModel(savedItemType).$save()
            this.addItemTypeSuccess(savedItemType);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ITEM_TYPE.ADD_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            this.resetLoaderAndError();
        });
    }

    updateItemType(itemType) {
        let url = 'itemTypes/' + itemType.id;
        
        updateItemType(itemType).then((updatedItemType) => {
            this.updateItemTypeSuccess(updatedItemType);
            AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ITEM_TYPE.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
        }).catch(() => {
            this.resetLoaderAndError();
        });
    }

    updateItemTypeWithKeywords(itemType) {
        let url = 'itemTypes/' + itemType.id;
        try {
            // const keywordUpdates = itemType.keywords.map(item => RequestHandler.put('keyword/' + item.id, item));
            // Promise.all(keywordUpdates)
            // .then(async results=>{
            //     const response = await RequestHandler.put(url, itemType);
            //     this.updateItemTypeSuccess(response);
            //     AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ITEM_TYPE.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
            // })

            const notExistingKeywords = itemType.keywords.filter(item => !item._id);
            const existingKeywords = itemType.keywords.filter(item => item._id);

            const addKeywordCalls = notExistingKeywords.map(item => addKeyword(item));
            const updateKeywordCalls = existingKeywords.map(item => updateItemKeyword(item))

            const keywordCalls = Array.isArray(addKeywordCalls) && addKeywordCalls.length > 1 && addKeywordCalls
                || updateKeywordCalls;
            Promise.all(keywordCalls)
                .then(async results => {
                    itemType.keywords = [...results];
                    const response = await updateItemType(itemType)
                    this.updateItemTypeSuccess(response);
                    AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.ITEM_TYPE.UPDATE_SUCCESS, level: Constant.NOTIFICATION_LEVELS.SUCCESS });
                })
        } catch (error) {
            this.resetLoaderAndError();
        }
    }

}

export default alt.createActions(ItemTypeAction);
