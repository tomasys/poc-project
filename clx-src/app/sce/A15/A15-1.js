/************************************************
 * Untitled.js
 * Created at 2025. 1. 17. 오후 2:06:26.
 *
 * @author HAN
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 
var ws = null;//웹소켓객체
var util = createCommonUtil();
var portletUtil = createCstPortlet();
var msISCD = "005930";//기본 종목정보
var msMinuteDiv = "1";
var mnMaxRSQN = 10000;//호가 최대값 기본
var moChartHandler = null;

/************************************************
 ** 글로벌 함수
 ************************************************/ 
var msStorageKey = "CUSTOM-DASH-";

// 신규 등록 여부
var mbIsInsert = false;

// 매트릭스 위치 정보 배열 구성
var maFormMatrix = [];

// 포틀릿 col, row 배치 카운트
var maxColCnt = 18;
var maxRowCnt = 18;
/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/

//function saveLayout(){
//	var container = app.lookup("grpData");
//			var layout = container.getLayout();
//			var rowDiv = layout.getRowDivisions();
//			var colDiv = layout.getColumnDivisions();
//			rowDiv = rowDiv.map(function(each){
//				var tempDiv = {};
//				Object.getOwnPropertyNames(each).forEach(function(eachP){
//					tempDiv[eachP] = each[eachP];
//				});
//				tempDiv["lengthExpression"] = each.lengthExpression;
//				return tempDiv;
//			});
//			colDiv = colDiv.map(function(each){
//				var tempDiv = {};
//				Object.getOwnPropertyNames(each).forEach(function(eachP){
//					tempDiv[eachP] = each[eachP];
//				});
//				tempDiv["lengthExpression"] = each.lengthExpression;
//				return tempDiv;
//			});
//			localStorage.setItem(AppProperties.PROJECT_NM+"LAYOUT-A15", JSON.stringify({
//				row: rowDiv,
//				col: colDiv
//			}));
//}
///**
// * 위젯 개인화 함수
// */
//function setCustomize(){
//	var vsStockLayout = localStorage.getItem(AppProperties.PROJECT_NM+"LAYOUT-A15");
//	if(vsStockLayout) {
//		var info = JSON.parse(vsStockLayout);
//		var rowDiv = info.row;
//		var colDiv = info.col;
//		rowDiv = rowDiv.map(function(each){
//			var tempDiv = new cpr.controls.layouts.FormDivision(each.lengthExpression);
//			Object.getOwnPropertyNames(each).forEach(function(eachP){
//				tempDiv[eachP] = each[eachP];
//			});
//			return tempDiv;
//		});
//		colDiv = colDiv.map(function(each){
//			var tempDiv = new cpr.controls.layouts.FormDivision(each.lengthExpression);
//			Object.getOwnPropertyNames(each).forEach(function(eachP){
//				tempDiv[eachP] = each[eachP];
//			});
//			return tempDiv;
//		});
//		var layout = app.lookup("grpData").getLayout();
//		layout.setRowDivisions(rowDiv);
//		layout.setColumnDivisions(colDiv);
//	}
//	var vaTabs = app.lookup("grpData").getChildren().filter(function(each) {
//			return each instanceof cpr.controls.TabFolder;
//		});
//	vaTabs.forEach(function(each) {
//		each.addEventListener("item-drop", function(ev) {
//			var mov = localStorage.getItem(AppProperties.PROJECT_NM+"TABMOVE");
//			var dat = mov ? JSON.parse(mov) : {"movement":{},"visible":{}};
//			dat["movement"][ev.item.han] = ev.item.tabFolder.id
//			if (Object.keys(dat).length > 0) {
//				localStorage.setItem(AppProperties.PROJECT_NM+"TABMOVE", JSON.stringify(dat));
//			}
//		});
//	});
//	var vsMove = localStorage.getItem(AppProperties.PROJECT_NM+"TABMOVE");
//	if (vsMove) {
//		
//		var voData = JSON.parse(vsMove);
//		var voMovement = voData["movement"];
//		var vaDataKey = Object.keys(voMovement);
//		vaTabs.forEach(function(each) {
//			each.getTabItems().forEach(function(eachTab) {
//				if (vaDataKey.indexOf(eachTab.han) != -1) {
//					/** @type cpr.controls.TabFolder */
//					var target = app.lookup(voMovement[eachTab.han]);
//					if (target) {
//						eachTab.tabFolder.removeTabItem(eachTab);
//						target.addTabItem(eachTab);
//						
//					}
//				}
//			});
//		});
//		var voVisible = voData["visible"];
//		var vaVisibleKey = Object.keys(voVisible);
//		vaVisibleKey.forEach(function(each){
//			var tab = app.lookup(each);
//			if(tab && tab instanceof cpr.controls.TabFolder) {
//				/** @type Array */
//				var tabItems = voVisible[each];
//				tabItems.forEach(function(eachId){
//					var item = tab.getTabItemByID(eachId);
//					item.visible = false;
//					var voVisibleItem = tab.getTabItems().find(function(ele){
//						return ele.visible;
//					});
//					if(voVisibleItem) {
//						tab.setSelectedTabItem(voVisibleItem);
//						tab.visible =true;
//					} else {
//						tab.visible = false;
//					}
//				});
//			}
//		});
//	}
//}

