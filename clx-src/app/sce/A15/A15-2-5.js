/************************************************
 * CMSTimePop.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2025. 4. 24..
 * @작성자 : HWPS
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/
var util = createCommonUtil();
/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 


/************************************************
 ** 글로벌 함수
 ************************************************/ 


/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 


/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 


/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * 캘린더에서 value-change 이벤트 발생 시 호출.
 * Calendar의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCdr1ValueChange(e){
	var cdr1 = e.control;
	app.lookup("grpTime").enabled = e.newValue != "";
	app.lookup("btnSelect").enabled = util.validate(app, "grpData","all",false);
}
/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onNbe1ValueChange(e){
	var nbe1 = e.control;
	app.lookup("btnSelect").enabled = util.validate(app, "grpData","all",false);
	app.lookup("btnSelect").redraw();
}

/*
 * 인풋 박스에서 before-value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장되기 전에 발생하는 이벤트. 다음 이벤트로 value-change가 발생합니다.
 */
function onIpb1BeforeValueChange(e){
	var ipb1 = e.control;
	if(e.newValue.length == 1) {
		e.preventDefault();
		ipb1.value = "0"+e.newValue;
	}
}
/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpb1ValueChange(e){
	var ipb1 = e.control;
	app.lookup("btnSelect").enabled = util.validate(app, "grpData","all",false);
	app.lookup("btnSelect").redraw();
}
/*
 * "초기화" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	
	app.lookup("cdr1").value = "";
	app.lookup("nbe1").value = "";
	app.lookup("ipb1").value = "";
}

/*
 * 버튼(btnSelect)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSelectClick(e){
	var btnSelect = e.control;
	app.close(util.DataMap.getValue(app, "dmTime", "result"));
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdb1SelectionChange(e){
	var rdb1 = e.control;
	util.Control.redraw(app, "btnSelect");
}

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	if(app.getHost()) {
		var voInitValue = app.getHostProperty("initValue");
		var vsReserveTime = voInitValue["reserve_time"];
		if(vsReserveTime){
			
			var voMoment = moment(vsReserveTime,"YYYY.MM.DD HH:mm");
			util.DataMap.setValue(app, "dmTime", "date", voMoment.format("YYYY.MM.DD"));
			util.DataMap.setValue(app, "dmTime", "minute", voMoment.format("mm"));
			var vnHour = Number(voMoment.format("HH"));
			if(vnHour > 12) {
				util.DataMap.setValue(app, "dmTime", "ampm", "pm");
				vnHour -= 12;
			}
				util.DataMap.setValue(app, "dmTime", "hour", vnHour);
			util.Control.setEnable(app, true, "grpTime");
			app.getContainer().redraw();
			app.lookup("btnSelect").enabled = true;
		}
	}
}


