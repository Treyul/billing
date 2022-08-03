/////////////////////////
////variables
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();
const day = date.getDate();
const monthNumber = month + 1;
let gridRows = "";

/////////////////////////
////elements
const PaymentContainer = document.querySelector(".payments");
const Search = document.getElementById("searchresults");
const MenuClose = document.getElementById("menuclose");
const PaymentSearch = document.querySelectorAll("#second");
const BillContainer = document.querySelector(".bill");
const mainContainer = document.querySelector(".main");
const BillSearch = document.querySelectorAll("#first");
const rows = document.getElementById("results");
const close = document.querySelector(".close");
const menu = document.getElementById("menu");
const viewmenu = document.getElementById("viewmenu");
const pay = document.getElementById("pay");

//get session storages necessary to render index page
const prevreading = sessionStorage.getItem("previous");
const curreading = sessionStorage.getItem("current");
const payments = sessionStorage.getItem("payment1");
const bal = sessionStorage.getItem("balance");
const batd = sessionStorage.getItem("data");
let currpay = sessionStorage.getItem("payment2");
const consumed = curreading - prevreading;
const MnthBill = consumed * 130 + 50;
var rretrieve = JSON.parse(batd);
console.log(rretrieve);

///////////////////////////
////templates
const SearchTemplate = `
<div id="center"></div>
<div style="text-align: center"><b>Start Month</b> <br /><input type="month"class="range"id="start"/></div>
<div style="text-align: center" class='empty'><b>End Month </b><br /><input type="month" class="range" id="end"/></div>
<div class="hidden empty" id="perror"></div>`;

let paymenthtml = `<div class="allrow heading">Payments</div>`;

console.log(currpay);

currpay = currpay.split("'").filter((ac) => ac.length > 1);
if (currpay != "NULL") {
  currpay.forEach((el) => {
    if (el.length > 2) {
      const desc = el.split(",");
      paymenthtml += `
    <div class="allrow">${desc[2].slice(0, 10)}
    <p id="middle">${desc[1]}</p>
    <p>${desc[0]}</p></div>`;
    }
  });
}

console.log(currpay, typeof currpay);

//insert templates into respective containers
PaymentContainer.insertAdjacentHTML("afterbegin", paymenthtml);

BillContainer.insertAdjacentHTML(
  "afterbegin",
  ` <div class="allrow heading">As of ${day} of June 2021</div>
      <div class="allrow">Current Reading <p class="value">${curreading}</p></div>
      <div class="allrow">Previous meter Reading<p class="value">${prevreading}</p></div>
      <div class="allrow">Consumed water units<p class="value">${consumed}</p></div>
      <div class="allrow">Current bill <p class="value">${MnthBill}</p></div>
      <div class="allrow">  Balance carried forward<p class="value">${+bal}</p></div>
      <div class="allrow">Total bill <p class="value">${
        MnthBill + +bal
      }</p></div>
      <div class="allrow">Paid<p class="value">${payments}</p></div>
      <div class="allrow">Balance<p class="value">${
        MnthBill + +bal - payments
      }</p></div>
`
);

////////////////////////////////////
////event listeners
close.addEventListener("click", function () {
  Search.classList.add("hidden");
  mainContainer.style.filter = "blur(0px)";
  ResultsCleaner(rows);
});

viewmenu.addEventListener("click", function () {
  menu.classList.remove("hidden");
});
MenuClose.addEventListener("click", function () {
  menu.classList.add("hidden");
});
// pay.addEventListener("click", function (e) {
//   e.preventDefault();
// });

