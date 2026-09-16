/************************************************
 * CMSTableList.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2025. 4. 10..
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


/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 


/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 
function getData(){
	getAllData(function(datas){
		var vaData = datas;
		app.lookup("dsList").build(vaData);
		app.lookup("grdList").setFilter("getIndex() < 10");
		app.lookup("grdList").redraw();
		var vnLength = vaData.length;
		app.lookup("pgi1").totalRowCount = vnLength;
		app.lookup("pgi1").redraw();
		
	});
}

/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/


/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
//	util.Submit.addFormParameter(app, "subList", "pageVal", app.lookup("pgi1").currentPageIndex);
//	util.Submit.send(app, "subList", function(){
//		app.lookup("pgi1").totalRowCount = util.DataMap.getValue(app, "dmPagingParam", "TOTALNUM");
//		app.lookup("grdList").insertRow(1, true);
//		app.lookup("grdList").insertRowData(1, true,{
//			"cc_viewtype" : "N",
//			"reserve_time": "2024.10.28 08:00"
//		});
////		app.lookup("grdList").setEditRowIndex(0);
//	});

	getData();
}
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrdListCellClick(e){
	var grdList = e.control;
	var vnRowIndex = e.rowIndex;
	var voRow =grdList.getRow(vnRowIndex);
	switch(e.cellIndex){
		case 7 :
			if(voRow.getValue("reserve_time")!= "") {
				break;
			}
			var ccType = voRow.getValue("cc_viewtype");
			var vsNewValue = ccType =="J" ? "N" : "J";
			voRow.setValue("cc_viewtype", vsNewValue);
			updateData(voRow.getValue("seq"), {
				"cc_viewtype" : vsNewValue
			});
			break;
		case 3 : case 4:
			if(voRow.getValue("cc_viewtype") =="J") {
				break;
			}
			util.Dialog.open(app, "app/sce/A15/A15-2-5", 500, 640, function(ev){
				var dialog = ev.control;
				var vsReturnValue = dialog.returnValue;
				if(vsReturnValue) {
					voRow.setValue("reserve_time", vsReturnValue);
					updateData(voRow.getValue("seq"),{
						"reserve_time": vsReturnValue
					})
				}
			},{
				"reserve_time" : voRow.getValue("reserve_time")
			});
			break;
		case 5 :
			util.Msg.confirmDlg(app, "설정된 예약을 삭제하시겠습니까?", null, {
				confirmCallback: function(){
					updateData(voRow.getValue("seq"),{
						"reserve_time": ""
					});
					getData();
				}
			});
			break;
		case 1 :
			util.Dialog.openFullInPage(app, "app/sce/A15/A15-2-1", function(ev){
				
			},{
				"seq" : voRow.getValue("seq")
			})
		default :
			break;
	}
}

/*
 * "글쓰기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	util.Dialog.openFullInPage(app, "app/sce/A15/A15-2-1", function(ev){
		getData();		
	});
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPgi1SelectionChange(e){
	var pgi1 = e.control;
	var vnSelIndex = pgi1.currentPageIndex;
	var vnPageRowCnt = pgi1.pageRowCount;
	
	app.lookup("grdList").setFilter("getIndex() < "+(vnPageRowCnt*vnSelIndex)+"&& getIndex() >= "+ vnPageRowCnt*(vnSelIndex-1));
//		util.Submit.addFormParameter(app, "subList", "pageVal", app.lookup("pgi1").currentPageIndex);
//	util.Submit.send(app, "subList", function(){
//		app.lookup("pgi1").totalRowCount = util.DataMap.getValue(app, "dmPagingParam", "TOTALNUM");
//	});
}

/*
 * "선택삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	var vaChecked = util.Grid.getCheckOrSelectedRowIndex(app, "grdList");
	
	if(vaChecked.length) {
		vaChecked.forEach(function(each){
			
			deleteData(util.Grid.getDataRow(app, "grdList",each).getValue("seq"));
		});
	}
	getData();
}

/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 행 선택 컬럼(columnType=checkbox)이 체크 되었을 때 발생하는 이벤트.
 */
function onGrdListRowCheck(e){
	var grdList = e.control;
	util.Control.redraw(app, "btnDelete");
}

/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(e){
	var button = e.control;
	getData();
}

/*
 * "데이터 집어넣기" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	getAllData(function(data){
		
		if(data.length > 0) {
			/** @type Array */
			var vaData = data;
			vaData.forEach(function(each){
				var seq = Number(each["seq"]);
				deleteData(seq);
			});
		}
	});
	
	util.Submit.send(app, "sub1", function(pbSuccess,sub){
		if(pbSuccess) {
			var responseText = sub.xhr.responseText;
			/** @type Array */
			var vaData = JSON.parse(responseText);
			
			vaData.forEach(function(each){
				var tempRow = each;
				addData(tempRow);
			});
			
			getData();
//			util.reload(app);
		}
	})
}
