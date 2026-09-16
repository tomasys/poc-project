/************************************************
 * P1-3-1.js
 * Created at 2025. 2. 15. 오후 1:11:12.
 *
 * @author daye
 ************************************************/

var util = createCommonUtil();

/*
 * "닫기" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	app.close();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	var voHost = app.getHost();
	if(voHost) {
		var voInitValue = app.getHostProperty("initValue");
		util.DataMap.setValue(app, "dmSpCtrt", "PRD_CD", voInitValue["PRD_CD"]);
		util.DataMap.setValue(app, "dmSpCtrt", "PRD_NM", voInitValue["PRD_NM"]);
		util.DataMap.setValue(app, "dmSpCtrt", "SAL_ST_DT", voInitValue["SAL_ST_DT"]);
		util.DataMap.setValue(app, "dmSpCtrt", "SAL_ED_DT", voInitValue["SAL_ED_DT"]);
		util.DataMap.setValue(app, "dmSpCtrt", "SP_CTRT_CD", voInitValue["SP_CTRT_CD"]);
		util.DataMap.setValue(app, "dmSpCtrt", "SP_CTRT_NM", voInitValue["SP_CTRT_NM"]);
		util.DataMap.setValue(app, "dmSpCtrt", "SP_CTRT_ST_DT", voInitValue["SP_CTRT_ST_DT"]);
		util.DataMap.setValue(app, "dmSpCtrt", "SP_CTRT_ED_DT", voInitValue["SP_CTRT_ED_DT"]);
		
		util.Control.redraw(app, "grp5");
	}
}

/*
 * "입력" 버튼(btn2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn2Click(e){
	var btn2 = e.control;
	
	var dmSpCtrt = app.lookup("dmSpCtrt");
	
	var returnValue = {
		"PRD_CD" : dmSpCtrt.getValue("PRD_CD"),
		"PRD_NM" : dmSpCtrt.getValue("PRD_NM"),
		"SAL_ST_DT" : dmSpCtrt.getValue("SAL_ST_DT"),
		"SAL_ED_DT" : dmSpCtrt.getValue("SAL_ED_DT"),
		"SP_CTRT_CD" : dmSpCtrt.getValue("SP_CTRT_CD"),
		"SP_CTRT_NM" : dmSpCtrt.getValue("SP_CTRT_NM"),
		"SP_CTRT_ST_DT" : dmSpCtrt.getValue("SP_CTRT_ST_DT"),
		"SP_CTRT_ED_DT" : dmSpCtrt.getValue("SP_CTRT_ED_DT")
	}
	
	// 입력한 정보를 부모화면에 전달
	app.close(returnValue);
}
