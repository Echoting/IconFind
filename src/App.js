import React, { useState } from 'react';
import { Modal, Button, Upload, message, Progress} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import {Icon} from '@befe/brick-comp-icon';
import {
    SvgCalendar,
    SvgChat,
    SvgDelete,
    SvgHeart,
    SvgHeartFill,
    SvgHome,
    SvgMagnifierMinus,
    SvgMagnifierPlus,
    SvgUserPlus,
    SvgUserTeam
} from '@befe/brick-icon'

import {predict} from './icon-predict/iconSearchPredict/script'

import './App.css';

const { Dragger } = Upload;
const iconMap = {
    'SvgCalendar' : SvgCalendar,
    'SvgChat': SvgChat,
    'SvgDelete': SvgDelete,
    'SvgHeart': SvgHeart,
    'SvgHeartFill': SvgHeartFill,
    'SvgHome': SvgHome,
    'SvgMagnifierMinus': SvgMagnifierMinus,
    'SvgMagnifierPlus': SvgMagnifierPlus,
    'SvgUserPlus': SvgMagnifierPlus,
    'SvgUserTeam': SvgUserTeam
}

const App = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [predictResult, setPredictResult] = useState([]);
    const [fileList, setFileList] = useState([]);

    const showModal = () => {
        setIsModalVisible(true);
        setPredictResult([]);
        setFileList([]);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onChange = async ({ fileList: newFileList }) => {
        await setFileList(newFileList.slice(-1))  // 只是获取最后一个图片

        let predictedImg = newFileList.slice(-1);

        if (predictedImg && predictedImg.length > 0) {

            const file = predictedImg[0];

            let src = file.url;
            if (!src) {
                src = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => resolve(reader.result);
                });
            }
            const image = new Image();
            image.src = src;
            image.width = 224;
            image.height = 224;

            const predictResultTemp = await predict(image);

            setPredictResult(predictResultTemp)
        }
    };

    // const onPreview = async file => {
    //     let src = file.url;
    //     if (!src) {
    //         src = await new Promise(resolve => {
    //             const reader = new FileReader();
    //             reader.readAsDataURL(file.originFileObj);
    //             reader.onload = () => resolve(reader.result);
    //         });
    //     }
    //     const image = new Image();
    //     image.src = src;
    //     const imgWindow = window.open(src);
    //     imgWindow.document.write(image.outerHTML);
    // };

    const props = {
        name: 'file',
        listType: "picture",
        fileList: fileList,
        // multiple: true,
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        defaultFileList: [...fileList],
        // onPreview: file => onPreview(file),
        onChange
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Open Modal
            </Button>
            <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                        band files
                    </p>
                </Dragger>

                <div>
                    {
                        predictResult.map(item => {
                            return <div className={'result-item-wrapper'}>
                                <Icon svg={iconMap[item.className]} style={{fontSize: 30, color: '#666', marginRight: '16px'}}/>

                                <Progress percent={(item.score * 100).toFixed(0)} />
                                <p className={'percent'}>{item.className}</p>
                            </div>
                        })
                    }
                </div>
            </Modal>
        </>
    );
};

export default App;
