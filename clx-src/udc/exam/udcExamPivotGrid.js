/************************************************
 * PivotHelperH.js
 * Created at 2020. 5. 14. 오후 4:09:59.
 *
 * @author ryu
 * 
 * --------------------------------------------------------------------------
 * 버전			|작성자	|내용
 * --------------------------------------------------------------------------
 * 1.0			|류다은	|최초 작성
 ************************************************/

/**************************************************
 * 전역 변수
 **************************************************/

/**
 * 그리드 컬럼의 너비
 * @type Number
 */
var mnColumnWidth = 100;

/**
 * 그리드 헤더 한 행의 높이
 * @type Number
 */
var mnHeaderRowHeight = 37;

/**
 * 그리드 디테일 한 행의 높이
 * @type Number
 */
var mnDetailRowHeight = 37;

/**
 * 그리드 푸터 한 행의 높이
 * @type Number
 */
var mnFooterRowHeight = 37;

//초기 컨데이너 높이값
var mnHeight ;

var util = createCommonUtil();
/************************************************
 * 사용자 정의 이벤트
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	return "Not Support";
};
/**
 * 헬퍼 그룹 내에 존재하는 필드를 옮기는 함수입니다.
 * @param {String} psFieldName
 * @param {String[]} paTargetContNm
 */
function moveField(psFieldName,paTargetContNm){
	/** @type cpr.data.DataSet */
	var vcDsTarget = app.getAppProperty("dataset");
	var vsFieldName = "";
	switch(psFieldName){
		case "rows" :
			vsFieldName = "row"
			break;
		case "values" :
			vsFieldName = "value"
			break;
		default :
			vsFieldName = "column"
			break;
	}
	var vaDrops = app.lookup("grpHlpBd").getChildren().filter(function(each){
		return each instanceof cpr.controls.Container && each.userAttr("pivot-field-type") != "";
	});
	/** @type cpr.controls.Container */
	var targetContainer = vaDrops.find(function(ele){return ele.userAttr("pivot-field-type") == vsFieldName});
	var vcGrpAllCont = app.lookup("grpAllCn");
	if(!(paTargetContNm instanceof Array)) {
		paTargetContNm = [paTargetContNm];
	}
	paTargetContNm.forEach(function(each){
		var voHeader = vcDsTarget.getHeader(each);
		vcGrpAllCont.getChildren().find(function(ele){
			return ele.fieldLabel == voHeader.getName();
		}).dispose();
		
		var button = createFieldControl({
			columnName: voHeader.getName(),
			value: voHeader.getInfo() || voHeader.getName(),
			type : vsFieldName
		});
		setupSource(button);
		var childConstraint = {
			width : "100%",
			height : "28px"
		}
		targetContainer.addChild(button, childConstraint);
	});
	
}

/**
 * 피봇그리드를 그리는 헬프UDC의 기본 정보를 지정하는 함수입니다.
 * @param {rows:String[],
 *  cols:String[],
 *  values:String[]} poOption 열,행,값 초기설정
 * @param {Boolean} pbSubTtl 소계 여부
 * @param {Boolean} pbFooter 푸터합계 여부
 */
function setupHelper(poOption, pbSubTtl, pbFooter){
	
	/* 각 데이터 셋 필드를 초기화하여 전체 영역에 다시 그리기 */
	createDatasetField(app.getAppProperty("dataset"));
	
	var voOption = poOption;
	for(var key in voOption) {
		var ps = voOption[key];
		moveField(key, ps);
	}
	
	app.setAppProperty("isSubTotal", pbSubTtl, false);
	app.setAppProperty("isfooter", pbFooter, false);
	app.lookup("cbxSubTre").putValue(pbSubTtl);
	app.lookup("chkSum").putValue(pbFooter);
	
	app.lookup("btnRn").click();
}
exports.setupHelper = setupHelper;
/**
 * 타겟 데이터 셋의 컬럼명을 통해 피벗 조건을 생성할 수 있는 필드를 생성합니다. 
 * @param {cpr.data.DataSet} pcDataset
 */
function createDatasetField(pcDataset) {
	/* 필드 초기화 */
	removeDatasetFields();
	
	var vcDsTarget = pcDataset; // 피벗으로 그려질 타겟 데이터 셋
	
	var vcGrpAllCn = app.lookup("grpAllCn"); // 전체 컨텐츠 영역
	
	/* 데이터 셋의 컬럼을 전체 컨텐츠 영역에 동적 생성 */
	vcDsTarget.getColumnNames().forEach(function(each){
		var vcField = new cpr.controls.Button(each);
		
		/* 컬럼 정보를 통해 버튼 속성 지정 */
		vcField.fieldLabel = each; // 컬럼 이름
		vcField.value = vcDsTarget.getHeader(each).getInfo() || each; // 라벨
		vcField.style.setClasses(["secondary", "field"]); // 스타일
		
		/* 드래그 앤 드롭 설정 */
		setupSource(vcField);
		
		/* 전체 컨텐츠 영역에 자식 추가 */
		vcGrpAllCn.addChild(vcField, {
			width: "100%",
			height: "28px"
		});
	});
}


/**
 * 타겟 데이터 셋의 컬럼명을 통해 생성된 필드를 모두 제거합니다. 
 */
function removeDatasetFields() {
	var vcGrpHlpBd = app.lookup("grpHlpBd"); // 피벗 도우미 바디 영역
	
	/* field 스타일이 적용된 필드를 찾아 모두 삭제 */
	vcGrpHlpBd.getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("field");
	}).forEach(function(each){
		each.getParent().removeChild(each, true);
	});
	
	vcGrpHlpBd.redraw();
}


/**
 * 필드의 드래그 소스 컨텍스트를 지정합니다.
 * @param {cpr.controls.Button} control
 */
