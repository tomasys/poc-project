/************************************************
 * CMSMngPage.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2025. 4. 7..
 * @작성자 : HWPS
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 
var util = createCommonUtil();

/************************************************
 ** 글로벌 함수
 ************************************************/ 
var mcInsertTargetCtrl = null;

/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 
var voTypes = {
	"summary" : udc.stock.mng.udcMngSummary,
	"chart": udc.stock.mng.udcMngChart,
	"subtitle": udc.stock.mng.udcMngSubtitle,
	"text": udc.stock.mng.udcMngText,
	"table": udc.stock.mng.udcMngTable,
	"caution": udc.stock.mng.udcMngCaution,
	"main": udc.stock.mng.udcMngMain,
	"image": udc.stock.mng.udcMngImage,
	"title": udc.stock.mng.udcMngTitle,
	"content": udc.stock.mng.udcMngText,
	"subTitle": udc.stock.mng.udcMngSubtitle
}

/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/
/**
 * seq로 게시판 상세 조회시 아이템을 추가하는함수
 */
function updateCMS(){ 
	
	var vcGrpData = app.lookup("grpData");
	var vcDsCont =  app.lookup("dsContent");
	var vcDsSub = app.lookup("dsSub");
	var vnRowCount = vcDsCont.getRowCount();
	for(var i=0; i< vnRowCount; i++) {
		var each = vcDsCont.getRow(i);
		var vsType= each.getValue("type");
		var voConstruct=  voTypes[vsType];
		/** @type cpr.controls.UIControl */
		var vcControl = new voConstruct();
		var voSettingData = {
			"value" : each.getValue("value")
		}
		if(each.getValue("hasSub") == "Y") {
			vcDsSub.bindParentRow(each);
			voSettingData["sub_value"] = vcDsSub.getRowDataRanged();
		}
		if(vcControl.hasAppMethod("setData")){
			vcControl.setData(voSettingData);
		}
		
		vcControl.addEventListener("mng-delete", function(ev){ 
			var children = app.lookup("grpData").getChildren();
			var index = children.indexOf(ev.control);
			app.lookup("dsContent").realDeleteRow(index-1);
			ev.control.dispose();
			
		});
		vcControl.addEventListener("mouseenter", function(ev){
			var targetCtrl = ev.control;
			mcInsertTargetCtrl = targetCtrl;
			var vcCont = targetCtrl.getParent();
			app.lookup("grpAdd").visible =true;
			vcCont.floatControl(app.lookup("grpAdd"),{
				bottom: "2px",
//				top: targetCtrl.getOffsetRect().bottom+2+"px",
				left: "8px",
				right: "8px",
				height: "32px"
			});
		});
		var voConstraint = {
			autoSize: "height"
		};
		if(vsType == "text") {
			voConstraint = {
				height : "400px"
			}
		}
		if(vsType == "table") {
			voConstraint = {
				height: '500px'
			}
		}
		vcGrpData.insertChild(vcGrpData.getChildren().length, vcControl,voConstraint);
	}
		app.lookup("mngMain").setData(app.lookup("dmResult").getDatas());
}

/**
 * 추가버튼을 통해 새 컨텐츠를 생성하는 함수
 * @param {String} psType
 * @param {Number} pnIndex
 */
