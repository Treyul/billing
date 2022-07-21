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
const monthNumber = month + 1;
let gridRows = "";

/////////////////////////
////elements
const PaymentContainer = document.querySelector(".payments");
const Search = document.getElementById("searchresults");
const PaymentSearch = document.getElementById("second");
const BillContainer = document.querySelector(".bill");
const mainContainer = document.querySelector(".main");
const BillSearch = document.getElementById("first");
const rows = document.getElementById("results");
const close = document.querySelector(".close");

///////////////////////////
////templates
const SearchTemplate = `
<div id="center"></div>
<div style="text-align: center"><b>Start Month</b> <br /><input type="month"class="range"id="start"/></div>
<div style="text-align: center" class='empty'><b>End Month </b><br /><input type="month" class="range" id="end"/></div>
<div class="hidden empty" id="perror"></div>`;

//get session storages necessary to render index page
const prevreading = sessionStorage.getItem("previous");
const curreading = sessionStorage.getItem("current");
const payments = sessionStorage.getItem("payment1").split(",");
const consumed = curreading - prevreading;

//insert templates into respective containers
PaymentContainer.insertAdjacentHTML(
  "afterbegin",
  `<div class="allrow heading">Payments</div>
  <div class="allrow">${payments[2].slice(0, 10)}
  <p id="middle">${payments[1]}</p>
  <p>${payments[0]}</p></div>`
);

BillContainer.insertAdjacentHTML(
  "afterbegin",
  ` <div class="allrow heading">As of 5th of June 2021</div>
      <div class="allrow">Current Reading <p class="value">${curreading}</p></div>
      <div class="allrow">Previous meter Reading<p class="value">${prevreading}</p></div>
      <div class="allrow">Consumed water units<p class="value">${consumed}</p></div>
      <div class="allrow">Current bill <p class="value">${
        consumed * 130 + 50
      }</p></div>
      <div class="allrow">  Balance carried forward<p class="value">0</p></div>
      <div class="allrow">Total bill <p class="value">${1800}</p>
      </div>`
);

////////////////////////////////////
////event listeners
close.addEventListener("click", function () {
  Search.classList.add("hidden");
  mainContainer.style.filter = "blur(0px)";
  ResultsCleaner(rows);
});

