/************************************************
 * H3-4.js
 * Created at 2025. 4. 21. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/

const util = createCommonUtil();

/*
 * "데이터 확인" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	
	const voModData = app.lookup("dsRadar").getRowDatasByState(cpr.data.tabledata.RowState.UPDATED);
	if(!Object.keys(voModData).length){
		util.Msg.alertDlg(app, "변경된 데이터가 없습니다.");
		return false;
	}
	
	util.Dialog.open(app, "app/sce/A3/P3-10", 700, -1, null, voModData);	
}

/*
 * 사용자 정의 컨트롤에서 update 이벤트 발생 시 호출.
 */
function onRadarChartUpdate(e){
	const radarChart = e.control;
	
	/* 차트 업데이트 이벤트 */
	//console.info("방사형 차트 데이터 변경 : \n", e.userData);
}

/*
 * 사용자 정의 컨트롤에서 update 이벤트 발생 시 호출.
 */
function onBarChartUpdate(e){
	const barChart = e.control;
	
	/* 차트 업데이트 이벤트 */
	//console.info("막대그래프 차트 데이터 변경 : \n", e.userData);
}