const store = {
    setLocalStorage(menu) {
        console.log(menu);
        localStorage.setItem("menu", JSON.stringify(menu)); 
    },
    getLocalStorage() {
        return JSON.parse(localStorage.getItem("menu"));
    }
};

export default store;