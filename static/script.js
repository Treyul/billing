"use strict";
/////////////////////////////////
////functions
const Decimal = (params) => {
  return +params;
};
/////////////////////////////////
////html elements from index
const BillContainer = document.querySelector(".bill");
const PaymentContainer = document.querySelector(".payments");
////html elements from login
const loginbtn = document.getElementById("lgn");
const form = document.getElementById("login_form");

////////////////////////////////
////get data from session storage for main page
const prevreading = sessionStorage.getItem("previous");
const curreading = sessionStorage.getItem("current");
const payments = sessionStorage.getItem("payment1");
const consumed = curreading - prevreading;

////////////////////////////////
////load html template into document
// PaymentContainer.insertAdjacentHTML(
//   "afterbegin",
//   `<div class="allrow heading">Payments</div><div class="allrow">${payments[2].slice(
//     0,
//     10
//   )}<p id="middle">${payments[1]}</p><p>${payments[0]}</p></div>`
// );
// BillContainer.insertAdjacentHTML(
//   "afterbegin",
//   ` <div class="allrow heading">As of 5th of June 2021</div>
//   <div class="allrow">Current Reading <p class="value">${curreading}</p></div>
//   <div class="allrow">Previous meter Reading<p class="value">${prevreading}</p></div>
//   <div class="allrow">Consumed water units<p class="value">${consumed}</p></div>
//   <div class="allrow">Current bill <p class="value">${
//     consumed * 130 + 50
//   }</p></div>
//   <div class="allrow">  Balance carried forward<p class="value">0</p></div>
//   <div class="allrow">Total bill <p class="value">${1800}</p>
//   </div>`
// );

////////////////////////////////
////html templates

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
        if (data["message"] == "null") {
          console.log("user does not exist");
        } else if (data["message"] == "success") {
          console.log(data["previousReading"]);
          console.log("herer");
          sessionStorage.setItem("previous", `${data["previousreading"]}`);
          sessionStorage.setItem("current", `${data["currentreading"]}`);
          sessionStorage.setItem("payment1", `${data["payment1"]}`);
          sessionStorage.setItem("payment2", `${data["payment2"]}`);
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
