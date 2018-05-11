
import WebAR from './webar';
import VConsole from './vconsole.min';
import App from './farmerapp.js'
import * as THREE from '../libs/three.module.js';
//
//
new VConsole();
class Main {
  constructor(){
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
    this.farmerVideo;
    this.app;
    //this.app=new App();
    //this.app.update();
    this.threeContainer=$('#threecontainer');
    this.urlSearch = window.location.search;
    this.myvideo = $('#myvideo');
    //获取url参数 ?oid=xxx
    this.oid =this.getQueryString('oid') || '001';
    this.urlMap = {
      "001":"http://news.sina.com.cn/c/2012-05-28/010024488046.shtml",
      "002":"http://news.sina.com.cn/c/2012-05-28/010024488046.shtml"
    }
    this.preloader();
    this.checkCamera();
    this.start();
    this.bindEvent();
    this.initVideo();
  }

    initVideo() {
        this.myvideo.attr('playsinline', '');
        this.myvideo.attr('x5-playsinline', '');
        this.myvideo.attr('webkit-playsinline', '');
        this.myvideo.attr('autoplay', '');
        this.myvideo.attr('muted', '');
        this.myvideo[0].loop = true;
    }



  init(){

  }
  preloader(){

    let $preload = $("#preload");
    let $progress = $("#progress");
    let $container = $(".container");

    let introImg = '../img/'+this.oid+'.png';
    let video = '../resources/'+this.oid+'.mp4';

    this.preload.installPlugin(createjs.Sound);
    this.preload.on("complete", function(){
      setTimeout(function(){
        $preload.hide();
        $container.show();
      },200)
    }, this);

    this.preload.on("progress", function(){

      var progress = Math.floor(this.preload.progress * 100);
      $("div",$progress).css("width",progress+'%');

    }, this);
    this.preload.loadManifest([
      	{src:"../img/scan.gif"},
        {src:"../img/light.gif"},
        {src:"../img/button.gif"},
      	{src:"../img/mainbg.jpg"},
      	{src:"../img/button.png"},
      	// {src:"../resources/farmerpainting.mp4"},
        {src: video},
        {src: introImg}
    ]);

  }

  bindEvent(){
    //对准完成按钮
    let _this = this;
    this.scanButon.on('click', function() {
        let top = $(".scan-boder").offset().top;
        let height = $(".scan-boder").height();
        _this.app.getVideo().resetPosition(top, height);
        _this.scan();
    });

    //more
    this.moreButton.on('click',function(){
      _this.videoPanel.hide();
      _this.introPanel.show();
      _this.moreInof();
    })

    //back
    this.returnVideo.on('click',function(){
      _this.videoPanel.show();
      _this.introPanel.hide();
      _this.moreInofback();
    })

  }
  moreInof(){
    this.threeContainer.hide();
    this.farmerVideo.pause();
  }
  moreInofback(){
    this.threeContainer.show();
    this.farmerVideo.play();
  }
  start(){
    //点击体验
      let _this = this;
    this.farmerVideo = document.getElementById('myvideo');
    this.btnOpenCamera.on('click', function() {
      console.log('xx');
      _this.startPanel.hide();
      _this.setIntroInfo();
        _this.threeContainer.show();
        _this.app=new App();
        _this.app.update();

      if(_this.supportVideo){
        _this.scanPanel.show();
      }else{
        //播放视频
          _this.videoPanel.show();
          $('#video').hide();
          let top = window.innerHeight * 0.16;
          let height = window.innerHeight * 0.6;
          _this.app.getVideo().resetPosition(top, height);
          _this.scan();
      }
    });

  }
  //设置作者简介信息;
  setIntroInfo(){
    $("#myvideo").html('<source src="resources/'+this.oid+'.mp4"/>');
    $(".intro .content").html('<img src="img/'+this.oid+'.png"/>');
    $(".intro .introbutton").attr("href",this.urlMap[this.oid]);
  }
  fail(){

    //如果是iphone和weiChat 显示引导页
    if(this.iosversion.length>=2){
      this.iosversion = this.iosversion[1] >= 11;
    }
    if (this.isIphone && this.isWeChat && this.iosversion) {
        $(".ioswxPanel").show();
        return;
    }
    //不支持
    this.supportVideo = false;
  }

  scan(){
    this.scanPanel.hide();
    this.videoPanel.show();
    this.farmerVideo.play();
    this.videoPanel[0].style.background="#00000000";
    console.log("started lf app!");
  }
  openCamera(){

    console.log(this.deviceId);
    this.webAR.openCamera(this.video, this.deviceId).then((msg) => {
        // 打开摄像头成功
        // 将视频铺满全屏(简单处理)

        window.setTimeout(() => {
            let videoWidth = video.offsetWidth;
            let videoHeight = video.offsetHeight;
            // if (window.innerWidth < window.innerHeight) {
                // 竖屏
            // if (videoHeight < window.innerHeight) {
                this.video.setAttribute('height', window.innerHeight.toString() + 'px');
            // }
            // if (videoWidth < window.innerWidth) {
            //     video.setAttribute('width', window.innerWidth.toString() + 'px');
            // }
            // } else {
            //     // 横屏
            //     if (videoWidth < window.innerWidth) {
            //         video.setAttribute('width', window.innerWidth.toString() + 'px');
            //     }
            // }


        }, 500);
    }).catch((err) => {
        alert('打开视频设备失败');
    });
  }
  checkCamera(){

    let _this = this;

    this.webAR.listCamera().then((videoDevice) => {
        //测了一些手机，android后置摄像头应该是数组的最后一个，苹果是第一个
        if (_this.isAndroid) {
            _this.deviceId = videoDevice[videoDevice.length - 1].deviceId;
        } else if (_this.isIphone) {
            _this.deviceId = videoDevice[0].deviceId;
        }
        //检查成功直接开启
        _this.openCamera();
    }).catch((err) => {

        this.fail();
        //
    });
  }
getQueryString(name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}


}
new Main();
