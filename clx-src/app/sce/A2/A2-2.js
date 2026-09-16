/************************************************
 * A2-2.js
 * Created at 2025. 2. 12. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/

var util = createCommonUtil();

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	app.lookup("cmbLang").selectItem(0);
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbLangSelectionChange(e){
	var cmbLang = e.control;
	
	/* 언어 코드에 따른 다국어 설정 */
	cpr.I18N.INSTANCE.currentLanguage = cmbLang.getSelectionLast().value;
	
}

/*
 * 사용자 정의 컨트롤에서 afterLoad 이벤트 발생 시 호출.
 */
function onUdcexamace3AfterLoad(e){
	var udcexamace3 = e.control;
	udcexamace3.value = onCmbLangSelectionChange;
}

/*
 * "메세지 호출" 버튼(btnMsg)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMsgClick(e){
	var btnMsg = e.control;
	
	util.Msg.confirmDlg(app, "UI-M021");
}