/**
 * 대시보드를 기본구성으로 변경합니다.
 */
function resetCustomItem(pbSave) {
	
	var vcGrpPortlet = app.lookup("grpPortlet");
	var voDsAllItem = app.lookup("dsAllItem");
	var voDsCustomItem = app.lookup("dsCustomItem");
	
	// 포틀릿에 존재할 경우, constraint 만 변경처리
	vcGrpPortlet.removeAllChildren();
	voDsCustomItem.clearData();
	
	voDsAllItem.getRowDataRanged().forEach(function(rowData) {
		var vsItemId = rowData["itemId"];
		createCustomItem(vsItemId, JSON.parse(rowData["constraint"]), false);
	});
	
	portletUtil.createDragManager(app, true);
	
	saveCustomItem(pbSave);
}
/**
 * 대시보드 정보를 저장합니다.
 */
function saveCustomItem(pbSave) {
	var vcGrpPortlet = app.lookup("grpPortlet");
	var voDmUserInfo = app.lookup("dmUserInfo");
	var voUserMenuGrpData = {};
	var vaUserMenuGrpData = [];
	
	var vaChildren = vcGrpPortlet.getChildren();
//	debugger;
	vaChildren.forEach(function( /*cpr.controls.Container*/ childItem) {
		/** @type String */
		var vsItems = childItem.userData("itemId");
			vsItems.split(",").forEach(function(eachItem){
			
			var voUserMenuGrpDatas = {
				itemId: eachItem,
				constraint: vcGrpPortlet.getConstraint(childItem)
			};
			vaUserMenuGrpData.push(voUserMenuGrpDatas);
//			createCustomItem(eachItem, JSON.parse(rowData["constraint"]), false);
		});
	});
//	vaChildren.
	
	voUserMenuGrpData["userId"] = voDmUserInfo.getValue("userId");
	voUserMenuGrpData["data"] = vaUserMenuGrpData;
	if (pbSave) {
		var vsDate = moment().format("YYYYMMDDHHmmss");
		voUserMenuGrpData["date"] = vsDate;
		voDmUserInfo.setValue("userMenuGrpDate", vsDate);
	}
	
	/* 스토리지 저장*/
	var vsStorageKey = msStorageKey+"-A15" + voDmUserInfo.getValue("userId");
	localStorage.setItem(vsStorageKey, JSON.stringify(voUserMenuGrpData));
	
	setCustomMode("READ");
}
/**
 * 포틀릿 모드를 변경합니다.
 * @param {"READ" | "UPDATE"} psMode  
 */
