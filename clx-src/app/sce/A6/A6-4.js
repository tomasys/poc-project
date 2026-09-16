/************************************************
 * screenLayout.js
 * Created at 2023. 2. 27. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad2(e){
	
	var subList = app.lookup("subList");
	subList.send();
	
	setDragSource(app.lookup("grd1"));
	setDropTarget(app.lookup("grd1"));
}

/*
 * 데이터셋에서 update 이벤트 발생 시 호출.
 * 데이터가 수정되는 경우 발생하는 이벤트. 발생 메소드 : setValue, updateRow
 */
function onDsData2Update(e){
	var dsData2 = e.control;
	
	app.lookup("chartVerticalBar").drawChart();
}

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
			app.getContainer().redraw();
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
			var vcGrid = app.lookup("grd1");
			var vnStartIndex = context.data;
			var vnTargetIndex = voTargetObject.rowIndex;
			if (vsRelativeTargetName == "header") {
				vnTargetIndex = 0;
			} else if (vsRelativeTargetName == "grid") {
				vnTargetIndex = vcGrid.getRowCount() - 1;
			}
			vcGrid.dataSet.moveRowIndex(vnStartIndex, vnTargetIndex, vsRelativeTargetName != "header");
			vcGrid.redraw();
			app.lookup("chartVerticalBar").drawChart();
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

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb1SelectionChange(e){
	var vsItemValue = e.newSelection[0].value;
	var vcChart = app.lookup("chartVerticalBar");
	if (vsItemValue == "barVertical") {
		vcChart.setAppProperty("chartType", "bar : vertical");
	} else if (vsItemValue == "barHorizontal") {
		vcChart.setAppProperty("chartType", "bar : horizontal");
	} else if (vsItemValue == "lineFold") {
		vcChart.setAppProperty("chartType", "line : fold");
	} else if (vsItemValue == "lineRound") {
		vcChart.setAppProperty("chartType", "line : round");
	} else if (vsItemValue == "areaFold") {
		vcChart.setAppProperty("chartType", "area : fold");
	} else if (vsItemValue == "areaRound") {
		vcChart.setAppProperty("chartType", "area : round");
	} else if (vsItemValue == "radarDef") {
		vcChart.setAppProperty("chartType", "radar : default");
	} else if (vsItemValue == "radarDtl") {
		vcChart.setAppProperty("chartType", "radar : detail");
	}
}