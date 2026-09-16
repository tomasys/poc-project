/************************************************
 * Untitled.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2025. 4. 22..
 * @작성자 : HWPS
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/
var util = createCommonUtil();
/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 

var voTypes = {
	"summary" : udc.stock.mng.udcMngSummary,
	"chart": udc.stock.mng.udcMngChart,
	"subTitle": udc.stock.mng.udcMngSubtitle,
	"text": udc.stock.mng.udcMngText,
	"table": udc.stock.mng.udcMngTable,
	"caution": udc.stock.mng.udcMngCaution,
	"main": udc.stock.mng.udcMngMain,
	"image": udc.stock.mng.udcMngImage,
	"title": udc.stock.mng.udcMngTitle,
	"content": udc.stock.mng.udcMngText
}
/************************************************
 ** 글로벌 함수
 ************************************************/ 

function createDragSourceFeedback() {
	var feedback = new cpr.controls.Output();
	feedback.ellipsis = true;
	feedback.style.css({
		"opacity": "0.8",
		"width": "50px",
		"height": "25px",
		"border": "solid 1px #00854a",
		"text-align": "center",
		"color": "black",
		"border-radius": "10px",
		"background": "white",
		"box-shadow": "0px 2px 10px #ddd",
		"cursor": "move"
	});
	return feedback;
}

//app.lookup("grd1").getRow(rowIndex)
/**
 * 파라미터의 컨트롤을 드래그 가능하도록 드래그 소스를 지정하는 함수.
 * @param {cpr.controls.UIControl} control
 */
function setDragSource(control) {
	var feedback = null;
	var actualRect = null;
	new cpr.controls.DragSource(control, {
		options: {
			dataType: "text",
			threadhold: 10
		},
		onDragStart: function(context) {//dragStart에서 사용중인 context.source.detail이라는 대상은 이후 릴리즈에서 depreacted될 대상으로,context.sourceTargetObject로 대체됩니다.
			if (context.targetObject != null && context.targetObject.relativeTargetName != "header") {
				context.cursor = "grabbing";
				feedback = createDragSourceFeedback();
				context.data = context.targetObject.rowIndex;
				feedback.value = JSON.stringify(control.getRow(context.targetObject.rowIndex).getRowData());
				
				var voDragStartLoca = context.dragStartLocation;
				actualRect = new cpr.geometry.Rectangle(voDragStartLoca.x, voDragStartLoca.y, 300, 32);
				app.getRootAppInstance().floatControl(feedback, actualRect);
				context.source = null;
			} else {
				context.cancel();
			}
		},
		onDragMove: function(context) {
			context.cursor = "grabbing";
			var newRect = actualRect.getTranslated(context.dragDelta);
			app.getRootAppInstance().floatControl(feedback, newRect);
//			app.getContainer().redraw();
		},
		onDragEnd: function(context) {
			context.cursor = "";
			feedback.dispose();
			feedback = null;
			control.style.removeStyle("opacity");
		}
	});
}
var voPrevRowElement = null;

/**
 * 파라미터로 받은 컨트롤을 드랍가능한 타겟으로 지정하는 함수.
 * @param {cpr.controls.UIControl} control2
 */
function setDropTarget(control2) {

	var dropTarget = new cpr.controls.DropTarget(control2, {
		isImportant: function(source) {
			return source.dataType == "text";
		},
		onDragEnter: function(context) {

		},
		onDragLeave: function(context) {

		},
		onDragMove: function(context) {
			var vaElementsOnMouse = elementsFromPoint(context.pointerLocation.x, context.pointerLocation.y);

			var vaClGridRowEle = vaElementsOnMouse.filter(function( /*HTMLElement*/ each) {
				if (each.classList.contains("cl-grid-row")) {
					return each;
				}
			});
			var voGridRowElement = vaClGridRowEle[0];

			if (voGridRowElement && !voGridRowElement.classList.contains("drag-row-bottom")) {
				if (voGridRowElement != voPrevRowElement && voPrevRowElement) {

					voPrevRowElement.classList.remove("drag-row-bottom");
				}
				voPrevRowElement = voGridRowElement;
				voGridRowElement.classList.add("drag-row-bottom");
			}
		},
		onDrop: function(context) {
			var voTargetObject = context.targetObject;
			var vsRelativeTargetName = voTargetObject.relativeTargetName;
			var vcGrid = app.lookup("grdList");
			var vnStartIndex = context.data;
			var vnTargetIndex = voTargetObject.rowIndex;
			if (vsRelativeTargetName == "header") {
				vnTargetIndex = 0;
			} else if (vsRelativeTargetName == "grid") {
				vnTargetIndex = vcGrid.getRowCount() - 1;
			}
			vcGrid.dataSet.moveRowIndex(vnStartIndex, vnTargetIndex, vsRelativeTargetName != "header");
			var children = app.lookup("grpData").getChildren();
			app.lookup("grpData").reorderChild(children[vnStartIndex+1], vnTargetIndex+1,true);
			vcGrid.redraw();
//			app.lookup("chartVerticalBar").drawChart();
			voPrevRowElement.classList.remove("drag-row-bottom");
		}
	});
}

