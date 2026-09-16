
/************************************************
 * 공통 모듈 선언
 ************************************************/
var util = createCommonUtil();
var portlet = createPortlet();

/************************************************
 * 전역 변수 선언
 ************************************************/

/************************************************
 * 사용자 정의 함수
 ************************************************/

/************************************************
 * 컨트롤 이벤트
 ************************************************/

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	portlet.portletIndividual().updateConstraintByCookie(app, "grpPortlet");
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	util.Submit.send(app, "subOnLoad", function(pbSuccess){
		if(pbSuccess) {
			//조회되었습니다.
			util.Msg.notify(app, "INF-M005");
		}
	});
	
	// 포틀릿 적용
	portlet.createDragManager(app);
}

/*
 * "삭제" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	portlet.portletIndividual().deleteCookie();
}

/*
 * "적용" 버튼(btn2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn2Click(e){
	portlet.portletIndividual().updateConstraintByCookie(app, "grpPortlet");
}

/*
 * "저장" 버튼(btn3)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn3Click(e){
	portlet.portletIndividual().setCookie(app, "grpPortlet", 30);
}