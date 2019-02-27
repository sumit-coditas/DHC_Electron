import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import { showFaliureNotification, showSuccessNotification } from '../../../../utils/notifications';
import { addNewScope, updateScopeArchive, updateScopeDataUsingId } from '../../../../utils/promises/ScopePromises';
import { renameProjectFolder, syncContractorDetails, updateTaskNew } from '../../../../utils/promises/TaskPromises';
import { getUsersTotalUrgentNonUrgentHours } from '../../../../utils/promises/UserPromises';
import Constant from '../../../helpers/Constant';

export async function archiveScope(payload) {
    const userID = payload.userID;
    if (payload.childScopes.length) {
        const updatableScopes = [
            ...payload.childScopes,
            payload.scopeId
        ];
        Promise.all(updatableScopes.map(scope => updateScopeArchive(scope, { isArchived: true }, payload.taskId)))
            .then(async (updatedScopes) => {
                await getUsersTotalUrgentNonUrgentHours(userID);
                console.log('Printing updated scopes:', updatedScopes);
                updatableScopes.forEach(updatedScope => SelectedTaskDetailModel.updateScope({ id: updatedScope, isArchived: true }, payload.taskId));
                // showSuccessNotification(`Scope has been updated`);
            }).catch(error => {
                console.error('Unable to archive scope:', error);
                showFaliureNotification(`Scope updation failed`);
            });
    } else {
        try {
            payload = { ...payload, scope: { "isArchived": true } }
            const updatedScope = await updateScopeArchive(payload.scopeId, payload);
            await getUsersTotalUrgentNonUrgentHours(userID);
            SelectedTaskDetailModel.updateStore(Constant.DOC_TYPES.SCOPE.type, updatedScope, payload.taskId);
            // showSuccessNotification(`Scope has been updated`);
        } catch (error) {
            console.log("error", error);
            showFaliureNotification(`Scope updation failed`);
        }
    }
    console.log("scope archive", archiveScope)
}

export async function updateTaskDescription(payload) {
    try {
        const {
            body,
            taskId
        } = payload;
        const result = await updateTaskNew(taskId, body);
        SelectedTaskDetailModel.updateTaskDescription(result, taskId);
        // showSuccessNotification(`Task details has been updated`);
    } catch (error) {
        console.log("error", error);
        showFaliureNotification(`Task details updation failed`);
    }
}

function updateScopes(newScopes, scopes, taskId, done, payload) {
    let scopeCalls = [];
    const {
        isUpdatingHours,
        userID
    } = payload
    scopes.forEach(scope => {
        const scopeId = scope.id;
        const updatedScope = updateScopeDataUsingId(scopeId, scope);
        scopeCalls.push(updatedScope)
    });
    newScopes.forEach(scope => scopeCalls.push(addNewScope({ scope, taskID: scope.taskID })));
    if (newScopes.length || scopes.length) {
        Promise.all(scopeCalls)
            .then(async (scopeResults) => {
                let updatedScopesResult = scopeResults.filter((scope) => scope.data && !scope.data.task);
                let newScopesResult = scopeResults.filter(scope => scope.data && scope.data.task);
                updatedScopesResult = updatedScopesResult.map(scope => scope.data);
                newScopesResult = newScopesResult.map(scope => scope.data);
                ScopeModel.updateMultipleScopes(updatedScopesResult);
                SelectedTaskDetailModel.updateScopes(updatedScopesResult, taskId)
                if (newScopesResult.length) {
                    ScopeModel.addNewScopes(newScopesResult);
                }
                if (isUpdatingHours || newScopesResult.length) {
                    await getUsersTotalUrgentNonUrgentHours(userID);
                }
                // showSuccessNotification(`Scope has been updated.`);
                return done(false)
            })
            .catch((error) => {
                console.log("error", error)
                showFaliureNotification('Scope Update Failed');
                SelectedTaskDetailModel.reset()
                return done(false)
            })
    } else {
        return done(false)
    }
}

export async function updateProjectDetails(payload, path, done) {
    const {
        taskId,
        projectDescription,
        scopes,
        newScopes,
        isUpdatingHours,
        userID
    } = payload;
    // if (projectDescription && Object.values(projectDescription).length > 0) {
    //     updateTaskDescription({
    //         taskId,
    //         body: {
    //             ...projectDescription
    //         }
    //     })
    //     handleRenameFTP(path);
    // }
    // updateScopes(newScopes, scopes, taskId, done)
    // if (isUpdatingHours) {
    //     await getUsersTotalUrgentNonUrgentHours(userID);
    // }

    try {
        const result = await updateTaskNew(taskId, projectDescription);
        SelectedTaskDetailModel.updateTaskDescription(result, taskId);
        handleRenameFTP(path);
        updateScopes(newScopes, scopes, taskId, done, payload)
        // if (isUpdatingHours) {
        //     await getUsersTotalUrgentNonUrgentHours(userID);
        // }
    } catch (error) {
        console.log("error", error);
        showFaliureNotification(`Task details updation failed`);
    }
}

export function handleSyncContractor(payload) {
    syncContractorDetails(payload)
        .then((result) => {
            SelectedTaskDetailModel.syncContractorDetails(result.data);
            showSuccessNotification('Contractor Synchronized')
        })
        .catch(error => {
            showFaliureNotification('Contractor Synchronization Failed');
            SelectedTaskDetailModel.reset()
        })
}

function handleRenameFTP(path) {
    if (path.oldPath !== path.newPath) {
        renameProjectFolder(path)
            .then(res => console.log('renameSucess'))
            .catch(e => console.log('rename error'))
    }
}
