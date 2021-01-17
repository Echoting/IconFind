import React, { useState } from 'react';
import { Modal, Button, Upload, message} from 'antd';
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
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onChange = async ({ fileList: newFileList }) => {
        await setFileList(newFileList)


        if (newFileList && newFileList.length > 0) {

            const file = newFileList[0];

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
            console.log('predict result', predictResultTemp)
            // const predictResult = [
            //     {className: SvgUserPlus, score: 0.640287697},
            //     {className: SvgMagnifierMinus, score: 0.30},
            //     {className: SvgUserTeam, score: 0.028}
            // ]

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
                                <Icon svg={iconMap[item.className]} />
                                <p>{`score为${(item.score * 100).toFixed(0)} 类型为 ${item.className}`}</p>
                            </div>
                        })
                    }
                </div>
            </Modal>
        </>
    );
};

export default App;
