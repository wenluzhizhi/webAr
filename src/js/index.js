import WebAR from './webar';
import VConsole from './vconsole.min';
new VConsole();

const ua = navigator.userAgent.toLowerCase(),
    isAndroid = /android/i.test(ua),
    isIphone = /(iPhone|iPad|iPod|iOS)/i.test(ua),
    isWeChat = /MicroMessenger/i.test(ua);

const webAR = new WebAR(1000, '/recognize.php');
const openCamera = $("#openCamera");
const video = $('#video')[0];
let deviceId; //指定调用设备ID

if (isIphone && isWeChat) {

}

// 列出视频设备
webAR.listCamera()
    .then((videoDevice) => {
        console.log(videoDevice);
        //测了一些手机，android后置摄像头应该是数组的最后一个，苹果是第一个
        if(isAndroid){
        	console.log('android');
        	deviceId = videoDevice[videoDevice.length -1].deviceId;
        }else if(isIphone){
        	deviceId = videoDevice[0].deviceId;
        }
       
    })
    .catch((err) => {
        console.log(err);
        alert('该设备不支持打开摄像头');

    });



openCamera.on('click', function() {
    webAR.openCamera(video, deviceId)
        .then((msg) => {
            // 打开摄像头成功
            // 将视频铺满全屏(简单处理)
            window.setTimeout(() => {
                let videoWidth = video.offsetWidth;
                let videoHeight = video.offsetHeight;

                if (window.innerWidth < window.innerHeight) {
                    // 竖屏
                    if (videoHeight < window.innerHeight) {
                        video.setAttribute('height', window.innerHeight.toString() + 'px');
                    }
                } else {
                    // 横屏
                    if (videoWidth < window.innerWidth) {
                        video.setAttribute('width', window.innerWidth.toString() + 'px');
                    }
                }
            }, 500);
            openCamera.hide();
        })
        .catch((err) => {
            alert('打开视频设备失败');
        });


});