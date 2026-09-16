/************************************************
 * screenLayout.js
 * Created at 2023. 2. 27. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/
var util = createCommonUtil();

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	var vaErrorLog=  getLog();
	var txa = app.lookup("txa1");
	
	vaErrorLog.forEach(function(each){
		
		var evt = each;
		txa.value = txa.value + "DEBUG : "+ moment(new Date(evt.timeStamp)).format("YYYYMMDD HH:mm:ss")
		+", type:" + evt.type + "  at " + evt.targetControl.getAppInstance().id+  "   on "+ evt.targetControl.type+ " Control \n";
		
	});
}

/*
 * "로그 출력" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	var vsErrorLog = app.lookup("txa1").value;
	var blobs = new Blob([vsErrorLog],{type:"text/plain"});
	var url = URL.createObjectURL(blobs);
	var atag = document.createElement("a");
	atag.href = url;
	atag.download = moment().format("YYYYMMDD_HHmmss_sss")+"_log.txt";
	
	atag.click();
	URL.revokeObjectURL(url);
}
