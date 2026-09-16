/************************************************
 * A3-8.js
 * Created at 2025. 8. 1. 오후 4:33:15.
 *
 * @author dyseo
 ************************************************/

/************************************************
 ** 공통모듈
 ************************************************/
var util = createCommonUtil();

/************************************************
 ** 글로벌 변수, 전역변수
 ************************************************/
var originalChildren = [];

/************************************************
 ** 사용자 정의 함수
 ************************************************/

/************************************************
 ** 컨트롤 이벤트
 ************************************************/
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	/** @type cpr.data.DataSet */
	var dsAddWorkFlow = app.lookup("dsAddWorkFlow");
	
	// 데이터셋으로 값을 받아서 추가할 수 있도록
	var vcGrpWorkflow = app.lookup("grpWorkflow");
	dsAddWorkFlow.getRowDataRanged().forEach(function(each){
		var workFlowUnit = new udc.poc.udcPocWorkflowUnit();
		workFlowUnit.btnText = each.title;
		workFlowUnit.shape = each.shape;
		workFlowUnit.src = each.src;
		vcGrpWorkflow.addChild(workFlowUnit, {
			"autoSize": "both"
		});
	});
	
	vcGrpWorkflow.getChildren().forEach(function(/* udc.poc.udcPocWorkflowUnit */ each, index){
		// 그룹 인덱스 순서 설정
		each.setAppProperty("index", index);
		
		// 로드시 첫번째 버튼 활성화
		if(index==0) each.setActive();
	});

	// 자식 사이에 Output 추가하며 다시 넣기
	originalChildren = vcGrpWorkflow.getChildren();
	for(var i = 0; i < originalChildren.length; i++){
		var opt = new cpr.controls.Output();
		opt.value = "→";
		if(i < originalChildren.length - 1){
			vcGrpWorkflow.insertChild(i*2+1, opt, {
				"autoSize": "both"
			});
		}
	}
}

/*
 * 루트 컨테이너에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(e){
	
	// 버튼으로 프로세스 이동시에 스타일 적용
	if(!ValueUtil.isNull(app.getAppProperty("btnIndex"))){
		// 현재 인덱스
		var vnCurrentIdx = Number(app.lookup("btnNext").userAttr("index"));
		// 클릭한 버튼 인덱스
		var vcBtnIndex = app.getAppProperty("btnIndex");
		
		// 마지막 버튼이 아닌 경우
		if (vcBtnIndex != (originalChildren.length - 1)) {
			util.Control.setVisible(app, true, "btnNext");
		} else {
			util.Control.setVisible(app, false, "btnNext");
		}
		
		// 첫번째 버튼이 아닌 경우
		if (vcBtnIndex != 0) {
			util.Control.setVisible(app, true, "btnPrev");
		} else {
			util.Control.setVisible(app, false, "btnPrev");
		}
		
		// 현재 활성화 되어있던 버튼 제거
		originalChildren.forEach(function(/* udc.poc.udcPocWorkflowUnit */ each, index){
			if(index == vnCurrentIdx){
				each.removeActive();
			};
		});
		
		// 인데스 업데이트
		app.lookup("btnNext").userAttr("index", String(app.getAppProperty("btnIndex")));
	}
}

/*
 * "다음" 버튼(btn3)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn3Click(e){
	var btnNext = e.control;
	
	// 이전 버튼 활성화
	util.Control.setVisible(app, true, "btnPrev");
	// 현재 인덱스
	var vnCurrentIdx = Number(btnNext.userAttr("index"));
	
	// 조건 만족할 경우(다음버튼 클릭) 시에 다음 프로세스 버튼 활성화
	originalChildren.forEach(function(/* udc.poc.udcPocWorkflowUnit */ each, index){
		if(index == vnCurrentIdx){
			each.removeActive();
		} else if(index == (vnCurrentIdx+1)){
			each.setActive();
		}
	});
	
	// 인덱스 +1
	btnNext.userAttr("index", String(vnCurrentIdx+1));
	if(vnCurrentIdx == (originalChildren.length - 2)){
		util.Control.setVisible(app, false, "btnNext");
	}
}

/*
 * "이전" 버튼(btn7)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn7Click(e){
	var btn7 = e.control;
	
	// 다음버튼 활성화
	util.Control.setVisible(app, true, "btnNext");
	var vcBtnNext = app.lookup("btnNext");
	
	// 현재 인덱스
	var vnCurrentIdx = Number(vcBtnNext.userAttr("index"));
	
	// 조건 만족할 경우(이전버튼 클릭) 시에 이전 프로세스 버튼 활성화
	originalChildren.forEach(function(/* udc.poc.udcPocWorkflowUnit */ each, index){
		if(index == vnCurrentIdx){
			each.removeActive();
		} else if(index == (vnCurrentIdx-1)){
			each.setActive();
		}
	});
	
	// 인덱스 -1
	vcBtnNext.userAttr("index", String(vnCurrentIdx-1));
	if(vnCurrentIdx == 1){
		util.Control.setVisible(app, false, "btnPrev");
	}
}

/*
 * 사용자 정의 컨트롤에서 proccess-click 이벤트 발생 시 호출.
 */
function onUdcpocworkflow1ProccessClick(e){
	// 클릭한 proccess 정보
	var info = e.option.info;
	app.lookup("embapp1").initValue = info.txt;
}
