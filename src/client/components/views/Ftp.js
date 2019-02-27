import React, { Component } from 'react'
import Client from 'ftp'
import { Upload, Icon, message } from 'antd';

var Dragger = Upload.Dragger;

export default class Ftp extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      client: null
    }
  }

  componentWillMount() {
    // this.getClient();
  }

  getClient(file) {
    var client = new Client();
    // console.log(client);
    var config = {
      host: 'ftp.sd.charlesengineering.com',
      user: 'swftpuser',
      password: '123erd456!',
      port: 21,
      secure: true,
      secureOptions: {
        rejectUnauthorized: false
      }
    };
    client.on('ready', function () {
      client.list(function (err, list) {
        if (err) throw console.log('#########', err);
        console.log('@@@@@@@@@@@', list);
        // client.end();
        console.log('$$$$$', file)
        client.put(file.path, `Testing/ftp-demo/${file.name}`, function (err) {
          if (err) console.log('error', err);
          console.log('file uploaded')
          client.end();
        });
      });

    });
    client.connect(config);
  }


  handleChange(info) {
    console.log('info', info)
    console.log(info);
    const status = info.file.status;
    console.log(status);
    if (status !== 'uploading') {
      console.log('uploading', info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  handleFileUpload(file) {
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    this.getClient(file)
  }

  render() {
    return (
      <div>
        {/* <Upload> */}
        <Dragger
          name='file'
          multiple={true}
          action={this.handleFileUpload.bind(this)}
          onChange={this.handleChange.bind(this)}
          style={{ height: '800px' }}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
        </Dragger>
        {/* </Upload> */}

      </div>
    )
  }
}
