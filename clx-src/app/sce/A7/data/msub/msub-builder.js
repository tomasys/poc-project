/**
 * OpenAPI Specification Version 3.1.0
 */

/**
 * OpenAPI Spec을 조회할 URL.
 */
//var OPENAPISPEC_URL = "http://localhost:8080/ui/app/sce/A7/data/msub/api-docs.json";
var OPENAPISPEC_URL = "http://127.0.0.1:52194/woori-bank-poc/clx-src/app/sce/A7/data/msub/api-docs.json";
/**
 * 전체 OpenAPI Spec을 임시저장하는 변수.
 */
var OPENAPISPEC = null;

/**
 * 검색조건을 임시저장하는 변수.
 */
var APIQUERY = null;

/**
 * 목록에서 선택한 API의 정보를 임시저장하는 변수.
 */
var SELECTED_SPEC = null;


/**
 * 검색창의 개인화 영역 표시할 필드 목록.
 * 검색조건에 입력된 값은 리턴되는 객체의 value 값을 키로 가지는 javascript 객체로 getLookupInfo 함수에 전달된다.
 * @return {[key:string]:string}
 */
function getSearchFields(){
	return {
		"URI": "uri",
		"Method": "method",
		"TAG" : "tag"
	}
}

/**
 * OpenAPI 목록 검색 URL을 리턴합니다.
 * 플러그인은 리턴된 주소로 검색 요청을 보냅니다.
 * @param {uri:string, method:string, tag:string} query 검색조건란에 입력된 값.
 * @return {url: string, method: string, request: any} OpenAPI 목록을 조회할 URL 정보.
 */
function getLookupInfo(query) {
	APIQUERY = query ? query : {}; // 검색조건 값 임시 저장
			
	return {
		"url": OPENAPISPEC_URL
		, "method": "get"
		, "request": APIQUERY
		,headers: {//API서버에 서비스 요청시, 요청헤더에 원하는 헤더정보를 추가
			"Accept" : "application/json;charset=utf-8",
			"foo":"bar"
		}
		
	}
}

/**
 * 서버의 검색 조회 결과를 스튜디오로 전달하는 모델로 리턴해야 합니다.
 * @param {any} response getLookupInfo에서 리턴한 요청 정보에 대한 서버 응답객체. OpenAPI Spec.
 * @return {{interfaces:any[], columns:string[]}[]} interfaces- API 목록. columns- API 목록에 출력될 컬럼 목록. 
 */
function convertSearchResult(response) {
	console.log("convertSearchResult");
	
	var interfaceArray = [];
	var result = {
		interfaces: interfaceArray
		, columns: ["uri", "method", "tag", "operationId"] // 목록에 보여질 컬럼 목록
	};
	
	var methods = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
	
	var pathItems = response.paths;
	for(var uri in pathItems) {
		var pathItem = pathItems[uri];
		
		methods.forEach(function(method) {
			addInterfaceItemProperty(uri, method, pathItem[method], interfaceArray);
		});
	}
	
	OPENAPISPEC = response; // OpenAPI Spec 임시저장
	
	return result;
}
/**
 * 서비스 목록을 생성하는 함수
 * @param {String} uri getLookupInfo에서 리턴한 요청 정보에 대한 서버 응답객체의 key값.(Mapping url);
 * @param {any} method 매핑된 서비스에서 소비가능한 http메서드타입
 * @param {any} operationObj uri 키에 대한 value값 서비스 구성정보가 담긴 객체정보
 * @param {Array} interfaceArray convertSearchResult함수에서 리턴하는 result의 interface에 들어가는 객체
 */