function setupSource(control) {
	/** @type cpr.controls.Output */
	var dragSourceFeedback;
	return new cpr.controls.DragSource(control, {
		onDragStart: function(context) {
			context.cursor = "grabbing";
			dragSourceFeedback = createDragSourceFeedback();

			control.style.css("opacity", "0.6");
			context.data = control["value"];

			var actualRect = control.getActualRect();
			dragSourceFeedback.value = context.data;
			app.getRootAppInstance().floatControl(dragSourceFeedback, cpr.controls.layouts.XYLayout.createConstraintWithRect(actualRect));
		},

		onDragMove: function(context) {
			var actualRect = context.source.control.getActualRect();
			var newRect = actualRect.getTranslated(context.dragDelta);
			app.getRootAppInstance().floatControl(dragSourceFeedback, cpr.controls.layouts.XYLayout.createConstraintWithRect(newRect));
		},

		onDragCancel: function(context) {
			// 취소 애니메이션
			if (dragSourceFeedback && dragSourceFeedback.disposed === false) {
				var actualRect = control.getActualRect();
				dragSourceFeedback.style.animateTo({
					"left": actualRect.left + "px",
					"top": actualRect.top + "px",
					"opacity": "0"
				}, 0.3);
				dragSourceFeedback.addEventListenerOnce("transitionend", function(e) {
					dragSourceFeedback.dispose();
					dragSourceFeedback = null;
				});
			}
			control.style.removeStyle("opacity");
		},

		onDragEnd: function(context) {
			if (dragSourceFeedback && dragSourceFeedback.disposed === false) {
				// 드롭 타겟이 존재한다면, 작아지는 애니메이션 표시.
				if (context.target) {
					dragSourceFeedback.style.animateTo({
						"transform": "scale(0, 0)"
					}, 0.1);
					dragSourceFeedback.addEventListenerOnce("transitionend", function(e) {
						dragSourceFeedback.dispose();
						dragSourceFeedback = null;
					});
				}

				// 드롭 타겟 없이 드래그 앤 드랍이 종료되었다면 캔슬 애니메이션 표시.
				else {
					var actualRect = control.getActualRect();
					dragSourceFeedback.style.animateTo({
						"left": actualRect.left + "px",
						"top": actualRect.top + "px",
						"opacity": "0"
					}, 0.3);
					dragSourceFeedback.addEventListenerOnce("transitionend", function(e) {
						dragSourceFeedback.dispose();
						dragSourceFeedback = null;
					});
				}
			}
			control.style.removeStyle("opacity");
			if (context.target){
				var vcField = context.source.control;
				vcField.getParent().removeChild(vcField, true);
			}
		}
	});
}


/**
 * 드래그 중 표시되는 피드백을 생성합니다.
 */
function createDragSourceFeedback() {
	var dragSourceFeedback = new cpr.controls.Button();
	dragSourceFeedback.style.css({
		"background-image" : "none",
		"background-color" : "#ffffff",
		"border-radius" : "0",
		"box-shadow": "0px 2px 10px #ddd",
		"cursor": "move",
		"opacity": "0.8",
		"overflow": "hidden",
		"padding" : "0px 5px",
		"text-align": "left",
		"text-overflow": "ellipsis"
	});
	
	return dragSourceFeedback;
}


/**
 * 각 필드의 영역에 드롭 타겟 컨텍스트를 설정합니다.
 * @param {cpr.controls.Container} control
 */
function setupVerticalLayoutTarget(control) {
	var targetContainer = control;
	
	/**
	 * 드롭 타켓에 마지막 자식 존재 여부를 판단합니다.
	 * @param {cpr.geometry.Point} location
	 * @return {cpr.controls.UIControl}
	 */
	function findAfter(location) {
		var children = targetContainer.getChildren();
		var after = children.find(function(each) {
			return each.isFloated() === false && location.y < each.getActualRect().center.y;
		});

		return after;
	}
	
	/**
	 * 어느 위치에 드롭할 것인지에 대한 피드백을 생성합니다.
	 */
	function createInsertFeedback() {
		var output = new cpr.controls.Output();
		output.style.css({
			backgroundColor: "#fa0000"
		});
		return output;
	}

	/** @type cpr.controls.UIControl */
	var feedback = null;
	var scrollAmount = 200;
	var edgeWidth = 60;
	
	/**
	 * 드롭 피드백을 생성하거나 이미 생성된 피드백을 리턴합니다.
	 * @return {cpr.controls.Output}
	 */
	function ensureFeedback() {
		if (feedback && feedback.disposed === false) {
			return feedback;
		} else {
			feedback = createInsertFeedback();
			return feedback;
		}
	}

	var dropTarget = new cpr.controls.DropTarget(targetContainer, {
		onDragEnter: function(context) {
			context.cursor = "copy";
		},
		onDrop: function(context) {
			var after = findAfter(context.pointerLocation);
			
			/* 새로운 필드 생성 */
			var button = createFieldControl({
				columnName : context.source.control.fieldLabel,
				value : context.data,
				type : targetContainer.userAttr("pivot-field-type")
			});
			
			button.style.css("opacity", "0");
			
			/* 드래그 앤 드롭 컨텍스트 설정 */
			setupSource(button);
			
			var childConstraint = {
				width: "100%",
				height: "28px"
			};
			
			/* 드롭될 필드의 위치 계산 */
			if (after) {
				var index = targetContainer.getChildren().indexOf(after);
				targetContainer.insertChild(index, button, childConstraint);
			} else {
				targetContainer.addChild(button, childConstraint);
			}
			
			/* 드롭될 필드가 추가된 이후 드롭에 대한 피드백 삭제 */
			if (feedback && !feedback.disposed) {
				feedback.dispose();
				feedback = null;
			}
			
			/* UI가 최초 1회 그려진 이후 애니메이션 실행 */
			cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function() {
				if (targetContainer.getViewPortRect().containsRect(button.getOffsetRect()) === false) {
					targetContainer.reveal(button, 0.3);
				}
				button.style.animateTo({
					"opacity": "1"
				});
				
				/* 자동 실행 상태인 경우 드롭 이후 즉시 실행 */
				if (app.lookup("cbxAtRn").checked){
					app.lookup("btnRn").click();
				}
			});
		},
		onDragLeave: function(context) {
			if (feedback && !feedback.disposed) {
				feedback.dispose();
				feedback = null;
			}
		},
		onDragIdle: function(cosntraint, repeat) {
			var actualRect = targetContainer.getActualRect();
			var animationDuration = dropTarget.idleRepeatTime;
			if (repeat) {
				animationDuration = dropTarget.idleRepeatTime;
			}
			if (Math.abs(actualRect.right - cosntraint.pointerLocation.y) < edgeWidth) {
				targetContainer.adjustScroll(scrollAmount, 0, animationDuration);
			} else if (Math.abs(actualRect.left - cosntraint.pointerLocation.y) < edgeWidth) {
				targetContainer.adjustScroll(-scrollAmount, 0, animationDuration);
			}
		},
		onDragMove: function(context) {
			/* 드롭 타겟의 위치에 따라 피드백의 위치를 계산 */
			var after = findAfter(context.pointerLocation);
			var y = 0;
			if (after) {
				y = after.getOffsetRect().y - targetContainer.getLayout().spacing * 0.5 - 1;
			} else {
				var lastChild = targetContainer.getChildren().reverse().find(function(e) {
					return e.isFloated() === false;
				});
				if (lastChild) {
					y = lastChild.getOffsetRect().bottom + 1;
				} else {
					y = 0;
				}
			}
			
			/* 피드백을 컨테이너에 플로팅 */
			var feedback = ensureFeedback();
 			targetContainer.floatControl(feedback, {
				left: "5px",
				width: "calc(100% - 10px)",
				top: y + "px",
				height: "1px"
			});
		}
	});
}


