/************************************************
 * A1-3.js
 * Created at 2025. 2. 11. 오후 8:59:08.
 *
 * @author daye
 ************************************************/

var util = createCommonUtil();

/**
 * 현재 일자를 기준으로 판매중인 것만 필터
 * @param {any} start
 * @param {any} end
 */
exports.validateProduct =function (start, end) {
	if(Number(start) <= Number(moment().format("YYYYMMDD")) && Number(end) >= Number(moment().format("YYYYMMDD"))) {
		return true;
	} else {
		return false;
	}
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	util.Submit.send(app, "subList", function(pbSuccess){
		if(pbSuccess) {
			var dsList = app.lookup("DS_PRDT_LIST");

			// 상품 리스트 데이터
			var voPrdtData = [];
			_.uniq(dsList.getColumnData("PRD_CD")).forEach(function(each){
				voPrdtData.push(dsList.findFirstRow("PRD_CD == '"+each+"' && SP_CTRT_CD != 'XA'").getRowData())
			});
			app.lookup("dsPrdtList").build(voPrdtData);
			app.lookup("cmbPrdt").selectItem(0);
		}
	});
	
	var vsWinTitle = window.opener ? window.opener.initValue : window.parent.initValue;
	if (vsWinTitle != undefined && vsWinTitle != null) {
		// 서브창 테마 변경 && document title 변경
		if(app.isRootAppInstance() && !app.getContainer().style.hasClass("subpage")) {
			cpr.core.Platform.INSTANCE.setDocumentTitle(vsWinTitle);

			app.getContainer().style.addClass("subpage");
			
			var voElBody = document.body;
			voElBody.setAttribute("data-xb-color", "black");
		}
	}
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbPrdtSelectionChange(e){
	var cmbPrdt = e.control;
	app.lookup("dv1").refresh();
	app.lookup("dv2").refresh();
	app.lookup("dv2").setSort("DIV_TYPE DESC");
	
	app.lookup("grd1").redraw();
	app.lookup("cmbSpPrdt").selectItem(0);
	app.lookup("udcComGridTitle1").redraw();
}

/*
 * "조회" 버튼(btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSearchClick(e){
	var btnSearch = e.control;
	
	var grd1 = app.lookup("grd1");
	
	function getType(psValue) {
		switch(psValue){
			case "value1" : // 전체
				return "";
				break;
			case "value2" : // 미지급형
				return "미지급형";
				break;
			case "value3" : // 일부지급형
				return "일부지급형";
				break;
			case "value4" : // 갱신형
				return "갱신형";
				break;
			case "value5" : // 표준형
				return "표준형";
				break;
		}
	}
	
	var cmb = app.lookup("cmb1");
	var sortValue = getType(cmb.value);
	var rdbValue = app.lookup("rdb1").value;
	var checkRowIndices = grd1.getCheckRowIndices();
	if(sortValue == "" && rdbValue == "all") {
		grd1.sort("DIV_TYPE DESC");
	} else {
		grd1.dataSet.forEachOfUnfilteredRows(function(dataRow){
			// 특약분류 정렬
			if(dataRow.getValue("SP_CTRT_NM").indexOf(sortValue) != -1) {
				dataRow.putValue("SORT", "Y");
			} else {
				dataRow.putValue("SORT", "");
			}
			
			// 선택특약여부 정렬
			if(checkRowIndices.indexOf(dataRow.getIndex()) == -1) {
				// 미선택
				var val = (rdbValue == "select") ? "" : "Y";
				dataRow.putValue("SORT2", val);
			} else {
				// 선택
				var val2 = (rdbValue == "select") ? "Y" : "";
				dataRow.putValue("SORT2", val2);
			}
		});
		
		grd1.sort("SORT DESC, SORT2 DESC");
	}
	
	
	// 특약명 검색
	var originFilter = grd1.dataSet.getFilter();
	var vsFilterVal = app.lookup("ipb1").value;
	if(ValueUtil.fixNull(vsFilterVal) == "") {
		grd1.setFilter(originFilter.split(" && SP_CTRT_NM *= '")[0]);
	} else {
		grd1.setFilter(originFilter + " && SP_CTRT_NM *= '"+app.lookup("ipb1").value+"'");
	}
	app.lookup("udcComGridTitle1").redraw();
}

/*
 * "Multi+" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	
	var vsHref = location.href;
	if(vsHref.indexOf(app.app.id) == -1) {
		vsHref += ("/ui/" + app.app.id + ".clx");
	}
	var childWin = window.open(vsHref);
	if(childWin) {
		window.initValue = app.app.title + "(서브창)";
	}
}

/*
 * "MultiTab+" 버튼(btn2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn2Click(e){
	var btn2 = e.control;
	
	var rootApp = app.getRootAppInstance();
	if(rootApp.hasAppMethod("doOpenMenuToEa")) {
		rootApp.callAppMethod("doOpenMenuToEa", app.app.id +".clx", null, {forceOpen:true,isSelect:false});
	}
}

/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onNbe1ValueChange(e){
	var nbe1 = e.control;
	
	var targetObj = e.relatedTargetObject;
	if(targetObj) {
		var voRow = targetObj.row;
		var lvl = voRow.getValue("LVL");
		if(lvl == "1") {
			// 최상위 레벨인 경우에만,
			// 값 변경 시, 	하위 레벨 일괄 값 변경
			var dv2 = app.lookup("dv2");
			dv2.findAllRow("LVL == \"2\" && DIV_TYPE == \""+voRow.getValue("DIV_TYPE")+"\"").forEach(function(each){
				each.setValue(targetObj.columnName, e.newValue);
			});
		}
	}
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGrd1RowDblclick(e){
	var grd1 = e.control;

	var rowIdx = e.rowIndex;
	var initValue = app.lookup("grd1").getRow(rowIdx).getRowData();
	if(initValue["LVL"] != "1") {
		util.Dialog.open(app, "app/sce/A1/P1-3-1", 800, -1, function(e){
			/* 팝업 close 후 처리 동작*/
			var dialog = e.control;
			
			// 팝업에서 내려받은 파라미터로 현재 화면의 데이터를 구성합니다.
			var returnValue = dialog.returnValue;
			if (returnValue) {
				util.DataSet.setValue(app, "dv2", rowIdx, "PRD_CD", returnValue.PRD_CD);
				util.DataSet.setValue(app, "dv2", rowIdx, "PRD_NM", returnValue.PRD_NM);
				util.DataSet.setValue(app, "dv2", rowIdx, "SAL_ST_DT", returnValue.SAL_ST_DT);
				util.DataSet.setValue(app, "dv2", rowIdx, "SAL_ED_DT", returnValue.SAL_ED_DT);
				util.DataSet.setValue(app, "dv2", rowIdx, "SP_CTRT_CD", returnValue.SP_CTRT_CD);
				util.DataSet.setValue(app, "dv2", rowIdx, "SP_CTRT_NM", returnValue.SP_CTRT_NM);
				util.DataSet.setValue(app, "dv2", rowIdx, "SP_CTRT_ST_DT", returnValue.SP_CTRT_ST_DT);
				util.DataSet.setValue(app, "dv2", rowIdx, "SP_CTRT_ED_DT", returnValue.SP_CTRT_ED_DT);
				
				util.Grid.setRowState(app, "grd1", cpr.data.tabledata.RowState.UPDATED, rowIdx);
			}
		}, initValue);
	}
}

/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트. 키코드 관련 상수는 {@link cpr.events.KeyCode}에서 참조할 수 있습니다.
 */
function onIpb1Keydown(e){
	if(e.keyCode == cpr.events.KeyCode.ENTER) {
		app.lookup("btnSearch").click();
	}
}
