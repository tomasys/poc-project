/************************************************
 * A14-3P.js
 * Created at 2025. 2. 15. 오전 10:50:34.
 *
 * @author HAN
 ************************************************/
var util = createCommonUtil();
var device = null;
/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	
	util.Submit.send(app, "subRetrieve", function(){
	});
	
	device = createDevice();
	device.openConnector("target", function(msg){
		var voMsgObj = JSON.parse(msg);
		var vsServiceType = voMsgObj["service"]//ReceiveWsPush
		var vsMessage = voMsgObj["message"];
		if(vsServiceType == "ReceiveWsPush"){
			
			alert(vsMessage);
		}
	});
}

/*
 * "닫기" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	window.close();
}

/*
 * "선택" 버튼(btn2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn2Click(e){
	var btn2 = e.control;
	var msg = util.Grid.getDataRow(app, "grd1").getRowData();
	msg = JSON.stringify(msg);
	device.sendMessage("home",msg);
	
	window.close();
}
