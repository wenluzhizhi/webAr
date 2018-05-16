import WebAR from './webar';
//import VConsole from './vconsole.min';
import App from './farmerapp.js'
import * as THREE from '../libs/three.module.js';
//
//
//new VConsole();

class Main {
    constructor() {
        const ua = navigator.userAgent.toLowerCase();
        this.isAndroid = /android/i.test(ua),
            this.isIphone = /(iPhone|iPad|iPod|iOS)/i.test(ua),
            this.isWeChat = /MicroMessenger/i.test(ua),
            this.iosversion = ua.match(/os\s+(\d+)/i) || false;
        this.winHeight = window.innerHeight;
        this.webAR = new WebAR();
        this.preload = new createjs.LoadQueue(false);
        this.startPanel = $(".openPanel");
        this.scanPanel = $(".scan-panel");
        this.btnOpenCamera = $("#openCamera");
        this.video = $('#video')[0];
        this.scanButon = $(".scan-button");
        this.introPanel = $(".intro");
        this.moreButton = $(".more-button");
        this.videoPanel = $(".video-panel");
        this.returnVideo = $(".returnVideo");
        this.deviceId;
        this.supportVideo = true;
        this.app = new App();
        this.app.update();
        this.threeContainer = $('#threecontainer');
        this.urlSearch = window.location.search;
        this.myvideo = $('#myvideo');
        this.onVideoPlaying = this.onPlaying.bind(this);
        this.myvideo[0].addEventListener("playing", this.onVideoPlaying, false);
        //获取url参数 ?oid=xxx
        this.oid = this.getQueryString('oid') || '1';
        this.urlMap = {
            "1": "http://news.sina.com.cn/c/2012-05-28/010024488046.shtml",
            "2": "http://news.sina.com.cn/c/2012-05-28/010024488046.shtml"
        }
        this.preloader();
        this.checkCamera();
        this.bindEvent();

        if(this.isAndroid){
            this.resizeCallback = this.onResize.bind(this);
            window.addEventListener('resize', this.resizeCallback, false);
        }
    }

    onPlaying(){
        this.myvideo[0].pause();
    }

    /**
     * Callback for resize event
     */
    onResize() {
        console.log("window height = " + window.innerHeight);
        this.video.style.height = window.innerHeight + "px";
    }

    preloader() {
        let $preload = $("#preload");
        let $progress = $("#progress");
        let $container = $(".container");

        let introImg = 'img/' + this.oid + '.png';
        let video = 'resources/' + this.oid + '.mp4';
        this.setIntroInfo();
        this.preload.installPlugin(createjs.Sound);
        this.preload.on("complete", function () {
            setTimeout(function () {
                $preload.hide();
                $container.show();
            }, 200)
        }, this);

        this.preload.on("progress", function () {

            var progress = Math.floor(this.preload.progress * 100);
            $("div", $progress).css("width", progress + '%');

        }, this);
        this.preload.loadManifest([
            {src: "img/scan.gif"},
            {src: "img/light.gif"},
            {src: "img/button.gif"},
            {src: "img/mainbg.jpg"},
            {src: "img/button.png"},
            {src: video},
            {src: introImg}
        ]);

    }

    checkCamera() {
        let _this = this;
        this.webAR.listCamera().then((videoDevice) => {
            //测了一些手机，android后置摄像头应该是数组的最后一个，苹果是第一个
            if (_this.isAndroid) {
                _this.deviceId = videoDevice[videoDevice.length - 1].deviceId;
            } else if (_this.isIphone) {
                _this.deviceId = videoDevice[0].deviceId;
            }
            //检查成功直接开启
            //_this.openCamera();
        }).catch((err) => {
            this.fail();
        });
    }

    //4个按钮的事件绑定
    bindEvent() {
        //对准完成按钮
        let _this = this;

        //点击体验
        this.btnOpenCamera.on('click', function () {
            _this.startPanel.hide();
            if (_this.supportVideo) {
                _this.myvideo[0].play();
                _this.openCamera();
                _this.scanPanel.show();
            } else {
                //播放视频
                _this.videoPanel.show();
                $('#video').hide();
                let top = window.innerHeight * 0.16;
                let height = window.innerHeight * 0.6;
                _this.app.getVideo().show(top, height);
                _this.scan();
            }
        });

        //点击对准完成
        this.scanButon.on('click', function () {
            let top = $(".scan-boder").offset().top;
            let height = $(".scan-boder").height();
            _this.app.getVideo().show(top, height);
            _this.scan();
        });

        //点击了解更多
        this.moreButton.on('click', function () {
            _this.videoPanel.hide();
            _this.introPanel.show();
            _this.app.getVideo().hide();
            //个人介绍页页面支持滚动
            $("html").addClass("introPage");
            _this.myvideo[0].pause();
        })

        //点击返回观看
        this.returnVideo.on('click', function () {
            if(_this.supportVideo) {
                _this.videoPanel.hide();
                _this.introPanel.hide();
                //删除页面滚动
                $("html").removeClass("introPage");
                _this.scanPanel.show();
            }
            else{
                _this.introPanel.hide();
                let top = window.innerHeight * 0.16;
                let height = window.innerHeight * 0.6;
                _this.app.getVideo().show(top,height);
                _this.scan();
            }
        })
    }
    //设置作者简介信息;
    setIntroInfo() {
        $("#myvideo").html('<source src="resources/' + this.oid + '.mp4"/>');
        $(".intro .content").html('<img src="img/' + this.oid + '.png"/>');
        $(".intro .introbutton").attr("href", this.urlMap[this.oid]);
    }

    fail() {

        //如果是iphone和weiChat 显示引导页
        if (this.iosversion.length >= 2) {
            this.iosversion = this.iosversion[1] >= 11;
        }
        if (this.isIphone && this.isWeChat && this.iosversion) {
            $(".ioswxPanel").show();
            return;
        }
        //不支持
        this.supportVideo = false;
    }

    scan() {
        // this.threeContainer.show();
        this.moreButton.show();
        this.scanPanel.hide();
        this.videoPanel.show();
        $("html").removeClass('introPage');
        this.myvideo[0].removeEventListener("playing", this.onVideoPlaying);
        this.myvideo[0].play();
        this.videoPanel.css("background", "none");
        console.log("started lf app!");
    }

    openCamera() {

        console.log(this.deviceId);
        this.webAR.openCamera(this.video, this.deviceId).then((msg) => {
            // 打开摄像头成功
            // 将视频铺满全屏(简单处理)
            video.setAttribute('height', window.innerHeight.toString() + 'px');
        }).catch((err) => {
            alert('打开视频设备失败');
        });
    }

    getQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }


}

new Main();
