/************************************************
 * A31.js
 * Created at 2023. 5. 10. 오후 5:47:16.
 *
 * @author tomatosystem
 ************************************************/

/************************************************
 ** 글로벌 변수, 전역변수
 ************************************************/

var util = createCommonUtil();

var sysscvStatus = {
	"-1": "정의되지 않은 예외가 발생했습니다. Log 파일을 확인해주세요.",
	"0": "성공",
	"1": "시스템으로부터 IP 정보를 획득할 수 없습니다.",
	"2": "시스템으로부터 연결된 모니터 정보를 획득할 수 없습니다.",
	"3": "시스템으로부터 대상 모니터 정보를 획득할 수 없습니다.",
	"4": "시스템으로부터 모니터 해상도 정보를 획득할 수 없습니다.",
	"5": "지원하지 않는 창(Window)이동 옵션이 입력되었습니다. 지원 옵션: 1,2,3",
	"6": "타겟 프로세스를 식별할 수 없습니다.",
	"7": "창(Window) 모드 설정 실패.",
	"8": "창(Window) 이동 실패.",
	"9": "대상 파일/디렉토리가 존재하지 않음.",
	"10": "최소화 모드에서는 스크린샷 획득 불가.",
	"11": "스크린샷 획득 실패.",
	"12": "파일 저장 실패.",
	"13": "시스템 경로(System Path) 획득에 실패했습니다.",
	"14": "해당 파일이 이미 존재합니다.",
	"98": "유효하지 않은 파라미터가 입력되었습니다.",
	"99": "Win32 Dll method 호출에 실패했습니다."
}

var conn = null;

var vnStartTime = 0;
/************************************************
 ** 사용자 정의 함수
 ************************************************/
/**
 * eXDevice+ 연결
 */
function doOnload( ) {
	if(!conn) return;
	
	/* eXDevice+ 연결 */
	conn.connect();
	
	/* eXDevice+ 콜백 핸들러 */
	conn.onready = function() {
		util.Msg.notify(app, "eXDevice+가 연결되었습니다.");
	};
	conn.onerror = function(msg) {
		console.log("에러가 발생했습니다. " + JSON.stringify(msg));
	};
	conn.onclose = function(msg) {
		console.log("연결이 종료되었습니다. " + JSON.stringify(msg));
	};
	conn.onmessage = function(msg) {
//		console.log(JSON.stringify(msg));
	};
}

function getExdpServiceMsg(stsCd){
	return sysscvStatus[stsCd] + " Service status: [" + stsCd + "]";
}

function checkStatusCode(serviceIdentifier, serviceName, statusCode) {
	if(statusCode == "0000") { return true; }

//	console.log(serviceIdentifier + "호출 에러: " + getMsg(statusCode));
	return false;
}
function checkReturnCode(serviceIdentifier, serviceName, returnCode){
	if(returnCode == 0) { return true; }

//	console.log(serviceIdentifier + "에러: " + getExdpServiceMsg(returnCode));
	return false;
}

/************************************************
 ** 로컬 파일 제어 (READ/WRITE/COPY/DELETE)
 ************************************************/

function fileReadDialog() {
	var serviceIdentifier = "[파일 Read Dialog 서비스] ";
	var ipbFileOpenPath = app.lookup("fileReadPath");
	var serviceName = "WinInfo.FileReadDialog";
	var timeFormat = 0; //Unix Epoch or ISO 8601
	
	var vsDirPath = ValueUtil.isNull(app.lookup("fileReadPath").value) == true ? "" : app.lookup("fileReadPath").value;

	var param = {
		initDirPath: vsDirPath,
		dialogTitle: "파일탐색기",
		filter: "",
		timeFormat: timeFormat
	};
	
	// 로드 마스크 보임
	util.showLoadMask(app.getRootAppInstance());
		
	conn.send(serviceName, param, function(msg) {
		if (!checkStatusCode(serviceIdentifier, serviceName, msg["statusCode"])) {
			// 로드 마스크 숨김
			util.hideLoadMask(app.getRootAppInstance());
			util.Msg.notify(app, "에러가 발생했습니다.");
			return;
		}
		
		var returnCode = msg["return"]["returnValue"];
		if (!checkReturnCode(serviceIdentifier, serviceName, returnCode)) {
			// 로드 마스크 숨김
			util.hideLoadMask(app.getRootAppInstance());
			util.Msg.notify(app, "파일을 오픈하는 데 실패하였습니다.");
			return;
		}
		
		util.Msg.notify(app, "파일을 정상적으로 오픈하였습니다.");
		
		var csvContent = msg["return"]["data"];
		const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
		const headers = lines[0].split(',');
		
		const jsonArr = lines.slice(1).map(line => {
			const values = line.split(',');
			const obj = {};
			headers.forEach((header, idx) => {
				obj[header] = values[idx] || '';
			});
			return obj;
		});
		
		// 데이터 구성
		app.lookup("dsLMSList").build(jsonArr);
		
		// 선택한 파일의 경로
		app.lookup("fileReadPath").value = msg["return"]["selectedFilePath"].split("\\").slice(0,-1).join("\\");
		
		// 시작 시간
		app.lookup("udcGrdPrfCnt").startRanderTime =  moment(new Date(Math.floor(msg["return"]["startTime"]))).format("YYYY-MM-DD HH:mm:ss.SSS");
		vnStartTime = Math.floor(msg["return"]["startTime"]);
		
		app.lookup("udcGrdPrfCnt").redraw();
	});
}

/************************************************
 * 컨트롤 이벤트
 ************************************************/


/*
 * "파일 오픈" 버튼(btnFileOpen)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnFileOpenClick(e){
	var btnFileOpen = e.control;
	// 데이터 초기화
	app.lookup("udcGrdPrfCnt").resetRander();
	app.lookup("dsLMSList").clearData();
	app.lookup("totalCnt").value = 0;
	fileReadDialog();
}

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	cpr.core.ResourceLoader.loadScript("thirdparty/exdevice/jquery/external/jquery/jquery.js").then(function(input){
		var resourceLoader = new cpr.core.ResourceLoader();
		resourceLoader.addCSS("thirdparty/exdevice/jquery/jquery-ui.min.css");
		resourceLoader.addScript("thirdparty/exdevice/jquery/jquery-ui.min.js");
		resourceLoader.addScript("thirdparty/exdevice/exdevice-client.js");
		resourceLoader.addScript("thirdparty/exdevice/exdevice-common.js");
		resourceLoader.load().then(function(input){
			conn = new exdevice.Connector();
			doOnload();
		});
	});
}

/*
 * 데이터셋에서 load 이벤트 발생 시 호출.
 * build 메소드에 의해 데이터 구조가 재구성될 때 발생하는 이벤트. 초기 생성시에도 발생합니다.
 */
function onDsLMSListLoad(e){
	var dsLMSList = e.control;
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function(){
		// 종료 시간
		app.lookup("udcGrdPrfCnt").endRanderTime =  moment().format("YYYY-MM-DD HH:mm:ss.SSS");
		
		// 소요 시간
		app.lookup("udcGrdPrfCnt").totalRanderTime = Math.floor(moment().valueOf()) - vnStartTime;
		app.lookup("udcGrdPrfCnt").redraw();
		
		// 총 건수
		app.lookup("totalCnt").value = app.lookup("dsLMSList").getRowCount();
		
		// 로드 마스크 숨김
		util.hideLoadMask(app.getRootAppInstance());
	});
}
