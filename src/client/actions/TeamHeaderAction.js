import alt from '../alt.js';

class TeamHeaderAction {
    constructor() {
        this.generateActions('clearStore', 'toggleAvatarView', 'setGroupBy', 'setShowPayDayModal');
    }
}
export default alt.createActions(TeamHeaderAction);
