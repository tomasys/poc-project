/**
 * OpenAPI Specification Version 3.1.0
 */

//var URL_PREFIX = "http://localhost:8080/ui/app/sce/A7/data/sub/";
var URL_PREFIX = "http://127.0.0.1:52194/woori-bank-poc/clx-src/app/sce/A7/data/sub/";
/**
 * 검색 필드에 표시할 항목을 리턴 합니다.
 * 서비스 검색필드 정의
 */
function getSearchFields(){
	return {
		"서비스 ID" :  "interfaceid",
		"서비스 명" : "interfacename"
	}
}

/**
 * 전문 목록 검색 URL을 리턴합니다.
 * MCI 플러그인은 해당 주소로 검색 요청을 보냅니다.
 * @param {interfaceid:string, interfacename:string} query
 */
function getLookupInfo(query) {
	console.log("검색 조건", query);
	return {
		// 검색 URL
		url : URL_PREFIX + "api-docs.json",
		
		// 요청 메소드
		method : "get",
		
		// 리퀘스트 바디 또는 파라미터로 전달할 데이터
		request : query,
		
		//API서버에 서비스 요청시, 요청헤더에 원하는 헤더정보를 추가
		headers: {
			"Accept" : "application/json;charset=utf-8",
			"foo":"bar"
		}
	};
}

/**
 * 서버의 검색 조회 결과를 스튜디오로 전달하는 모델로 리턴해야 합니다. 
 * @param {any} response
 * @return {{interfaces:any[], columns:string[]}[]}
 */
function convertSearchResult(response){
	return {
		// 인터페이스 목록
		interfaces : response.foo.interface,
		
		// 화면에 노출할 컬럼 이름 목록
		columns: ["interfaceid", "interfacename"]
	};
}

/**
 * 사용자가 검색된 서비스 목록에서 서비스를 선택하고, 불러오기를 눌렀을 때 호출 됩니다.
 * 클라이언트는 서비스 상세 스펙을 얻을 수 있는 url과, 해당 url로 전송할  request 객체를 반환 해야 합니다.
 * 
 * @param {interfaceid:string, interfacename:string} spec 사용자가 선택한 서비스 JSON 객체.
 * @return {url:string, request:any}
 */
function getServiceURL(spec) {
	console.log("서비스 " + spec.interfaceid + "(" + spec.interfaceid + ") URL을 요청 받음");
	return {
		url: URL_PREFIX + spec.interfaceid,
		method: "post",
		request: {}
	}
}

/**
 * 서비스 상세 얻기 서버가 반환한 서비스 스펙을 eb6 데이터 매트릭스 정의 식으로 변환하여 리턴 하여야 합니다.
 * @param {any} service
 */
function convert(service) {
	var result = service.wrap;
	return result;
}