PaymentSearch.addEventListener("click", function () {
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

  end.addEventListener("mouseout", function (e) {
    let PaymentTemplate = ``;
    ResultsCleaner(rows);

    //get months between which bill data should be returned
    let startyear = +start.value.slice(0, 4);
    let startmonth = +start.value.slice(5, 7);
    const Endyr = +e.target.value.slice(0, 4);
    const Endmonth = +e.target.value.slice(5, 7);

    //make error element hidden
    error.classList.add("hidden");

    //handle exception if date range is wrong
    if (startyear > Endyr || (startmonth > Endmonth && startyear == Endyr)) {
      error.innerHTML = "End month cannot be less than Start month";
      error.classList.remove("hidden");
    } else if (Endmonth > monthNumber && Endyr == year) {
      error.innerHTML = "Please select a valid End Month";
      error.classList.remove("hidden");
    } else {
      try {
        let response = fetch("/payment", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify([startyear, startmonth, Endyr, Endmonth]),
        }).then(function (response) {
          if (response.status !== 200) {
            console.log("Error from server");
          }
          response.json().then(function (data) {
            if (data["message"] !== "success") {
              console.log(data["message"]);
            } else {
              delete data["message"];
              console.log(data["payments"]);
              data["payments"].forEach((ac) => {
                const pay = ac.split(/[{}]/g);
                pay.forEach((args) => {
                  if (args.length > 1) {
                    const payment = args.split(";");
                    payment.forEach((args) => {
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
      console.log("clicked");
    }
  });
});

BillSearch.addEventListener("click", function () {
  //clear results in the div container
  rows.innerHTML = "";
  rows.insertAdjacentHTML("afterbegin", SearchTemplate);
  /////////////////////////////
  ////declare variables
  const center = document.getElementById("center");
  const start = document.getElementById("start");
  const error = document.getElementById("perror");
  const end = document.getElementById("end");
  let len = 0;
  start.style.marginBottom = "1.5rem";
  mainContainer.style.filter = "blur(4.5px)";
  Search.classList.remove("hidden");

  //set default values for the month inputs
  start.value = `${year}-${monthNumber.toString().padStart(2, "0")}`;
  end.value = `${year}-${monthNumber.toString().padStart(2, "0")}`;
  gridRows = `auto `;
  rows.style.gridTemplateRows = gridRows;

  //add event listener to enable searching of bills
  end.addEventListener("mouseout", function (e) {
    bills = "";
    gridRows = `auto `;
    rows.style.gridTemplateRows = gridRows;
    ResultsCleaner(rows);
    //get months between which bill data should be returned
    let startyear = +start.value.slice(0, 4);
    let startmonth = +start.value.slice(5, 7);
    const Endyr = +e.target.value.slice(0, 4);
    const Endmonth = +e.target.value.slice(5, 7);
    //make error element hidden
    error.classList.add("hidden");

    //handle exception if date range is wrong
    if (startyear > Endyr || (startmonth > Endmonth && startyear == Endyr)) {
      error.innerHTML = "End month cannot be less than Start month";
      error.classList.remove("hidden");
    } else if (Endmonth > monthNumber && Endyr == year) {
      error.innerHTML = "Please select a valid End Month";
      error.classList.remove("hidden");
    } else {
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
            response.json().then(function (data) {
              if (data["message"] !== "success") {
                console.log("Error");
              } else {
                delete data["message"];
                readings = Object.entries(data);
                let BillTemplate = "";
                let len = 0;
                while (readings.length > 0) {
                  const bills = readings[0];
                  const [year, reading] = bills;
                  if (startyear == Endyr) {
                    while (reading.length < Endmonth) {
                      reading.unshift(0);
                      console.log(reading);
                    }
                    while (startmonth <= Endmonth) {
                      console.log(reading[startmonth - 1]);
                      const previous = reading[startmonth - 2];
                      const current = reading[startmonth - 1];
                      const consumed = current - previous;
                      const bill = consumed * 130 + 50;
                      if (previous == undefined) {
                        startmonth++;
                        continue;
                      }
                      BillTemplate += `<div class="bill" style="margin-bottom:2rem;grid-row:span 11;height:20rems">
                            <div class="allrow heading">As of 5th of ${
                              months[startmonth - 1]
                            } ${year.slice(1, 5)}</div>
                            <div class="allrow">Current Reading <p class="value">${current}</p></div>
                            <div class="allrow">Previous meter Reading<p class="value">${previous}</p></div>
                            <div class="allrow">Consumed water units<p class="value">${consumed}</p></div>
                            <div class="allrow">Current bill <p class="value">${bill}</p></div>
                            <div class="allrow">  Balance carried forward<p class="value">0</p></div>
                            <div class="allrow">Total bill <p class="value">${bill}</p></div>
                            <div class="allrow">Paid<p class="value">${consumed}</p></div>
                            <div class="allrow">Balance<p class="value">${consumed}</p></div>
                            </div>`;
                      len++;
                      startmonth++;
                      console.log(startmonth);
                    }
                  }
                  console.log(bills);
                  readings.shift();
                }

                //render bill template
                len > 0 ? (len = Math.ceil(len / 2)) : len;
                console.log(len);
                center.style.gridRow = `1/span ${11 * len}`;
                gridRows += `repeat(${11 * len},2rem )`;
                rows.insertAdjacentHTML("beforeend", BillTemplate);
                rows.style.gridTemplateRows = gridRows;
                console.log("Loaded");
              }
              /* console.log(data);
                    console.log(typeof data);
                    console.log(response.statusText);*/
              //data["reading"].split(",").forEach(read => {readings.push(+read.split("'")[1]);console.log(readings);})
            });
          })
          .finally(function (data2) {});
      } catch (error) {
        console.log(error);
      }
    }
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