/**
 * 필드 컨트롤을 동적으로 생성합니다. 전체 영역에서 그 외 영역으로 드롭할 때 사용됩니다.
 * @param {{columnName : String, value : String, type : "all" | "column" | "row" | "value"}} poData
 */
function createFieldControl(poData) {
	var vcField = new cpr.controls.Button(poData.columnName);
	
	/* 필드에 대한 정보 설정 */
	vcField.fieldLabel = poData.columnName;
	vcField.value = poData.value || poData.columnName;	
	
	var vsDfCnfg = "";
	var vsDfClasses = ["field"];
	
	/* 필드가 위치할 영역(타입)에 따라 주어질 스타일 또는 상태값 설정 */
	var vsCnType = poData.type;
	if (vsCnType == "column" || vsCnType == "row"){
		vsDfCnfg = "asc";
	} else if (vsCnType == "value") {
		/** @type cpr.data.DataSet */
		var vcDsTarget = app.getAppProperty("dataset");
		
		var vsDataType = vcDsTarget.getHeader(poData.columnName).getDataType();
		var vsDfCnfg = vsDataType != "string" ? "sum" : "count";
	}
	
	/* 생성 이후에도 데이터를 참조할 수 있도록 사용자 정의 속성 정의 */
	vcField.userAttr("pivot-field-config", vsDfCnfg);
	vcField.style.setClasses(["secondary", "field", vsCnType, vsDfCnfg]);
	
	/* 필드를 선택하였을 때 컨텍스트 메뉴 생성 */
	vcField.addEventListener("click", function(e){
		var vcMnuField = new cpr.controls.Menu("mnuField");
		
		/* 필드 타입에 따라 컨텍스트 메뉴의 데이터를 변경 */
		var vcMnuDs = vsCnType == "value" ? app.lookup("dsVFld") : app.lookup("dsCRFld");
		vcMnuField.setItemSet(vcMnuDs, {
			label : "label",
			value : "value",
			parentValue : "parent",
			icon : "icon"
		});
		
		var vsFieldCnfg = e.control.userAttr("pivot-field-config");
		vcMnuField.value = vsFieldCnfg;
		
		/* 컨텍스트 메뉴 아이템을 선택했을 때 필드 상태값을 변경 */
		vcMnuField.addEventListener("item-click", function(e) {
			var control = e.control;
			var vcItem = e.item;
			
			vcField.style.removeClass(vsFieldCnfg);
			vcField.style.addClass(vcItem.value);
			vcField.userAttr("pivot-field-config", vcItem.value);
			
			control.blur();
			
			/* 필드의 정보가 변경되었을 때 자동 실행 여부에 따라 피벗 실행 */
			var isChecked = app.lookup("cbxAtRn").checked;
			if (isChecked){
				app.lookup("btnRn").click();
			}
		});
		/* 컨텍스트 메뉴를 클릭하거나 포커스를 잃었을 때 컨텍스트 메뉴 파기 */
		vcMnuField.addEventListener("blur", function(e) {
			var control = e.control;
			control.hide();
			control.dispose();
		});
		
		// 메인 화면에 스크롤이 있는 경우 현재 표시중인 영역까지 계산
		var voVwRct = app.getRootAppInstance().getContainer().getViewPortRect();
		
		/** @type cpr.geometry.Rectangle */
		var voActlRct = e.control.getActualRect(true);
		
		app.getRootAppInstance().getContainer().floatControl(vcMnuField, {
			top : voVwRct.top + voActlRct.bottom + "px",
			left : voActlRct.left + "px",
			width : voActlRct.width + "px"
		});
		
		vcMnuField.focus();
	});

	return vcField;
}


/**
 * 피벗의 포맷을 가져옵니다.
 * @return {cols:{column:string}[], rows:{column:string, label:string}[], values:{column:string, label:string, aggregator:(sum|avg|min|max|count)}[]}
 */
function getConfig() {
	/* 피벗 데이터 포맷 선언 */
	var voCnfg = {
		cols : [],
		rows : [],
		values : [],
		footers : [],
		rowGroups : false
	}
	
	/* 필드 상태값을 통해 데이터 정렬 */
	var vaRwCond = app.lookup("grpRwCn").getChildren().map(function(each){
		return each.fieldLabel + " " + each.userAttr("pivot-field-config");
	});
	
	var vaClmnCond = app.lookup("grpClmnCn").getChildren().map(function(each){
		return each.fieldLabel + " " + each.userAttr("pivot-field-config");
	});
	
	if (vaRwCond.length > 0 && vaClmnCond.length > 0){
		/** @type cpr.data.DataSet */
		var vcDsTarget = app.getAppProperty("dataset");
		vcDsTarget.setSort(vaRwCond.concat(vaClmnCond).join(","));
	}
	
	/* 피벗 설정 구조체 생성 */
	app.lookup("grpClmnCn").getChildren().forEach(function(/* cpr.controls.Button */ each, index){
		voCnfg.cols.push({
			column : each.fieldLabel,
			label : each.value
		});
	});
	
	app.lookup("grpRwCn").getChildren().forEach(function(/* cpr.controls.Button */ each, index){
		voCnfg.rows.push({
			column : each.fieldLabel,
			label : each.value,
			suppressible : true,
			suppressRef : (index - 1)
		});
	});
	
	app.lookup("grpValCn").getChildren().forEach(function(/* cpr.controls.Button */ each, index){
		voCnfg.values.push({
			column : each.fieldLabel,
			label : each.value,
			aggregator : each.userAttr("pivot-field-config")
		});
	});
	
	if(app.lookup("chkSum").checked){
		voCnfg.footers = voCnfg.values; 
	}
	voCnfg.rowGroups = app.lookup("cbxSubTre").checked;
	return voCnfg;
}

