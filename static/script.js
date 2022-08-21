"use strict";
/////////////////////////////////
////html elements from index
const loginbtn = document.getElementById("lgn");
const form = document.getElementById("login_form");

//////////////////////////////
////login functions
const login = async () => {
  try {
    let response = await fetch("/login", {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ ...[...new FormData(form).values()] }),
    }).then(function (response) {
      if (response.status !== 200) {
        console.log("Errorr!!");
        return;
      }
      response.json().then(function (data) {
        //get response from server
        console.log(data);
        if (data["message"] == "Null") {
          const error = document.getElementById("error");
          const user = document.getElementById("user");
          const pass = document.getElementById("pass");
          loginbtn.removeAttribute("disabled");
          loginbtn.nextSibling.remove();
          error.classList.remove("hidden");
          user.value = "";
          pass.value = "";
          user.blur();
          pass.blur();

          console.log("user does not exist");
        } else if (data["rights"] == "user") {
          console.log(data["previous_reading"]);
          console.log("herer");
          sessionStorage.setItem("data", JSON.stringify(data));
          sessionStorage.setItem("previous", `${data["previous_reading"]}`);
          sessionStorage.setItem("current", `${data["current_reading"]}`);
          sessionStorage.setItem("payment1", `${data["payment1"]}`);
          sessionStorage.setItem("payment2", `${data["pay"]}`);
          sessionStorage.setItem("balance", `${data["balance"]}`);
          window.location.href = "/";
          // BillContainer.insertAdjacentHTML("afterbegin", BillHtml);
          console.log("passed redirect");
        } else if (data["rights"] == "admin") {
          sessionStorage.setItem("statistics", JSON.stringify(data));
          window.location.href = "/adm";
        }
      });
      //TODO get billing data about the user(readings, payments)
    });
  } catch (error) {
    loginbtn.removeAttribute("disabled");
    loginbtn.nextSibling.remove();
    console.log("there is an error!!!!", error);
  }
};

//////////////////////////////
////login event listeners
// loginbtn.addEventListener("click", function () {});
loginbtn.addEventListener("click", function (e) {
  e.preventDefault();
  loginbtn.insertAdjacentHTML(
    "afterend",
    `<i class="fa-solid fa-spinner fa-pulse fa-lg"></i>`
  );
  loginbtn.setAttribute("disabled", true);
  login();
});
