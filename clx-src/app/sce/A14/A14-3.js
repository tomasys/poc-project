/************************************************
 * A7-2.js
 * Created at 2025. 2. 12. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/
var util = createCommonUtil();
var device =null;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	if(device == null) {
		
		device = createDevice();
		
		device.openConnector("home", function(msg) {
			var voMsgObj = JSON.parse(msg);
			var vsServiceType = voMsgObj["service"]//ReceiveWsPush
			var voMessage = voMsgObj["message"];
			if(vsServiceType == "ReceiveWsPush"){
				
				app.lookup("dm1").build(voMessage);
				util.Control.redraw(app, "grpForm");
			}
		});
	}
}
/*
 * "Button" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	device.setBrowserUri(app.lookup("rdb1").value);
	device.openBrowser();
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdb1SelectionChange(e){
	var rdb1 = e.control;
	var vbDirect = rdb1.value == "";
	app.lookup("ipbUri").visible=  vbDirect;
	if(vbDirect) {
		device.setBrowserUri(app.lookup("ipbUri").value);
	} else {
		device.setBrowserUri(rdb1.value);
	}
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpbUriValueChange(e){
	var ipbUri = e.control;
	device.setBrowserUri(ipbUri.value);
}