exports.getConfig = getConfig;

/**
 * 피벗 타겟 데이터 셋을 가져옵니다.
 * 
 * @return {cpr.data.DataSet}
 */
function getDataset() {
	/** @type cpr.data.DataSet */
	return app.getAppProperty("dataset");
}

exports.getDataset = getDataset;


/**
 * 피벗의 병합 표현 여부를 가져옵니다.
 * 
 * @retrun {"merged" | "split"}
 */
function getSuppressedCellType() {
	if(app.lookup("cbxSubTre").checked) {
		return "split";
	} else {
		return app.getAppProperty("suppressedCellType")	//app.lookup("grpValCn").getChildrenCount() > 0 ? "merged" : "split";
	}
}

exports.getSuppressedCellType = getSuppressedCellType;

/************************************************
 * 일반 이벤트
 ************************************************/


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	if(!app.getAppProperty("pivotHelperVisible")){
		app.getContainer().getLayout().setRowVisible(0, false);
	}else{
		/*피벗 도우미의 크기를 서정합니다.*/
		app.getContainer().getLayout().setRows([app.getAppProperty('pivotHelperMaxHeight')+"px", "1fr"]);
		app.getContainer().getLayout().setRowVisible(1, false);
	}
	
	/* 각 필드 영역에 드롭 타켓 컨텍스트를 지정 */
	app.lookup("grpHlpBd").getChildren().filter(function(each){
		return each instanceof cpr.controls.Container;
	}).forEach(function(each){
		setupVerticalLayoutTarget(each);
	});
	
	/*병합형태 지정*/
	app.lookup("grdPivot").suppressedCellType = app.getAppProperty('suppressedCellType');
	mnHeight = app.getContainer().getActualRect().height;	
	var rows = !app.getAppProperty("rows") == "" || app.getAppProperty("rows") != null ? app.getAppProperty("rows").replace(/(\s*)/g,'').split(",") : [];
	var cols = !app.getAppProperty("columns") == "" || app.getAppProperty("columns") != null  ? app.getAppProperty("columns").replace(/(\s*)/g,'').split(",") : [];
	var values = !app.getAppProperty("values") == "" || app.getAppProperty("values") != null ? app.getAppProperty("values").replace(/(\s*)/g,'').split(",") : [];
	var obj = {
				"rows" : rows,
				"cols" : cols,
				"values" : values
			};
	var num  =1;
	
	setupHelper(obj, app.getAppProperty('isSubTotal'), app.getAppProperty("isfooter"));
	
}


/*
 * Body에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	/* 데이터 셋 앱 속성이 변경되었을 때 피벗 도우미 실행 */
	if (e.property == "dataset"){
		if (e.newValue instanceof cpr.data.DataSet){
			createDatasetField(e.newValue);
		}
		/** @type cpr.data.DataSet */
		var _dataSet = e.newValue;
		_dataSet.addEventListener("load", function(e){
			app.lookup("btnRn").click();
		});
		
	}
	/*병합 타입이 변경됬을때 실행*/
	if (e.property == "suppressedCellType") {
		var grd = app.lookup("grdPivot");
		grd.suppressedCellType = e.newValue;
	}
	
	if(e.property == "isSubTotal"){
		app.lookup("cbxSubTre").value = e.newValue;
	}
	if(e.property == "isfooter"){
		app.lookup("chkSum").value = e.newValue;
	}
	
	if(e.property == "pivotHelperVisible"){
		/*피벗 도우미의 크기를 서정합니다.*/
		if (e.newValue == "true") {
			app.getContainer().getLayout().setRowVisible(0, true);
			//app.getContainer().getLayout().setRows([app.getAppProperty('pivotHelperMaxHeight') + "px", "1fr"]);
		} else {
			app.getContainer().getLayout().setRowVisible(0, false);
		}
	}
	
	if(e.property == "cbxAtRn"){
		app.lookup("cbxAtRn").value = e.newValue;
	}
	
}


/*
 * 버튼(btnTggl)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTgglClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTggl = e.control;

	var voGrpCntLt = btnTggl.getParent().getParent().getLayout();//app.getContainer().getLayout();
	/* 현재 피벗 도우미 바디 영역의 표시 여부에 따라 숨기거나 표시 */
	var vbRwVs = voGrpCntLt.isRowVisible(1);
	app.lookup('grpPivotHelper').getLayout()
	voGrpCntLt.setRowVisible(1, !vbRwVs);
	
	var vcHost = app.getHost();
	var vcHostCn = vcHost.getParent();
	
	var vnStdHt = 30; // 최소 사이즈
	var vnHeight = mnHeight;
	var vnbRwVs1 = app.getContainer().getLayout().isRowVisible(1);
	
	if (!vbRwVs){ // 미표시 -> 표시
		vnStdHt = app.getAppProperty("pivotHelperMaxHeight"); 
		btnTggl.style.removeClass("collapse");
		btnTggl.style.addClass("expand");		
		app.getContainer().getLayout().setRows([app.getAppProperty('pivotHelperMaxHeight')+"px", "1fr"]);
	} else { // 표시 -> 미표시
		vnHeight -= app.lookup("grpPivotHelper").getActualRect().height;
		btnTggl.style.removeClass("expand");
		btnTggl.style.addClass("collapse");
		app.getContainer().getLayout().setRows(["30px", "1fr"]);
	}
	app.getContainer().getLayout().setRowVisible(1, vnbRwVs1);
	
	/* 폼 레이아웃이 아닌 경우에만 자동으로 높이를 조절 */
	if (vcHostCn.getLayout() instanceof cpr.controls.layouts.FormLayout == false){
		vcHostCn.updateConstraint(vcHost, {
			height : vnHeight + "px"
		});
	}	
	
	/* 토글 이벤트 디스패치 */
	var voEvToggle = new cpr.events.CMouseEvent("toggle", {
		content : {
			"visible" : !vbRwVs,
			"height" : vnStdHt
		}
	});
	app.dispatchEvent(voEvToggle);
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbxAtRnValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cbxAtRn = e.control;
	
	/* 자동 실행 체크 여부에 따라 피벗 정보를 실행 */
	var vbAtUpd = cbxAtRn.checked;
	
	if (vbAtUpd){
		app.lookup("btnRn").click();
	}
	
	/* 자동 실행 상태가 변경되었을 때 업데이트 이벤트 디스패치 */
	var voEvAtUpd = new cpr.events.CMouseEvent("update");
	app.dispatchEvent(voEvAtUpd);
}


