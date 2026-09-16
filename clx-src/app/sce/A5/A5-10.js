/************************************************
 * N1-6.js
 * Created at 2025. 8. 1. 오후 4:33:40.
 *
 * @author dyseo
 ************************************************/

/************************************************
 ** 공통모듈
 ************************************************/
var util = createCommonUtil();

/************************************************
 ** 글로벌 변수, 전역변수
 ************************************************/

/************************************************
 ** 사용자 정의 함수
 ************************************************/

/************************************************
 ** 컨트롤 이벤트
 ************************************************/
/*
 * "출력 정보 설정" 버튼(btnSetting)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSettingClick(e){
	var btnSetting = e.control;
	util.Dialog.open(app, "app/sce/A5/A5-10P", 600, -1, function(e) {
		/* 팝업 close 후 처리 동작*/
		var dialog = e.control;
		
		/** @type cpr.data.DataMap */
		var returnValue = dialog.returnValue;
		if (returnValue) {
			returnValue.copyToDataMap(app.lookup("dmPrintInfo"));
		}
		
	}, app.lookup("dmPrintInfo"));
}

/*
 * "출력" 버튼(btnPrint4)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPrint4Click(e){
	var btnPrint4 = e.control;
	var btn2 = e.control;
	var dmPrintInfo = app.lookup("dmPrintInfo");
	var info = [];
	var office = dmPrintInfo.getValue("office");
	var dateYn = dmPrintInfo.getValue("dateYn");
	var name = dmPrintInfo.getValue("name");
	
	if (office) info.push({
		"사무소명": office
	});
	if (dateYn) info.push({
		"출력일시": dateYn
	});
	if (name) info.push({
		"출력자명": name
	});
	
	printGrid([app.lookup("grdList")], {
		title: dmPrintInfo.getValue("title"),
		approvalLine: dmPrintInfo.getValue("approval"),
		approvalLocation: dmPrintInfo.getValue("approvalLocation"),
		info: info
	});
}