function setCustomMode(psMode) {
	var vcGrpPortlet = app.lookup("grpPortlet");
	var vaChildItems = vcGrpPortlet.getChildren();
	var vcGrpItemListWrap = app.lookup("grpItemListWrap");
	
	if (psMode == "UPDATE") {
		
		/* 대시보드 아이템 리스트 구성*/
		vcGrpItemListWrap.visible = true;
		updateEmptyItemList();
		
		vcGrpPortlet.getLayout().horizontalSeparatorWidth = 1;
		vcGrpPortlet.getLayout().verticalSeparatorWidth = 1;
		
		util.Control.setVisible(app, true, ["btnAllDel", "btnCustomSave", "btnCustomReset", "btnCancle"]);
		util.Control.setVisible(app, false, "btnCustomUpdate");
		
		// 컨텐츠내 기능 아이템 표시
		vaChildItems.forEach(function( /* cpr.controls.Container*/ grpItem) {
			if (grpItem instanceof cpr.controls.Container) {
				grpItem.getAllRecursiveChildren().forEach(function(ctrl) {
					if (ctrl instanceof cpr.controls.Button) {
						ctrl.visible = true;
					} else if (ctrl instanceof cpr.controls.Output) {
						ctrl.visible = true;
					}
				});
			}
		});
		
		// 포틀릿 모드 활성화
		portletUtil.setUseDragManager(true);
	} else {
		
		vcGrpItemListWrap.visible = false;
		
		/*default 스크린 사이즈에서만 셋팅 버튼 플로팅*/
		if (AppProperties.SCREEN_DEFAULT_NM.indexOf(app.targetScreen.name) != -1) {
			floatBtnSetting(true);
		}
		
		vcGrpPortlet.getLayout().horizontalSeparatorWidth = 0;
		vcGrpPortlet.getLayout().verticalSeparatorWidth = 0;
		
		// 수정, 삭제 버튼 표시
		util.Control.setVisible(app, false, ["btnAllDel", "btnCustomSave", "btnCustomReset", "btnCancle"]);
		util.Control.setVisible(app, true, ["btnCustomUpdate", "btnCancle"]);
		
		// 컨텐츠내 기능 아이템 숨김
		vaChildItems.forEach(function( /* cpr.controls.Container*/ grpItem) {
			if (grpItem instanceof cpr.controls.Container) {
				grpItem.getAllRecursiveChildren().forEach(function(ctrl) {
					if (ctrl instanceof cpr.controls.Button) {
						ctrl.visible = false;
					} else if (ctrl instanceof cpr.controls.Output) {
						ctrl.visible = false;
					}
				});
			}
		});
		
		// 포틀릿 모드 비활성화
		portletUtil.setUseDragManager(false);
		
		/* 반응형 모듈 재구성*/
		if (vcGrpPortlet["_RForm"]) {
			var voRfrom = vcGrpPortlet["_RForm"];
			voRfrom._backup();
		}
	}
}
/**
 * 대시보드 수정버튼 플로팅
 * @param {Boolean} pbView 표시여부
 */
function floatBtnSetting(pbView) {
	var voContainer = app.getContainer();
	var voContLayout = voContainer.getLayout();
	var vcBtnSetting = app.lookup("btnSetting");
	
	if (pbView) {
		
		if (vcBtnSetting) {
			vcBtnSetting.visible = true;
		} else {
			vcBtnSetting = new cpr.controls.Button("btnSetting");
			vcBtnSetting.addEventListener("click", function(e) {
				voContainer.getLayout().setRowVisible(0, true);
				vcBtnSetting.visible = false;
			});
			vcBtnSetting.style.setClasses("icon");
			vcBtnSetting.icon = "theme/images/com/main/ic_settings_02.svg";
			vcBtnSetting.style.icon.setClasses(["icon", "ico-setting"]);
			
			voContainer.floatControl(vcBtnSetting, {
				"top": "5px",
				"right": "5px",
				"width": "18px",
				"height": "18px"
			});
		}
		voContLayout.setRowVisible(0, false);
	} else {
		voContainer.getLayout().setRowVisible(0, false);
		if (vcBtnSetting) {
			vcBtnSetting.visible = false;
		}
	}
}
function drawOriginData() {
	
	var voDmUserInfo = app.lookup("dmUserInfo");
	var vsUserId = voDmUserInfo.getValue("userId");
	
	/* 커스텀 대시보드 정보조회 */
	var vsStorageKey = msStorageKey+"-A15" + vsUserId;
	var voUserCustomData = localStorage.getItem(vsStorageKey);
	
	if (!ValueUtil.isNull(voUserCustomData)) {
		
	// 포틀릿에 존재할 경우, constraint 만 변경처리
		app.lookup("grpPortlet").removeAllChildren();
		app.lookup("dsCustomItem").clearData();
			
		/** @type Object */
		var voJsonUserCustomData = JSON.parse(voUserCustomData);
		
		/* 커스텀 저장일시 생성 */
		util.DataMap.setValue(app, "dmUserInfo", "userMenuGrpDate", voJsonUserCustomData["date"]);
		/* 커스텀 아이템 생성 */
		/** @type Array */
		var vaJsonUserCustomData = voJsonUserCustomData["data"];
		vaJsonUserCustomData.forEach(function(each) {
			var vsItemId = each["itemId"];
			createCustomItem(vsItemId, each["constraint"], false);
		});
	} else {
		return false;
	}
	
	return true;
}
/**
 * 파라미터로 받은 크기에 적용 가능한 비어있는 위치를 찾아 반환
 * @param {Number} pnPositionX
 * @param {Number} pnPositionY
 */