function addInterfaceItemProperty(uri, method, operationObj, interfaceArray) {
	if(operationObj == null) {
		return;
	}
	var tags = operationObj.tags;
	var tagText = tags ? tags.join(",") : "";
	
	// 검색조건 필터링	
	if(APIQUERY != null && APIQUERY.uri != "" && uri.indexOf(APIQUERY.uri) == -1) {
		return;
	}
	if(APIQUERY != null && APIQUERY.method != "" && APIQUERY.method.toLowerCase() != method) {
		return;
	}
	if(APIQUERY != null && APIQUERY.tag != "" && tagText.indexOf(APIQUERY.tag) == -1) {
		return;
	}
	
	var interfaceItem = {
		uri: uri
		, method: method
		, tag: tagText
		, operationId: operationObj.operationId
	};
	
	interfaceArray.push(interfaceItem);
}

/**
 * 사용자가 검색된 서비스 목록에서 서비스를 선택(더블클릭)했을 때 호출 됩니다.
 * 클라이언트는 서비스 상세스펙을 얻을 수 있는 url과, 해당 url로 전송할 request 객체를 반환 합니다.
 * 요청정보가 반환되면 플러그인은 반환된 요청정보로 서버에 상세스펙을 요청하고 결과를 convert 함수에 전달합니다.
 * null이 반환되면 플러그인은 인자가 null 인 값으로 convert 함수를 호출합니다.
 * @param {uri:string, method:string, tag:string, operationId:string} spec 사용자가 선택한 서비스 JSON 객체.
 * @return {url: string, method: string, request: any} | null API 상세정보 요청 스펙.
 */
function getServiceURL(spec) {
	console.log("getServiceURL");
	
	SELECTED_SPEC = spec; // 선택된 스펙정보 임시 저장
	
	return null; // 별도의 서버 호출이 없음
}

/**
 * 서비스상세 얻기서버가 반환한 서비스 스펙을 eb6 데이터 매트릭스 정의식으로 변환하여 리턴하여야 합니다.
 * @param {any} service null이 전달됨.
 * @return {requet:any, response:any}
 */
function convert(service) {
	console.log("convert");
		
	// 임시저장된 OpenAPI Spec에서 선택된 API의 상세정보 조회
	var pathItems = OPENAPISPEC.paths;
	var operationObj = pathItems[SELECTED_SPEC.uri][SELECTED_SPEC.method];
		
	var result = {
	  submission : convetSubmission(SELECTED_SPEC),
	  request: convertRequest(operationObj.requestBody), // requestBody/content/"application/json"
	  response: convertResponse(operationObj.responses) // responses/200/content/"application/json"
	};
	
	console.log("result: ");
	console.log(result);
	
	return result;
}

function convetSubmission(spec){
	return {
		action : spec["uri"],
		method : spec["method"],
		comment : spec["operationId"]
	}	
}

/**
 * 요청변환.
 * @param {any} requestBody
 */
function convertRequest(requestBody) {
	var requestMatrix = {
		format: "object"
		, data: {}
	};
	if(requestBody == null) {
		return requestMatrix;
	}
	var content = requestBody.content;
	if(content == null) {
		return requestMatrix;
	}
	var jsonBody = content["application/json"]; // json 형식만 지원
	if(jsonBody == null) {
		return requestMatrix;
	}
	
	convertSchema(requestMatrix, jsonBody.schema, "request", null);
	
	return requestMatrix;
}

/**
 * 응답변환.
 * @param {any} response
 */
function convertResponse(response) {
	var responseMatrix = {
		format: "object"
		, data: {}
	};
	if(response == null) {
		return responseMatrix;
	}
	var responseObj = response["200"]; // 정상처리만 지원
	if(responseObj == null) {
		return responseMatrix;
	}
	var content = responseObj.content;
	if(content == null) {
		return responseMatrix;
	}
	var jsonBody = content["application/json"]; // json 형식만 지원
	if(jsonBody == null) {
		return requestMatrix;
	}
	
	convertSchema(responseMatrix, jsonBody.schema, "response", null);
	
	return responseMatrix;
}

