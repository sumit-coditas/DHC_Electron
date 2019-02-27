import React from 'react';
import { Image } from 'semantic-ui-react';

export default class FileUpload extends React.Component {
    resetFileInput = () => {
        this.fileInput.value = ''
    };

    render() {
        const { src, size, accept, onChange, onClick, style, label, fileInput } = this.props;
        return (
            <div className={style}>
                <label style={{ paddingBottom: '8px', fontSize: '20px' }}>{label}</label>
                <Image
                    src={src}
                    size={size}
                    bordered
                />
                <input
                    type='file'
                    accept={accept}
                    onChange={onChange}
                    onClick={onClick}
                    ref={fileInput}
                />
            </div>
        );
    }
}