PaymentSearch.forEach((ac) => {
  ac.addEventListener("click", function () {
    //clear contents of results element
    rows.innerHTML = "";
    rows.insertAdjacentHTML("afterbegin", SearchTemplate);

    //select elements from the template
    const center = document.getElementById("center");
    const start = document.getElementById("start");
    const error = document.getElementById("perror");
    const end = document.getElementById("end");

    //make results container and blur main container
    mainContainer.style.filter = "blur(4.5px)";
    start.style.marginBottom = "1.5rem";
    Search.classList.remove("hidden");

    //set default values for month inputs
    start.value = `${year}-${monthNumber.toString().padStart(2, "0")}`;
    end.value = `${year}-${monthNumber.toString().padStart(2, "0")}`;

    // add event listener to the end month input
    end.addEventListener("mouseout", function (e) {
      // initiate template for the search reslts
      let PaymentTemplate = ``;
      ResultsCleaner(rows);

      //get months between which bill data should be returned
      let startyear = +start.value.slice(0, 4);
      let startmonth = +start.value.slice(5, 7);
      const Endyr = +e.target.value.slice(0, 4);
      const Endmonth = +e.target.value.slice(5, 7);

      //make error element hidden
      error.classList.add("hidden");

      //handle exception if date range is invalid
      if (startyear > Endyr || (startmonth > Endmonth && startyear == Endyr)) {
        error.innerHTML = "End month cannot be less than Start month";
        error.classList.remove("hidden");
      } else if (Endmonth > monthNumber && Endyr == year) {
        error.innerHTML = "Please select a valid End Month";
        error.classList.remove("hidden");
      } else {
        // fetch data from database using fetch api
        try {
          let response = fetch("/payment", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify([startyear, startmonth, Endyr, Endmonth]),
          }).then(function (response) {
            if (response.status !== 200) {
              console.log("Error from server");
            }

            //get response from the server
            response.json().then(function (data) {
              if (data["message"] !== "success") {
                console.log(data["message"]);
              } else {
                delete data["message"];

                console.log(data["payments"]);

                //get values from each string
                data["payments"].forEach((ac) => {
                  //delete characters from the element
                  const pay = ac.split(/[{}]/g);
                  pay.forEach((args) => {
                    if (args.length > 1) {
                      const payment = args.split(";");

                      payment.forEach((args) => {
                        // append data to template
                        const descriptions = args.split(",");
                        PaymentTemplate += `<div class="allrow dispp">${descriptions[2].slice(
                          0,
                          10
                        )}
                                          <p id="middle">${descriptions[1]}</p>
                                          <p>${descriptions[0]}</p></div>`;
                      });
                    }
                  });
                });
                rows.insertAdjacentHTML("beforeend", PaymentTemplate);
              }
            });
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  });
});

// add listeners to elements with id of first
BillSearch.forEach((ac) => {
  ac.addEventListener("click", function () {
    //clear results in the div container
    rows.innerHTML = "";
    rows.insertAdjacentHTML("afterbegin", SearchTemplate);

    /////////////////////////////
    ////declare variables
    const center = document.getElementById("center");
    const start = document.getElementById("start");
    const error = document.getElementById("perror");
    const end = document.getElementById("end");
    gridRows = `auto `;
    rows.style.gridTemplateRows = gridRows;
    let len = 0;

    //make results container visible
    start.style.marginBottom = "1.5rem";
    mainContainer.style.filter = "blur(4.5px)";
    Search.classList.remove("hidden");

    //set default values for the month inputs
    start.value = `${year}-${monthNumber.toString().padStart(2, "0")}`;
    end.value = `${year}-${monthNumber.toString().padStart(2, "0")}`;

    //add event listener to enable searching of bills
    end.addEventListener("mouseout", function (e) {
      bills = "";
      gridRows = `auto `;
      rows.style.gridTemplateRows = gridRows;
      ResultsCleaner(rows);

      //get range between which bill result data should be returned
      let startyear = +start.value.slice(0, 4);
      let startmonth = +start.value.slice(5, 7);
      const Endyr = +e.target.value.slice(0, 4);
      const Endmonth = +e.target.value.slice(5, 7);

      //make error element hidden
      error.classList.add("hidden");

      //handle exception if date range is invalid
      if (startyear > Endyr || (startmonth > Endmonth && startyear == Endyr)) {
        error.innerHTML = "End month cannot be less than Start month";
        error.classList.remove("hidden");
      } else if (Endmonth > monthNumber && Endyr == year) {
        error.innerHTML = "Please select a valid End Month";
        error.classList.remove("hidden");
      } else {
        // make a call to the server
        try {
          let readings = [];
          let response = fetch("/bills", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify([startyear, startmonth - 1, Endyr, Endmonth]),
          })
            .then(function (response) {
              if (response.status !== 200) {
                console.log("error");

                return;
              }

              // fetch response from the server
              response.json().then(function (data) {
                if (data["message"] !== "success") {
                  console.log("Error");
                } else {
                  delete data["message"];

                  console.log(Object.entries(data));

                  readings = Object.entries(data);

                  let BillTemplate = "";
                  let len = 0;
                  while (readings.length > 0) {
                    if (startyear == Endyr) {
                      const bills = readings[1];
                      const pay = readings[0];

                      // deconstruct the response from server
                      const [year, reading] = bills;
                      const [mes, payment] = pay;
                      while (reading.length < Endmonth) {
                        reading.unshift(0);
                      }
                      while (payment.length <= Endmonth) {
                        payment.unshift(0);

                        console.log(payment);
                      }
                      let cfbalance = 0;

                      while (startmonth <= Endmonth) {
                        // get summage of payment of the month
                        const paid = payment[startmonth];
                        let amount = 0;
                        paid
                          .split(/[{}]/g)
                          .filter((ac) => ac.length > 1)
                          .forEach((ac) => {
                            const amt = ac
                              .split(";")
                              .reduce(
                                (acc, mov) => acc + +mov.split(",")[0],
                                0
                              );
                            amount = amt;
                          });

                        // prepare data to be rendered to the template
                        const previous = reading[startmonth - 2];
                        const current = reading[startmonth - 1];
                        const consumed = current - previous;
                        const bill = consumed * 130 + 50;
                        const balance = bill + cfbalance - amount;

                        //
                        if (previous == undefined) {
                          startmonth++;
                          continue;
                        }
                        BillTemplate += `<div class="bill" style="margin-bottom:2rem;grid-row:span 11;height:20rem">
                            <div class="allrow heading">As of 5th of ${
                              months[startmonth - 1]
                            } ${year.slice(1, 5)}</div>
                            <div class="allrow">Current Reading <p class="value">${current}</p></div>
                            <div class="allrow">Previous meter Reading<p class="value">${previous}</p></div>
                            <div class="allrow">Consumed water units<p class="value">${consumed}</p></div>
                            <div class="allrow">Current bill <p class="value">${bill}</p></div>
                            <div class="allrow">  Balance carried forward<p class="value">${cfbalance}</p></div>
                            <div class="allrow">Total bill <p class="value">${
                              bill + cfbalance
                            }</p></div>
                            <div class="allrow">Paid<p class="value">${amount}</p></div>
                            <div class="allrow">Balance<p class="value">${balance}</p></div>
                            </div>`;
                        len++;
                        startmonth++;
                        cfbalance = balance;

                        console.log(startmonth);
                      }
                    }

                    console.log(bills);

                    readings.pop();
                    readings.pop();
                  }

                  //prepare results container to render the template
                  len > 0 ? (len = Math.ceil(len / 2)) : len;

                  console.log(len);

                  center.style.gridRow = `1/span ${11 * len}`;
                  gridRows += `repeat(${11 * len},2rem )`;
                  rows.insertAdjacentHTML("beforeend", BillTemplate);
                  rows.style.gridTemplateRows = gridRows;

                  console.log("Loaded");
                }
              });
            })
            .finally(function (data2) {});
        } catch (error) {
          console.log(error);
        }
      }
    });
  });
});

////////////////////////
////functions
const ResultsCleaner = (args) => {
  while (
    args.lastChild?.classList?.value.includes("empty") == false ||
    args.lastChild?.classList == "undefined"
  ) {
    args.lastChild.remove();
  }
};
