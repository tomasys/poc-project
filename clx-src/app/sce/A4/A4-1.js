/************************************************
 * A31.js
 * Created at 2023. 5. 10. 오후 5:47:16.
 *
 * @author tomatosystem
 ************************************************/

/************************************************
 * 전역변수
 ************************************************/

/**
 * 
 */
var util = createCommonUtil();

/**
 * 조회액션 시작시점
 */
var maBeforeSubmit = [];

/**
 * 최종 서브미션 receive 시점
 */
var maReceive = [];

/**
 * 최초 그리드initConfig(컬럼10개짜리)
 */
var mogrdMstInitConfig;

/************************************************
 * 사용자정의함수
 ************************************************/

exports.setMask = function(psType, sourceData) {
	return ValueUtil.maskType(psType, sourceData);
}

var mbFirstLoadData = false;
/**
 * 
 * @param {String} sourceData
 */
exports.setMultiMask = function(sourceData) {
	if (sourceData.length == 16 || sourceData == 19) { // 카드번호
		return ValueUtil.maskType("CARD", sourceData);
	} else if (sourceData.length == 10) { // 사업자등록번호
		return ValueUtil.maskType("BSN", sourceData);
	} else if (sourceData.length == 13) { // 주민등록번호
		return ValueUtil.maskType("JUMIN", sourceData);
	} else {
		return sourceData;
	}
}

/************************************************
 * 컨트롤 이벤트
 ************************************************/

/*
 * "초기화" 버튼(btnRst)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRstClick(e) {
	var grdTitle = app.lookup("udcGrdPrfCnt");
	
	grdTitle.networkTime = 0;
	grdTitle.downloadTime = 0;
	grdTitle.totalTime = 0;
	grdTitle.randerTime = 0;
	util.Control.setValue(app, "totalCnt", "0");
	grdTitle.redraw();	
	
	util.Grid.reset(app, "grd1");
}

/*
 * 서브미션에서 submit-load-progress 이벤트 발생 시 호출.
 * 서버로 부터 수신된 데이터가 응답 데이터컨트롤에 부분적으로 적재되었을 때 발생합니다. 하나의 응답에 대해 여러 번 발생할 수 있습니다.
 */
function onSubListSubmitLoadProgress(e) {
	var subList = e.control;
	

	if(!mbFirstLoadData){
		var grdTitle = app.lookup("udcGrdPrfCnt");
		grdTitle.firstLoadRander();
	}
	
	if (subList.responseType === "blob") {
		var progress = app.lookup("progressbar");
		progress.value = Math.floor((parseInt(e.loaded) / parseInt(e.total)) * 100);
	}
	
	if (subList.getResponseDataCount() > 0) {
		var rowCnt = subList.getResponseData(0).data.getRowCount();
		app.lookup("totalCnt").value = rowCnt;
		mbFirstLoadData = true;
	}
}

/*
 * "조회" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click2(e) {
	var btn1 = e.control;
	
	app.lookup("btnRst").click();	
	app.lookup("totalCnt").value = 0;
	app.lookup("progressbar").value = 0;
	
	mbFirstLoadData = false;
	// 초기화	
	var grdTitle = app.lookup("udcGrdPrfCnt");
	grdTitle.resetRander();
//	grdTitle.randerTime = 0;
//	grdTitle.networkTime = 0;
//	grdTitle.downloadTime = 0;
    grdTitle.startRander();		
	var vcSubList = app.lookup("SUB_LIST");		
	vcSubList.action = app.lookup("rdbCnt").value;	
			
	vcSubList.addEventListenerOnce("receive", function(e) {
		maReceive.push(new Date().getTime());
	});
	
	// 조회액션 시작시점
	maBeforeSubmit.push(new Date().getTime());
	
	vcSubList.send().then(function(input) {				
		var progress = app.lookup("progressbar");
		progress.value = 100;
		grdTitle.endRander();
		app.lookup("totalCnt").value = app.lookup("dsLMSList").getRowCount();
		
		cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
			// 1. 네트워크 이전단 걸리는 시간(sql 이 돌아가 값을 가져오는 시간등)
			var vnBeforeNetwork = maReceive[0] - maBeforeSubmit[0];
			
			// 2. 네트워크 이후단 걸리는 시간(sql 파싱후 화면 로딩이 끝나는 시간)
			var vnAfterNetwork = new Date().getTime() - maReceive[0];
			grdTitle.randerTime = vnAfterNetwork;
			grdTitle.networkTime = vnBeforeNetwork;
			grdTitle.totalTime = new Date().getTime() - maBeforeSubmit[0];
			
			maBeforeSubmit = [];
			maReceive = [];
			
			grdTitle.redraw();
		});
		
		util.Msg.notify(app, "조회가 완료 되었습니다.");
	});	
}