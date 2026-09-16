/************************************************
 * A6-3.js
 * Created at 2025. 2. 12. 오후 4:02:24.
 *
 * @author ryu
 ************************************************/

function doAnimate (selectedAnimation) {
	// 기존 애니메이션 클래스 제거 
	var target = app.lookup("grpCard");
	target.style.setClasses(""); // 클래스 초기화
	
	// 선택된 애니메이션 추가
	 if (selectedAnimation){
	 	target.style.setClasses("animate__animated", selectedAnimation);
	 	
	 	// 애니메이션 종료 시 애니메이션 클래스 제거
	 	target.addEventListenerOnce("animationend", function(e){
	 		target.style.removeClass("animate__animated");
	 		target.style.removeClass(selectedAnimation);
	 	});
	 }
}

/*
 * 리스트 박스에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onListBoxItemClick(e){
	var selectedAnimation = e.item.value;
	doAnimate(selectedAnimation);
}

/*
 * 리스트 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트. 키코드 관련 상수는 {@link cpr.events.KeyCode}에서 참조할 수 있습니다.
 */
function onLbxListKeydown(e){
	var lbxList = e.control;
	if(e.keyCode == cpr.events.KeyCode.ENTER) {
		var listBox = app.lookup("lbxList");
		doAnimate(listBox.getSelection()[0].value);
	}
}