/**
 * 마우스 포인터가 위치한 곳 밑에 있는 모든 요소를 가져오는 함수입니다.
 * @param {Number} x
 * @param {Number} y
 * @return {HTMLElement}
 */
function elementsFromPoint(x, y) {
	if (document["msElementsFromPoint"]) {
		var nodeList = document["msElementsFromPoint"](x, y);
		if (!nodeList) {
			return [];
		} else {
			return Array.prototype.slice.call(nodeList);
		}
	} else {
		return (document["elementsFromPoint"](x, y) || []);
	}
}
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
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	
//	var voInitValue = app.getHostProperty("initValue");
//	if(voInitValue) {
//		app.lookup("dsContent").build(voInitValue["data"]);
////		var vcGrd = app.lookup("grdList");
////		var voInitConfig = vcGrd.getInitConfig();
////		voInitConfig.dataSet = voInitValue["dataset"];
////		vcGrd.init(voInitConfig);
////		vcGrd.redraw();
//	}
	
	var voConstructs = udc.stock.mng;
	var vaAllApps = cpr.core.Platform.INSTANCE.getAllLoadedApps().filter(function(each){
		return each.id.indexOf("udc/stock/mng") != -1 && each.id.indexOf("Main") == -1 && each.id.indexOf("Caution") == -1;
	}).map(function(each){
		var vsType = each.id.replace("udc/stock/mng/udcMng","").toLowerCase();
		if(vsType == "text") {
			vsType = "content";
		}
		if(vsType == "subtitle") {
			vsType = "subTitle";
		}
		return {
			title:each.title,
			type : vsType,
			cons:each.id
		};
	});
	vaAllApps.forEach(function(each){
		var btn = new cpr.controls.Button();
		btn.value = each.title;
		btn.style.setClasses(["secondary"]);
//		btn.userAttr("constructors", each.cons);
		btn.addEventListener("click", function(ev){
			var vcGrd = app.lookup("grdList2");
//			var vnSelIdx = vcGrd.getSelectedRowIndex();
//			if(vnSelIdx == -1) {
//				vnSelIdx = vcGrd.getRowCount()-1;
//			}
			app.lookup("dsInsert").pushRowData(each);
//			vcGrd.insertRowData(vnSelIdx, true, {
//				type: each.type
//			});
		});
		app.lookup("grpItem").addChild(btn, {
			height: "32px"
		});
	});
	
	setDragSource(app.lookup("grdList"));
	setDropTarget(app.lookup("grdList"));
}

/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrdListCellClick(e){
	var grdList = e.control;
	if(e.cellIndex ==1)  {
		var row = grdList.getRow(e.rowIndex);
		if(row.getStateString() == "ID") {
			grdList.dataSet.realDeleteRow(e.rowIndex);
		} else {
			
			app.lookup("grdList").deleteRow(e.rowIndex);
		}
//		app.lookup("dsInsert").deleteRow(e.rowIndex);
	}
}



/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(e){
	var button = e.control;
	app.close();
}

/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrdList2CellClick(e){
	var grdList2 = e.control;
	if(e.cellIndex ==1)  {
		app.lookup("dsInsert").realDeleteRow(e.rowIndex);
	}
}
/*
 * "추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	var vcDsContent = app.lookup("dsContent");
	util.Msg.confirmDlg(app, "수정사항을 적용하시겠습니까?", null,{
		confirmCallback: function(){
			var vaData = app.lookup("dsInsert").getRowDataRanged();
			app.close(vaData);
		}
	});
//	var vaData = app.lookup("dsInsert").getRowDataRanged();
//	app.close(vaData);
}