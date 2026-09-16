/************************************************
 * P3-10.js
 * Created at 2025. 4. 24. 오후 4:47:07.
 *
 * @author tomatosystem
 ************************************************/

/************************************************
 ** 공통모듈
 ************************************************/

/************************************************
 ** 글로벌 변수, 전역변수
 ************************************************/
const util = createCommonUtil();

/************************************************
 ** 사용자 정의 함수
 ************************************************/

/************************************************
 ** 컨트롤 이벤트
 ************************************************/

/*
 * "닫기" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e) {
	app.close();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	const initValue = app.getHostProperty("initValue");
	if (initValue) {
		/** @type Array */
		const vaModDatas = initValue[4];
		
		if (!vaModDatas.length) return;
		
		let modData = "";		
		vaModDatas.forEach(function(each, idx) {
			modData += JSON.stringify(each);
			
			if(idx < vaModDatas.length-1){
				modData += "," + "\n";
			}
		});
		
		app.lookup("txa2").value = modData;
			
	}
}