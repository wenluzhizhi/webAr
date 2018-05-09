let $preload = $("#preload");
let $progress = $("#progress");
let $container = $(".container");
let preload = new createjs.LoadQueue(false);


preload.on("fileload", handleFileLoad);
preload.on("complete", handleComplete, this);
preload.on("progress", handleOverallProgress, this);
preload.installPlugin(createjs.Sound);
preload.loadManifest([
	{src:"../img/scan.gif"},
    {src:"../img/mainbg.gif"},
	{src:"../img/bg.jpg"},
	{src:"../img/button.png"},
    // { id: "music", src: "http://storage.jd.com/web-static/735ef47dd77d0c8fa69b3370f59aef81.mp4"},
]);

function handleFileLoad(event) {

}

function handleComplete() {

     $preload.hide();
     $container.show();
}

function handleOverallProgress() {
    //console.log(this);
    var progress = Math.floor(preload.progress * 100);
    $("div",$progress).css("width",progress+'%');

}