/*
 * 버튼(btnRst)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRstClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRst = e.control;
	
	/* 각 데이터 셋 필드를 초기화하여 전체 영역에 다시 그리기 */
	createDatasetField(app.getAppProperty("dataset"));
	app.lookup("cbxSubTre").putValue(false);
	app.lookup("chkSum").putValue(false);
	app.lookup("btnRn").click();
	
	/* 초기화 이벤트 디스패치 */
	var voEvRst = new cpr.events.CMouseEvent("reset");
	app.dispatchEvent(voEvRst);
}


/*
 * 버튼(btnRn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRn = e.control;
	
	/* 각 필드 영역에 대한 정보를 바탕으로 피벗 데이터 생성 후 실행 이벤트 디스패치 */
	var voEvExt = new cpr.events.CMouseEvent("execute", {
		content : {
			dataset : getDataset(),
			config : getConfig()
		}
	});
	
	setup(getDataset(), getConfig());

	app.dispatchEvent(voEvExt);
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onChkSumValueChange(e){
	var chkSum = e.control;
	
	app.lookup("btnRn").click();
}

/*
 * "푸터합계" 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(e){
	app.lookup("chkSum").checked = !app.lookup("chkSum").checked;
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCheckBoxValueChange(e){
	var checkBox = e.control;
	app.lookup("btnRn").click();
	
}

/////////////////////////////////////////////////////////////////////

/**
 * PivotGrid를 그리기 위해 설정하는 함수.
 * @param {cpr.data.DataSet} dataset
 * @param {cols:{column:string}[], rows:{column:string, label:string}[], values:{column:string, label:string, aggregator:(sum|avg|min|max|count)}[]}
 */
