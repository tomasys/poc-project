/************************************************
 * A7-2.js
 * Created at 2025. 2. 12. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/
var util = createCommonUtil();

/*
 * "third-party 리스트" 버튼(btnOpen)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnOpenClick(e){
	var btnOpen = e.control;
	window.open("https://edu.tomatosystem.co.kr/eXCFrame-third/","thirdparty","width=1280,height=720");
//	window.open("http://localhost:8081","thirdparty","width=1280,height=720");
}
