/************************************************
 * screenLayout.js
 * Created at 2023. 2. 27. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/

var util = createCommonUtil();

/*
 * "포틀릿 확인" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	
	var vcBtnHome = app.getRootAppInstance().lookup("btnHome");
	if(vcBtnHome) vcBtnHome.click();
}
