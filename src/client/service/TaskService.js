import { renameProjectFolder } from '../utils/promises/TaskPromises';
import { showFaliureNotification, showSuccessNotification } from '../utils/notifications';

export function renameProjectFolderOnFTP(oldPath, newPath) {
    renameProjectFolder({ oldPath, newPath })
        .then(() => showSuccessNotification('FTP folder has been updated successfully.'))
        .catch(() => showFaliureNotification('Failed to rename project folder with new value'));
}