function findEmptyMatrixPosition(pnPositionX, pnPositionY) {
	for (var i = 0; i <= maxRowCnt - pnPositionX; i++) {
		for (var j = 0; j <= maxColCnt - pnPositionY; j++) {
			var isEmpty = true;
			
			// 크기에 따른 영역을 확인하여 비어있는지 검사합니다.
			for (var x = i; x < i + pnPositionX; x++) {
				for (var y = j; y < j + pnPositionY; y++) {
					if (maFormMatrix[x][y] === 1) {
						isEmpty = false;
						break;
					}
				}
				if (!isEmpty) break;
			}
			
			if (isEmpty) {
				return {
					colIndex: j,
					rowIndex: i,
					colSpan: pnPositionX,
					rowSpan: pnPositionY
				}; // 삽입가능한 영역중 비어있는 영역 반환
			}
		}
	}
	
	// 모든 위치가 차있을 경우 null을 반환합니다.
	if (pnPositionX - 1 < 1 || pnPositionY - 1 < 1) {
		return null;
	} else {
		return findEmptyMatrixPosition(pnPositionX - 1, pnPositionY - 1);
	}
}
/**
 * 매트릭스 위치 정보를 초기화 합니다.
 */
function setClearFormMatrix() {
	for (var x = 0; x < maxRowCnt; x++) {
		maFormMatrix[x] = [];
		for (var y = 0; y < maxColCnt; y++) {
			maFormMatrix[x][y] = 0;
		}
	}
}
/**
 * 포틀릿 그룹내 배치 가능한 영역의 컨스트레인트를 반환합니다.
 * @param {String} psSizeInfo 생성하고자 하는 포지션 크기 Width x Height(ex. "4x4")
 */
function getEmptyMatrixPosition(psSizeInfo) {
	var vcGrpPortlet = app.lookup("grpPortlet");
	var vaSizeInfo = psSizeInfo.split("x");
	
	// 매트릭스 정보 초기화
	setClearFormMatrix();
	
	// 매트릭스 정보 삽입
	var vaChildren = vcGrpPortlet.getChildren();
	vaChildren.forEach(function(childItem) {
		var voItemConst = vcGrpPortlet.getConstraint(childItem);
		var vnColIdx = voItemConst.colIndex;
		var vnRowIdx = voItemConst.rowIndex;
		var vnColSpan = 0;
		var vnRowSpan = 0;
		
		if (voItemConst.colSpan) vnColSpan = voItemConst.colSpan;
		if (voItemConst.rowSpan) vnRowSpan = voItemConst.rowSpan;
		
		for (var x = vnRowIdx; x < vnRowIdx + vnRowSpan; x++) {
			for (var y = vnColIdx; y < vnColIdx + vnColSpan; y++) {
				maFormMatrix[x][y] = 1; // 1은 컨트롤이 배치된 위치를 나타냅니다.
			}
		}
	});
	
	return findEmptyMatrixPosition(Number(vaSizeInfo[0]), Number(vaSizeInfo[1]));
}
/**
 * UDC 객체에서 타겟되는 객체를 반환합니다.
 * @param {String} path
 */
function getUdcNestedProperty(path) {
	
	var vaKeys = path.split('.');
	if (vaKeys.length > 0 && vaKeys[0] == "udc") {
		vaKeys.shift();
	}
	
	return vaKeys.reduce(function(acc, key) {
		return acc && acc[key];
	}, udc);
}
/**
 * 커스텀 메뉴 아이템을 생성합니다.
 * @param {Object} psItemId 아이템 아이디
 * @param {Object} poPostion 메뉴 위치 정보
 * @param {Boolean} pbBtnVisible? 기능 버튼 표시 여부
 * @param {Boolean} pbWrapVisible? 아이템 커버 표시 여부
 * @param {Boolean} pbAddItem? 아이템 추가로 등록된 아이템 여부
 */
