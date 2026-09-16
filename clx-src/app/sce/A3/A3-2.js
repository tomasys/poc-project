/************************************************
 * screenLayout.js
 * Created at 2023. 2. 27. 오전 9:26:47.
 *
 * @author tomatosystem
 ************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad2(e){
	
	var subList = app.lookup("subList");
	subList.send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubListSubmitSuccess(e){
	var subList = e.control;
		
	app.lookup("barline").dataSet = app.lookup("dsLineBar");
	app.lookup("barline").drawChart();
		
	app.lookup("CLineChart").dataSet = app.lookup("dsCustomLine");
	app.lookup("CLineChart").drawChart();
		
	app.lookup("edit").dataSet = app.lookup("dsEditor");
	app.lookup("edit").drawChart();		
		
	app.lookup("ybar").dataSet = app.lookup("dsYbar");
	app.lookup("ybar").drawChart();
		
	app.lookup("scatt").dataSet = app.lookup("dsScatterData");
	app.lookup("scatt").drawChart();
	
	app.lookup("pyr").dataSet = app.lookup("dsPyramid");
	app.lookup("pyr").drawChart();			
	
}

/*
 * "eChart" 아웃풋(opt2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpt2Click(e){
	var opt2 = e.control;
	window.open("https://echarts.apache.org/examples/en/index.html");
}
