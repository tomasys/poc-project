/************************************************
 * P1-1-4.js
 * Created at 2025. 2. 12. 오후 1:52:08.
 *
 * @author daye
 ************************************************/

/*
 * 사용자 정의 컨트롤에서 report-load 이벤트 발생 시 호출.
 */
function onUdcclipreport1ReportLoad(e){
	var report = e.control;
	
	var initValue = app.getHostProperty("initValue");
		if(initValue) {
			var fileName = initValue["fileName"];
			switch(fileName){
				case "인입시간대별 분포":
					report.filePath = "dblife/data1.crf";
					break;
				case "상담유형별 분포":
					report.filePath = "dblife/data2.crf";
					break;
				case "상담사-상담유형별 분포":
					report.filePath = "dblife/data3.crf";
					break;
				case "상담유형-계약번호별 분포":
					report.filePath = "dblife/data4.crf";
					break;
			}
			
			var vcDataset = initValue["dataSet"];
			if(vcDataset && (vcDataset instanceof cpr.data.DataSet)) {
				var dmParam = app.lookup("dmParam");
				var paramCol = [];
				var paramData = {};
				vcDataset.getRowDataRanged().forEach(function(eachRow, i){
					vcDataset.getColumnNames().forEach(function(each, idx){
						var key = "PARAM"+idx+"_"+i;
						paramCol.push({"name": key});
						paramData[key] = eachRow[each];
					});
				});
				dmParam.parseData({
					columns: paramCol,data: paramData
				});
				report.datamapProp = dmParam;
			}
			
			report.start();
		} else {
			report.start();
		}
}