function createCustomItem(psItemId, poPostion, pbBtnVisible, pbWrapVisible, pbAddItem) {
	pbBtnVisible = pbBtnVisible ? pbBtnVisible : false;
	pbWrapVisible = pbWrapVisible ? pbWrapVisible : false;
	var voDsAllItem = app.lookup("dsAllItem");
	var voDsCustomItem = app.lookup("dsCustomItem");
	
	var vbHasAuth = false;
	
	// 삭제된 아이템 또는 권한 처리를 위한 아이템 조회
	var voFindRow = voDsAllItem.findFirstRow("itemId == '" + psItemId + "'");
	if (!voFindRow) {
		pbWrapVisible = true;
	} else {
		vbHasAuth = true;
	}
	
	var voMatrixPosition;
	if (!poPostion) { // 신규 생성되는 Item
		// 포틀릿에 위치시킬 포지션을 반환합니다.(초기 크기 4x4)
		voMatrixPosition = getEmptyMatrixPosition("4x4");
		if (!voMatrixPosition) {
			util.Msg.alertDlg(app, "배치 가능한 영역이 존재하지 않습니다.");
			return false;
		}
	} else { // 기존 구성된 Item
		voMatrixPosition = poPostion;
	}
	var voPosition = {
		"colIndex": voMatrixPosition["colIndex"],
		"rowIndex": voMatrixPosition["rowIndex"],
		"colSpan": voMatrixPosition["colSpan"],
		"rowSpan": voMatrixPosition["rowSpan"]
	};
	var vcGrpPort = app.lookup("grpPortlet");
	var vcGrpItem = null;
	var vaExistCtrl = vcGrpPort.getLayout().findControls(voPosition);
	if(vaExistCtrl.length>0) {
		vcGrpItem = vaExistCtrl[0];
		vcGrpItem.userData("itemId",vcGrpItem.userData("itemId")+","+psItemId);
	} else  {
		vcGrpItem = new cpr.controls.Container();
		var voXyLayout = new cpr.controls.layouts.XYLayout();
		voXyLayout.scrollable = true;
		vcGrpItem.style.addClass("custom-item");
		vcGrpItem.userData("itemId", psItemId);
		vcGrpItem.userAttr({
			"mobile-min-height": String(voFindRow.getValue("minHeight")),
			"table-min-height": String(voFindRow.getValue("minHeight"))
		});
		vcGrpItem.setLayout(voXyLayout);
		if (voFindRow) vcGrpItem.userData("itemInfo", voFindRow.getRowData());
		
	}
	// 아이템 생성	
	
	
	var vsOptWrapText = "드래그&드랍하여 배치할 수 있습니다.";
	
	(function(container) {
		// 권한 및 화면 존재여부에 따라 구성
		if (vbHasAuth) {
			var vsItemType = voFindRow.getValue("itemType");
			
			var vcObjItem = getUdcNestedProperty(vsItemType);
			var vcUdcItem = new vcObjItem;
			var vaExistCtrl = container.getChildren();
			/** @type cpr.controls.TabFolder */
			var vcTargetTab = null;
			if(vaExistCtrl.length < 1) {
				vcTargetTab = new cpr.controls.TabFolder();
				vcTargetTab.style.setClasses(["tab-widget"]);
				vcTargetTab.itemDraggingMode = "global";
				container.addChild(vcTargetTab, {
					"top": "0px",
					"right": "0px",
					"bottom": "0px",
					"left": "0px"
				});
			} else {
				vcTargetTab = vaExistCtrl[0];
			}
			var tabItem = createTabItem(vcUdcItem,voFindRow.getValue("itemNm"));
			tabItem.userAttr("itemId", psItemId);
			vcTargetTab.addTabItem(tabItem);
			vcTargetTab.setSelectedTabItem(tabItem);
		} else {
			vsOptWrapText = "해당 아이템이 존재하지 않거나 권한이 없습니다.";
		}
		if(vaExistCtrl.length> 2) {
			return;
		}
		var vcOptWrap = new cpr.controls.Output("optWrap");
		vcOptWrap.visible = pbWrapVisible;
		vcOptWrap.style.addClass("item-wrap");
		vcOptWrap.value = vsOptWrapText;
		container.addChild(vcOptWrap, {
			"top": "0px",
			"right": "0px",
			"bottom": "0px",
			"left": "0px"
		});
		
		var vcBtnClose = new cpr.controls.Button("btnClose");
		vcBtnClose.tooltip = "닫기";
		vcBtnClose.visible = pbBtnVisible;
		vcBtnClose.style.setClasses(["btn-close"]);
		if (typeof onBtnResizeMousedown == "function") {
			vcBtnClose.addEventListener("click", onBtnCloseClick);
		}
		container.addChild(vcBtnClose, {
			"top": "0px",
			"right": "0px",
			"width": "20px",
			"height": "20px"
		});
		var vcBtnResize = new cpr.controls.Button("btnResize");
		vcBtnResize.tooltip = "크기변경";
		vcBtnResize.visible = pbBtnVisible;
		vcBtnResize.style.addClass("btn-resize");
		if (typeof onBtnResizeMousedown == "function") {
			vcBtnResize.addEventListener("mousedown", onBtnResizeMousedown);
		}
		container.addChild(vcBtnResize, {
			"right": "0px",
			"bottom": "0px",
			"width": "20px",
			"height": "20px"
		});
	})(vcGrpItem);
	
//	var voPosition = {
//		"colIndex": voMatrixPosition["colIndex"],
//		"rowIndex": voMatrixPosition["rowIndex"],
//		"colSpan": voMatrixPosition["colSpan"],
//		"rowSpan": voMatrixPosition["rowSpan"]
//	}
	vcGrpPort.addChild(vcGrpItem, voPosition);
	
	// 커스텀 메뉴 목록에 구성
	var voTargetRow = voDsAllItem.findFirstRow("itemId == '" + psItemId + "'");
	var voTargetRowData = voTargetRow.getRowData();
	voTargetRowData["constraint"] = JSON.stringify(voPosition);
	
	voDsCustomItem.addRowData(voTargetRowData);
	
	if (pbAddItem) {
		updateEmptyItemList();
		// 포틀릿 모드 활성화
		portletUtil.createDragManager(app, true);
	}
	
	return true;
}
exports.createCustomItem = createCustomItem;

