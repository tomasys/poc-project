/************************************************
 * CMSPreview.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2025. 4. 8..
 * @작성자 : HWPS
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 


/************************************************
 ** 글로벌 함수
 ************************************************/ 


/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 
var mnSummaryIndex = 0;

/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 
function createContent () {
	
}

function createMain(poData){
	var data = poData.value;
	var file = poData.file;
	
	var group_1 = new cpr.controls.Container();
			var verticalLayout_2 = new cpr.controls.layouts.VerticalLayout();
			group_1.setLayout(verticalLayout_2);
			(function(container){
				var output_1 = new cpr.controls.Output();
				output_1.value = data.title;
				output_1.style.setClasses(["tit", "h3"]);
				container.addChild(output_1, {
					"autoSize": "height",
					"width": "100px",
					"height": "69px"
				});
				var group_2 = new cpr.controls.Container();
				var formLayout_1 = new cpr.controls.layouts.FormLayout();
				formLayout_1.scrollable = false;
				formLayout_1.horizontalSpacing = "8px";
				formLayout_1.verticalSpacing = "8px";
				formLayout_1.topMargin = "0px";
				formLayout_1.rightMargin = "0px";
				formLayout_1.bottomMargin = "0px";
				formLayout_1.leftMargin = "0px";
				formLayout_1.setColumns(["100px", "1fr"]);
				formLayout_1.setRows(["1fr"]);
				group_2.setLayout(formLayout_1);
				(function(container){
					var output_2 = new cpr.controls.Output();
					output_2.value = data.dt_regdate;
					output_2.style.addClass("text-gray-500");
					container.addChild(output_2, {
						"colIndex": 0,
						"rowIndex": 0
					});
					var output_3 = new cpr.controls.Output();
					output_3.style.addClass("text-gray-500");
					output_3.value = data.penname;
					container.addChild(output_3, {
						"colIndex": 1,
						"rowIndex": 0
					});
				})(group_2);
				container.addChild(group_2, {
					"width": "400px",
					"height": "20px"
				});
				var output_4 = new cpr.controls.Output();
				output_4.value = "";
				container.addChild(output_4, {
					"width": "100px",
					"height": "20px"
				});
				var image_1 = new cpr.controls.Image();
				if(data.fname) {
					image_1.src = data.dir+ data.fname;
				} else if(file){
					var reader = new FileReader();
					reader.onload = function(res) {
						image_1.src = res.target.result;
						image_1.redraw();
					};
					reader.readAsDataURL(file);
				}
				container.addChild(image_1, {
					autoSize:"height"
				});
			})(group_1);
			app.getContainer().addChild(group_1, {
				"autoSize": "height",
			});
}

function createSummary(poData){
	var voData = poData;
	var vaArr = [{value:voData.value}];
	if(voData["hasSub"] && voData["hasSub"] =="Y") {
		vaArr = vaArr.concat(voData["sub_value"]);
	}
	var vbSkel = false;
	if(!voData["value"]) {
		vbSkel =  true;
	}
	var tempDs = new cpr.data.DataSet();
			tempDs.parseData({
				"columns": [{"name": "value"}],
			});
			tempDs.build(vaArr);
			app.register(tempDs);
	var group_3 = new cpr.controls.Container();
			group_3.style.setClasses(["border-t-2", "border-solid", "border-black"]);
			if(vbSkel) {
				group_3.style.addClass("skeleton");
			}
			var formLayout_2 = new cpr.controls.layouts.FormLayout();
			formLayout_2.scrollable = false;
			formLayout_2.horizontalSpacing = "8px";
			formLayout_2.verticalSpacing = "8px";
			formLayout_2.topMargin = "0px";
			formLayout_2.rightMargin = "0px";
			formLayout_2.bottomMargin = "0px";
			formLayout_2.leftMargin = "0px";
			formLayout_2.setColumns(["0px", "1fr"]);
			formLayout_2.setColumnAutoSizing(0, true);
			formLayout_2.setRows(["1fr"]);
			group_3.setLayout(formLayout_2);
			(function(container){
				var grid_1 = new cpr.controls.Grid();
				grid_1.init({
					"dataSet": tempDs,
					"autoRowHeight": "all",
					"columns": [{"width": "100px"}],
					"detail": {
						"rows": [{"height": "32px"}],
						"cells": [{
							"constraint": {"rowIndex": 0, "colIndex": 0},
							"configurator": function(cell){
								cell.columnName = "value";
								cell.control = (function(){
									var output_5 = new cpr.controls.Output();
									output_5.style.css({
										"text-align" : "left"
									});
									output_5.style.bindClass().toExpression("rowIndex == 0 ? \"tit h5\" : \"text-gray-500\"");
									output_5.bind("value").toDataColumn("value");
									return output_5;
								})();
								cell.controlConstraint = {
									"topSpacing": 8,
									"rightSpacing": 0,
									"bottomSpacing": 8,
									"leftSpacing": 0
								};
							}
						}]
					}
				});
				grid_1.style.setClasses(["table-white", "row-top"]);
				container.addChild(grid_1, {
					"colIndex": 1,
					"rowIndex": 0
				});
				var output_6 = new cpr.controls.Output();
				output_6.value = "0"+mnSummaryIndex;
				output_6.style.setClasses(["tit", "h5"]);
				container.addChild(output_6, {
					"colIndex": 0,
					"rowIndex": 0,
					"verticalAlign": "top",
					"height": 32,
					"topSpacing": 8
				});
			})(group_3);
			app.getContainer().addChild(group_3, {
				"autoSize": "height",
			});
}

/**
 * 
 * @param {{type:String,chartType:String,xAxis:String,yAxis:String,title:String,data:Array}} poData
 */