function setup(/* cpr.data.DataSet */ dataset, config) {
	
	var ds = app.lookup("ds");
	var grd = app.lookup("grdPivot");
	grd.suppressedCellType = getSuppressedCellType();
	ds.clear(true);
	grd.init(grd.getInitConfig());
	/**
	 * {
	 *   key:{
	 *    [newColumnName1]: value(config.rows[0].column),
	 *    [newColumnName1]: value(config.rows[1].column),
	 *    ...
	 *   },
	 *   data : { [value(config.cols[0].column)]: { [value(config.cols[1].column)]..: { [config.values[0].label]: 0+,  [config.values[1].label]: 0+ } } }
	 * }[]
	 */
	var dataRows = []; // PivotGrid에 적용할 DataSet의 Data를 가진 Row의 중간형태
	var objMap = new cpr.utils.ObjectMap(); // Entry{keyobj:{[key:string]:string}, valueObj:{[depthValue]:{[depthValue]:{[leaf1Label]:number, [leaf2Label]:number, ...}}}}
	/**
	 * DataSet Column 의  dataRows에서의 값 경로
	 * {Path:string[]}[]
	 */
	var dataCols = [];
	/**
	 * DataSet Column 정보
	 * {name:string, dataType:string|number|decimal, aggregator?:(sum|avg|min|max|count)}[]
	 */
	var dsColumns = [];
	var rowColLeng = config.rows.length; // 행으로 처리될 컬럼의 개수
	for(var idx = 0; idx < rowColLeng; idx++) {
		var rowCol = config.rows[idx]; // {column:string, label:string}
		var columnName = "column" + (idx + 1);
		/**
		 * @type cpr.data.header.Header
		 */
		var rowColHeader = dataset.getColumn(rowCol.column).getHeader();
		var dataType = rowColHeader.getDataType();
		
		dataCols[dataCols.length] = [columnName];
		dsColumns[dsColumns.length] = {
			name : columnName,
			dataType : dataType
		};
	}
	
	var colLeng = config.cols.length; // 컬럼 필드의 개수
	var valLeng = config.values.length; // 값 필드의 개수
	
	var rowCount = dataset.getRowCount();
	// 소스 DataSet의 값 집계
	for(var idx = 0; idx < rowCount; idx++) {
		/*
		 * @type cpr.data.Row
		 */
		var row = dataset.getRow(idx);

		var isNew = false;
		var keyObj = {};
		for(var rci = 0; rci < rowColLeng; rci++) {
			var rowCol = config.rows[rci]; // {column:string, label:string}
			keyObj["column" + (rci + 1)] = row.getValue(rowCol.column);
		}
		
		var objMapEntry = objMap.findEntry(function(key, value, index) {
			for(var rci = 0; rci < rowColLeng; rci++) {
				var colNm = "column" + (rci + 1);
				if(key[colNm] != keyObj[colNm]) {
					return false;
				}
			}
			return true;
		});//행에 들어간 정보를 통해서 오브젝트맵에 중복되지 않는 조합으로 key값을 세팅함. 
		var valueObj = null;
		if(objMapEntry) {
			valueObj = objMapEntry.value;
			isNew = false;
		} else {
			valueObj = {};
			objMap.put(keyObj, valueObj);
			isNew = true;
		}
		/*
		 *키값을 세팅하고 행에 들어가있는 컬럼의 데이터를 가져오고 objMap의 value에 세팅하는 작업을 함. 객체 참조를 통해  열에 집어넣은 순서대로 타고타고들어가서 컬럼정보를 설정
		 */
		var colPath = []; // 새로운 데이터셋의 데이터경로
		var parentValueWrap = valueObj;//참조에 의한 객체 복사로 인해 이미 오브젝트맵에 들어있는value object를 복사하여 핸들링
		for(var ci = 0; ci < colLeng; ci++) {
			var colConf = config.cols[ci]; // {column:string, label:string}
			var colValue = row.getValue(colConf.column);
			colPath[colPath.length] = colValue;

			var valueCol = parentValueWrap[colValue];
			if(valueCol == null) {
				valueCol = {};
				parentValueWrap[colValue] = valueCol;
			}
			parentValueWrap = valueCol;
		}
		// 통계 데이터 생성
		for(var vi = 0; vi < valLeng; vi++) {
			var valConf = config.values[vi]; // {column:string, label:string, aggregator:(sum|avg|min|max|count)}
			var value = row.getValue(valConf.column);
			var valLabel = valConf.label;
			var aggregator = valConf.aggregator;
			if(!aggregator) {
				aggregator = "sum";
			}
			
			// 통계함수별 처리(Nexacro는 sum, avg, count, min, max, function을 제공)
			switch(aggregator) {
				case "sum" : {
					if(parentValueWrap.hasOwnProperty(valLabel)) {
						parentValueWrap[valLabel] += value;
					} else {
						parentValueWrap[valLabel] = value;
					}
					break;
				}
				case "avg" : {
					if(parentValueWrap.hasOwnProperty(valLabel)) { // 총합
						parentValueWrap[valLabel] += value;
					} else {
						parentValueWrap[valLabel] = value;
					}
					var dataCountLabel = valLabel + "_cnt"; // 카운트 저장 필드명
					if(parentValueWrap.hasOwnProperty(dataCountLabel)) {
						parentValueWrap[dataCountLabel] += 1;
					} else {
						parentValueWrap[dataCountLabel] = 1;
					}
					break;
				}
				case "min" : {
					if(parentValueWrap.hasOwnProperty(valLabel)) {
						var oldValue = parentValueWrap[valLabel];
						if(oldValue > value) {
							parentValueWrap[valLabel] = value;
						}
					} else {
						parentValueWrap[valLabel] = value;
					}
					break;
				}
				case "max" : {
					if(parentValueWrap.hasOwnProperty(valLabel)) {
						var oldValue = parentValueWrap[valLabel];
						if(oldValue < value) {
							parentValueWrap[valLabel] = value;
						}
					} else {
						parentValueWrap[valLabel] = value;
					}
					break;
				}
				case "count" : {
					if(parentValueWrap.hasOwnProperty(valLabel)) {
						parentValueWrap[valLabel] += 1;
					} else {
						parentValueWrap[valLabel] = 1;
					}
					break;
				}
				default : {
					if(parentValueWrap.hasOwnProperty(valLabel)) {
						parentValueWrap[valLabel] += value;
					} else {
						parentValueWrap[valLabel] = value;
					}
				}
			}

			var colContains = false;
			var leafPath = colPath.concat([valLabel]);
			outer : for(var pi = rowColLeng; pi < dataCols.length; pi++) {
				var dsColPath = dataCols[pi];
				for(var pci = 0; pci < leafPath.length; pci++) {
					if(leafPath[pci] != dsColPath[pci]) {
						continue outer;
					}
				}
				colContains = true;
				break outer;
			}
			if(colContains == false) { // 기존 컬럼이 없을 경우 컬럼 추가
				dataCols[dataCols.length] = leafPath;
				// TODO 정밀도, 단위환산 등 처리
				dsColumns[dsColumns.length] = {
					name : "column" + dataCols.length,
					dataType : cpr.data.tabledata.DataType.NUMBER,
					aggregator : aggregator
				};
			}
		}
		
		if(isNew) { // 새로운 통계 행일 경우 행 추가
			dataRows[dataRows.length] = {key: keyObj, data: valueObj};
		}
	}

	// dataSet 초기화
	ds.parseData({"columns" : dsColumns});

	// DataSet row 생성
	for(var idx = 0; idx < dataRows.length; idx++) {
		var dataRow = dataRows[idx];
		
		var row = ds.pushRow();
		for(var ci = 0; ci < dataCols.length; ci++) {
			var dataCol = dataCols[ci]; // path:string[]
			
			var columnName = "column" + (ci + 1);
			var columnValue = null;
			
			if(ci < rowColLeng) {
				columnValue = dataRow.key[columnName];
			} else {
				var parentData = null;
				var dataWrapper = dataRow.data;
				var vpi = 0;
				valueLoop : for(; vpi < dataCol.length; vpi++) {
					if(dataWrapper[dataCol[vpi]] == null) {
						dataWrapper = null;
						break valueLoop;
					} else {
						parentData = dataWrapper;
						dataWrapper = dataWrapper[dataCol[vpi]];
					}
				}
				var aggregator = dsColumns[ci].aggregator;
				switch(aggregator) {
					case "avg" : {
						var total = dataWrapper;
						var dataCountLabel = dataCol[vpi - 1] + "_cnt";
						var dataCnt = dataCountLabel == "undefined_cnt" ? 0 : parentData[dataCountLabel];
						// TODO 정밀도 처리
						columnValue = (total / dataCnt).toFixed(2);
						break;
					}
					default : {
						columnValue = dataWrapper;
					}
				}
			}
			
			row.setValue(columnName, columnValue);
		}
		row.setState(cpr.data.tabledata.RowState.UNCHANGED);
	}
//	ds.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	/**
	 * @type cpr.controls.gridpart.GridConfig
	 */
	var gridInfo = createGridConfig(config, dataCols, dsColumns);
	if(!gridInfo)
		return;
	// dataSet 설정
	gridInfo.dataSet = ds;
	
	// pivot grid 초기화
	grd.init(gridInfo);
	
	// pivot grid redraw
	grd.redraw();
}

