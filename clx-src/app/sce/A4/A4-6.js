/************************************************
 * A4-6.js
 * Created at 2025. 8. 1. 오후 4:35:26.
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

/************************************************
 ** 사용자 정의 함수
 ************************************************/

/************************************************
 ** 컨트롤 이벤트
 ************************************************/
/*
 * "엑셀 업로드" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	app.lookup("fit1").openFileChooser();
}

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onFit1ValueChange(e){
	var fit1 = e.control;
	
	util.Submit.addImportGridFileParameter(app, "subImport", "grdImport", fit1.file, {
		headerLine: app.lookup("grdImport").header.getRowHeights().length
	});
	
	util.Submit.send(app, "subImport", function(pbSuccess){
		if(pbSuccess){ }
	});
}

/*
 * 파일 업로드에서 sendbutton-click 이벤트 발생 시 호출.
 * 파일을 전송하는 button을 클릭 시 발생하는 이벤트. 서브미션을 통해 전송 버튼에 대한 구현이 필요합니다.
 */
function onFid1SendbuttonClick(e){
	var fid1 = e.control;
	
	if(fid1.getSelection().length == 0) {
		util.Msg.alertDlg(app, "업로드 할 파일을 선택해주세요");
		return;
	}
	
	var vaUplaodFiles = fid1.getSelection();
	var submit = app.lookup("subUpload");
	var voFile;
	for (var i = 0, len = vaUplaodFiles.length; i < len; i++) {
		voFile = vaUplaodFiles[i];
		submit.addFileParameter(voFile.name, voFile);
	}
	
	util.Submit.send(app, submit.id, function(pbSuccess) {
		if (pbSuccess) {
			util.Msg.alertDlg(app, "업로드가 정상적으로 완료되었습니다.\n업로드 경로 : " + util.DataMap.getValue(app, "dmUpload", "uploadPath"));
		}
	});
}

/*
 * "다운로드" 버튼(btn2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn2Click(e){
	var fid = app.lookup("fid1");
	var vaSelection = fid.getSelection();
	
	var filePath = util.DataMap.getValue(app, "dmUpload", "uploadPath");
	if(ValueUtil.isNull(filePath)) {
		util.Msg.alertDlg(app, "업로드가 완료 된 후 다운로드를 할 수 있습니다.");
		return;
	}
	if(vaSelection.length == 0) {
		util.Msg.alertDlg(app, "다운로드 할 파일을 선택해주세요");
		return;
	}
	
	var count = vaSelection.length;
	var curIdx = 0;
	function downloadEachFile(psFileName) {
		util.DataMap.setValue(app, "dmParamDown", "filePath", "cmn/"+psFileName);
		util.DataMap.setValue(app, "dmParamDown", "fileNm", psFileName);
		util.DataMap.setValue(app, "dmParamDown", "resType", app.lookup("subDownload").responseType);
		util.Submit.send(app, "subDownload", function(pbSuccess) {
			if (pbSuccess) {
				if(curIdx < count-1) {
					downloadEachFile(vaSelection[++curIdx].name);
				}
			}
		});
	}
	
	downloadEachFile(vaSelection[curIdx].name);
}

/*
 * "전체다운로드" 버튼(btn3)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn3Click(e){
	var filePath = util.DataMap.getValue(app, "dmUpload", "uploadPath");
	if(ValueUtil.isNull(filePath)) {
		util.Msg.alertDlg(app, "업로드가 완료 된 후 다운로드를 할 수 있습니다.");
		return;
	}
	
	var fid = app.lookup("fid1");
	if(fid.getFiles().length == 0) {
		util.Msg.alertDlg(app, "다운로드 할 파일이 없습니다.");
		return;
	}
	
	var vaFiles = fid.getFiles().map(function(each){
		return each.name;
	});
	util.DataMap.setValue(app, "dmParamDown", "fileNm", vaFiles.join(","));
	util.Submit.send(app, "subDownloadAll", function(pbSuccess) {
		if (pbSuccess) {}
	});
}