function createChart(poData) {
	var vcChart = new udc.stock.chart.udcCmnChart();
	try{
		
		var voSubValue = JSON.parse(poData["sub_value"][0]["value"]);
		vcChart.categoryColNm = voSubValue.xAxis;
		vcChart.valueColNms = voSubValue.yAxis;
		vcChart.chartType = voSubValue.chartType;
		vcChart.title = poData.value;
		vcChart.titlePosition = voSubValue["posiVer"]+"-"+voSubValue["posiHori"]
		var ds = new cpr.data.DataSet();
		ds.parseData({
	    alterColumnLayout: "merge"});
		ds.build(JSON.parse(voSubValue.data));
		vcChart.dataSet = ds;
		vcChart.drawChart();
		app.getContainer().addChild(vcChart, {
					"height": "400px",
				});
	}catch(e){
		console.log(e);
	}
//	type:"chart",
//		chartType:app.lookup("cmbType").value,
//		xAxis: app.lookup("ipbXAxis").value,
//		yAxis: app.lookup("ipbYAxis").value,
//		data : app.lookup("txaData").value
}
function createTitle(poData){
	var output = new cpr.controls.Output();
	output.value = poData["value"];
	output.style.setClasses(["cms-title"]);
	app.getContainer().addChild(output, {
		"autoSize": "height"
	});
}

function createSubtitle(poData) {
	var output_1 = new cpr.controls.Output();
	output_1.value = poData["value"];
	output_1.style.setClasses(["cms-subtitle"]);
	app.getContainer().addChild(output_1, {
		"autoSize": "height",
	});
}

function createText(poData) {
	var hTMLSnippet_1 = new cpr.controls.HTMLSnippet();
	hTMLSnippet_1.value = poData["value"];
	app.getContainer().addChild(hTMLSnippet_1, {
		"autoSize": "height",
	});
}

function createImage(poData){
	var vcImage = new cpr.controls.Image();
	if(poData.value instanceof File) {
		var fileReader = new FileReader();
	
		fileReader.onload = function(res) {
			var text = res.target.result;
			vcImage.src = text;
		};
		fileReader.readAsDataURL(poData.value);
	} else {
		vcImage.src = getStaticUrl()+poData.value;
	}
	app.getContainer().addChild(vcImage, {
		"autoSize": "height"
	});
}
function createCaution(poData){
	var voData = poData;
	var vaSubs = [];
	if(voData["hasSub"] && voData["hasSub"]=="Y") {
		vaSubs = voData["sub_value"];
	}
	var accordion_1 = new cpr.controls.Accordion();
			accordion_1.style.setClasses(["acc-caution"]);
			var sectionItem_1 = new cpr.controls.SectionItem();
			sectionItem_1.title = "꼭!확인해주세요";
			(function(item){
				var group_1 = new cpr.controls.Container();
				var verticalLayout_2 = new cpr.controls.layouts.VerticalLayout();
				group_1.setLayout(verticalLayout_2);
					vaSubs.forEach(function(each){
						var output_1 = new cpr.controls.Output();
						output_1.value = each["value"];
						group_1.addChild(output_1, {
							"autoSize": "height",
						});
						
					});
				item.content = group_1;
			})(sectionItem_1);
			accordion_1.addSection(sectionItem_1);
			app.getContainer().addChild(accordion_1, {
				"autoSize": "height",
				"width": "200px",
				"height": "300px"
			});
}

function createTable(poData){
	var group_1 = new cpr.controls.Container();
			var verticalLayout_2 = new cpr.controls.layouts.VerticalLayout();
			verticalLayout_2.spacing = 16;
			group_1.setLayout(verticalLayout_2);
			(function(container){
				var output_1 = new cpr.controls.Output();
				output_1.value = poData["value"];
				output_1.style.setClasses(["tit", "h5"]);
				container.addChild(output_1, {
					"autoSize": "height",
					"width": "100px",
					"height": "20px"
				});
				var hTMLSnippet_1 = new cpr.controls.HTMLSnippet();
				hTMLSnippet_1.value = poData["sub_value"][0]["value"];
				container.addChild(hTMLSnippet_1, {
					"autoSize": "height",
					"width": "1532px",
					"height": "20px"
				});
			})(group_1);
			app.getContainer().addChild(group_1, {
				"autoSize": "height",
				"width": "1532px",
				"height": "400px"
			});
}


/**
 * 
 * @param {Array} paDetail
 */
function createCMSDetail(paDetail){
	
	if(paDetail) {
		paDetail.forEach(function(each){
			var vsType = each.type;
			switch(vsType){
				case "main" :
					createMain(each);
					break;
				case "summary":
					mnSummaryIndex++;
					createSummary(each);
					break;
				case "chart":
					createChart(each);
					break;
				case "subtitle":
					createSubtitle(each);
					break;
				case "text":
					createText(each);
					break;
				case "title":
					createTitle(each);
					break;
				case "image":
					createImage(each);
					break;
				case "caution":
					createCaution(each);
					break;
				case "table":
					createTable(each);
					break;
				default :
					break;
			}
		});
	}
}
/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	
	var voHost = app.getHost();
	if(!voHost) {
		return;
	}
	var initValue = app.getHostProperty("initValue");
	if(initValue instanceof Array) {
		createCMSDetail(initValue);
	} else {
		getData(Number(initValue["seq"]), function(data){
			var voData = data;
			var jsons = voData['jsonData'];
			delete voData["jsonData"];
			var voMainData = {
				"type": "main",
				"value": voData
			}
			/** @type Array */
			var vaArr = JSON.parse(jsons);
			vaArr.unshift(voMainData);
			createCMSDetail(vaArr);
		});
	}
}
