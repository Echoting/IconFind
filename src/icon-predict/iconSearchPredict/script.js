// import * as tfvis from '@tensorflow/tfjs-vis'
import * as tf from '@tensorflow/tfjs'

import {img2x, file2img} from './utils'

const ICON_CLASSES = [
    'SvgCalendar',
    'SvgChat',
    'SvgDelete',
    'SvgHeart',
    'SvgHeartFill',
    'SvgHome',
    'SvgMagnifierMinus',
    'SvgMagnifierPlus',
    'SvgUserPlus',
    'SvgUserTeam'
]

const MOBILENET_MODEL_PATH = 'http://127.0.0.1:8080/mobilenet/web_model/model.json'  // imageNet模型
const TRANSFER_MOBILENET_MODEL_PATH = 'http://127.0.0.1:8080/icon/web_model/transferModel.json' // icon 识别模型

// export async function predictObj() {

async function loadModel() {
    const model = await tf.loadLayersModel(TRANSFER_MOBILENET_MODEL_PATH)

    // 加载imageNet模型
    const mobilenet = await tf.loadLayersModel(MOBILENET_MODEL_PATH)
    // mobilenet.summary()
    // 截断 imageNet模型，生成我们新的 截断模型 从 conv_pw_13_relu 截断
    const layer = mobilenet.getLayer('conv_pw_13_relu')  // 获取卷积层 名称为 conv_pw_13_relu 的层
    const truncatMobileNet = tf.model({
        inputs: mobilenet.inputs,
        outputs: layer.output
    })

    return {
        model,
        truncatMobileNet
    }
}

function findIndicesOfMax(inp, count) {
    const outp = [];
    for (let i = 0; i < inp.length; i += 1) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort((a, b) => inp[b] - inp[a]); // descending sort the output array
            outp.pop(); // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
}

async function predict(image){
    // 将上传的图片展示到页面上
    // const image = await file2img(file)
    // document.body.appendChild(image)

    const {model, truncatMobileNet} = await loadModel()

    const pred = tf.tidy(() => {
        // 将上传的image图片转换成tensor并reshape
        const x = img2x(image)
        // 将图片喂给截断模型进行预测
        const input = truncatMobileNet.predict(x)
        // 将截断模型输出的结果喂给新模型预测  这个预测过程与训练过程保持一致
        return model.predict(input)
    })

    const index = pred.argMax(1).dataSync()
    const resultArr = pred.squeeze().arraySync()

    console.log(resultArr)

    const predictions = findIndicesOfMax(resultArr, 5).map(i => ({
        className: ICON_CLASSES[i],
        score: resultArr[i],
    }));

    return predictions

    console.log('predictions', predictions)
}

export {
    predict,
    loadModel
}