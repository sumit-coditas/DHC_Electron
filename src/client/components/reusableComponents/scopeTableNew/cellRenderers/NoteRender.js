import React from 'react';

import { PLPPureComponent } from '../../../../baseComponents/importer';


export default class NoteRenderer extends PLPPureComponent {
    render = () => <span>{this.props.value}</span>;
}