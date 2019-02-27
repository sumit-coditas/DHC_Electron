import { Modal } from 'antd';
import React from 'react';

import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { UtilModel } from '../../model/AppModels/UtilModel';

const bodyStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}
class CongratulationsPopup extends PLPPureComponent {

    handleCongratulationsPopup = () => {
        let data = UtilModel.getUtilsData();
        data.showCongratulationsPopup = false;
        console.log(data)
        new UtilModel(data).$save()
    };

    getRandomImage = () => {
        const randomNumber = Math.floor(Math.random() * 16) + 1;
        return `/images/popup/congratulations${randomNumber}.png`
    };

    render = () => <Modal
        visible
        width='800px'
        onCancel={this.handleCongratulationsPopup}
        title='Congratulations!!'
        okText='C'
        footer={null}
        bodyStyle={bodyStyle}
    >
        <img style={{ height: '700px' }} src={this.getRandomImage()} />
    </Modal >;
}

export default CongratulationsPopup;