function insertContent(psType,pnIndex){
	var voConstruct=  voTypes[psType];
	/** @type cpr.controls.UIControl */
		var vcControl = new voConstruct();
		vcControl.addEventListener("mng-delete", function(ev){
			var children = app.lookup("grpData").getChildren();
			var index = children.indexOf(ev.control);
			app.lookup("dsContent").realDeleteRow(index-1);
			ev.control.dispose();
			
		});
		vcControl.addEventListener("mouseenter", function(ev){
			var targetCtrl = ev.control;
			mcInsertTargetCtrl = targetCtrl;
			var vcCont = targetCtrl.getParent();
			app.lookup("grpAdd").visible =true;
			vcCont.floatControl(app.lookup("grpAdd"),{
				top: targetCtrl.getOffsetRect().bottom+2+"px",
				left: "18px",
				right: "18px",
				height: "28px"
			});
		});
		var voConstraint = {
			autoSize: "height"
		};
		if(psType == "text") {
			voConstraint = {
				height : "400px"
			}
		}
		if(psType == "table") {
			voConstraint = {
				height: '500px'
			}
		}
		app.lookup("dsContent").insertRowData(pnIndex, false,{
			type: psType
		})
		app.lookup("grpData").insertChild(pnIndex+1, vcControl,voConstraint);
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
	var vsSeq = "";
	if (app.getHost()) {
		
		var voInitValue = app.getHostProperty("initValue");
		if (voInitValue) {
			
			vsSeq = voInitValue["seq"];
			getData(Number(vsSeq),function(data){
//				var parsed = JSON.parse(res);
				var parsed = data;
				app.lookup("dmResult").build(parsed);
				var datas = data["jsonData"];
				/** @type Array */
				var jsonData = JSON.parse(datas);
				var vcDsContent = app.lookup("dsContent");
				var vcDsSub = app.lookup("dsSub");
				//		vcDsContent.pushRowData({type: "Main"})
				jsonData.forEach(function(each, idx) {
					var row = vcDsContent.pushRowData(each);
					row.putValue("id", idx);
					if (row.getValue("hasSub") == "Y") {
						/** @type Array */
						var vaSubValue = each["sub_value"];
						vcDsSub.bindParentRow(row);
						vaSubValue.forEach(function(eachSub) {
							vcDsSub.pushRowData(eachSub);
						});
					}
				});
				updateCMS();
			});
//			app.lookup("subRealList").addFileParameter("seq", vsSeq);
//			//	util.Submit.addFileParameter(app, "subRealList", blobs);
//			util.Submit.send(app, "subRealList", function(pbSuccess, sub) {
//				var res = sub.xhr.responseText;
//				var parsed = JSON.parse(res);
//				var data = app.lookup("dmResult").getValue("jsonData");
//				/** @type Array */
//				var jsonData = JSON.parse(data);
//				var vcDsContent = app.lookup("dsContent");
//				var vcDsSub = app.lookup("dsSub");
//				//		vcDsContent.pushRowData({type: "Main"})
//				jsonData.forEach(function(each, idx) {
//					var row = vcDsContent.pushRowData(each);
//					row.putValue("id", idx);
//					if (row.getValue("hasSub") == "Y") {
//						/** @type Array */
//						var vaSubValue = each["sub_value"];
//						vcDsSub.bindParentRow(row);
//						vaSubValue.forEach(function(eachSub) {
//							vcDsSub.pushRowData(eachSub);
//						});
//					}
//				});
//				updateCMS();
//			});
		}
	}
	app.lookup("mngMain").addEventListener("mouseenter", function(ev){
			var targetCtrl = ev.control;
			mcInsertTargetCtrl = targetCtrl;
			var vcCont = targetCtrl.getParent();
			app.lookup("grpAdd").visible =true;
			vcCont.floatControl(app.lookup("grpAdd"),{
				top: targetCtrl.getOffsetRect().bottom+2+"px",
				left: "18px",
				right: "18px",
				height: "28px"
			});
		});
}

/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrd1CellClick(e){
	var grd1 = e.control;
	var vnIndex = grd1.getSelectedRowIndex();
	var vcGrp = app.lookup("grpData");
	var children = vcGrp.getChildren();
	/** @type cpr.controls.UIControl */
	var vcTarget = children[vnIndex+1];
	vcGrp.scrollTo(0,vcTarget.getOffsetRect().top,0.5,cpr.animation.TimingFunction.EASE_OUT);
}

/*
 * "+" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	util.Dialog.open(app, "app/sce/A15/A15-2-3", 400, 600, function(ev){
		var dialog = ev.control;
	},{
		"dataset" : app.lookup("dsContent"),
		"container":app.lookup("grpData")
	});
}

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(e){
	var button = e.control;
	app.lookup("grpEdit").addChild(app.lookup("grpAdd"), {
		rowIndex: 1,colIndex: 0
	});
	var result = app.lookup("grpData").getChildren().map(function(each){
		if(each.getData){
			return each.getData();
		} else {
			return {}
		}
	});
	
	var voMain = result.shift();
	/** @type Object */
	var resultData = voMain["value"];
	resultData["jsonData"] = JSON.stringify(result);
	if(Object.keys(app.getHostProperty("initValue")).length > 0) {
		resultData["seq"] = Number(app.getHostProperty("initValue")["seq"]);
		updateData(Number(app.getHostProperty("initValue")["seq"]),resultData);
	} else {
		if(resultData.hasOwnProperty("seq")) {
			delete resultData["seq"];
		}
		resultData["cc_viewtype"] = "N";
		resultData["viewcnt"] = 0
		resultData["dt_regdate"] = moment().format("YYYY.MM.DD");
		addData(resultData);
	}
	
}

/*
 * 그룹에서 mouseleave 이벤트 발생 시 호출.
 * 사용자가 컨트롤 및 컨트롤의 자식 영역 바깥으로 마우스 포인터를 이동할 때 발생하는 이벤트.
 */
function onGrpDataMouseleave(e){
	var grpData = e.control;
	app.lookup("grpAdd").visible = false;
}

/*
 * 버튼(btnInsert)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnInsertClick(e){
	var btnInsert = e.control;
	util.Dialog.open(app, "app/sce/A15/A15-2-4", 600, 400, function(ev){
		var dialog =ev.control;
		/** @type Array */
		var vaReturnValue = dialog.returnValue;
		if(vaReturnValue) {
			vaReturnValue.reverse().forEach(function(each,idx){
				var vnIndex = mcInsertTargetCtrl.getParent().getChildren().indexOf(mcInsertTargetCtrl);
				insertContent(each["type"],vnIndex);
			});
		}
	});
}

/*
 * "미리보기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	
	var data = app.lookup("grpData").getChildren().filter(function(each){
		return !each.isFloated();
	}).map(function(each){
		return each.getData();
	});
	
	app.lookup("ea1").app = null;
	var previewPage = cpr.core.App.load("app/sce/A15/A15-2-2", function(loadedApp){
		app.lookup("ea1").app = loadedApp;
		app.lookup("ea1").initValue = data;
	});
}