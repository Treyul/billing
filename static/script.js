"use strict";
/////////////////////////////////
////functions
const Decimal = (params) => {
  return +params;
};
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
        if (data["message"] == "Null") {
          const error = document.getElementById("error");
          const user = document.getElementById("user");
          const pass = document.getElementById("pass");
          error.classList.remove("hidden");
          user.value = "";
          pass.value = "";
          user.blur();
          pass.blur();

          console.log("user does not exist");
        } else if (data["message"] == "success") {
          console.log(data["previousReading"]);
          console.log("herer");
          sessionStorage.setItem("previous", `${data["previousreading"]}`);
          sessionStorage.setItem("current", `${data["currentreading"]}`);
          sessionStorage.setItem("payment1", `${data["payment1"]}`);
          sessionStorage.setItem("payment2", `${data["pay"]}`);
          sessionStorage.setItem("balance", `${data["balance"]}`);
          window.location.href = "/";
          // BillContainer.insertAdjacentHTML("afterbegin", BillHtml);
          console.log("passed redirect");
        }
      });
      //TODO get billing data about the user(readings, payments)
    });
  } catch (error) {
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
  login();
});