/**
 * 매트릭스 구성 후 자동으로 DataSet 또는 DataMap을 구성합니다.
 * @param matrix 구성할 MatrixSubmission 정보 객체
 * @param schema OpenAPI Spec Schema
 * @param (dataset|datamap) parentType 가장 가까운 상위 DataControl의 Type(datamap|dataset)
 */
function convertSchema(matrix, schema, propNm, parentType) {
	if(schema == null) {
		return;
	}
	
	var ref = schema["$ref"];
	if(ref) {
		schema = getRef(ref);
	}
	
	var currentType = null;
	
	if(schema.comment) matrix.comment = schema.comment;
	
	var type = schema.type;
	switch(type) {
		case "object": {
			matrix.format = "object";
			matrix.data = {};
			
			if(parentType == null || parentType == "datamap") {
				matrix.dataControl = toDataCtrlNm(propNm, "dm"); // 자동구성 Entry(DataControl의 ID)
				matrix.dataControlType = "datamap"; // 자동구성 Entry(dataset|datamap)
				currentType = "datamap";
			} else if(parentType == "dataset") { // Parent DataControl에 병합
				currentType = parentType;
			}
			
			//matrix.comment = schema.comment;			
			var props = schema.properties;			
			
			for(var prop in props) {
				var propModel = {};				
				matrix.data[prop] = propModel;				
				convertSchema(propModel, props[prop], prop, currentType);
			}
			
			break;
		}
		case "array": {
			matrix.format = "array";
			matrix.data = {};
			
			if(propNm == null) {
				console.log(schema);
			}
			
			matrix.dataControl = toDataCtrlNm(propNm, "ds"); // 자동구성 Entry(DataControl의 ID)
			matrix.dataControlType = "dataset"; // 자동구성 Entry(dataset|datamap)
			if(parentType === "dataset") {
				matrix.linked = true; // 자동구성 Entry(상위 dataControl 행에 종속성 처리 여부)
			}
			currentType = "dataset";
			
			var props = null;
			var items = schema.items;
			if(items && items["$ref"]) {
				var itemSchema = getRef(items["$ref"]);
				
				var itemType = itemSchema.type;
				if(itemType != "object") { // 객체 타입 배열만 지원
					throw new Exception("Array ItemType: " + itemType + " is not supported.");
				}
				props = itemSchema.properties;
			} else {
				var itemType = items.type;
				throw new Exception("Array ItemType: " + itemType + " is not supported.");
			}
			for(var prop in props) {
				var propModel = {};
				matrix.data[prop] = propModel
				convertSchema(propModel, props[prop], prop, currentType);
			}
			
			break;
		}
		case "boolean":
		case "string": {
			matrix.format = "string";			
			if(parentType != null) {
				matrix.path = "@" + propNm; // 자동구성 Entry('@' + FIELD_NAME)
			}
			break;
		}
		case "integer":
		case "number": {
			matrix.format = "number"; // FIXME: decimal로 처리해야 하는 경우 decimal로 처리
			if(parentType != null) {
				matrix.path = "@" + propNm; // 자동구성 Entry('@' + FIELD_NAME)
			}
			break;
		}
		default: {
			console.log("Unsupported Type: " + type);
		}
	}
	
}

/**
 * 참조 Object를 조회합니다.
 * @param {any} ref 참조키
 */
function getRef(ref) {
	var refPath = ref.split("/");
	var schemaObj = OPENAPISPEC;
	refPath.forEach(function(path) {
		if(schemaObj == null || path == "#" || path == "") {
			return;
		}
		schemaObj = schemaObj[path];
	});
	
	return schemaObj;
}

/**
 * 프로퍼티명의 가장 앞 첫 문자를 대문자로 바꾸고 prefix를 합친 값을 리턴합니다.
 * @param {any} str
 * @param {any} prefix
 */
function toDataCtrlNm(str, prefix) {
 	return prefix + str.charAt(0).toUpperCase() + str.substring(1);
}
/**
 * 
 */