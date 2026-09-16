/************************************************
 * T0002.js
 * Created at 2023. 2. 16. 오후 3:17:12.
 *
 * @author tomatosystem
 ************************************************/

/**************************************************
 * 공통 모듈/전역 변수 선언
 **************************************************/
var util = createCommonUtil();

/**************************************************
 * 사용자 정의 함수
 **************************************************/

/**
 * 데이터 조회
 */
function doList() {
	if (!util.validate(app, "grpSearch")) return;
	
	console.log("클라이언트단에서 암호화 전 요청데이터");
	console.log(app.lookup("DM_PARAM").getDatas());
	
	util.Submit.send(app, "SUB_LIST", function(pbSuccess) {
		// 알림 - "조회되었습니다"
		util.Msg.notify(app, "INF-M001");
		
		app.lookup("udcComGridTitle").redraw();
	});
}

/**
 * 선택한 고객정보(returnValue)를 부모화면에 전달하고 팝업을 닫습니다
 */
function selectCustomer() {
	
	// 그리드에서 선택된 로우 인덱스
	var selectedRow = app.lookup("grdCust").getSelectedRow();
	
	if (!selectedRow) {
		util.Msg.alertDlg(app, "선택된 고객정보가 없습니다.");
		return;
	}
	
	var returnValue = selectedRow.getRowData();
	
	// 다이얼로그를 닫고 부모 프로그램에 returnValue를 전달합니다.
	app.close(returnValue);
}

/**************************************************
 * 이벤트 리스너 함수
 **************************************************/

/**
 * 데이터 암호화
 * @param {String} psPlaintext
 */
function encrypt(psPlaintext) {
	// 사용자의 비밀번호
	var passphrase = "exb6Frame";
	
	// salt 및 초기화 벡터(IV)(서버에서 전달받아야 하는 데이터로 임시구성)
	var saltHex = "0c68efe9e3c3a02b3f9f69a08987e4ab";
	var ivHex = "18b8e16db963ae9bfe9fccbe37d452e0";
	var iterations = 10000;
	var keySize = 128; // 키 크기는 128비트 (16바이트)
	
	var saltWordArray = CryptoJS.enc.Hex.parse(saltHex);
	var ivWordArray = CryptoJS.enc.Hex.parse(ivHex);
	
	var key = CryptoJS.PBKDF2(passphrase, saltWordArray, {
		keySize: keySize / 32, // Key size in words
		iterations: iterations
	});
	
	var encrypted = CryptoJS.AES.encrypt(psPlaintext, key, {
		iv: ivWordArray,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	
	return encrypted.toString();
}

/**
 * 데이터 복호화
 * @param {String} psPlaintext
 */
function decrypt(psPlaintext) {
	// 사용자의 비밀번호
	var passphrase = "exb6Frame";
	
	// salt 및 초기화 벡터(IV)(서버에서 전달받아야 하는 데이터로 임시구성)
	var saltHex = "0c68efe9e3c3a02b3f9f69a08987e4ab";
	var ivHex = "18b8e16db963ae9bfe9fccbe37d452e0";
	var iterations = 10000;
	var keySize = 128; // 키 크기는 128비트 (16바이트)
	
	var saltWordArray = CryptoJS.enc.Hex.parse(saltHex);
	var ivWordArray = CryptoJS.enc.Hex.parse(ivHex);
	
	var key = CryptoJS.PBKDF2(passphrase, saltWordArray, {
		keySize: keySize / 32, // Key size in words
		iterations: iterations
	});
	
	var decrypted = CryptoJS.AES.decrypt(psPlaintext, key, {
		iv: ivWordArray,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	
	return decrypted.toString(CryptoJS.enc.Utf8);
}

function requestEncoder(submission, poReqData) {
	var voReqData = poReqData["data"];
	Object.keys(voReqData).forEach(function(pcReqCtrlId) {
		var voData = voReqData[pcReqCtrlId];
		if (voData instanceof Array) {
			//데이터셋인 경우
			/** @type Array */
			var vaData = voData;
			vaData.forEach(function(poData) {
				Object.keys(poData).forEach(function(each) {
					if (each != "sts") {
						var vsColumnData = poData[each];
						poData[each] = encrypt(vsColumnData);
					}
				});
			});
		} else {
			//데이터맵인 경우
			Object.keys(voData).forEach(function(each) {
				var vsColumnData = voData[each];
				/** @type String */
				voData[each] = encrypt(vsColumnData);
			});
		}
	});
	return {
		content: {
			"data": voReqData
		}
	};
}

function responseDecoder( /* cpr.protocols.Submission */ submission, resData) {
	
	var _app = submission.getAppInstance();
	/*서버에서 내려온 값(xhr.responseText)*/
	var resDataObj = JSON.parse(resData);
	
	var voProtocolJson = {};
	voProtocolJson["_METADATA_"] = {
		success: true
	};
	voProtocolJson["DS_CUST"] = [];
	
	/*각 사이트별로 데이터를 구조화하는 스크립트를 작성한다.*/
	for (var key in resDataObj) {
		for (var subKey in resDataObj[key]) {
			if (typeof resDataObj[key][subKey] == "string") {
				var _obj = {};
				_obj[subKey] = resDataObj[key][subKey];
				voProtocolJson[key] = _obj;
				
			} else if (typeof resDataObj[key][subKey] == "object") {
				if (key == "DS_CUST") {
					// Base64 디코딩
					var cipherText = resDataObj[key][subKey]["jumin"];
					if (cipherText) {
						var decryptedData = decrypt(cipherText);
						
						resDataObj[key][subKey]["jumin"] = decryptedData;
						voProtocolJson['DS_CUST'].push(resDataObj[key][subKey]);
					}
				}
			}
		}
	}
	console.log("클라이언트단에서 주민번호 복호화 후 응답데이터");
	console.log(voProtocolJson);
	
	return {
		contentType: "application/json",
		content: voProtocolJson
	};
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	
	var subList = app.lookup("SUB_LIST");
	subList.setRequestEncoder(requestEncoder);
	subList.setResponseDecoder(responseDecoder);
	
	var voHost = app.getHost();
	if (voHost) {
		var voInitValue = app.getHostProperty("initValue");
		if (!ValueUtil.isNull(voInitValue.custNo)) {
			util.Control.setValue(app, "ipbCustNo", voInitValue.custNo);
			util.Control.redraw(app, "grpSearch");
			//값을 전달받은 경우 자동조회
			app.lookup("btnSearch").click();
		}
	}
}

/*
 * "조회" 버튼(btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSearchClick(e) {
	doList();
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGrdListRowDblclick(e) {
	var grd1 = e.control;
	
	// 선택한 고객정보를 부모화면에 전달하고 팝업을 닫습니다
	selectCustomer();
}

/*
 * "선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e) {
	var button = e.control;
	
	// 선택한 고객정보를 부모화면에 전달하고 팝업을 닫습니다
	selectCustomer();
}

/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(e) {
	var button = e.control;
	
	app.close();
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpbCustNoValueChange(e){
	doList();
}