function createTabItem(pcCtrl,title){
	var vcTabItem = new cpr.controls.TabItem();
	vcTabItem.text = title;
	var group = new cpr.controls.Container();
	var form = new cpr.controls.layouts.FormLayout();
	form.setRows(["1fr"]);
	form.setColumns(["1fr"]);
	group.setLayout(form);
	group.addChild(pcCtrl,{rowIndex:0,colIndex:0});
	vcTabItem.content = group;
	return vcTabItem;	
//					tabItem_1.text = "tab1";
//					var group_1 = new cpr.controls.Container();
//					var xYLayout_2 = new cpr.controls.layouts.XYLayout();
//					group_1.setLayout(xYLayout_2);
//					tabItem_1.content = group_1;
//					return tabItem_1;
}
function updateEmptyItemList() {
	var vcGrpItemList = app.lookup("grpItemList");
	var voDsAllItem = app.lookup("dsAllItem");
	var voDsCustomItem = app.lookup("dsCustomItem");
	
	vcGrpItemList.removeAllChildren();
	
	for (var i = 0; i < voDsAllItem.getRowCount(); i++) {
		var vsItemId = voDsAllItem.getValue(i, "itemId");
		var voTargetRow = voDsCustomItem.findFirstRow("itemId == '" + vsItemId + "'");
		
		if (!voTargetRow) {
			var vcBtnItem = new cpr.controls.Button();
			vcBtnItem.value = voDsAllItem.getValue(i, "itemNm");
			vcBtnItem.userData("itemInfo", voDsAllItem.getRowData(i));
			
			vcGrpItemList.addChild(vcBtnItem, {
				"autoSize": "width",
				"width": "20px",
				"height": "28px"
			});
			
			setUpDragSource(vcBtnItem);
		}
	}
}
/**
 * 포틀릿 그룹 컨트롤에 드래그&드랍 소스를 구성합니다.
 * @param {cpr.controls.Button} pcButton 아이템 버튼
 */
