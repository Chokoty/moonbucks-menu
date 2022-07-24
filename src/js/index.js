import { $ } from "./utils/dom.js";
import store from "./store/index.js";
import MenuApi from './api/index.js';

// TODO 서버 요청 부분
// - [x] 웹 서버를 띄운다.
// - [x] 서버에 새로운 메뉴가 추가될 수 있도록 요청한다.
// - [x] 서버에 카테고리별 메뉴리스트를 불러온다.
// - [x] 서버에 메뉴가 수정될 수 있도록 요청한다.
// - [x] 서버에 메뉴의 품질상태가 토글될 수 있도록 요청한다.
// - [x] 서버에 메뉴가 삭제될 수 있도록 요청한다.

// TODO 리팩터링 부분
// - [x] localStorage에 저장하는 로직은 지운다.
// - [x] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

// TODO 사용자 경험
// - [x] API 통산이 실패하는 경우에 대해 사용자가 알 수 있게 alert으로 예외처리를 진행한다.
// - [x] 중복되는 메뉴는 추가할 수 없다.
    

// 오늘의 회고, 내가 혼자 짤 때의 전략 비교
// 1. 웹서버 띄우는거
// 2. BASE_URL 웹 서버 변수 먼저 선언
// 3. 비동기 처리하는데 해당하는 부분이 어디인지 확인하고, 웹서버에 오청하게끔 코드 짜기
// 4. 서버에 요청한 후 데이터를 받아서 화면에 렌더링 하기
// 5. 리펙터링 
// - localStorage 부분 지우기
// - API 파일 따로 만들어서 진행
// - 페이지 렌더링과 관련해서 중복되는 부분들 제거
// - 서버 요청할 때 option 객체 
// - 카테고리 버튼 클릭 시 콜백함수 분리
// 6. 사용자 경험 부분

function App() {
    this.menu = {
        espresso: [],
        frappuccino: [],
        blended: [],
        teavana: [],
        desert: [],
    };
    this.currentCategory = 'espresso';
    this.init = async () => {
        this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(this.currentCategory);
        render();
        initEventListeners();
    };
    
    const render = async () => {
        this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(this.currentCategory);
        const template = this.menu[this.currentCategory].map((menuItem) => {
            return `
            <li data-menu-id="${menuItem.id}" class="menu-list-item d-flex items-center py-2">
                <span class="w-100 pl-2 menu-name ${menuItem.isSoldOut ? "sold-out" : "" }">${menuItem.name}</span>
                <button
                type="button"
                class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
                >
                품절
                </button>
                <button
                type="button"
                class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
                >
                수정
                </button>
                <button
                type="button"
                class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
                >
                삭제
                </button>
            </li>`;
        })
        .join("");

        $("#menu-list").innerHTML = template;
        updateMenuCount();
    }

    const updateMenuCount = () => {
        const menuCount = this.menu[this.currentCategory].length;
        $(".menu-count").innerText = `총 ${menuCount}개`;
    }

    const addMenuName = async () => {
        if ($("#menu-name").value === "") {
            alert("값을 입력해주세요.");
            return;
        }

        const duplicatedItem = this.menu[this.currentCategory].find(menuItem => menuItem.name === $("#menu-name").value)
        console.log(duplicatedItem);
        if (duplicatedItem) {
            alert("이미 등록된 메뉴입니다. 다시 입력해주세요.");
            $("#menu-name").value = "";
            return;
        }
        const menuName = $('#menu-name').value;
        await MenuApi.createMenu(this.currentCategory, menuName);
        render();
        $("#menu-name").value = "";
    };
    
    const UpdateMenuName = async (e) => {
        const menuId = e.target.closest("li").dataset.menuId;
        const $menuName = e.target.closest("li").querySelector(".menu-name");
        const updatedMenuName = prompt("메뉴명을 수정하세요", $menuName.innerText);
        await MenuApi.updateMenu(this.currentCategory, updatedMenuName, menuId);
        render();
    }

    const RemoveMenuName = async (e) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            const menuId = e.target.closest("li").dataset.menuId;
            await MenuApi.deleteMenu(this.currentCategory, menuId);
            render();
            
        }
    }

    const soldOutMenu = async (e) => {
        const menuId = e.target.closest("li").dataset.menuId;
        await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
        render();
    }

    const changeCategory = (e) => {
        const isCategoryButton = e.target.classList.contains("cafe-category-name");
        if (isCategoryButton) {
            const categoryName = e.target.dataset.categoryName;
            this.currentCategory = categoryName;
            $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
            render();
        }   
    }

    const initEventListeners = () => {
        $('#menu-list').addEventListener("click", (e) => {
            if (e.target.classList.contains("menu-edit-button")) {
               UpdateMenuName(e);
               return;
            }
            if (e.target.classList.contains("menu-remove-button")) {
                RemoveMenuName(e);
                return;
            }
    
            if (e.target.classList.contains("menu-sold-out-button")) {
                soldOutMenu(e);
                return;
            }
        })
    
        $('#menu-form').addEventListener("submit", (e) => {
            e.preventDefault();
        })
    
        $("#menu-submit-button").addEventListener("click", addMenuName);
    
        $("#menu-name").addEventListener("keypress", (e) => {
            if(e.key !== 'Enter') {
                return;
            }
            addMenuName();       
        });
    
        $("nav").addEventListener("click", changeCategory);

        
    }

   

}

// App(); // 하지만 new 키워드를 빼먹는 순간 일반 함수 호출과 같아지기 때문에, 이 경우는 this가 window에 바인딩됩니다. (🐄오름)
var app = new App();
app.init();
