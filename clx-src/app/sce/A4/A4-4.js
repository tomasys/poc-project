/************************************************
 * A4-4.js
 * Created at 2025. 2. 13. 오전 9:57:06.
 *
 * @author daye
 ************************************************/

/*
 * "시나리오 S1 화면 호출" 버튼(btn1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn1Click(e){
	var btn1 = e.control;
	
	var rootAppIns = app.getRootAppInstance();
	if(rootAppIns.hasAppMethod("doOpenMenuToEa")) {
		rootAppIns.callAppMethod("doOpenMenuToEa", "app/sce/A1/A1-1.clx", null, {
			forceOpen: true,isSelect : false,
			readyCallback: function(ea) {
//				rootAppIns.callAppMethod("doOpenMenuToEa", app.app.id+".clx");
//				cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function(){
//					app.lookup("btn1").focus();
//				});
			}
		});
	}
}