function setUpDragSource(pcButton) {
	/** @type udc.sr.udcSrDragFeedBack */
	var dragFeedback;
	/** @type cpr.geometry.Rectangle */
	var feedbackLocation = null;
	var vcGrpPortlet = app.lookup("grpPortlet");
	
	var dragSource = new cpr.controls.DragSource(pcButton, {
		options: {
			dataType: vcGrpPortlet.userAttr("dataType"), // indvPortletManager 모듈 _createDropTarget 메서드에서 처리
			threadhold: 5
		},
		onDragStart: function(context) {
			var voDragData = pcButton.userData("itemInfo");
			context.cursor = "grabbing";
			
			dragFeedback = createDragSourceFeedback(voDragData);
			
			/* 해상도에 따른 이슈를 개선하기 위해 고정 span으로 구성*/
//			var vnItemWidth = Number(voDragData["minWidth"]);
//			var vnItemHeidht = Number(voDragData["minHeight"]);
			var voCellSize = calcCellSize();
//			
//			var vnItemColSpan = Math.round(vnItemWidth / voCellSize["cellWidth"]);
//			var vnItemRowSpan = Math.round(vnItemHeidht / voCellSize["cellHeight"]);
//			
//			var vnCalcItemWidth = vnItemColSpan * voCellSize["cellWidth"];
//			var vnCalcItemHeight = vnItemRowSpan * voCellSize["cellHeight"];
			
			var vnRowSpan = voDragData["rowSpan"];
			var vnColSpan = voDragData["colSpan"];
			
			var vnCalcItemWidth = vnColSpan * voCellSize["cellWidth"] - 30;
			var vnCalcItemHeight = vnRowSpan * voCellSize["cellHeight"] - 30;

			context.data = {
				dragFeedback: dragFeedback,
				data: voDragData,
				rowSpan: voDragData["rowSpan"],
				colSpan: voDragData["colSpan"],
				ctrl: pcButton
			};
			
			// 드래그된 feedback을 위치시킬 좌표 구성
			var startLocation = context.dragStartLocation;
			var voHostAppIns = app.getHostAppInstance();
			
			if (!voHostAppIns.isRootAppInstance()) { // 메인화면 내부 업무화면에 렌더링된 경우 
				startLocation["x"] = startLocation.x - voHostAppIns.getActualRect().x;
				startLocation["y"] = startLocation.y - voHostAppIns.getActualRect().y;
			}
			
			feedbackLocation = new cpr.geometry.Rectangle(startLocation.x - (vnCalcItemWidth / 2), startLocation.y - (vnCalcItemHeight / 2), vnCalcItemWidth, vnCalcItemHeight);
			app.getHostAppInstance().floatControl(dragFeedback, cpr.controls.layouts.XYLayout.createConstraintWithRect(feedbackLocation));
		},
		onDragMove: function(context) {
			var newRect = feedbackLocation.getTranslated(context.dragDelta);
			app.getHostAppInstance().floatControl(dragFeedback, cpr.controls.layouts.XYLayout.createConstraintWithRect(newRect));
		},
		onDragEnd: function(context) {
			if (dragFeedback) {
				dragFeedback.dispose();
				dragFeedback = null;
			}
		},
		onDragCancel: function(context) {
			if (dragFeedback) {
				dragFeedback.style.animateTo({
					"left": feedbackLocation.left + "px",
					"top": feedbackLocation.top + "px",
					"opacity": "0"
				}, 0.3);
				dragFeedback.addEventListener("transitionend", function(e) {
					dragFeedback.dispose();
					dragFeedback = null;
				});
			}
		}
	});
}

/**
 * 드래그 피드백 컨트롤을 생성합니다.
 * @param {Object} poData
 * @return {udc.sr.udcSrDragFeedBack} 드래드 피드백 UDC
 */
function createDragSourceFeedback(poData) {
	
	/* 드래그 피드백을 UDC로 구성합니다. */
	var vcObjItem = getUdcNestedProperty(poData["itemType"]);
	var vcUdcItem = new vcObjItem;
	
	var vcDragSourceFeedback = new vcObjItem;
	
	return vcDragSourceFeedback;
}

/**
 * 폼 레이아웃 내부 셀하나의 크기값을 반환합니다.
 */
function calcCellSize() {
	var vcGrpPortlet = app.lookup("grpPortlet");
	var voGrpLayout = vcGrpPortlet.getLayout();
	
	var voActualRect = vcGrpPortlet.getActualRect();
	
	var vnWidth = voActualRect.width - Number(voGrpLayout.leftMargin.replace("px", "")) - Number(voGrpLayout.rightMargin.replace("px", ""));
	var vnHeight = voActualRect.height - Number(voGrpLayout.topMargin.replace("px", "")) - Number(voGrpLayout.bottomMargin.replace("px", ""));
	
	var vnCellWidth = vnWidth / maxColCnt;
	var vnCellHeight = vnHeight / maxRowCnt;
	
	return {
		"cellWidth": vnCellWidth,
		"cellHeight": vnCellHeight,
	}
}

/**
 * 아이템 리사이즈 버튼 mousedown 이벤트
 * @param {cpr.events.CMouseEvent} e
 */
function onBtnCloseClick(e) {
	/** @type cpr.controls.Button */
	var button = e.control;
	
	deleteCustomItem(button.getParent(), true);
}

/**
 * 아이템 리사이즈 버튼 mousedown 이벤트
 * @param {cpr.events.CMouseEvent} e
 */
function onBtnResizeMousedown(e) {
	/** @type cpr.controls.Button */
	var button = e.control;
	
	portletUtil.setResizePortlet(true);
	
	button.addEventListenerOnce("mouseup", function(e) {
		portletUtil.setResizePortlet(false);
	});
}

exports.getISInfo = function(){
	return moISInfo;
}

var moISInfo;

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	var voISInfo = {
		"PDRT": "삼성전자",
		"DIV": "KOSPI",
		"PDNO": "005930"
	}
	if(app.getHost()){
		var voInitValue = app.getHostProperty("initValue");
		if(voInitValue) {
			var data = voInitValue;
			msISCD = data["PDNO"];
			voISInfo = data;
		}
	}
	else if(cpr.core.Platform.INSTANCE.getParameter("searchs")){
		var data = cpr.core.Platform.INSTANCE.getParameter("searchs");
		msISCD = data["PDNO"];
		voISInfo = data;
	}
	moISInfo =voISInfo;