/**
 * GridConfig 객체를 생성하여 리턴한다.
 * @param {cols:{column:string}[], rows:{column:string, label:string}[], values:{column:string, label:string}[], footers:{column:string, label:string, aggressive:string}[],rowGroups : Boolean} config
 * @param [path:string][] dataCols 각 컬럼의 값 경로
 * @param {name:string, dataType:string|number|decimal}[] dsColumns
 * @return cpr.controls.gridpart.GridConfig
 */
function createGridConfig(config, dataCols, dsColumns) {
	// 그리드 영역 visible, 그리드 타이틀 rowCount 지정 (2026.06.29)
	if (!ValueUtil.isNull(dataCols) && !ValueUtil.isNull(dsColumns)) {
		app.getContainer().getLayout().setRowVisible(1, true);
		app.lookup("udcComGridTitle").rowCount = app.lookup("grdPivot").getRowCount();
	}
	var rowColLeng = config.rows.length; // 행으로 처리될 컬럼의 개수
	/**
	 * Grid의 header cell 정보
	 * @type {
	 *  label:string,
	 *  target:"columnName",
	 *  control?:string, // Control Type
	 *  sub: {label: String, target: String, control: String}[]
	 */
	var headerCells = [];
	var hRowCnt = 0;
	
	for(var idx = 0; idx < dataCols.length; idx++) {
		var dataCol = dataCols[idx]; // Path:string[]
		var dataColumn = dsColumns[idx]; // {name:string, dataType:string|number|decimal}
		
		if(hRowCnt < dataCol.length) {
			hRowCnt = dataCol.length;
		}
		
		if(rowColLeng > idx) {
			var headerCell = {
				label: config.rows[idx].label,
				target : dataColumn.name,
				sub: null
			};
			if(config.rows[idx].hasOwnProperty("suppressible")) {
				headerCell.suppressible = config.rows[idx]["suppressible"];
			}
			if(config.rows[idx].hasOwnProperty("suppressRef")) {
				headerCell.suppressRef = config.rows[idx]["suppressRef"];
			}
			// 단일 구조
			headerCells[headerCells.length] = headerCell;
		} else {
			// 계층형 구조
			var parentCellContainer = headerCells;
			var headerCell = null;
			for(var i = 0; i < dataCol.length; i++) {
				var label = dataCol[i];
				var match = false;
				var nextContainer = null;
				check : for(var j = 0; j < parentCellContainer.length; j++) {
					headerCell = parentCellContainer[j];
					if(headerCell && headerCell.label == label) { // TODO rowlabel의 cell은 비교 대상에서 제거
						match = true;
						nextContainer = headerCell.sub;
						if(nextContainer == null) {
							nextContainer = [];
							headerCell.sub = nextContainer;
						}
						break check;
					}
				}
				if(match == false) {
					nextContainer = [];
					headerCell = {
						label : label,
						target : null,
						sub : nextContainer
					};
					parentCellContainer[parentCellContainer.length] = headerCell;
				}
				parentCellContainer = nextContainer;
			}
			if(headerCell) {
				headerCell.sub = null;
				headerCell.target = dataColumn.name;
				headerCell.control = "number"; // 값을 출력하는 DetailCell은 NumberEditor로 처리
			} else {
				console.log("GridCell is null!!!");
			}
		}
	}
	
	/**
	 * @type cpr.controls.gridpart.GridConfig
	 */
	var gridInfo = {};
	/**
	 * Detail Cell에 매핑할 dataset의 columnName 및 셀의 속성 배열
	 * {
	 *  column:string,
	 *  suppressible?:boolean,
	 *  suppressRef?:number,
	 *  control?:string // detail cell의 컨트롤 타입
	 * }
	 */
	var detailCells = [];
	
	// grid columns 설정
	gridInfo.columns = [];
	for(var i = 0; i < dsColumns.length; i++) {
		gridInfo.columns[gridInfo.columns.length] = {
			width: mnColumnWidth + "px"
		};
	}
	// grid header 생성
	gridInfo.header = function() {
		var headerInfo = {
			rows: [],
			cells: []
		};
		// grid header의 행 설정
		for(var i = 0; i < hRowCnt; i++) {
			headerInfo.rows[headerInfo.rows.length] = {
				height: mnHeaderRowHeight + "px"
			};
		}
		
		var startRowIdx = 0;
		var startColIdx = 0;
		var maxRowSpan = hRowCnt;

		var cellCreator = function(headerCell, idx) {
			var cellInfo = {
				constraint: {},
				configurator: function(cell) {
					if(headerCell.target) {
						cell.targetColumnName = headerCell.target;
						cell.sortable = true;
					}
					cell.text = headerCell.label;
				}
			};
			cellInfo.constraint.rowIndex = startRowIdx;
			cellInfo.constraint.colIndex = startColIdx;
			cellInfo.constraint.rowSpan = maxRowSpan - getMaxDepth(headerCell) + 1;
			cellInfo.constraint.colSpan = getColSpan(headerCell);
			
			if(headerCell.target) {
				var detailCell = {
					column: headerCell.target
				};
				
				if(headerCell.hasOwnProperty("suppressible")) {
					detailCell.suppressible = headerCell["suppressible"];
				}
				if(headerCell.hasOwnProperty("suppressRef")) {
					detailCell.suppressRef = headerCell["suppressRef"];
				}
				if(headerCell.control === "number") {
					detailCell.control = "number";
				}
				
				detailCells[cellInfo.constraint.colIndex] = detailCell;
			}
			
			headerInfo.cells[headerInfo.cells.length] = cellInfo;
			
			if(headerCell.sub && headerCell.sub.length > 0) {
				var maxRowSpanBack = maxRowSpan;
				
				startRowIdx += cellInfo.constraint.rowSpan;
				startColIdx = cellInfo.constraint.colIndex;
				maxRowSpan -= cellInfo.constraint.rowSpan;

				headerCell.sub.forEach(cellCreator); // header group을 처리하기 위해 재귀호출
				
				maxRowSpan = maxRowSpanBack; // 재귀호출 후 값 원복
			}
			
			// 다음셀 연산을 위해 인덱스 값 초기화
			startRowIdx = cellInfo.constraint.rowIndex;
			startColIdx = cellInfo.constraint.colIndex + cellInfo.constraint.colSpan;
		}
		
		headerCells.forEach(cellCreator);
		
		
		return headerInfo;
	}();
	
	// grid detail 생성
	gridInfo.detail = function() {
		var detailInfo = {
			rows: [{
				height: mnDetailRowHeight + "px"
			}], // detail은 한 행
			cells: []
		};
		
		detailCells.forEach(function(detailCell, idx) {
			var cellInfo = {
				constraint: {rowIndex: 0, colIndex: idx},
				configurator: function(cell) {
					cell.columnName = detailCell.column;
					
					if (idx < rowColLeng && config.rowGroups) {
						cell.style.addClass("rowGroup");
					} else if (detailCell.control == "number") {
						cell.control = (function() {
							var control;
							/* 읽기 전용 모드 여부에 따라 컨트롤 변경 */
							if (cell.grid.readOnly) {
								control = new cpr.controls.Output();
								control.format = "s#,##0";
								control.dataType = "number";
							} else {
								control = new cpr.controls.NumberEditor();
							}
							
							control.style.css({
								"text-align": "right"
							});
							
							control.bind("value").toDataColumn(detailCell.column);
							
							// TODO 정밀도, 표현형식 처리
							
							return control;
						})();
					}
				
					if(detailCell.suppressible) {
						cell.suppressible = true;
					}
//					if(idx == 0) {
//						cell.suppressible = false;
//					}
					if(detailCell.hasOwnProperty("suppressRef")) {
						cell.suppressRef = detailCell["suppressRef"];
					}
				}
			};
			detailInfo.cells[detailInfo.cells.length] = cellInfo;
		});
		
		return detailInfo;
	}();
	
	if(config.footers != null && config.footers.length > 0 ) {		
		// 푸터에 합계 생성
		gridInfo.footer = function() {
			var footerInfo = {
				rows: [{height: mnFooterRowHeight + "px"}], 
				cells: []
			};
			
			//디테일의 수만큼 푸터를 생성한다. 
			var _firstSum = false;
			detailCells.forEach(function(detailCell, idx) {
				if(rowColLeng > idx ) {				
					var totInfo = {
						constraint: {
							rowIndex: 0,
							colIndex: 0,
							colSpan: rowColLeng
						},
						configurator: function(cell) {
							cell.expr = "'합계'";
							cell.style.css({
								"text-align": "right"
							});
							cell.style.addClass("pfooter");
						}
					}
					if(!_firstSum){
						footerInfo.cells[footerInfo.cells.length] = totInfo;
						_firstSum = true;
					}
				}else {
					var cellInfo = {
						constraint: {
							rowIndex: 0,
							colIndex: idx
						},		
						configurator: function(cell) {
								cell.expr = "getSum(\"" + detailCell.column + "\")";
								cell.control = (function() {
									var output = new cpr.controls.Output();
									output.format =  "s#,###";
									output.dataType = "number";
									output.style.css({
										"text-align": "right"
									});
									cell.style.addClass("pfooter");
									return output;
								})();
						}
					}
					footerInfo.cells[footerInfo.cells.length] = cellInfo;
				}
			});
			return footerInfo;
		}();
	}
	if(config.rowGroups) {
		/** @type Array */
		var vaDsCols = dsColumns;
		if(vaDsCols.length < 1) {
			return;
		}
		var vsFirstCol = vaDsCols[0].name;
		gridInfo.collapsible = true;
		gridInfo.rowGroup = (function(){
			
			var rowGroups = [];
			for(var i = 0 ;i < rowColLeng -1 ; i++){
				rowGroups.push({
					groupCondition : vaDsCols[i].name,
					collapseIndex : i,
					gheader : {
						"rows": [{
							"height": mnDetailRowHeight + "px"
						}],
						"cells" : (function(){
							var vaResult = [];
							dsColumns.forEach(function(each,idx){
								var voTemp = {};
								
								if(idx == (i + 1) && idx < rowColLeng){
									voTemp.constraint = {
										rowIndex: 0,
										colIndex: idx,
										colSpan: rowColLeng - 1 - i
									};
								}else if(idx > i && idx <= (rowColLeng - 1)){
									return;
								}else{
									voTemp.constraint = {
										rowIndex: 0,
										colIndex: idx,
									};
								}
								
								if(Object.keys(voTemp).length > 0){
									voTemp.configurator = function(cell){
										if (this.constraint.colIndex + this.constraint.colSpan < rowColLeng) {
											cell.expr = each.name;
											cell.style.addClass("rowGroup");
										} else if (each.dataType == "number") {
											cell.expr = "getSum('" + each.name + "')";
											cell.control = (function() {
												var output = new cpr.controls.Output();
												output.format = "s#,##0";
												output.dataType = "number";
												output.style.css({
													"text-align": "right",
//													"font-weight": "bold"
												});
												return output;
											})();
										} else if (this.constraint.colSpan > 0 && !each.aggregator) {
											cell.expr = "'소계'";
											cell.style.addClass("rowGroup");
										}
									}
								}
								vaResult.push(voTemp);
							});
							return vaResult;
						})()
					}
				});
				
			}
			return rowGroups;
		})();
	}
	return gridInfo;
}

/**
 * 전달받은 gridCell이 포함하는 최하단 노드의 개수를 리턴한다.
 * @param {label:string, target:"columnName", sub:{label:string,..}[]} gridCell
 * @return
 */
function getColSpan(gridCell) {
	var colSpan = 0;
	
	if(gridCell.sub == null || gridCell.sub.length == 0) {
		colSpan += 1;
	} else {
		var sub = gridCell.sub;
		for(var idx = 0; idx < sub.length; idx++) {
			colSpan += getColSpan(sub[idx]);
		}
	}
	
	return colSpan;
}

/**
 * 전달받은 gridCell이 포함하는 최하단 노드까지의 깊이를 리턴한다.
 * @param {label:string, target:"columnName", sub:{label:string,..}[]} gridCell
 */
function getMaxDepth(gridCell) {
	var sub = gridCell.sub;
	if(sub == null || sub.length == 0) {
		return 1;
	}
	var depth = 0;
	for(var i = 0; i < sub.length; i++) {
		var subcell = sub[i];
		var subCellDepth = getMaxDepth(subcell);
		if(depth < subCellDepth) {
			depth = subCellDepth;
		}
	}
	return depth + 1;
}


