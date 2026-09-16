/************************************************
 * comNotiPop.js
 * Created at 2023. 5. 16. 오후 2:35:58.
 *
 * @author csj_9
 ************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	var voInitvalue = app.getHost().initValue;
	app.lookup('opt2').value = voInitvalue.time;
	app.lookup('hspt1').value = voInitvalue.Text || voInitvalue.MSG;
	
	if(!ValueUtil.isNull(voInitvalue.adminMsg)) {
		app.lookup("grp2").getLayout().setRowVisible(1, true);
		app.lookup("optAdminMsg").value = voInitvalue.adminMsg;
	}
}