//	setCustomize();//개인화된 위젯 처리 함수
//	connect(voISInfo);
}

/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/
var maInterval = null;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	var voContainer = app.getContainer();
	
	// 메뉴오픈시 삭제 버튼 표시
	util.Control.setVisible(app, true, "btnCustomReset");
	
	/* 사용자 정보 구성*/
	/** @type cpr.data.DataMap */
	var voDmUserInfo = util.Main.getUserInfo(app);
	var vsUserId = "admin";
//	
	util.DataMap.setValue(app, "dmUserInfo", "userId", vsUserId);
	util.DataMap.setValue(app, "dmUserInfo", "userNm", "admin");
//	
	var vbHasOrigin = drawOriginData();
	
	if (!vbHasOrigin) {
		resetCustomItem(false);
	}
//	
	portletUtil.createDragManager(app, true);
//	
	setCustomMode("READ");
//	
//	voContainer.visible = true; // 테블릿, 모바일 대시보드 레이아웃 구성 완료 후 표시
//	voContainer.redraw();
}

/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(e){
}


/*
 * 루트 컨테이너에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onBodyMousedown(e){
}





/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e){
	var button = e.control;
	var voInits = app.lookup("grpData").getChildren().filter(function(each){
		return each instanceof cpr.controls.TabFolder;
	});
	voInits = voInits.map(function(each){
		var returns = {
			"id": each.id,
			"items" : each.getTabItems().map(function(/*cpr.controls.TabItem*/eachTab){
				return {
					"id" : eachTab.id,
					"text":eachTab.text,
					"visible":eachTab.visible
				};
			})
		};
//		if(each.hasOwnProperty("_removedItem")){
//			each["_removedItem"].forEach(function(eachRemoved){
//				returns["items"].push({
//					"id" : eachRemoved.id,
//					"text":eachRemoved.text,
//					"visible":eachRemoved.visible
//				});
//			})
//		}
		return returns;
	});
	var vcGrpData = app.lookup("grpData");
	var voLayout = vcGrpData.getLayout();
	const vnRowLen = voLayout.getRows().length;
	const vnColLen = voLayout.getColumns().length;
	
	util.Dialog.open(app, "app/src/WTSCustomPop", 1000, 600, function(ev){
		
		if(voLayout.getRows().length != vnRowLen || voLayout.getColumns().length != vnColLen) {
			saveLayout();
		}
	},{
		"tab": voInits,
		"layout":voLayout,
		"host": app
//		,"portlet":portletUtil
	});
//	portletUtil.portletIndividual().setCookie(app, "grpData","7");
}

/*
 * 그룹에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onGrpDataMousedown(e){
	var group = e.control;
	//페이지 내 위젯 크기 조정 정보 저장하기 위한 로직
//	var voTargetObj = e.targetObject;
//	if(voTargetObj && voTargetObj.hasOwnProperty('resizeDirection')) {
//		window.addEventListener("mouseup", function(ev){
//			saveLayout();
//		},{once:true});
//	}
}

/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(e){
	
}

/*
 * 루트 컨테이너에서 host-change 이벤트 발생 시 호출.
 * 앱이 다른 부모 앱에 포함되거나 부모 앱으로 부터 이탈할 때 발생하는 이벤트 입니다.
 */
function onBodyHostChange(e){
}

/*
 * "편집" 버튼(btnCustomUpdate)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCustomUpdateClick(e){
	var btnCustomUpdate = e.control;
		setCustomMode("UPDATE");
}

/*
 * "취소" 버튼(btnCancle)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCancleClick(e){
	var btnCancle = e.control;
	drawOriginData();
	portletUtil.createDragManager(app, true);
	
	setCustomMode("READ");
}

/*
 * "저장" 버튼(btnCustomSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCustomSaveClick(e){
	var btnCustomSave = e.control;
	saveCustomItem(true);
	util.Main.doTabHeaderFunction(app, "refresh");
}

/*
 * "초기화" 버튼(btnCustomReset)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCustomResetClick(e){
	var btnCustomReset = e.control;
	util.Msg.confirmDlg(app, "대시보드를 기본 구성으로 변경하시겠습니까?", null, {
		confirmCallback: function() {
			resetCustomItem(true);
		}
	});
}
