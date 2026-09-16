/************************************************
 * P1-6.js
 * @프로그램설명 : 
 *
 * @작성일자 :  2025. 8. 5..
 * @작성자 : cin07
 *
 * @수정이력 : 수정일자 (수정자) 수정내용
 ************************************************/

/************************************************
 ** 글로벌 변수, 상수변수
 ************************************************/ 


/************************************************
 ** 글로벌 함수
 ************************************************/ 


/************************************************
 ** 파일내 로컬변수 선언  
 ************************************************/ 
var util = createCommonUtil();

/************************************************
 ** 사용자 정의 자바스크립트 함수를 기술 
 ************************************************/ 


/************************************************
 ** 자동으로 생성되는 이벤트 자바스크립트 함수를 배치
 ** (이벤트 생성시 자동으로 스크립트 함수 하위에 표시) 
 ************************************************/

/*
 * "저장" 버튼(btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveClick(e){
	var btnSave = e.control;
	app.close(app.lookup("dmPrintInfo"))
}

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	/** @type cpr.data.DataMap */
	var dm = app.getHostProperty("initValue");
	dm.copyToDataMap(app.lookup("dmPrintInfo"))
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb2SelectionChange(e){
	var cmb2 = e.control;
	// 4개 이상 선택인 경우 다른 아이템 disabled 처리
	if(cmb2.getSelection().length >= 4){
		cmb2.getItems().forEach(function(each){
			if(cmb2.getSelection().indexOf(each) == -1){
				cmb2.setItemEnable(each, false);
			}
		});
	}else{
		cmb2.getItems().forEach(function(each){
			if(cmb2.getSelection().indexOf(each) == -1){
				cmb2.setItemEnable(each, true);
			}
		});
	}
}

/*
 * 콤보 박스에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onCmb2Open(e){
	var cmb2 = e.control;
	// 4개 이상 선택인 경우 다른 아이템 disabled 처리
	if(cmb2.getSelection().length >= 4){
		cmb2.getItems().forEach(function(each){
			if(cmb2.getSelection().indexOf(each) == -1){
				cmb2.setItemEnable(each, false);
			}
		});
	}else{
		cmb2.getItems().forEach(function(each){
			if(cmb2.getSelection().indexOf(each) == -1){
				cmb2.setItemEnable(each, true);
			}
		});
	}
}
